import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useAction, useConvexAuth } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import {
  ChatMessageModel,
  ConversationModel,
  TargetProfileModel,
  UserSubscriptionModel,
  SuggestionOptionModel,
  DialogTreeNodeModel,
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

// Convex rejects `undefined` fields, so only include the optional ones that are set
// Turns the stored thread into roles the coach understands: their messages, what you already sent,
// what you asked the coach, and the coach's earlier answers
const buildCoachThread = (messages: ChatMessageModel[]) =>
  messages.slice(-30).map((m) => {
    if (m.sender === 'them' || m.id.startsWith('t-')) {
      return { role: m.sender === 'you' ? 'you_to_them' : 'them', text: m.text };
    }
    if (m.sender === 'you') {
      const sent = m.text.match(/^I sent: "([\s\S]*)"$/);
      return sent ? { role: 'you_to_them', text: sent[1] } : { role: 'user', text: m.text };
    }
    return { role: 'coach', text: m.text };
  });

const serializeMessage = (m: ChatMessageModel) => ({
  id: m.id,
  sender: m.sender,
  text: m.text,
  ...(m.sceneContext !== undefined ? { sceneContext: m.sceneContext } : {}),
  ...(m.suggestions !== undefined ? { suggestions: m.suggestions } : {}),
  ...(m.selectedSuggestionId !== undefined ? { selectedSuggestionId: m.selectedSuggestionId } : {}),
  ...(m.timestamp !== undefined ? { timestamp: m.timestamp } : {}),
});

export interface AccountInfo {
  email: string;
  googleName: string;
  displayName: string | null;
}

interface AppContextType {
  account: AccountInfo | undefined;
  saveDisplayName: (name: string) => Promise<void>;
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
  hasProfiles: boolean;
  createCustomSession: (
    rawText: string,
    mode: 'paste' | 'type',
    profile?: TargetProfileModel
  ) => Promise<void>;
  createScreenshotSession: (images: string[], profile?: TargetProfileModel) => Promise<void>;
  generateReplies: (
    prompt: string,
    vibe: string,
    gender?: string,
    history?: { sender: string; text: string }[]
  ) => Promise<{ advice: string; sceneContext: string; suggestions: SuggestionOptionModel[] }>;
  chatWithCoach: (
    message: string,
    vibe: string,
    gender?: string
  ) => Promise<{ advice: string; sceneContext: string; suggestions: SuggestionOptionModel[] }>;
  generateBranches: (reply: string) => Promise<DialogTreeNodeModel[]>;
  extractChatText: (images: string[]) => Promise<{ sender: 'you' | 'them'; text: string }[]>;
  swapSides: (ids: string[]) => Promise<void>;
  analyzeCurrentConversation: () => Promise<void>;
  loadConversation: (conv: ConversationModel) => void;
  updateMessages: (messages: ChatMessageModel[]) => Promise<void>;
  updateVibe: (vibe: string) => Promise<void>;
  hasMoreMessages: boolean;
  loadEarlierMessages: () => void;
  upgradePlan: (plan: 'plus' | 'pro') => Promise<void>;
  useCredit: () => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useConvexAuth();

  const profilesQuery = useQuery(api.profiles.listProfiles, isAuthenticated ? {} : 'skip');
  const conversationsQuery = useQuery(api.conversations.listConversations, isAuthenticated ? {} : 'skip');
  const subscriptionQuery = useQuery(api.subscriptions.getSubscription, isAuthenticated ? {} : 'skip');
  const account = useQuery(api.userProfiles.getMyProfile, isAuthenticated ? {} : 'skip');
  const setDisplayNameMutation = useMutation(api.userProfiles.setDisplayName);

  const saveProfileMutation = useMutation(api.profiles.saveProfile);
  const updateProfileMutation = useMutation(api.profiles.updateProfile);
  const deleteProfileMutation = useMutation(api.profiles.deleteProfile);
  const saveConversationMutation = useMutation(api.conversations.saveConversation);
  const updateConversationMutation = useMutation(api.conversations.updateConversation);
  const syncMessagesMutation = useMutation(api.conversations.syncMessages);
  const setSubscriptionMutation = useMutation(api.subscriptions.setSubscription);
  const useCreditMutation = useMutation(api.subscriptions.useCredit);
  const generateRepliesAction = useAction(api.ai.generateReplies);
  const coachChatAction = useAction(api.ai.coachChat);
  const extractChatAction = useAction(api.ai.extractChatFromImages);
  const generateBranchesAction = useAction(api.ai.generateBranches);
  const swapSidesMutation = useMutation(api.conversations.swapSides);
  const analyzePulseAction = useAction(api.ai.analyzeConversationPulse);
  const saveAnalysisMutation = useMutation(api.conversations.saveAnalysis);

  const profiles: TargetProfileModel[] = useMemo(
    () =>
      (profilesQuery ?? []).map((doc) => ({
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
      })),
    [profilesQuery]
  );

  const conversations: ConversationModel[] = useMemo(
    () =>
      (conversationsQuery ?? []).map((doc) => ({
        id: doc._id,
        profileId: doc.profileId,
        title: doc.title,
        targetName: doc.targetName,
        relationship: doc.relationship,
        personalityTraits: doc.personalityTraits,
        messages: doc.messages,
        currentVibe: doc.currentVibe,
        pulseScore: doc.pulseScore,
        analysis: doc.analysis,
        updatedAt: doc.updatedAt,
      })),
    [conversationsQuery]
  );

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
  const conversationSummary =
    conversations.find((c) => c.id === currentConversationId) ?? conversations[0] ?? EMPTY_CONVERSATION;

  // The list only carries a short preview per conversation; load the open thread separately
  const [messageLimit, setMessageLimit] = useState(60);
  useEffect(() => {
    setMessageLimit(60);
  }, [conversationSummary.id]);

  const threadQuery = useQuery(
    api.conversations.listMessages,
    isAuthenticated && conversationSummary.id
      ? { conversationId: conversationSummary.id as Id<'conversations'>, limit: messageLimit }
      : 'skip'
  );

  const currentConversation = useMemo(
    () => (threadQuery ? { ...conversationSummary, messages: threadQuery.messages } : conversationSummary),
    [conversationSummary, threadQuery]
  );
  const hasMoreMessages = threadQuery?.hasMore ?? false;

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
    });
    setCurrentConversationId(newId);
  };

  const requestReplies = async (
    profile: TargetProfileModel,
    lastMessage: string,
    history: { sender: string; text: string }[],
    vibe: string,
    gender: string = profile.gender
  ) => {
    const result = await generateRepliesAction({
      lastMessage,
      conversationHistory: history,
      targetName: profile.name,
      relationship: `${profile.relationship} (refer to them as ${pronoun(gender, 'subject')}/${pronoun(gender, 'object')})`,
      personalityTraits: profile.personalityTraits,
      desiredVibe: vibe,
    });
    return {
      advice: result.advice as string,
      sceneContext: result.sceneContext as string,
      suggestions: pickTopSuggestions(result.responses, vibe),
    };
  };

  const createCustomSession = async (
    rawText: string,
    mode: 'paste' | 'type',
    profile: TargetProfileModel = activeProfile
  ) => {
    const textPrompt = rawText.trim();
    if (!textPrompt) throw new Error('Enter what they said first.');
    const userMessageText =
      textPrompt.startsWith('She said:') || textPrompt.startsWith('He said:')
        ? textPrompt
        : `${profile.gender === 'male' ? 'He' : 'She'} said: "${textPrompt}"`;

    const ai = await requestReplies(profile, textPrompt, [], 'flirty');

    const userMsg: ChatMessageModel = {
      id: `m-u-${Date.now()}`,
      sender: 'you',
      text: userMessageText,
      timestamp: 'Just now',
    };
    const aiMsg: ChatMessageModel = {
      id: `m-a-${Date.now()}`,
      sender: 'ai',
      text: ai.advice,
      sceneContext: ai.sceneContext,
      suggestions: ai.suggestions,
      timestamp: 'Just now',
    };

    const newId = await saveConversationMutation({
      profileId: profile.id,
      title: `${mode === 'paste' ? 'Pasted chat' : 'Dialogue'} with ${profile.name}`,
      targetName: profile.name,
      relationship: profile.relationship,
      personalityTraits: profile.personalityTraits,
      messages: [userMsg, aiMsg].map(serializeMessage),
      currentVibe: 'flirty',
    });
    setCurrentConversationId(newId);
  };

  // Reads the chat out of screenshots (vision model), then coaches on the real last message
  const createScreenshotSession = async (
    images: string[],
    profile: TargetProfileModel = activeProfile
  ) => {
    const { messages: transcript } = await extractChatAction({ images, targetName: profile.name });
    const lastThem = [...transcript].reverse().find((m) => m.sender === 'them');
    if (!lastThem) {
      throw new Error("Couldn't find the other person's messages in those screenshots. Try clearer screenshots.");
    }

    const recent = transcript.slice(-40);
    const ai = await requestReplies(profile, lastThem.text, recent, 'flirty');

    const stamp = Date.now();
    const transcriptMsgs: ChatMessageModel[] = recent.map((m, i) => ({
      id: `t-${stamp}-${i}`,
      sender: m.sender,
      text: m.text,
    }));
    const aiMsg: ChatMessageModel = {
      id: `m-a-${stamp}`,
      sender: 'ai',
      text: ai.advice,
      sceneContext: ai.sceneContext,
      suggestions: ai.suggestions,
      timestamp: 'Just now',
    };

    const newId = await saveConversationMutation({
      profileId: profile.id,
      title: `Screenshot with ${profile.name}`,
      targetName: profile.name,
      relationship: profile.relationship,
      personalityTraits: profile.personalityTraits,
      messages: [...transcriptMsgs, aiMsg].map(serializeMessage),
      currentVibe: 'flirty',
    });
    setCurrentConversationId(newId);
  };

  // Replies for a new message typed inside the open chat
  const generateReplies = (
    prompt: string,
    vibe: string,
    gender?: string,
    history?: { sender: string; text: string }[]
  ) =>
    requestReplies(
      activeProfile,
      prompt,
      history ?? currentConversation.messages.slice(-12).map((m) => ({ sender: m.sender, text: m.text })),
      vibe,
      gender
    );

  const extractChatText = async (images: string[]) => {
    const { messages } = await extractChatAction({ images, targetName: activeProfile.name });
    return messages;
  };

  const swapSides = async (ids: string[]) => {
    if (!currentConversation.id || ids.length === 0) return;
    await swapSidesMutation({ conversationId: currentConversation.id as Id<'conversations'>, ids });
  };

  // Typed messages in the studio are talk with the wingman, not something the other person said
  const chatWithCoach = async (message: string, vibe: string, gender: string = activeProfile.gender) => {
    const result = await coachChatAction({
      message,
      thread: buildCoachThread(currentConversation.messages),
      targetName: activeProfile.name,
      relationship: `${activeProfile.relationship} (refer to them as ${pronoun(gender, 'subject')}/${pronoun(gender, 'object')})`,
      personalityTraits: activeProfile.personalityTraits,
      desiredVibe: vibe,
    });
    const stamp = Date.now();
    return {
      advice: result.advice,
      sceneContext: result.sceneContext,
      suggestions: (result.responses as { category: string; replyText: string; explanation: string }[]).map((r, i) => ({
        id: `s-${stamp}-${i}`,
        category: r.category,
        replyText: r.replyText,
        toneVariant: r.explanation,
      })),
    };
  };

  const generateBranches = async (reply: string): Promise<DialogTreeNodeModel[]> => {
    const { nodes } = await generateBranchesAction({
      suggestedReply: reply,
      targetName: activeProfile.name,
      relationship: activeProfile.relationship,
      personalityTraits: activeProfile.personalityTraits,
    });
    return nodes;
  };

  // Runs the AI pulse analysis for the open conversation and stores it on the conversation
  const analyzeCurrentConversation = async () => {
    if (!currentConversation.id) return;
    const analysis = await analyzePulseAction({
      messages: currentConversation.messages.map((m) => ({ sender: m.sender, text: m.text })),
      targetName: currentConversation.targetName || activeProfile.name,
      relationship: currentConversation.relationship || activeProfile.relationship,
      personalityTraits: currentConversation.personalityTraits,
    });
    await saveAnalysisMutation({ id: currentConversation.id as Id<'conversations'>, analysis });
  };

  const loadConversation = (conv: ConversationModel) => {
    setCurrentConversationId(conv.id);
    const matched = profiles.find((p) => p.name.toLowerCase() === conv.targetName.toLowerCase());
    if (matched) setActiveProfileId(matched.id);
  };

  // Sends only what changed (new messages / suggestion selections), never the whole thread
  const updateMessages = async (messages: ChatMessageModel[]) => {
    if (!currentConversation.id) return;
    const existing = new Map(currentConversation.messages.map((m) => [m.id, m]));
    const overlaps = messages.some((m) => existing.has(m.id));
    const replace = existing.size > 0 && !overlaps;

    const append = messages.filter((m) => replace || !existing.has(m.id)).map(serializeMessage);
    const patches = replace
      ? []
      : messages
          .filter((m) => {
            const prev = existing.get(m.id);
            return prev && m.selectedSuggestionId && prev.selectedSuggestionId !== m.selectedSuggestionId;
          })
          .map((m) => ({ id: m.id, selectedSuggestionId: m.selectedSuggestionId as string }));

    if (!replace && append.length === 0 && patches.length === 0) return;
    await syncMessagesMutation({
      conversationId: currentConversation.id as Id<'conversations'>,
      replace,
      append,
      patches,
    });
  };

  const updateVibe = async (vibe: string) => {
    if (!currentConversation.id) return;
    await updateConversationMutation({
      id: currentConversation.id as Id<'conversations'>,
      currentVibe: vibe,
    });
  };

  const loadEarlierMessages = () => setMessageLimit((n) => n + 60);

  const upgradePlan = async (plan: 'plus' | 'pro') => {
    await setSubscriptionMutation({ plan, creditsRemaining: 9999, unlimited: true });
  };

  const useCredit = async (): Promise<boolean> => {
    return await useCreditMutation({});
  };

  const saveDisplayName = async (name: string) => {
    await setDisplayNameMutation({ displayName: name });
  };

  return (
    <AppContext.Provider
      value={{
        account,
        saveDisplayName,
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
        hasProfiles: profiles.length > 0,
        createCustomSession,
        createScreenshotSession,
        generateReplies,
        chatWithCoach,
        generateBranches,
        extractChatText,
        swapSides,
        analyzeCurrentConversation,
        loadConversation,
        updateMessages,
        updateVibe,
        hasMoreMessages,
        loadEarlierMessages,
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
