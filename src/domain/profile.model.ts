export type TargetGender = 'female' | 'male' | 'other';

export interface TargetProfileModel {
  id: string;
  name: string;
  gender: TargetGender;
  relationship: 'crush' | 'dating' | 'partner' | 'friend' | 'bro' | 'colleague' | 'family' | 'ex' | string;
  personalityTraits: string[];
  likes: string[];
  thingsToAvoid: string[];
  vibeSummary: string;
  avatarEmoji: string;
  updatedAt: string;
}
