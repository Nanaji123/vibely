import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Palette } from '../theme/colors';
import { ThemeShadows } from '../theme/shadows';
import { ConversationModel, TargetProfileModel, UserSubscriptionModel, isUnlimited, messagesLeft, chatsLeft } from '../domain/index';
import { usePullRefresh } from '../lib/usePullRefresh';

type SessionMethod = 'screenshot' | 'paste';

interface HomeScreenProps {
  activeProfile?: TargetProfileModel;
  hasProfiles: boolean;
  profiles: TargetProfileModel[];
  recentConversations: ConversationModel[];
  // The open thread with its full messages; list items only carry a short preview
  currentConversation?: ConversationModel;
  subscription: UserSubscriptionModel;
  displayName: string;
  onStartNewSession: (method?: SessionMethod) => void;
  onOpenConversation: (conv: ConversationModel) => void;
  onStartChat: () => void;
  onSwitchProfile: () => void;
  onCreateProfile: () => void;
  onSelectProfile: (profile: TargetProfileModel) => void;
  onOpenPaywall: () => void;
  onViewAllChats: () => void;
}

const RELATIONSHIP_LABEL: Record<string, string> = {
  crush: 'Crush',
  dating: 'Dating',
  partner: 'Partner',
  friend: 'Friend',
  bro: 'Buddy',
  colleague: 'Work',
  family: 'Family',
  ex: 'Reconnecting',
};

const formatAgo = (iso: string) => {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};

