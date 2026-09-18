import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  BackHandler,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { Palette, ThemeColors } from '../theme/colors';
import { ThemeShadows } from '../theme/shadows';
import { ConversationModel, TargetProfileModel } from '../domain/index';
import { AIService } from '../services/aiService';

interface HomeScreenProps {
  activeProfile?: TargetProfileModel;
  recentConversations: ConversationModel[];
  onStartNewSession: () => void;
  onCreateCustomSession?: (rawText: string, mode: 'screenshot' | 'paste' | 'type') => void;
  onOpenConversation: (conv: ConversationModel) => void;
  onSwitchProfile: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  activeProfile,
  recentConversations,
  onStartNewSession,
  onCreateCustomSession,
  onOpenConversation,
  onSwitchProfile,
}) => {
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [modalMode, setModalMode] = useState<'picker' | 'paste'>('picker');
  const [pasteText, setPasteText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Skeleton pulse animation
  const skeletonOpacity = useSharedValue(0.4);
  useEffect(() => {
    skeletonOpacity.value = withRepeat(withTiming(0.9, { duration: 700 }), -1, true);
  }, []);
  const skeletonAnimStyle = useAnimatedStyle(() => ({ opacity: skeletonOpacity.value }));

  // Handle Android Back Gesture / Button
  useEffect(() => {
    const onBackPress = () => {
      if (showNewSessionModal) {
        setShowNewSessionModal(false);
        setModalMode('picker');
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [showNewSessionModal]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 850);
  };

  // Top/Current active conversation matching activeProfile
  const activeConvo = recentConversations.find(
    (c) =>
      (activeProfile?.id && c.profileId === activeProfile.id) ||
      (activeProfile?.name && c.targetName.toLowerCase() === activeProfile.name.toLowerCase())
  );

  const currentConvo: ConversationModel = activeConvo || {
    id: `conv-${activeProfile?.id || 'default'}`,
    profileId: activeProfile?.id,
    title: `Wingman Session with ${activeProfile?.name || 'Target'}`,
    targetName: activeProfile?.name || 'Target',
    relationship: activeProfile?.relationship || 'crush',
    personalityTraits: activeProfile?.personalityTraits || [],
    messages: [
      {
        id: `m-init-${activeProfile?.id || 'default'}`,
        sender: 'ai',
        text: `Hey! I'm your wingman for ${activeProfile?.name || 'your target'}. What did ${
          activeProfile?.gender === 'male' ? 'he' : activeProfile?.gender === 'female' ? 'she' : 'they'
        } text you? Tell me what ${
          activeProfile?.gender === 'male' ? 'he' : activeProfile?.gender === 'female' ? 'she' : 'they'
        } said, or upload a screenshot and I'll break down ${
          activeProfile?.gender === 'male' ? 'his' : activeProfile?.gender === 'female' ? 'her' : 'their'
        } signals.`,
      },
    ],
    currentVibe: 'witty',
    pulseScore: 84,
    updatedAt: new Date().toISOString(),
  };

  const targetName = activeProfile?.name || currentConvo.targetName;
  const targetGender = activeProfile?.gender || 'female';
  const genderLabel = targetGender === 'female' ? '👩 Her' : targetGender === 'male' ? '👨 Him' : '🧑 Them';

  // 1. Upload Screenshot Handler
  const handleUploadScreenshot = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const extracted = AIService.extractChatFromImage(result.assets[0].uri);
        const lastMsg = extracted.messages[extracted.messages.length - 1]?.text || 'Probably just staying home lol';
        if (onCreateCustomSession) {
          onCreateCustomSession(lastMsg, 'screenshot');
        }
      }
    } catch (e) {
      // Ignore user cancellation or access denial
    }
    setShowNewSessionModal(false);
    setModalMode('picker');
  };

  // 2. Paste Submit Handler
  const handlePasteSubmit = () => {
    if (!pasteText.trim()) return;
    if (onCreateCustomSession) {
      onCreateCustomSession(pasteText.trim(), 'paste');
    }
    setPasteText('');
    setShowNewSessionModal(false);
    setModalMode('picker');
  };

  // 3. Quick Paste from Clipboard
  const handlePasteFromClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setPasteText(text);
      }
    } catch (e) {}
  };

  // 4. Type Directly in Chat Handler
  const handleTypeInChat = () => {
    setShowNewSessionModal(false);
    setModalMode('picker');
    onStartNewSession();
  };

  // Entrance Animation
  const contentFade = useSharedValue(0);
  const contentSlide = useSharedValue(18);

  useEffect(() => {
    contentFade.value = withTiming(1, { duration: 350 });
    contentSlide.value = withTiming(0, { duration: 350 });
  }, []);

  const contentAnimStyle = useAnimatedStyle(() => ({
    opacity: contentFade.value,
    transform: [{ translateY: contentSlide.value }],
  }));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Palette.indigo600}
          colors={[Palette.indigo600, Palette.zinc900]}
        />
      }
    >
      <Animated.View style={contentAnimStyle}>
      {/* 1. TOP HEADER & STATUS BAR */}
      <View style={styles.topStatusHeader}>
        <View>
          <Text style={styles.appBrandTitle}>Vibely AI</Text>
          <Text style={styles.appBrandSub}>AI Conversation Wingman</Text>
        </View>

        <View style={styles.onlineBadge}>
          <View style={styles.onlineGreenDot} />
          <Text style={styles.onlineBadgeText}>AI Engine Active</Text>
        </View>
      </View>

      {/* SKELETON LOADER STATE (Rendered when pulling to refresh) */}
      {refreshing ? (
        <View style={{ gap: 14, marginBottom: 16 }}>
          <Animated.View style={[styles.skeletonCard, skeletonAnimStyle]}>
            <View style={styles.skeletonLineTop} />
            <View style={styles.skeletonLineMid} />
            <View style={styles.skeletonLineShort} />
          </Animated.View>
          <Animated.View style={[styles.skeletonCardSmall, skeletonAnimStyle]}>
            <View style={styles.skeletonLineTop} />
          </Animated.View>
        </View>
      ) : (
        /* 2. CURRENT CONVO CARD ON TOP (The Chat Card on Top!) */
        currentConvo ? (
          <View style={styles.topChatCardSection}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionBadgeBox}>
                <Feather name="message-circle" size={12} color={Palette.indigo600} />
                <Text style={styles.sectionBadgeText}>CURRENT CONVERSATION</Text>
              </View>
              <View style={styles.pulsePill}>
                <Feather name="activity" size={11} color={Palette.emerald600} />
                <Text style={styles.pulsePillText}>{currentConvo.pulseScore || 84}% Pulse</Text>
              </View>
            </View>

          {/* Interactive Chat Card */}
          <TouchableOpacity
            style={styles.chatCardOnTop}
            onPress={() => onOpenConversation(currentConvo)}
            activeOpacity={0.9}
          >
            {/* Target Header Inside Card */}
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardAvatar}>
                <Text style={styles.cardAvatarEmoji}>
                  {activeProfile?.avatarEmoji || (targetName === 'Sarah' ? '💕' : '❤️')}
                </Text>
              </View>

              <View style={styles.cardTargetDetails}>
                <View style={styles.nameRow}>
                  <Text style={styles.cardTargetName}>{targetName}</Text>
                  <View style={styles.cardGenderChip}>
                    <Text style={styles.cardGenderText}>{genderLabel}</Text>
                  </View>
                  <View style={styles.cardRelChip}>
                    <Text style={styles.cardRelText}>
                      {(activeProfile?.relationship || currentConvo.relationship || 'crush').toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cardVibeSummary}>
                  {activeProfile?.vibeSummary || currentConvo.title || `Chat with ${targetName}`}
                </Text>
              </View>

              <View style={styles.openStudioIcon}>
                <Feather name="chevron-right" size={20} color={Palette.zinc400} />
              </View>
            </View>

            {/* Chat Preview Bubbles Inside Card */}
            <View style={styles.cardPreviewContainer}>
              {/* Target Message Preview */}
              <View style={styles.previewBubbleThem}>
                <Text style={styles.previewLabelThem}>
                  {targetName} said:
                </Text>
                <Text style={styles.previewTextThem} numberOfLines={2}>
                  "{currentConvo.messages?.find(m => m.sender === 'you' && m.text.includes('said:'))?.text.replace(/^She said:|^He said:|^They said:/i, '').replace(/["']/g, '').trim() ||
                    currentConvo.messages?.[currentConvo.messages.length - 1]?.text ||
                    `Waiting for ${targetName}'s message...`}"
                </Text>
              </View>

              {/* AI Coaching Snippet */}
              <View style={styles.previewBubbleAi}>
                <View style={styles.aiSnippetRow}>
                  <Feather name="zap" size={11} color={Palette.indigo600} />
                  <Text style={styles.aiSnippetLabel}>AI WINGMAN SCENE ADVICE</Text>
                </View>
                <Text style={styles.aiSnippetText} numberOfLines={2}>
                  {currentConvo.messages?.find(m => m.sender === 'ai' && m.sceneContext)?.sceneContext ||
                    `Wingman ready for ${targetName}. Upload screenshot or type their last text to generate responses!`}
                </Text>
              </View>
            </View>

            {/* Card Footer CTA */}
            <View style={styles.cardFooter}>
              <Text style={styles.cardFooterHint}>3 tailored responses ready in studio</Text>
              <View style={styles.cardCtaBtn}>
                <Text style={styles.cardCtaBtnText}>Open Chat Studio</Text>
                <Feather name="arrow-right" size={12} color="#ffffff" />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      ) : null)}

      {/* 3. PRIMARY ACTION: START NEW SESSION */}
      <View style={styles.newSessionActionSection}>
        <TouchableOpacity
          style={styles.startSessionPrimaryBtn}
          onPress={onStartNewSession}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={['#18181b', '#27272a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.startSessionGradient}
          >
            <View style={styles.startSessionLeft}>
              <View style={styles.plusIconSquare}>
                <Feather name="plus" size={20} color="#ffffff" />
              </View>
              <View>
                <Text style={styles.startSessionTitle}>Start New Session</Text>
                <Text style={styles.startSessionSubtitle}>
                  Upload screenshot, paste dialogue, or type
                </Text>
              </View>
            </View>

            <Feather name="arrow-up-right" size={20} color="#ffffff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* 4. ACTIVE PERSONALITY PROFILE CONTEXT */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionMainHeading}>Active Target Context</Text>
          <TouchableOpacity onPress={onSwitchProfile} activeOpacity={0.7}>
            <Text style={styles.switchProfileLink}>Switch Profile →</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.profileContextCard}
          onPress={() => onOpenConversation(currentConvo)}
          activeOpacity={0.85}
        >
          <View style={styles.profileAvatarLarge}>
            <Text style={styles.profileAvatarText}>{activeProfile?.avatarEmoji || '❤️'}</Text>
          </View>

          <View style={styles.profileMainDetails}>
            <View style={styles.nameAndTagsRow}>
              <Text style={styles.profileNameTitle}>{targetName}</Text>
              <View style={styles.contextGenderTag}>
                <Text style={styles.contextGenderTagText}>{genderLabel}</Text>
              </View>
              <View style={styles.contextRelTag}>
                <Text style={styles.contextRelTagText}>{activeProfile?.relationship || 'Crush'}</Text>
              </View>
            </View>

            <Text style={styles.profileSummaryLine}>
              {activeProfile?.vibeSummary || 'Witty & Reserved (Crush Context)'}
            </Text>

            {/* Personality Chips */}
            <View style={styles.traitsChipsRow}>
              {(activeProfile?.personalityTraits || ['witty', 'reserved', 'sarcastic']).map((trait) => (
                <View key={trait} style={styles.traitChip}>
                  <Text style={styles.traitChipText}>#{trait}</Text>
                </View>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* 5. RECENT SESSIONS HISTORY */}
      {recentConversations.length > 1 && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionMainHeading}>Recent Wingman Sessions</Text>
          <View style={styles.recentSessionsList}>
            {recentConversations.slice(1, 4).map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.recentSessionItemCard}
                onPress={() => onOpenConversation(c)}
                activeOpacity={0.85}
              >
                <View style={styles.recentLeftIcon}>
                  <Feather name="message-square" size={16} color={Palette.indigo600} />
                </View>
                <View style={styles.recentDetails}>
                  <View style={styles.recentTopRow}>
                    <Text style={styles.recentTargetName}>{c.targetName}</Text>
                    <View style={styles.recentVibeBadge}>
                      <Text style={styles.recentVibeText}>{c.currentVibe}</Text>
                    </View>
                  </View>
                  <Text style={styles.recentPreviewText} numberOfLines={1}>
                    "{c.messages?.[c.messages.length - 1]?.text || c.title}"
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color={Palette.zinc400} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* 6. WINGMAN TACTICAL ARSENAL (Quick Feature Highlights) */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionMainHeading}>Tactical Arsenal</Text>
        <View style={styles.arsenalRow}>
          <View style={styles.arsenalCard}>
            <View style={[styles.arsenalIconCircle, { backgroundColor: '#eff6ff' }]}>
              <Feather name="zap" size={16} color={Palette.indigo600} />
            </View>
            <Text style={styles.arsenalCardTitle}>Vibe Tuning</Text>
            <Text style={styles.arsenalCardSub}>Flirty, Witty, Playful, Warm</Text>
          </View>

          <View style={styles.arsenalCard}>
            <View style={[styles.arsenalIconCircle, { backgroundColor: '#ecfdf5' }]}>
              <Feather name="activity" size={16} color={Palette.emerald600} />
            </View>
            <Text style={styles.arsenalCardTitle}>Subtext Pulse</Text>
            <Text style={styles.arsenalCardSub}>Decode interest & intentions</Text>
          </View>

          <View style={styles.arsenalCard}>
            <View style={[styles.arsenalIconCircle, { backgroundColor: '#fdf2f8' }]}>
              <Feather name="git-branch" size={16} color="#db2777" />
            </View>
            <Text style={styles.arsenalCardTitle}>Dialog Trees</Text>
            <Text style={styles.arsenalCardSub}>If they say X → Say Y</Text>
          </View>
        </View>
      </View>
      </Animated.View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110,
  },

  /* 1. TOP STATUS HEADER */
  topStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 4,
  },
  appBrandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Palette.zinc900,
    letterSpacing: -0.5,
  },
  appBrandSub: {
    fontSize: 12,
    color: Palette.zinc500,
    fontWeight: '600',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  onlineGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Palette.emerald600,
  },
  onlineBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.emerald600,
  },

  /* 2. TOP CHAT CARD (SHOW ON TOP LIKE CURRENT CONVO IN A CARD OF CHAT) */
  topChatCardSection: {
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sectionBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Palette.indigo600,
    letterSpacing: 0.5,
  },
  pulsePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  pulsePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: Palette.emerald600,
  },
  chatCardOnTop: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    padding: 16,
    ...ThemeShadows.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  cardAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f4f4f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardAvatarEmoji: {
    fontSize: 22,
  },
  cardTargetDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  cardTargetName: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.zinc900,
  },
  cardGenderChip: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  cardGenderText: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.indigo600,
  },
  cardRelChip: {
    backgroundColor: Palette.zinc100,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  cardRelText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: Palette.zinc700,
  },
  cardVibeSummary: {
    fontSize: 12,
    color: Palette.zinc500,
    fontWeight: '600',
  },
  openStudioIcon: {
    padding: 4,
  },

  /* Preview bubbles inside top card */
  cardPreviewContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  previewBubbleThem: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  previewLabelThem: {
    fontSize: 10,
    fontWeight: '800',
    color: Palette.zinc500,
    marginBottom: 2,
  },
  previewTextThem: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.zinc900,
    lineHeight: 18,
  },
  previewBubbleAi: {
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: Palette.indigo600,
  },
  aiSnippetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  aiSnippetLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: Palette.indigo600,
    letterSpacing: 0.3,
  },
  aiSnippetText: {
    fontSize: 12,
    color: Palette.zinc800,
    lineHeight: 16,
  },

  /* Card footer */
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardFooterHint: {
    fontSize: 11,
    color: Palette.zinc500,
    fontWeight: '600',
  },
  cardCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Palette.zinc900,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  cardCtaBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#ffffff',
  },

  /* 3. START NEW SESSION BUTTON */
  newSessionActionSection: {
    marginBottom: 20,
  },
  startSessionPrimaryBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    ...ThemeShadows.sm,
  },
  startSessionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  startSessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  plusIconSquare: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startSessionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  startSessionSubtitle: {
    fontSize: 11,
    color: Palette.zinc400,
    marginTop: 1,
  },

  /* SECTIONS COMMON */
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionMainHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: Palette.zinc900,
    letterSpacing: -0.2,
  },
  switchProfileLink: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.indigo600,
  },

  /* 4. ACTIVE PROFILE CARD */
  profileContextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
    ...ThemeShadows.sm,
  },
  profileAvatarLarge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f4f4f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarText: {
    fontSize: 24,
  },
  profileMainDetails: {
    flex: 1,
  },
  nameAndTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  profileNameTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Palette.zinc900,
  },
  contextGenderTag: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  contextGenderTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.indigo600,
  },
  contextRelTag: {
    backgroundColor: Palette.zinc100,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  contextRelTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.zinc700,
  },
  profileSummaryLine: {
    fontSize: 12,
    color: Palette.zinc500,
    marginBottom: 6,
  },
  traitsChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  traitChip: {
    backgroundColor: Palette.zinc100,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  traitChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: Palette.zinc600,
  },

  /* 5. RECENT SESSIONS */
  recentSessionsList: {
    gap: 8,
  },
  recentSessionItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 10,
    ...ThemeShadows.sm,
  },
  recentLeftIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: Palette.zinc100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentDetails: {
    flex: 1,
  },
  recentTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  recentTargetName: {
    fontSize: 13,
    fontWeight: '800',
    color: Palette.zinc900,
  },
  recentVibeBadge: {
    backgroundColor: Palette.zinc100,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  recentVibeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.zinc600,
  },
  recentPreviewText: {
    fontSize: 12,
    color: Palette.zinc500,
  },

  /* 6. ARSENAL ROW */
  arsenalRow: {
    flexDirection: 'row',
    gap: 8,
  },
  arsenalCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'flex-start',
    ...ThemeShadows.sm,
  },
  arsenalIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  arsenalCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Palette.zinc900,
    marginBottom: 2,
  },
  arsenalCardSub: {
    fontSize: 10,
    color: Palette.zinc500,
    lineHeight: 14,
  },

  /* SKELETON STYLES */
  skeletonCard: {
    backgroundColor: '#f4f4f5',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    gap: 12,
  },
  skeletonCardSmall: {
    backgroundColor: '#f4f4f5',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  skeletonLineTop: {
    width: '40%',
    height: 14,
    borderRadius: 7,
    backgroundColor: '#e4e4e7',
  },
  skeletonLineMid: {
    width: '85%',
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e4e4e7',
  },
  skeletonLineShort: {
    width: '60%',
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e4e4e7',
  },
});
