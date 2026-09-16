import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listConversations = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("conversations")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
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
    userId: v.string(),
    title: v.string(),
    targetName: v.string(),
    relationship: v.string(),
    personalityTraits: v.array(v.string()),
    messages: v.array(
      v.object({
        sender: v.union(v.literal("you"), v.literal("them")),
        text: v.string(),
        timestamp: v.optional(v.string()),
      })
    ),
    lastMessage: v.string(),
    currentVibe: v.string(),
    pulseScore: v.number(),
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
    const now = new Date().toISOString();
    const conversationId = await ctx.db.insert("conversations", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
    return conversationId;
  },
});

export const deleteConversation = mutation({
  args: { id: v.id("conversations") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
