export type MessageSender = 'you' | 'ai' | 'them';

export interface SuggestionOptionModel {
  id: string;
  category: string;
  replyText: string;
  toneVariant: string;
}

export interface ChatMessageModel {
  id: string;
  sender: MessageSender;
  text: string;
  sceneContext?: string;
  suggestions?: SuggestionOptionModel[];
  selectedSuggestionId?: string;
  timestamp?: string;
}

export interface PulseAnalysisModel {
  interestScore: number;       // 0 - 100%
  playfulnessScore: number;    // 0 - 100%
  romanceScore: number;        // 0 - 100%
  effortRatio: number;         // 0 - 100%
  currentVibeSummary: string;  // e.g. "Playful + Comfortable"
  observation: string;         // Strategic observation tip
  suggestion: string;          // Actionable coaching next step
  subtext: string;             // Subtext decoder
  frameScore?: number;
  detectedIntent?: string;
  intentExplanation?: string;
  moments?: { theirMessage: string; subtext: string; recommendedReply: string }[];
  doNext?: string;
  avoid?: string;
  analyzedMessageCount?: number;
}

export interface ConversationModel {
  id: string;
  profileId?: string;
  title: string;
  targetName: string;
  relationship: string;
  personalityTraits: string[];
  messages: ChatMessageModel[];
  currentVibe: string;
  pulseScore?: number;
  analysis?: PulseAnalysisModel;
  updatedAt: string;
}
