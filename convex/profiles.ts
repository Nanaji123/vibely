import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listProfiles = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const saveProfile = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    relationship: v.string(),
    personalityTraits: v.array(v.string()),
    likes: v.array(v.string()),
    thingsToAvoid: v.array(v.string()),
    vibeSummary: v.string(),
    avatarEmoji: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("profiles", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateProfile = mutation({
  args: {
    id: v.id("profiles"),
    name: v.string(),
    relationship: v.string(),
    personalityTraits: v.array(v.string()),
    likes: v.array(v.string()),
    thingsToAvoid: v.array(v.string()),
    vibeSummary: v.string(),
    avatarEmoji: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    const now = new Date().toISOString();
    await ctx.db.patch(id, {
      ...data,
      updatedAt: now,
    });
  },
});

export const deleteProfile = mutation({
  args: { id: v.id("profiles") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