// Their last line, whether it came from a screenshot/paste or was relayed as "She said: ..."
const lastTheirLine = (conv?: ConversationModel) => {
  if (!conv) return undefined;
  const msgs = [...conv.messages].reverse();
  const them = msgs.find((m) => m.sender === 'them')?.text;
  if (them) return them;
  return msgs
    .find((m) => m.sender === 'you' && /said:/i.test(m.text))
    ?.text.replace(/^(she|he|they) said:/i, '')
    .replace(/^\s*["']|["']\s*$/g, '')
    .trim();
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  activeProfile,
  hasProfiles,
  profiles,
  recentConversations,
  currentConversation,
  subscription,
  displayName,
  onStartNewSession,
  onOpenConversation,
  onStartChat,
  onSwitchProfile,
  onCreateProfile,
  onSelectProfile,
  onOpenPaywall,
  onViewAllChats,
}) => {
  const { refreshing, onRefresh } = usePullRefresh();
  const fade = useSharedValue(0);
  const slide = useSharedValue(14);
  React.useEffect(() => {
    fade.value = withTiming(1, { duration: 320 });
    slide.value = withTiming(0, { duration: 320 });
  }, []);
  const animStyle = useAnimatedStyle(() => ({ opacity: fade.value, transform: [{ translateY: slide.value }] }));

  const firstName = displayName.trim().split(/\s+/)[0] || 'there';
  const isFree = !isUnlimited(subscription);
  const repliesLeft = messagesLeft(subscription);
  const chatsRemaining = chatsLeft(subscription);

  const belongsToActive = (c: ConversationModel) =>
    !!activeProfile && (c.profileId === activeProfile.id || c.targetName.toLowerCase() === activeProfile.name.toLowerCase());
  const activeConvo =
    currentConversation?.id && belongsToActive(currentConversation)
      ? currentConversation
      : recentConversations.find(belongsToActive);
  const others = recentConversations.filter((c) => c.id !== activeConvo?.id);
  const recents = others.slice(0, 3);
  const theirLine = lastTheirLine(activeConvo);
  const sceneRead = [...(activeConvo?.messages ?? [])].reverse().find((m) => m.sender === 'ai' && m.sceneContext)?.sceneContext;
  const readyCount = [...(activeConvo?.messages ?? [])]
    .reverse()
    .find((m) => m.sender === 'ai' && m.suggestions?.length && !m.selectedSuggestionId)?.suggestions?.length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Palette.zinc900} />}
    >
      <Animated.View style={animStyle}>
        {/* GREETING */}
        <View style={styles.greetingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Hey {firstName}</Text>
            <Text style={styles.greetingSub}>
              {hasProfiles && activeProfile ? `Let's get ${activeProfile.name} replying.` : 'Who are we texting today?'}
            </Text>
          </View>
          <TouchableOpacity style={[styles.planPill, !isFree && styles.planPillPro]} onPress={onOpenPaywall} activeOpacity={0.8}>
            <Feather name="zap" size={12} color={isFree ? Palette.zinc900 : '#ffffff'} />
            <Text style={[styles.planPillText, !isFree && styles.planPillTextPro]}>
              {isFree ? `${repliesLeft} replies left` : subscription.plan === 'pro' ? 'PRO' : 'PLUS'}
            </Text>
          </TouchableOpacity>
        </View>

        {!hasProfiles || !activeProfile ? (
          <FirstRun onCreateProfile={onCreateProfile} />
        ) : (
          <>
            {/* NOW TEXTING */}
            <TouchableOpacity
              style={styles.hero}
              onPress={() => (activeConvo ? onOpenConversation(activeConvo) : onStartChat())}
              activeOpacity={0.92}
            >
              <LinearGradient colors={['#18181b', '#27272a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroGradient}>
                <View style={styles.heroTop}>
                  <View style={styles.heroAvatar}>
                    <Text style={styles.heroAvatarEmoji}>{activeProfile.avatarEmoji || '❤️'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.heroEyebrow}>NOW TEXTING</Text>
                    <View style={styles.heroNameRow}>
                      <Text style={styles.heroName} numberOfLines={1}>
                        {activeProfile.name}
                      </Text>
                      <View style={styles.heroChip}>
                        <Text style={styles.heroChipText}>
                          {RELATIONSHIP_LABEL[activeProfile.relationship] ?? activeProfile.relationship}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {activeConvo?.pulseScore !== undefined ? (
                    <View style={styles.pulseBubble}>
                      <Text style={styles.pulseBubbleValue}>{activeConvo.pulseScore}</Text>
                      <Text style={styles.pulseBubbleLabel}>pulse</Text>
                    </View>
                  ) : null}
                </View>

                {activeConvo && theirLine ? (
                  <View style={styles.heroBody}>
                    <View style={styles.theirBubble}>
                      <Text style={styles.theirLabel}>{activeProfile.name}</Text>
                      <Text style={styles.theirText} numberOfLines={2}>
                        {theirLine}
                      </Text>
                    </View>
                    {sceneRead ? (
                      <View style={styles.readRow}>
                        <Feather name="eye" size={12} color="#a5b4fc" />
                        <Text style={styles.readText} numberOfLines={2}>
                          {sceneRead}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ) : (
                  <View style={styles.heroBody}>
                    <Text style={styles.heroEmptyText}>
                      {activeConvo ? `Tell me what ${activeProfile.name} said and I'll read the room.` : `No chat yet. Share what ${activeProfile.name} said and I'll read the room.`}
                    </Text>
                  </View>
                )}

                <View style={styles.heroFooter}>
                  <Text style={styles.heroHint}>
                    {readyCount ? `${readyCount} replies ready` : activeConvo ? `Updated ${formatAgo(activeConvo.updatedAt)} ago` : 'Ready when you are'}
                  </Text>
                  <View style={styles.heroCta}>
                    <Text style={styles.heroCtaText}>{activeConvo ? 'Open chat' : 'Start chat'}</Text>
                    <Feather name="arrow-right" size={14} color={Palette.zinc900} />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* GET REPLIES */}
            <Text style={styles.sectionTitle}>Get replies</Text>
            <View style={styles.actionsRow}>
              <ActionTile
                icon="image"
                tint="#eef2ff"
                color={Palette.indigo600}
                title="Screenshot"
                sub="Upload the chat"
                onPress={() => onStartNewSession('screenshot')}
              />
              <ActionTile
                icon="clipboard"
                tint="#fdf2f8"
                color="#db2777"
                title="Paste"
                sub="Drop in their text"
                onPress={() => onStartNewSession('paste')}
              />
              <ActionTile
                icon="message-square"
                tint="#ecfdf5"
                color={Palette.emerald600}
                title="Ask"
                sub="Talk to wingman"
                onPress={onStartChat}
              />
            </View>

            {/* PEOPLE */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>People</Text>
              <TouchableOpacity onPress={onSwitchProfile} hitSlop={8}>
                <Text style={styles.sectionLink}>Manage</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.peopleRow}>
              {profiles.map((p) => {
                const active = p.id === activeProfile.id;
                return (
                  <TouchableOpacity key={p.id} style={styles.person} onPress={() => onSelectProfile(p)} activeOpacity={0.8}>
                    <View style={[styles.personAvatar, active && styles.personAvatarActive]}>
                      <Text style={styles.personEmoji}>{p.avatarEmoji || '❤️'}</Text>
                    </View>
                    <Text style={[styles.personName, active && styles.personNameActive]} numberOfLines={1}>
                      {p.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity style={styles.person} onPress={onCreateProfile} activeOpacity={0.8}>
                <View style={[styles.personAvatar, styles.personAvatarAdd]}>
                  <Feather name="plus" size={18} color={Palette.zinc500} />
                </View>
                <Text style={styles.personName}>Add</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* RECENT */}
            {recents.length > 0 ? (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent</Text>
                  {recentConversations.length > 3 ? (
                    <TouchableOpacity onPress={onViewAllChats} hitSlop={8}>
                      <Text style={styles.sectionLink}>View all</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
                <View style={styles.recentList}>
                  {recents.map((c) => {
                    const last = c.messages[c.messages.length - 1];
                    return (
                      <TouchableOpacity key={c.id} style={styles.recentItem} onPress={() => onOpenConversation(c)} activeOpacity={0.85}>
                        <View style={styles.recentAvatar}>
                          <Text style={styles.recentAvatarText}>{(c.targetName[0] || '?').toUpperCase()}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={styles.recentTop}>
                            <Text style={styles.recentName}>{c.targetName}</Text>
                            <Text style={styles.recentTime}>{formatAgo(c.updatedAt)}</Text>
                          </View>
                          <Text style={styles.recentPreview} numberOfLines={1}>
                            {last ? last.text : c.title}
                          </Text>
                        </View>
                        <Feather name="chevron-right" size={16} color={Palette.zinc400} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            ) : null}

            {/* UPGRADE */}
            {isFree ? (
              <TouchableOpacity style={styles.upgradeCard} onPress={onOpenPaywall} activeOpacity={0.9}>
                <View style={styles.upgradeIcon}>
                  <Feather name="zap" size={16} color="#ffffff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.upgradeTitle}>
                    {repliesLeft <= 0
                      ? 'Free replies used up'
                      : chatsRemaining <= 0
                      ? 'Free chats used up'
                      : `${repliesLeft} ${repliesLeft === 1 ? 'reply' : 'replies'} · ${chatsRemaining} ${chatsRemaining === 1 ? 'chat' : 'chats'} left`}
                  </Text>
                  <Text style={styles.upgradeSub}>Go unlimited with Vibely Plus</Text>
                </View>
                <Feather name="chevron-right" size={16} color={Palette.zinc400} />
              </TouchableOpacity>
            ) : null}
          </>
        )}
      </Animated.View>
    </ScrollView>
  );
};

const ActionTile: React.FC<{
  icon: keyof typeof Feather.glyphMap;
  tint: string;
  color: string;
  title: string;
  sub: string;
  onPress: () => void;
}> = ({ icon, tint, color, title, sub, onPress }) => (
  <TouchableOpacity style={styles.tile} onPress={onPress} activeOpacity={0.85}>
    <View style={[styles.tileIcon, { backgroundColor: tint }]}>
      <Feather name={icon} size={18} color={color} />
    </View>
    <Text style={styles.tileTitle}>{title}</Text>
    <Text style={styles.tileSub} numberOfLines={1}>
      {sub}
    </Text>
  </TouchableOpacity>
);

// First launch: no people yet. One clear next step, then what they will get.
const FirstRun: React.FC<{ onCreateProfile: () => void }> = ({ onCreateProfile }) => (
  <>
    <LinearGradient colors={['#18181b', '#312e81']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.firstHero}>
      <View style={styles.firstBadge}>
        <Feather name="zap" size={11} color="#ffffff" />
        <Text style={styles.firstBadgeText}>YOUR AI WINGMAN</Text>
      </View>
      <Text style={styles.firstTitle}>Know exactly what to say next</Text>
      <Text style={styles.firstSub}>
        Share a chat and Vibely reads the signals, tells you the move, and writes replies in your voice.
      </Text>

      <View style={styles.steps}>
        {[
          ['1', 'Add who you’re texting', 'Name, relationship, personality'],
          ['2', 'Share the chat', 'Screenshot, paste, or just tell me'],
          ['3', 'Send the right reply', 'Three options, one tap to copy'],
        ].map(([n, title, sub]) => (
          <View key={n} style={styles.step}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>{n}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>{title}</Text>
              <Text style={styles.stepSub}>{sub}</Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.firstCta} onPress={onCreateProfile} activeOpacity={0.9}>
        <Feather name="user-plus" size={16} color={Palette.zinc900} />
        <Text style={styles.firstCtaText}>Add who you're texting</Text>
      </TouchableOpacity>
      <Text style={styles.firstFine}>Takes 20 seconds · free to start</Text>
    </LinearGradient>

    <Text style={styles.sectionTitle}>What you get</Text>
    <View style={styles.featureList}>
      {[
        ['eye', '#eef2ff', Palette.indigo600, 'Signal reading', 'Tone, interest and what they’re really asking'],
        ['message-circle', '#fdf2f8', '#db2777', 'Replies in any vibe', 'Flirty, witty, confident, warm — your call'],
        ['git-branch', '#ecfdf5', Palette.emerald600, 'Next-turn predictions', 'If they say X, here’s your Y'],
      ].map(([icon, tint, color, title, sub]) => (
        <View key={title} style={styles.featureRow}>
          <View style={[styles.featureIcon, { backgroundColor: tint }]}>
            <Feather name={icon as keyof typeof Feather.glyphMap} size={16} color={color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.featureTitle}>{title}</Text>
            <Text style={styles.featureSub}>{sub}</Text>
          </View>
        </View>
      ))}
    </View>
  </>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  content: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 120 },

  greetingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, gap: 12 },
  greeting: { fontSize: 26, fontWeight: '800', color: Palette.zinc900, letterSpacing: -0.6 },
  greetingSub: { fontSize: 14, color: Palette.zinc500, marginTop: 2 },
  planPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    height: 32,
    borderRadius: 999,
    backgroundColor: Palette.zinc100,
  },
  planPillPro: { backgroundColor: Palette.zinc900 },
  planPillText: { fontSize: 12, fontWeight: '800', color: Palette.zinc900 },
  planPillTextPro: { color: '#ffffff' },

  /* hero */
  hero: { borderRadius: 24, overflow: 'hidden', marginBottom: 22, ...ThemeShadows.lg },
  heroGradient: { padding: 18 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAvatarEmoji: { fontSize: 24 },
  heroEyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, color: 'rgba(255,255,255,0.55)' },
  heroNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  heroName: { fontSize: 20, fontWeight: '800', color: '#ffffff', flexShrink: 1 },
  heroChip: { backgroundColor: 'rgba(255,255,255,0.14)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  heroChipText: { fontSize: 10, fontWeight: '700', color: '#ffffff' },
  pulseBubble: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  pulseBubbleValue: { fontSize: 18, fontWeight: '800', color: '#ffffff' },
  pulseBubbleLabel: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5 },
  heroBody: { marginTop: 16, gap: 10 },
  theirBubble: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    borderTopLeftRadius: 4,
    padding: 12,
    alignSelf: 'flex-start',
    maxWidth: '92%',
  },
  theirLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.55)', marginBottom: 3 },
  theirText: { fontSize: 14, color: '#ffffff', lineHeight: 20 },
  readRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  readText: { flex: 1, fontSize: 12, lineHeight: 17, color: 'rgba(255,255,255,0.78)' },
  heroEmptyText: { fontSize: 14, lineHeight: 20, color: 'rgba(255,255,255,0.78)' },
  heroFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  heroHint: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 999,
  },
  heroCtaText: { fontSize: 13, fontWeight: '800', color: Palette.zinc900 },

  /* sections */
  sectionTitle: { fontSize: 15, fontWeight: '800', color: Palette.zinc900, marginBottom: 10, letterSpacing: -0.2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionLink: { fontSize: 13, fontWeight: '700', color: Palette.indigo600, marginBottom: 10 },

  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 22 },
  tile: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: Palette.zinc200,
    ...ThemeShadows.sm,
  },
  tileIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  tileTitle: { fontSize: 14, fontWeight: '800', color: Palette.zinc900 },
  tileSub: { fontSize: 11, color: Palette.zinc500, marginTop: 2 },

  peopleRow: { gap: 14, paddingRight: 8, marginBottom: 22 },
  person: { alignItems: 'center', width: 60 },
  personAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Palette.zinc100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  personAvatarActive: { borderColor: Palette.zinc900, backgroundColor: '#ffffff' },
  personAvatarAdd: { borderStyle: 'dashed', borderColor: Palette.zinc200, backgroundColor: '#ffffff' },
  personEmoji: { fontSize: 24 },
  personName: { fontSize: 11, fontWeight: '600', color: Palette.zinc500, marginTop: 6 },
  personNameActive: { color: Palette.zinc900, fontWeight: '800' },

  recentList: { gap: 8, marginBottom: 22 },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: Palette.zinc50,
  },
  recentAvatar: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  recentAvatarText: { fontSize: 15, fontWeight: '800', color: Palette.zinc900 },
  recentTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  recentName: { fontSize: 14, fontWeight: '700', color: Palette.zinc900 },
  recentTime: { fontSize: 11, color: Palette.zinc400, fontWeight: '600' },
  recentPreview: { fontSize: 12, color: Palette.zinc500, marginTop: 2 },

  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Palette.zinc200,
    backgroundColor: '#ffffff',
  },
  upgradeIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: Palette.zinc900, alignItems: 'center', justifyContent: 'center' },
  upgradeTitle: { fontSize: 14, fontWeight: '800', color: Palette.zinc900 },
  upgradeSub: { fontSize: 12, color: Palette.zinc500, marginTop: 1 },

  /* first run */
  firstHero: { borderRadius: 24, padding: 20, marginBottom: 24, ...ThemeShadows.lg },
  firstBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 14,
  },
  firstBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 1, color: '#ffffff' },
  firstTitle: { fontSize: 26, fontWeight: '800', color: '#ffffff', letterSpacing: -0.6, lineHeight: 31 },
  firstSub: { fontSize: 14, lineHeight: 20, color: 'rgba(255,255,255,0.78)', marginTop: 8 },
  steps: { marginTop: 18, gap: 12 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  stepNumText: { fontSize: 12, fontWeight: '800', color: '#ffffff' },
  stepTitle: { fontSize: 14, fontWeight: '700', color: '#ffffff' },
  stepSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 1 },
  firstCta: {
    marginTop: 20,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  firstCtaText: { fontSize: 15, fontWeight: '800', color: Palette.zinc900 },
  firstFine: { textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 10 },

  featureList: { gap: 10 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Palette.zinc200,
  },
  featureIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  featureTitle: { fontSize: 14, fontWeight: '800', color: Palette.zinc900 },
  featureSub: { fontSize: 12, color: Palette.zinc500, marginTop: 2 },
});
