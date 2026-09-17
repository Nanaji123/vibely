import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useMutation, useAction, useConvexAuth } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import {
  ChatMessageModel,
  ConversationModel,
  TargetProfileModel,
  UserSubscriptionModel,
} from '../domain/index';

const FALLBACK_PROFILE: TargetProfileModel = {
  id: 'prof-fallback',
  name: 'Target Profile',
  gender: 'female',
  relationship: 'crush',
  personalityTraits: [],
  likes: [],
  thingsToAvoid: [],
  vibeSummary: 'New Profile',
  avatarEmoji: '❤️',
  updatedAt: new Date().toISOString(),
};

const EMPTY_CONVERSATION: ConversationModel = {
  id: '',
  title: '',
  targetName: '',
  relationship: '',
  personalityTraits: [],
  messages: [],
  currentVibe: 'flirty',
  updatedAt: new Date().toISOString(),
};

const pronoun = (gender: string, form: 'subject' | 'object') => {
  if (gender === 'male') return form === 'subject' ? 'he' : 'him';
  if (gender === 'other') return 'they';
  return form === 'subject' ? 'she' : 'her';
};

const buildWelcomeMessage = (profile: TargetProfileModel) =>
  `Hey! I'm your wingman for ${profile.name}. What did ${pronoun(profile.gender, 'subject')} text you? Tell me or upload a screenshot and I'll break down the scene!`;

const pickTopSuggestions = (
  responses: { category: string; replyText: string; explanation: string }[],
  desiredVibe: string
) => {
  const vibeMatch = responses.filter((r) => r.category.toLowerCase() === desiredVibe.toLowerCase());
  const pool = vibeMatch.length >= 3 ? vibeMatch : responses;
  return pool.slice(0, 3).map((r, i) => ({
    id: `s-${Date.now()}-${i}`,
    category: r.category,
    replyText: r.replyText,
    toneVariant: r.explanation,
  }));
};

