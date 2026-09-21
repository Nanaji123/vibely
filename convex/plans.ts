// Single source of truth for what each plan allows. Infinity = unlimited.
export type PlanId = "free" | "plus" | "pro";

export const PLANS: Record<
  PlanId,
  { name: string; price: string; messages: number; chats: number; profiles: number; predictions: boolean }
> = {
  free: { name: "Free", price: "$0", messages: 20, chats: 3, profiles: 2, predictions: true },
  plus: { name: "Plus", price: "$6.99", messages: Infinity, chats: Infinity, profiles: 5, predictions: true },
  pro: { name: "Pro", price: "$12.99", messages: Infinity, chats: Infinity, profiles: Infinity, predictions: true },
};

// Show the soft "enjoying it?" upsell to free users once they cross this many replies
export const SOFT_UPSELL_AT = Math.ceil(PLANS.free.messages / 2);

export const PAYWALL_REASONS = {
  messages: "You've used your free replies.",
  chats: "You've used your free chats.",
  profiles: "You've reached the people limit for your plan.",
} as const;
export type PaywallReason = keyof typeof PAYWALL_REASONS;
