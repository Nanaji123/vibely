import { ConversationState, TargetProfile, UserSubscription } from '../types';

export const DEFAULT_PROFILES: TargetProfile[] = [
  {
    id: 'prof-1',
    name: 'Laxmi',
    relationship: 'crush',
    personalityTraits: ['humorous', 'reserved', 'sarcastic', 'teasing'],
    likes: ['Movies', 'Manhwa', 'Gaming', 'Matcha Latte'],
    thingsToAvoid: ['Too serious', 'Too many questions', 'Long paragraphs'],
    vibeSummary: 'Witty & Reserved (Crush)',
    avatarEmoji: '❤️',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prof-2',
    name: 'Sarah',
    relationship: 'dating',
    personalityTraits: ['romantic', 'talkative', 'humorous'],
    likes: ['Sushi', 'Indie Music', 'Travel', 'Art Exits'],
    thingsToAvoid: ['Late replies', 'Vague plans'],
    vibeSummary: 'Warm & Expressive (Dating)',
    avatarEmoji: '💕',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prof-3',
    name: 'Alex',
    relationship: 'friend',
    personalityTraits: ['bro', 'direct', 'sarcastic'],
    likes: ['Valorant', 'Gym', 'Memes', 'Anime'],
    thingsToAvoid: ['Forced romantic talk'],
    vibeSummary: 'Casual Banter (Friend)',
    avatarEmoji: '😎',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prof-4',
    name: 'Elena',
    relationship: 'colleague',
    personalityTraits: ['reserved', 'direct', 'dry_texter'],
    likes: ['Product Design', 'Tech', 'Espresso'],
    thingsToAvoid: ['Casual slang', 'Unprepared meetings'],
    vibeSummary: 'Professional & Direct (Work)',
    avatarEmoji: '💼',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prof-5',
    name: 'Jake',
    relationship: 'bro',
    personalityTraits: ['humorous', 'direct'],
    likes: ['Basketball', 'Sneakers', 'Streetwear'],
    thingsToAvoid: ['Boring small talk'],
    vibeSummary: 'Pure Comedy (Peer)',
    avatarEmoji: '😂',
    updatedAt: new Date().toISOString(),
  },
];

export const DEFAULT_CONVERSATIONS: ConversationState[] = [
  {
    id: 'conv-1',
    title: 'Weekend Plans with Sarah',
    targetName: 'Sarah',
    relationship: 'crush',
    personalityTraits: ['playful', 'dry_texter'],
    messages: [
      { id: 'm1', sender: 'you', text: 'What are you doing this weekend?' },
      { id: 'm2', sender: 'them', text: 'Probably just staying home lol' },
    ],
    currentVibe: 'playful',
    pulseScore: 78,
  },
  {
    id: 'conv-2',
    title: 'Post-date check in',
    targetName: 'Laxmi',
    relationship: 'dating',
    personalityTraits: ['sarcastic', 'flirty'],
    messages: [
      { id: 'm3', sender: 'them', text: 'haha maybe 😂' },
      { id: 'm4', sender: 'you', text: 'That maybe sounds like a solid yes to me 😏' },
      { id: 'm5', sender: 'them', text: 'hmm okay 😂' },
    ],
    currentVibe: 'flirty',
    pulseScore: 84,
  }
];

export class StorageService {
  private static profiles: TargetProfile[] = [...DEFAULT_PROFILES];
  private static conversations: ConversationState[] = [...DEFAULT_CONVERSATIONS];
  private static subscription: UserSubscription = {
    plan: 'free',
    creditsRemaining: 3,
    unlimited: false,
  };

  static getProfiles(): TargetProfile[] {
    return this.profiles;
  }

  static addProfile(profile: Omit<TargetProfile, 'id' | 'updatedAt'>): TargetProfile {
    const newProf: TargetProfile = {
      ...profile,
      id: `prof-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    this.profiles.unshift(newProf);
    return newProf;
  }

  static getConversations(): ConversationState[] {
    return this.conversations;
  }

  static addConversation(conv: ConversationState): ConversationState {
    const newConv = {
      ...conv,
      id: conv.id || `conv-${Date.now()}`,
    };
    this.conversations.unshift(newConv);
    return newConv;
  }

  static getSubscription(): UserSubscription {
    return this.subscription;
  }

  static updateSubscription(tier: UserSubscription['plan']) {
    this.subscription.plan = tier;
    if (tier === 'free') {
      this.subscription.creditsRemaining = 3;
      this.subscription.unlimited = false;
    } else {
      this.subscription.creditsRemaining = 9999;
      this.subscription.unlimited = true;
    }
    return this.subscription;
  }

  static useCredit(): boolean {
    if (this.subscription.unlimited) return true;
    if (this.subscription.creditsRemaining > 0) {
      this.subscription.creditsRemaining -= 1;
      return true;
    }
    return false;
  }
}