interface AppContextType {
  profiles: TargetProfileModel[];
  activeProfile: TargetProfileModel;
  conversations: ConversationModel[];
  currentConversation: ConversationModel;
  subscription: UserSubscriptionModel;
  selectProfile: (profile: TargetProfileModel) => Promise<void>;
  addProfile: (profile: Omit<TargetProfileModel, 'id' | 'updatedAt'>) => Promise<TargetProfileModel>;
  editProfile: (id: string, updated: Partial<TargetProfileModel>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  startNewSession: () => Promise<void>;
  createCustomSession: (
    rawText: string,
    mode: 'screenshot' | 'paste' | 'type',
    profile?: TargetProfileModel
  ) => Promise<void>;
  loadConversation: (conv: ConversationModel) => void;
  updateMessages: (messages: ChatMessageModel[]) => Promise<void>;
  updateVibe: (vibe: string) => Promise<void>;
  upgradePlan: (plan: 'plus' | 'pro') => Promise<void>;
  useCredit: () => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useConvexAuth();

  const profilesQuery = useQuery(api.profiles.listProfiles, isAuthenticated ? {} : 'skip');
  const conversationsQuery = useQuery(api.conversations.listConversations, isAuthenticated ? {} : 'skip');
  const subscriptionQuery = useQuery(api.subscriptions.getSubscription, isAuthenticated ? {} : 'skip');

  const saveProfileMutation = useMutation(api.profiles.saveProfile);
  const updateProfileMutation = useMutation(api.profiles.updateProfile);
  const deleteProfileMutation = useMutation(api.profiles.deleteProfile);
  const saveConversationMutation = useMutation(api.conversations.saveConversation);
  const updateConversationMutation = useMutation(api.conversations.updateConversation);
  const setSubscriptionMutation = useMutation(api.subscriptions.setSubscription);
  const useCreditMutation = useMutation(api.subscriptions.useCredit);
  const generateRepliesAction = useAction(api.ai.generateReplies);

  const profiles: TargetProfileModel[] = (profilesQuery ?? []).map((doc) => ({
    id: doc._id,
    name: doc.name,
    gender: doc.gender,
    relationship: doc.relationship,
    personalityTraits: doc.personalityTraits,
    likes: doc.likes,
    thingsToAvoid: doc.thingsToAvoid,
    vibeSummary: doc.vibeSummary,
    avatarEmoji: doc.avatarEmoji,
    updatedAt: doc.updatedAt,
  }));

  const conversations: ConversationModel[] = (conversationsQuery ?? []).map((doc) => ({
    id: doc._id,
    profileId: doc.profileId,
    title: doc.title,
    targetName: doc.targetName,
    relationship: doc.relationship,
    personalityTraits: doc.personalityTraits,
    messages: doc.messages,
    currentVibe: doc.currentVibe,
    pulseScore: doc.pulseScore,
    updatedAt: doc.updatedAt,
  }));

  const subscription: UserSubscriptionModel = subscriptionQuery
    ? {
        plan: subscriptionQuery.plan,
        creditsRemaining: subscriptionQuery.creditsRemaining,
        unlimited: subscriptionQuery.unlimited,
      }
    : { plan: 'free', creditsRemaining: 3, unlimited: false };

  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeProfileId && profiles.length > 0) {
      setActiveProfileId(profiles[0].id);
    }
  }, [profiles, activeProfileId]);

  const activeProfile = profiles.find((p) => p.id === activeProfileId) ?? profiles[0] ?? FALLBACK_PROFILE;
  const currentConversation =
    conversations.find((c) => c.id === currentConversationId) ?? conversations[0] ?? EMPTY_CONVERSATION;

  const selectProfile = async (profile: TargetProfileModel) => {
    setActiveProfileId(profile.id);

    const existing = conversations.find(
      (c) => c.profileId === profile.id || c.targetName.toLowerCase() === profile.name.toLowerCase()
    );
    if (existing) {
      setCurrentConversationId(existing.id);
      return;
    }

    const newId = await saveConversationMutation({
      profileId: profile.id,
      title: `Wingman Session with ${profile.name}`,
      targetName: profile.name,
      relationship: profile.relationship,
      personalityTraits: profile.personalityTraits,
      messages: [{ id: `m-init-${profile.id}`, sender: 'ai', text: buildWelcomeMessage(profile) }],
      currentVibe: 'witty',
      pulseScore: 84,
    });
    setCurrentConversationId(newId);
  };

  const addProfile = async (
    newProf: Omit<TargetProfileModel, 'id' | 'updatedAt'>
  ): Promise<TargetProfileModel> => {
    const id = await saveProfileMutation(newProf);
    setActiveProfileId(id);
    return { ...newProf, id, updatedAt: new Date().toISOString() };
  };

  const editProfile = async (id: string, updated: Partial<TargetProfileModel>) => {
    const current = profiles.find((p) => p.id === id);
    if (!current) return;
    await updateProfileMutation({
      id: id as Id<'profiles'>,
      name: updated.name ?? current.name,
      gender: updated.gender ?? current.gender,
      relationship: updated.relationship ?? current.relationship,
      personalityTraits: updated.personalityTraits ?? current.personalityTraits,
      likes: updated.likes ?? current.likes,
      thingsToAvoid: updated.thingsToAvoid ?? current.thingsToAvoid,
      vibeSummary: updated.vibeSummary ?? current.vibeSummary,
      avatarEmoji: updated.avatarEmoji ?? current.avatarEmoji,
    });
  };

  const deleteProfile = async (id: string) => {
    await deleteProfileMutation({ id: id as Id<'profiles'> });
    if (activeProfileId === id) {
      const next = profiles.find((p) => p.id !== id);
      setActiveProfileId(next ? next.id : null);
    }
  };

  const startNewSession = async () => {
    const newId = await saveConversationMutation({
      profileId: activeProfile.id,
      title: `Chat with ${activeProfile.name}`,
      targetName: activeProfile.name,
      relationship: activeProfile.relationship,
      personalityTraits: activeProfile.personalityTraits,
      messages: [
        {
          id: `m-ai-welcome-${Date.now()}`,
          sender: 'ai',
          text: buildWelcomeMessage(activeProfile),
          timestamp: 'Just now',
        },
      ],
      currentVibe: 'flirty',
      pulseScore: 80,
    });
    setCurrentConversationId(newId);
  };

  const createCustomSession = async (
    rawText: string,
    mode: 'screenshot' | 'paste' | 'type',
    profile: TargetProfileModel = activeProfile
  ) => {
    const textPrompt = rawText.trim() || 'Probably just staying home lol';
    const userMessageText =
      textPrompt.startsWith('She said:') || textPrompt.startsWith('He said:')
        ? textPrompt
        : `${profile.gender === 'male' ? 'He' : 'She'} said: "${textPrompt}"`;

    const aiResult = await generateRepliesAction({
      lastMessage: textPrompt,
      conversationHistory: [],
      targetName: profile.name,
      relationship: profile.relationship,
      personalityTraits: profile.personalityTraits,
      desiredVibe: 'flirty',
    });

    const userMsg: ChatMessageModel = {
      id: `m-u-${Date.now()}`,
      sender: 'you',
      text: userMessageText,
      timestamp: 'Just now',
    };

    const aiMsg: ChatMessageModel = {
      id: `m-a-${Date.now()}`,
      sender: 'ai',
      text: aiResult.advice,
      sceneContext: aiResult.sceneContext,
      suggestions: pickTopSuggestions(aiResult.responses, 'flirty'),
      timestamp: 'Just now',
    };

    const newId = await saveConversationMutation({
      profileId: profile.id,
      title: `${mode === 'screenshot' ? 'Screenshot' : mode === 'paste' ? 'Pasted chat' : 'Dialogue'} with ${profile.name}`,
      targetName: profile.name,
      relationship: profile.relationship,
      personalityTraits: profile.personalityTraits,
      messages: [userMsg, aiMsg],
      currentVibe: 'flirty',
      pulseScore: 85,
    });
    setCurrentConversationId(newId);
  };

  const loadConversation = (conv: ConversationModel) => {
    setCurrentConversationId(conv.id);
    const matched = profiles.find((p) => p.name.toLowerCase() === conv.targetName.toLowerCase());
    if (matched) setActiveProfileId(matched.id);
  };

  const updateMessages = async (messages: ChatMessageModel[]) => {
    if (!currentConversation.id) return;
    await updateConversationMutation({ id: currentConversation.id as Id<'conversations'>, messages });
  };

  const updateVibe = async (vibe: string) => {
    if (!currentConversation.id) return;
    await updateConversationMutation({
      id: currentConversation.id as Id<'conversations'>,
      messages: currentConversation.messages,
      currentVibe: vibe,
    });
  };

  const upgradePlan = async (plan: 'plus' | 'pro') => {
    await setSubscriptionMutation({ plan, creditsRemaining: 9999, unlimited: true });
  };

  const useCredit = async (): Promise<boolean> => {
    return await useCreditMutation({});
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
        editProfile,
        deleteProfile,
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
