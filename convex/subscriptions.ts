import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

export const getSubscription = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    const existing = await ctx.db
      .query("userSubscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    return (
      existing ?? {
        userId: user._id,
        plan: "free" as const,
        creditsRemaining: 3,
        unlimited: false,
        updatedAt: new Date().toISOString(),
      }
    );
  },
});

export const setSubscription = mutation({
  args: {
    plan: v.union(v.literal("free"), v.literal("plus"), v.literal("pro")),
    creditsRemaining: v.number(),
    unlimited: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    const existing = await ctx.db
      .query("userSubscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    const updatedAt = new Date().toISOString();
    if (existing) {
      await ctx.db.patch(existing._id, { ...args, updatedAt });
    } else {
      await ctx.db.insert("userSubscriptions", { ...args, userId: user._id, updatedAt });
    }
  },
});

export const useCredit = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    const existing = await ctx.db
      .query("userSubscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (!existing) {
      await ctx.db.insert("userSubscriptions", {
        userId: user._id,
        plan: "free",
        creditsRemaining: 2,
        unlimited: false,
        updatedAt: new Date().toISOString(),
      });
      return true;
    }

    if (existing.unlimited) return true;
    if (existing.creditsRemaining <= 0) return false;

    await ctx.db.patch(existing._id, {
      creditsRemaining: existing.creditsRemaining - 1,
      updatedAt: new Date().toISOString(),
    });
    return true;
  },
});
