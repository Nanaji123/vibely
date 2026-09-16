export type SenderRole = 'you' | 'them';

export interface ChatMessage {
  id: string;
  sender: SenderRole;
  text: string;
  timestamp?: string;
}

export interface TargetProfile {
  id: string;
  name: string;
  gender?: 'female' | 'male' | 'other';
  relationship: string;
  personalityTraits: string[];
  likes: string[];
  thingsToAvoid: string[];
  vibeSummary: string;
  avatarEmoji: string;
  updatedAt: string;
}

export interface ConversationState {
  id?: string;
  title: string;
  targetName: string;
  relationship: string;
  personalityTraits: string[];
  messages: ChatMessage[];
  currentVibe: string;
  intent?: string;
  customNotes?: string;
  pulseScore?: number;
}

export interface PulseAnalysis {
  interestScore: number;     // e.g. 78 (%)
  playfulnessScore: number;  // e.g. 88 (%)
  romanceScore: number;      // e.g. 52 (%)
  effortRatio: number;       // e.g. 71 (%)
  currentVibeSummary: string;// "Playful + comfortable"
  observation: string;       // "⚠️ You're asking most of the questions."
  suggestion: string;        // "💡 Stop interviewing them and introduce something about yourself."
  subtext: string;           // "What they actually mean: They're interested but waiting for a move."
}

export interface ResponseOption {
  id: string;
  category: 'Playful' | 'Flirty' | 'Romantic' | 'Funny' | 'Confident' | 'Cute' | 'Spicy' | 'Bro' | 'Caring';
  replyText: string;
  explanation: string;
  vibe: string;
}

export interface BranchingNode {
  id: string;
  ifTheySay: string;
  suggestedReply: string;
  intent: string;
  confidence: number;
}

export type SubscriptionTier = 'free' | 'plus' | 'pro';

export interface UserSubscription {
  plan: SubscriptionTier;
  creditsRemaining: number;
  unlimited: boolean;
}
