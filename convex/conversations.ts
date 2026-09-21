import { query, mutation } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { authComponent } from "./auth";
import { messageObject, analysisObject } from "./schema";

const DEFAULT_PAGE = 60;
const MAX_PAGE = 300;
const PREVIEW_COUNT = 3;

type ClientMessage = {
  id: string;
  sender: "you" | "ai" | "them";
  text: string;
  sceneContext?: string;
  suggestions?: { id: string; category: string; replyText: string; toneVariant: string }[];
  selectedSuggestionId?: string;
  timestamp?: string;
};

function toClientMessage(row: Doc<"messages">): ClientMessage {
  const msg: ClientMessage = { id: row.clientId, sender: row.sender, text: row.text };
  if (row.sceneContext !== undefined) msg.sceneContext = row.sceneContext;
  if (row.suggestions !== undefined) msg.suggestions = row.suggestions;
  if (row.selectedSuggestionId !== undefined) msg.selectedSuggestionId = row.selectedSuggestionId;
  if (row.timestamp !== undefined) msg.timestamp = row.timestamp;
  return msg;
}

async function getOwnedConversation(
  ctx: QueryCtx | MutationCtx,
  id: Id<"conversations">
): Promise<{ conversation: Doc<"conversations">; userId: string }> {
  const user = await authComponent.getAuthUser(ctx);
  const conversation = await ctx.db.get(id);
  if (!conversation || conversation.userId !== user._id) {
    throw new Error("Conversation not found");
  }
  return { conversation, userId: user._id };
}

async function insertMessage(
  ctx: MutationCtx,
  conversationId: Id<"conversations">,
  userId: string,
  seq: number,
  m: ClientMessage
) {
  await ctx.db.insert("messages", {
    conversationId,
    userId,
    seq,
    clientId: m.id,
    sender: m.sender,
    text: m.text,
    ...(m.sceneContext !== undefined ? { sceneContext: m.sceneContext } : {}),
    ...(m.suggestions !== undefined ? { suggestions: m.suggestions } : {}),
    ...(m.selectedSuggestionId !== undefined ? { selectedSuggestionId: m.selectedSuggestionId } : {}),
    ...(m.timestamp !== undefined ? { timestamp: m.timestamp } : {}),
  });
}

async function lastSeq(ctx: MutationCtx, conversationId: Id<"conversations">): Promise<number> {
  const last = await ctx.db
    .query("messages")
    .withIndex("by_conversation_seq", (q) => q.eq("conversationId", conversationId))
    .order("desc")
    .first();
  return last ? last.seq : 0;
}

async function deleteAllMessages(ctx: MutationCtx, conversationId: Id<"conversations">) {
  // Bounded batches keep a single mutation within Convex's read/write limits
  for (let i = 0; i < 10; i++) {
    const batch = await ctx.db
      .query("messages")
      .withIndex("by_conversation_seq", (q) => q.eq("conversationId", conversationId))
      .take(500);
    if (batch.length === 0) return;
    for (const row of batch) await ctx.db.delete(row._id);
  }
}

// Move legacy inline messages into the messages table
async function migrateLegacyMessages(ctx: MutationCtx, conversation: Doc<"conversations">, userId: string) {
  if (!conversation.messages) return;
  let seq = 0;
  for (const m of conversation.messages) {
    seq += 1;
    await insertMessage(ctx, conversation._id, userId, seq, m);
  }
  await ctx.db.patch(conversation._id, { messages: undefined });
}

async function refreshPreview(ctx: MutationCtx, conversationId: Id<"conversations">) {
  const last = await ctx.db
    .query("messages")
    .withIndex("by_conversation_seq", (q) => q.eq("conversationId", conversationId))
    .order("desc")
    .take(PREVIEW_COUNT);
  await ctx.db.patch(conversationId, {
    previewMessages: last.reverse().map(toClientMessage),
    updatedAt: new Date().toISOString(),
  });
}

// Light summaries for list screens: no full threads
export const listConversations = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);
    return conversations.map((c) => ({
      _id: c._id,
      profileId: c.profileId,
      title: c.title,
      targetName: c.targetName,
      relationship: c.relationship,
      personalityTraits: c.personalityTraits,
      currentVibe: c.currentVibe,
      pulseScore: c.pulseScore,
      analysis: c.analysis,
      updatedAt: c.updatedAt,
      messages: (c.previewMessages ?? (c.messages ?? []).slice(-PREVIEW_COUNT)) as ClientMessage[],
    }));
  },
});

