import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";
import { assertCanCreateProfile } from "./subscriptions";

export const listProfiles = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    return await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const saveProfile = mutation({
  args: {
    name: v.string(),
    gender: v.union(v.literal("female"), v.literal("male"), v.literal("other")),
    relationship: v.string(),
    personalityTraits: v.array(v.string()),
    likes: v.array(v.string()),
    thingsToAvoid: v.array(v.string()),
    vibeSummary: v.string(),
    avatarEmoji: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    await assertCanCreateProfile(ctx, user._id);
    const now = new Date().toISOString();
    return await ctx.db.insert("profiles", {
      ...args,
      userId: user._id,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateProfile = mutation({
  args: {
    id: v.id("profiles"),
    name: v.string(),
    gender: v.union(v.literal("female"), v.literal("male"), v.literal("other")),
    relationship: v.string(),
    personalityTraits: v.array(v.string()),
    likes: v.array(v.string()),
    thingsToAvoid: v.array(v.string()),
    vibeSummary: v.string(),
    avatarEmoji: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    const { id, ...data } = args;
    const existing = await ctx.db.get(id);
    if (!existing || existing.userId !== user._id) {
      throw new Error("Profile not found");
    }
    await ctx.db.patch(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const deleteProfile = mutation({
  args: { id: v.id("profiles") },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== user._id) {
      throw new Error("Profile not found");
    }
    await ctx.db.delete(args.id);
  },
});
