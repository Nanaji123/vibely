import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Palette } from '../theme/colors';
import { ThemeShadows } from '../theme/shadows';
import { ConversationModel, TargetProfileModel } from '../domain/index';

interface HomeScreenProps {
  activeProfile?: TargetProfileModel;
  hasProfiles: boolean;
  recentConversations: ConversationModel[];
  onStartNewSession: () => void;
  onOpenConversation: (conv: ConversationModel) => void;
  onStartChat: () => void;
  onSwitchProfile: () => void;
  onCreateProfile: () => void;
}

const genderLabelOf = (gender?: string) =>
  gender === 'female' ? '👩 Her' : gender === 'male' ? '👨 Him' : '🧑 Them';

export const HomeScreen: React.FC<HomeScreenProps> = ({
  activeProfile,
  hasProfiles,
  recentConversations,
  onStartNewSession,
  onOpenConversation,
  onStartChat,
  onSwitchProfile,
  onCreateProfile,
}) => {
  const contentFade = useSharedValue(0);
  const contentSlide = useSharedValue(18);
  React.useEffect(() => {
    contentFade.value = withTiming(1, { duration: 350 });
    contentSlide.value = withTiming(0, { duration: 350 });
  }, []);
  const contentAnimStyle = useAnimatedStyle(() => ({
    opacity: contentFade.value,
    transform: [{ translateY: contentSlide.value }],
  }));

  // The real conversation for the active profile, if one exists
  const activeConvo = activeProfile
    ? recentConversations.find(
        (c) => c.profileId === activeProfile.id || c.targetName.toLowerCase() === activeProfile.name.toLowerCase()
      )
    : undefined;
  const otherConvos = recentConversations.filter((c) => c.id !== activeConvo?.id).slice(0, 3);

  const targetName = activeProfile?.name ?? '';
  const genderLabel = genderLabelOf(activeProfile?.gender);

  const previewMsgs = activeConvo?.messages ?? [];
  const lastThem = [...previewMsgs].reverse().find((m) => m.sender === 'them')?.text;
  const relayed = previewMsgs
    .find((m) => m.sender === 'you' && /said:/i.test(m.text))
    ?.text.replace(/^(she|he|they) said:/i, '')
    .replace(/["']/g, '')
    .trim();
  const theirText = lastThem ?? relayed;
  const sceneContext = previewMsgs.find((m) => m.sender === 'ai' && m.sceneContext)?.sceneContext;
  const readySuggestions = [...previewMsgs]
    .reverse()
    .find((m) => m.sender === 'ai' && m.suggestions?.length && !m.selectedSuggestionId)?.suggestions?.length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Animated.View style={contentAnimStyle}>
        {/* HEADER */}
        <View style={styles.topStatusHeader}>
          <View>
            <Text style={styles.appBrandTitle}>Vibely AI</Text>
            <Text style={styles.appBrandSub}>AI Conversation Wingman</Text>
          </View>
        </View>

        {!hasProfiles || !activeProfile ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Feather name="user-plus" size={26} color={Palette.indigo600} />
            </View>
            <Text style={styles.emptyTitle}>Add the person you're texting</Text>
            <Text style={styles.emptySub}>
              Create a profile with their name and personality so Vibely can tailor every reply to them. Then start your first chat.
            </Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={onCreateProfile} activeOpacity={0.85}>
              <Feather name="plus" size={15} color="#ffffff" />
              <Text style={styles.emptyBtnText}>Create a profile</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* CURRENT CONVERSATION */}
            <View style={styles.topChatCardSection}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionBadgeBox}>
                  <Feather name="message-circle" size={12} color={Palette.indigo600} />
                  <Text style={styles.sectionBadgeText}>CURRENT CONVERSATION</Text>
                </View>
                {activeConvo?.pulseScore !== undefined ? (
                  <View style={styles.pulsePill}>
                    <Feather name="activity" size={11} color={Palette.emerald600} />
                    <Text style={styles.pulsePillText}>{activeConvo.pulseScore}% Pulse</Text>
                  </View>
                ) : null}
              </View>

              <TouchableOpacity
                style={styles.chatCardOnTop}
                onPress={() => (activeConvo ? onOpenConversation(activeConvo) : onStartChat())}
                activeOpacity={0.9}
              >
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardAvatar}>
                    <Text style={styles.cardAvatarEmoji}>{activeProfile.avatarEmoji || '❤️'}</Text>
                  </View>
                  <View style={styles.cardTargetDetails}>
                    <View style={styles.nameRow}>
                      <Text style={styles.cardTargetName}>{targetName}</Text>
                      <View style={styles.cardGenderChip}>
                        <Text style={styles.cardGenderText}>{genderLabel}</Text>
                      </View>
                      <View style={styles.cardRelChip}>
                        <Text style={styles.cardRelText}>{activeProfile.relationship.toUpperCase()}</Text>
                      </View>
                    </View>
                    <Text style={styles.cardVibeSummary}>{activeProfile.vibeSummary || 'No summary yet'}</Text>
                  </View>
                  <View style={styles.openStudioIcon}>
                    <Feather name="chevron-right" size={20} color={Palette.zinc400} />
                  </View>
                </View>

                {activeConvo ? (
                  <View style={styles.cardPreviewContainer}>
                    <View style={styles.previewBubbleThem}>
                      <Text style={styles.previewLabelThem}>{targetName} said:</Text>
                      <Text style={styles.previewTextThem} numberOfLines={2}>
                        {theirText ? `"${theirText}"` : `Waiting for ${targetName}'s message...`}
                      </Text>
                    </View>
                    {sceneContext ? (
                      <View style={styles.previewBubbleAi}>
                        <View style={styles.aiSnippetRow}>
                          <Feather name="zap" size={11} color={Palette.indigo600} />
                          <Text style={styles.aiSnippetLabel}>AI WINGMAN SCENE ADVICE</Text>
                        </View>
                        <Text style={styles.aiSnippetText} numberOfLines={2}>{sceneContext}</Text>
                      </View>
                    ) : null}
                  </View>
                ) : (
                  <View style={styles.cardPreviewContainer}>
                    <Text style={styles.previewTextThem}>
                      No conversation with {targetName} yet. Start one to get tailored replies.
                    </Text>
                  </View>
                )}

                <View style={styles.cardFooter}>
                  <Text style={styles.cardFooterHint}>
                    {readySuggestions
                      ? `${readySuggestions} tailored responses ready`
                      : activeConvo
                      ? 'Continue the conversation'
                      : 'Ready when you are'}
                  </Text>
                  <View style={styles.cardCtaBtn}>
                    <Text style={styles.cardCtaBtnText}>{activeConvo ? 'Open Chat Studio' : 'Start chat'}</Text>
                    <Feather name="arrow-right" size={12} color="#ffffff" />
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* START NEW SESSION */}
            <View style={styles.newSessionActionSection}>
              <TouchableOpacity style={styles.startSessionPrimaryBtn} onPress={onStartNewSession} activeOpacity={0.88}>
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
                      <Text style={styles.startSessionSubtitle}>Upload screenshot, paste dialogue, or type</Text>
                    </View>
                  </View>
                  <Feather name="arrow-up-right" size={20} color="#ffffff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* ACTIVE PROFILE */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionMainHeading}>Active Target Context</Text>
                <TouchableOpacity onPress={onSwitchProfile} activeOpacity={0.7}>
                  <Text style={styles.switchProfileLink}>Switch Profile →</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.profileContextCard} onPress={onSwitchProfile} activeOpacity={0.85}>
                <View style={styles.profileAvatarLarge}>
                  <Text style={styles.profileAvatarText}>{activeProfile.avatarEmoji || '❤️'}</Text>
                </View>
                <View style={styles.profileMainDetails}>
                  <View style={styles.nameAndTagsRow}>
                    <Text style={styles.profileNameTitle}>{targetName}</Text>
                    <View style={styles.contextGenderTag}>
                      <Text style={styles.contextGenderTagText}>{genderLabel}</Text>
                    </View>
                    <View style={styles.contextRelTag}>
                      <Text style={styles.contextRelTagText}>{activeProfile.relationship}</Text>
                    </View>
                  </View>
                  {activeProfile.vibeSummary ? (
                    <Text style={styles.profileSummaryLine}>{activeProfile.vibeSummary}</Text>
                  ) : null}
                  {activeProfile.personalityTraits.length > 0 ? (
                    <View style={styles.traitsChipsRow}>
                      {activeProfile.personalityTraits.map((trait) => (
                        <View key={trait} style={styles.traitChip}>
                          <Text style={styles.traitChipText}>#{trait}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
              </TouchableOpacity>
            </View>

            {/* RECENT SESSIONS */}
            {otherConvos.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionMainHeading}>Recent Wingman Sessions</Text>
                <View style={styles.recentSessionsList}>
                  {otherConvos.map((c) => {
                    const last = c.messages[c.messages.length - 1];
                    return (
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
                            {last ? last.text : c.title}
                          </Text>
                        </View>
                        <Feather name="chevron-right" size={18} color={Palette.zinc400} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </>
        )}

        {/* FEATURES */}
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

  /* EMPTY STATE */
  emptyCard: {
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderStyle: 'dashed',
    paddingVertical: 34,
    paddingHorizontal: 22,
    marginBottom: 20,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Palette.indigo50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Palette.zinc900,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    color: Palette.zinc500,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Palette.zinc900,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
  },
  emptyBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
});
