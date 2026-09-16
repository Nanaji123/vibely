export type SubscriptionTierModel = 'free' | 'plus' | 'pro';

export interface UserSubscriptionModel {
  plan: SubscriptionTierModel;
  creditsRemaining: number;
  unlimited: boolean;
}

export interface UserModel {
  id: string;
  name: string;
  email: string;
  subscription: UserSubscriptionModel;
}
