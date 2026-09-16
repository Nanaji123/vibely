import React, { createContext, useContext, useState } from 'react';
import {
  ChatMessageModel,
  ConversationModel,
  PulseAnalysisModel,
  TargetProfileModel,
  AIReplyModel,
  UserSubscriptionModel,
} from '../domain/index';
import { AIService } from '../services/aiService';

export const INITIAL_PROFILES: TargetProfileModel[] = [
  {
    id: 'prof-1',
    name: 'Laxmi',
    gender: 'female',
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
    gender: 'female',
    relationship: 'dating',
    personalityTraits: ['romantic', 'talkative', 'humorous'],
    likes: ['Sushi', 'Indie Music', 'Travel', 'Art'],
    thingsToAvoid: ['Late replies', 'Vague plans'],
    vibeSummary: 'Warm & Expressive (Dating)',
    avatarEmoji: '💕',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prof-3',
    name: 'Alex',
    gender: 'male',
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
    gender: 'female',
    relationship: 'colleague',
    personalityTraits: ['reserved', 'direct', 'dry_texter'],
    likes: ['Product Design', 'Tech', 'Espresso'],
    thingsToAvoid: ['Casual slang', 'Unprepared meetings'],
    vibeSummary: 'Professional & Direct (Work)',
    avatarEmoji: '💼',
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_CONVERSATIONS: ConversationModel[] = [
  {
    id: 'conv-1',
    title: 'Weekend Plans with Sarah',
    targetName: 'Sarah',
    relationship: 'dating',
    personalityTraits: ['romantic', 'talkative'],
    messages: [
      {
        id: 'm1',
        sender: 'ai',
        text: "Hey! I'm your wingman for Sarah. What did she text you? Tell me what she said, or upload a screenshot and I'll break down her signals.",
      },
      {
        id: 'm2',
        sender: 'you',
        text: "She said: 'Probably just staying home lol'",
      },
      {
        id: 'm3',
        sender: 'ai',
        text: "She's signaling her weekend is open and testing if you'll take initiative! Here are 3 Flirty ways to reply:",
        sceneContext: "Scene Breakdown: She has no plans and wants you to lead. Don't ask boring questions—take charge.",
        suggestions: [
          {
            id: 's1',
            category: 'Flirty',
            toneVariant: 'Bold & Direct',
            replyText: "Staying home? Sounds like you need better plans 😏 I know a great spot.",
          },
          {
            id: 's2',
            category: 'Flirty',
            toneVariant: 'Playful Tease',
            replyText: "Couch potato mode? Only if you're saving a spot for me 😉",
          },
          {
            id: 's3',
            category: 'Flirty',
            toneVariant: 'Smooth & Magnetic',
            replyText: "Staying in wouldn't be nearly as boring with the right company ❤️",
          },
        ],
      },
    ],
    currentVibe: 'flirty',
    pulseScore: 78,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'conv-2',
    title: 'Dry Texting from Laxmi',
    targetName: 'Laxmi',
    relationship: 'crush',
    personalityTraits: ['sarcastic', 'teasing'],
    messages: [
      {
        id: 'm4',
        sender: 'you',
        text: "She said: 'haha maybe 😂'",
      },
      {
        id: 'm5',
        sender: 'ai',
        text: "Classic dry tease! Flip the script with teasing friction to wake up her engagement:",
        sceneContext: "Scene Breakdown: 'Maybe' is playful reluctance. She wants to see if you can hold your frame.",
        suggestions: [
          {
            id: 's4',
            category: 'Witty',
            toneVariant: 'Banter Callout',
            replyText: "That 'maybe' sounds like a solid yes disguised as plausible deniability 😏",
          },
          {
            id: 's5',
            category: 'Witty',
            toneVariant: 'Sharp Tease',
            replyText: "Careful, laughing at all my texts is stage one of catching feelings 😉",
          },
          {
            id: 's6',
            category: 'Witty',
            toneVariant: 'Playful Challenge',
            replyText: "Don't laugh too hard, you haven't even seen my best charm yet 😂",
          },
        ],
      },
    ],
    currentVibe: 'witty',
    pulseScore: 84,
    updatedAt: new Date().toISOString(),
  },
];

interface AppContextType {
  profiles: TargetProfileModel[];
  activeProfile: TargetProfileModel;
  conversations: ConversationModel[];
  currentConversation: ConversationModel;
  subscription: UserSubscriptionModel;
  selectProfile: (profile: TargetProfileModel) => void;
  addProfile: (profile: Omit<TargetProfileModel, 'id' | 'updatedAt'>) => TargetProfileModel;
  startNewSession: () => void;
  createCustomSession: (
    rawText: string,
    mode: 'screenshot' | 'paste' | 'type',
    profile?: TargetProfileModel
  ) => ConversationModel;
  loadConversation: (conv: ConversationModel) => void;
  updateMessages: (messages: ChatMessageModel[]) => void;
  updateVibe: (vibe: string) => void;
  upgradePlan: (plan: 'plus' | 'pro') => void;
  useCredit: () => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<TargetProfileModel[]>(INITIAL_PROFILES);
  const [activeProfile, setActiveProfile] = useState<TargetProfileModel>(INITIAL_PROFILES[0]);
  const [conversations, setConversations] = useState<ConversationModel[]>(INITIAL_CONVERSATIONS);
  const [currentConversation, setCurrentConversation] = useState<ConversationModel>(INITIAL_CONVERSATIONS[0]);
  const [subscription, setSubscription] = useState<UserSubscriptionModel>({
    plan: 'free',
    creditsRemaining: 3,
    unlimited: false,
  });

  const selectProfile = (profile: TargetProfileModel) => {
    setActiveProfile(profile);
    setCurrentConversation(prev => ({
      ...prev,
      targetName: profile.name,
      relationship: profile.relationship,
      personalityTraits: profile.personalityTraits,
    }));
  };

  const addProfile = (newProf: Omit<TargetProfileModel, 'id' | 'updatedAt'>) => {
    const created: TargetProfileModel = {
      ...newProf,
      id: `prof-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    setProfiles(prev => [created, ...prev]);
    selectProfile(created);
    return created;
  };

  const startNewSession = () => {
    const newSession: ConversationModel = {
      id: `conv-${Date.now()}`,
      title: `Chat with ${activeProfile.name}`,
      targetName: activeProfile.name,
      relationship: activeProfile.relationship,
      personalityTraits: activeProfile.personalityTraits,
      messages: [
        {
          id: `m-ai-welcome`,
          sender: 'ai',
          text: `Hey! I'm your wingman for ${activeProfile.name}. What did ${activeProfile.gender === 'female' ? 'she' : 'he'} text you? Tell me or upload a screenshot and I'll break down the scene!`,
          timestamp: 'Just now',
        },
      ],
      currentVibe: 'flirty',
      pulseScore: 80,
      updatedAt: new Date().toISOString(),
    };
    setCurrentConversation(newSession);
    setConversations(prev => [newSession, ...prev]);
  };

  const createCustomSession = (
    rawText: string,
    mode: 'screenshot' | 'paste' | 'type',
    profile = activeProfile
  ): ConversationModel => {
    const textPrompt = rawText.trim() || 'Probably just staying home lol';
    const userMessageText =
      textPrompt.startsWith('She said:') || textPrompt.startsWith('He said:')
        ? textPrompt
        : `${profile.gender === 'male' ? 'He' : 'She'} said: "${textPrompt}"`;

    const coachResp = AIService.generateCoachSceneResponse(
      textPrompt,
      'flirty',
      profile.relationship,
      profile.name,
      (profile.gender as any) || 'female'
    );

    const userMsg: ChatMessageModel = {
      id: `m-u-${Date.now()}`,
      sender: 'you',
      text: userMessageText,
      timestamp: 'Just now',
    };

    const aiMsg: ChatMessageModel = {
      id: `m-a-${Date.now()}`,
      sender: 'ai',
      text: coachResp.advice,
      sceneContext: coachResp.sceneContext,
      suggestions: coachResp.suggestions,
      timestamp: 'Just now',
    };

    const newSession: ConversationModel = {
      id: `conv-${Date.now()}`,
      title: `${mode === 'screenshot' ? 'Screenshot' : mode === 'paste' ? 'Pasted chat' : 'Dialogue'} with ${profile.name}`,
      targetName: profile.name,
      relationship: profile.relationship,
      personalityTraits: profile.personalityTraits,
      messages: [userMsg, aiMsg],
      currentVibe: 'flirty',
      pulseScore: 85,
      updatedAt: new Date().toISOString(),
    };

    setCurrentConversation(newSession);
    setConversations(prev => [newSession, ...prev]);
    return newSession;
  };

  const loadConversation = (conv: ConversationModel) => {
    setCurrentConversation(conv);
    const matched = profiles.find(p => p.name.toLowerCase() === conv.targetName.toLowerCase());
    if (matched) setActiveProfile(matched);
  };

  const updateMessages = (messages: ChatMessageModel[]) => {
    setCurrentConversation(prev => {
      const updated = { ...prev, messages, updatedAt: new Date().toISOString() };
      setConversations(list => list.map(c => c.id === prev.id ? updated : c));
      return updated;
    });
  };

  const updateVibe = (vibe: string) => {
    setCurrentConversation(prev => ({ ...prev, currentVibe: vibe }));
  };

  const upgradePlan = (plan: 'plus' | 'pro') => {
    setSubscription({
      plan,
      creditsRemaining: 9999,
      unlimited: true,
    });
  };

  const useCredit = (): boolean => {
    if (subscription.unlimited) return true;
    if (subscription.creditsRemaining > 0) {
      setSubscription(prev => ({ ...prev, creditsRemaining: prev.creditsRemaining - 1 }));
      return true;
    }
    return false;
  };

  return (
    <AppContext.Provider
      value={{
        profiles,
        activeProfile,
        conversations,
        currentConversation,
        subscription,
        selectProfile,
        addProfile,
        startNewSession,
        createCustomSession,
        loadConversation,
        updateMessages,
        updateVibe,
        upgradePlan,
        useCredit,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
