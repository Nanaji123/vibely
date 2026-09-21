export type SubscriptionTierModel = 'free' | 'plus' | 'pro';

// What the signed-in user is allowed to do right now. `null` limits mean unlimited.
export interface UserSubscriptionModel {
  plan: SubscriptionTierModel;
  renewsAt: string | null;
  messagesUsed: number;
  messagesLimit: number | null;
  chatsUsed: number;
  chatsLimit: number | null;
  profilesUsed: number;
  profilesLimit: number | null;
  predictions: boolean;
}

export type PaywallReason = 'messages' | 'chats' | 'profiles' | 'upsell';

export const isUnlimited = (s: UserSubscriptionModel) => s.plan !== 'free';
export const messagesLeft = (s: UserSubscriptionModel) =>
  s.messagesLimit === null ? Infinity : Math.max(0, s.messagesLimit - s.messagesUsed);
export const chatsLeft = (s: UserSubscriptionModel) =>
  s.chatsLimit === null ? Infinity : Math.max(0, s.chatsLimit - s.chatsUsed);
export const profilesLeft = (s: UserSubscriptionModel) =>
  s.profilesLimit === null ? Infinity : Math.max(0, s.profilesLimit - s.profilesUsed);

export interface UserModel {
  id: string;
  name: string;
  email: string;
  subscription: UserSubscriptionModel;
}