// The latest `limit` messages of one conversation, oldest first
export const listMessages = query({
  args: { conversationId: v.id("conversations"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { conversation } = await getOwnedConversation(ctx, args.conversationId);
    const limit = Math.max(1, Math.min(args.limit ?? DEFAULT_PAGE, MAX_PAGE));

    if (conversation.messages) {
      const legacy = conversation.messages as ClientMessage[];
      return { messages: legacy.slice(-limit), hasMore: legacy.length > limit };
    }

    const rows = await ctx.db
      .query("messages")
      .withIndex("by_conversation_seq", (q) => q.eq("conversationId", args.conversationId))
      .order("desc")
      .take(limit + 1);
    return {
      messages: rows.slice(0, limit).reverse().map(toClientMessage),
      hasMore: rows.length > limit,
    };
  },
});

export const saveConversation = mutation({
  args: {
    profileId: v.optional(v.string()),
    title: v.string(),
    targetName: v.string(),
    relationship: v.string(),
    personalityTraits: v.array(v.string()),
    messages: v.array(messageObject),
    currentVibe: v.string(),
    pulseScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    const now = new Date().toISOString();
    const { messages, ...rest } = args;
    const conversationId = await ctx.db.insert("conversations", {
      ...rest,
      userId: user._id,
      previewMessages: messages.slice(-PREVIEW_COUNT),
      createdAt: now,
      updatedAt: now,
    });
    let seq = 0;
    for (const m of messages) {
      seq += 1;
      await insertMessage(ctx, conversationId, user._id, seq, m);
    }
    return conversationId;
  },
});

// Applies only what changed: new messages, selection patches, or a full replace.
// Idempotent on message id, so a duplicate/stale call from the client is harmless.
export const syncMessages = mutation({
  args: {
    conversationId: v.id("conversations"),
    replace: v.boolean(),
    append: v.array(messageObject),
    patches: v.array(v.object({ id: v.string(), selectedSuggestionId: v.string() })),
  },
  handler: async (ctx, args) => {
    const { conversation, userId } = await getOwnedConversation(ctx, args.conversationId);
    await migrateLegacyMessages(ctx, conversation, userId);

    if (args.replace) await deleteAllMessages(ctx, args.conversationId);

    let seq = await lastSeq(ctx, args.conversationId);
    for (const m of args.append) {
      const existing = await ctx.db
        .query("messages")
        .withIndex("by_conversation_clientId", (q) =>
          q.eq("conversationId", args.conversationId).eq("clientId", m.id)
        )
        .first();
      if (existing) continue;
      seq += 1;
      await insertMessage(ctx, args.conversationId, userId, seq, m);
    }

    for (const p of args.patches) {
      const row = await ctx.db
        .query("messages")
        .withIndex("by_conversation_clientId", (q) =>
          q.eq("conversationId", args.conversationId).eq("clientId", p.id)
        )
        .first();
      if (row && row.selectedSuggestionId !== p.selectedSuggestionId) {
        await ctx.db.patch(row._id, { selectedSuggestionId: p.selectedSuggestionId });
      }
    }

    await refreshPreview(ctx, args.conversationId);
  },
});

// Flips you <-> them on transcript messages (fixes a screenshot read with the sides reversed)
export const swapSides = mutation({
  args: {
    conversationId: v.id("conversations"),
    ids: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await getOwnedConversation(ctx, args.conversationId);
    for (const id of args.ids.slice(0, 200)) {
      const row = await ctx.db
        .query("messages")
        .withIndex("by_conversation_clientId", (q) =>
          q.eq("conversationId", args.conversationId).eq("clientId", id)
        )
        .first();
      if (row && row.sender !== "ai") {
        await ctx.db.patch(row._id, { sender: row.sender === "you" ? "them" : "you" });
      }
    }
    await refreshPreview(ctx, args.conversationId);
  },
});

export const updateConversation = mutation({
  args: {
    id: v.id("conversations"),
    currentVibe: v.optional(v.string()),
    pulseScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    await getOwnedConversation(ctx, id);
    await ctx.db.patch(id, { ...data, updatedAt: new Date().toISOString() });
  },
});

export const saveAnalysis = mutation({
  args: { id: v.id("conversations"), analysis: analysisObject },
  handler: async (ctx, args) => {
    await getOwnedConversation(ctx, args.id);
    await ctx.db.patch(args.id, {
      analysis: args.analysis,
      pulseScore: Math.round(args.analysis.interestScore),
    });
  },
});

export const deleteConversation = mutation({
  args: { id: v.id("conversations") },
  handler: async (ctx, args) => {
    await getOwnedConversation(ctx, args.id);
    await deleteAllMessages(ctx, args.id);
    await ctx.db.delete(args.id);
  },
});
