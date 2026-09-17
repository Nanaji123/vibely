import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

const messageValidator = v.object({
  id: v.string(),
  sender: v.union(v.literal("you"), v.literal("ai"), v.literal("them")),
  text: v.string(),
  sceneContext: v.optional(v.string()),
  suggestions: v.optional(
    v.array(
      v.object({
        id: v.string(),
        category: v.string(),
        replyText: v.string(),
        toneVariant: v.string(),
      })
    )
  ),
  selectedSuggestionId: v.optional(v.string()),
  timestamp: v.optional(v.string()),
});

export const listConversations = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    return await ctx.db
      .query("conversations")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const getConversation = query({
  args: { id: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const saveConversation = mutation({
  args: {
    profileId: v.optional(v.string()),
    title: v.string(),
    targetName: v.string(),
    relationship: v.string(),
    personalityTraits: v.array(v.string()),
    messages: v.array(messageValidator),
    currentVibe: v.string(),
    pulseScore: v.optional(v.number()),
    analysis: v.optional(
      v.object({
        interestScore: v.number(),
        playfulnessScore: v.number(),
        romanceScore: v.number(),
        effortRatio: v.number(),
        currentVibeSummary: v.string(),
        observation: v.string(),
        suggestion: v.string(),
        subtext: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    const now = new Date().toISOString();
    const conversationId = await ctx.db.insert("conversations", {
      ...args,
      userId: user._id,
      createdAt: now,
      updatedAt: now,
    });
    return conversationId;
  },
});

export const updateConversation = mutation({
  args: {
    id: v.id("conversations"),
    messages: v.array(messageValidator),
    currentVibe: v.optional(v.string()),
    pulseScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    const { id, ...data } = args;
    const existing = await ctx.db.get(id);
    if (!existing || existing.userId !== user._id) {
      throw new Error("Conversation not found");
    }
    await ctx.db.patch(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const deleteConversation = mutation({
  args: { id: v.id("conversations") },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== user._id) {
      throw new Error("Conversation not found");
    }
    await ctx.db.delete(args.id);
  },
});
