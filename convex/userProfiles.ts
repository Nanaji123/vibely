import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    const row = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    return {
      email: user.email ?? "",
      googleName: user.name ?? "",
      displayName: row?.displayName ?? null,
    };
  },
});

export const setDisplayName = mutation({
  args: { displayName: v.string() },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    const displayName = args.displayName.trim();
    if (!displayName) throw new Error("Name is required");
    if (displayName.length > 60) throw new Error("Name is too long");

    const now = new Date().toISOString();
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { displayName, updatedAt: now });
    } else {
      await ctx.db.insert("userProfiles", {
        userId: user._id,
        displayName,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});
