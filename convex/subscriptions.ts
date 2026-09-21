import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { authComponent } from "./auth";
import { PLANS, PlanId, PAYWALL_REASONS, PaywallReason } from "./plans";

const PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

type Ctx = QueryCtx | MutationCtx;

const findSubscription = async (ctx: Ctx, userId: string) =>
  ctx.db
    .query("userSubscriptions")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();

const countConversations = async (ctx: Ctx, userId: string) =>
  (await ctx.db.query("conversations").withIndex("by_userId", (q) => q.eq("userId", userId)).collect()).length;

const countProfiles = async (ctx: Ctx, userId: string) =>
  (await ctx.db.query("profiles").withIndex("by_userId", (q) => q.eq("userId", userId)).collect()).length;

// Usage recorded before the messages counter existed was stored as credits remaining out of 5
const messagesUsedOf = (doc: { messagesUsed?: number; creditsRemaining?: number } | null) =>
  doc?.messagesUsed ?? (doc?.creditsRemaining !== undefined ? Math.max(0, 5 - doc.creditsRemaining) : 0);

// A paid plan whose period lapsed falls back to free (no billing integration renews it yet)
const effectivePlan = (doc: { plan: PlanId; renewsAt?: string } | null): PlanId => {
  if (!doc || doc.plan === "free") return "free";
  if (doc.renewsAt && new Date(doc.renewsAt).getTime() < Date.now()) return "free";
  return doc.plan;
};

export const paywallError = (reason: PaywallReason) =>
  new ConvexError({ code: "PAYWALL", reason, message: PAYWALL_REASONS[reason] });

// Full entitlement picture for the signed-in user
export const entitlementsFor = async (ctx: Ctx, userId: string) => {
  const doc = await findSubscription(ctx, userId);
  const plan = effectivePlan(doc);
  const limits = PLANS[plan];
  const messagesUsed = messagesUsedOf(doc);
  const chatsUsed = await countConversations(ctx, userId);
  const profilesUsed = await countProfiles(ctx, userId);
  return {
    plan,
    renewsAt: plan === "free" ? null : doc?.renewsAt ?? null,
    messagesUsed,
    messagesLimit: limits.messages,
    chatsUsed,
    chatsLimit: limits.chats,
    profilesUsed,
    profilesLimit: limits.profiles,
    predictions: limits.predictions,
  };
};

// JSON cannot carry Infinity; unlimited is sent as null
const wire = (e: Awaited<ReturnType<typeof entitlementsFor>>) => ({
  ...e,
  messagesLimit: Number.isFinite(e.messagesLimit) ? e.messagesLimit : null,
  chatsLimit: Number.isFinite(e.chatsLimit) ? e.chatsLimit : null,
  profilesLimit: Number.isFinite(e.profilesLimit) ? e.profilesLimit : null,
});

export const getSubscription = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    return wire(await entitlementsFor(ctx, user._id));
  },
});

// Cheap pre-check the AI actions run before spending money on a model call
export const canGenerate = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    const e = await entitlementsFor(ctx, user._id);
    return e.messagesUsed < e.messagesLimit;
  },
});

export const assertCanCreateChat = async (ctx: Ctx, userId: string) => {
  const e = await entitlementsFor(ctx, userId);
  if (e.chatsUsed >= e.chatsLimit) throw paywallError("chats");
};

export const assertCanCreateProfile = async (ctx: Ctx, userId: string) => {
  const e = await entitlementsFor(ctx, userId);
  if (e.profilesUsed >= e.profilesLimit) throw paywallError("profiles");
};

// Counts one AI generation against the free allowance
export const useCredit = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    const doc = await findSubscription(ctx, user._id);
    const plan = effectivePlan(doc);
    if (plan !== "free") return true;
    const used = messagesUsedOf(doc);
    if (used >= PLANS.free.messages) return false;
    const updatedAt = new Date().toISOString();
    if (doc) await ctx.db.patch(doc._id, { messagesUsed: used + 1, updatedAt });
    else await ctx.db.insert("userSubscriptions", { userId: user._id, plan: "free", unlimited: false, messagesUsed: 1, updatedAt });
    return true;
  },
});

// Plan changes. There is no store billing wired up yet, so this trusts the client; when
// RevenueCat/StoreKit is added, call this from the purchase webhook instead.
export const setPlan = mutation({
  args: { plan: v.union(v.literal("free"), v.literal("plus"), v.literal("pro")) },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    const doc = await findSubscription(ctx, user._id);
    const updatedAt = new Date().toISOString();
    const renewsAt = args.plan === "free" ? undefined : new Date(Date.now() + PERIOD_MS).toISOString();
    const patch = { plan: args.plan, unlimited: args.plan !== "free", renewsAt, updatedAt };
    if (doc) await ctx.db.patch(doc._id, patch);
    else await ctx.db.insert("userSubscriptions", { userId: user._id, messagesUsed: 0, ...patch });
  },
});

// Kept for older clients
export const setSubscription = mutation({
  args: {
    plan: v.union(v.literal("free"), v.literal("plus"), v.literal("pro")),
    creditsRemaining: v.number(),
    unlimited: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    const doc = await findSubscription(ctx, user._id);
    const updatedAt = new Date().toISOString();
    const renewsAt = args.plan === "free" ? undefined : new Date(Date.now() + PERIOD_MS).toISOString();
    if (doc) await ctx.db.patch(doc._id, { plan: args.plan, unlimited: args.unlimited, renewsAt, updatedAt });
    else await ctx.db.insert("userSubscriptions", { userId: user._id, plan: args.plan, unlimited: args.unlimited, renewsAt, updatedAt });
  },
});
