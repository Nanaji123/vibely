import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Palette, ThemeColors } from '../theme/colors';
import { ThemeShadows } from '../theme/shadows';
import { ConversationModel, TargetProfileModel } from '../domain/index';

interface PulseAnalysisScreenProps {
  activeProfile?: TargetProfileModel;
  conversation?: ConversationModel;
}

export const PulseAnalysisScreen: React.FC<PulseAnalysisScreenProps> = ({
  activeProfile,
  conversation,
}) => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };

  const targetName = activeProfile?.name || conversation?.targetName || 'Sarah';
  const targetGender = activeProfile?.gender || 'female';
  const genderLabel = targetGender === 'female' ? '👩 Her' : targetGender === 'male' ? '👨 Him' : '🧑 Them';

  // Sentiment metrics
  const interestScore = conversation?.pulseScore || 85;
  const playfulnessScore = 91;
  const romanceScore = 72;
  const frameScore = 78;

  // Real or sample chat messages from conversation
  const lastTargetMsg =
    conversation?.messages?.find(m => m.sender === 'you' && m.text.includes('said:'))?.text.replace(/^She said:|^He said:/i, '').replace(/["']/g, '').trim() ||
    conversation?.messages?.[0]?.text.replace(/["']/g, '').trim() ||
    'Probably just staying home lol';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Palette.indigo600}
          colors={[Palette.indigo600, Palette.zinc900]}
        />
      }
    >
      {/* 1. HERO SENTIMENT PULSE BANNER */}
      <View style={styles.heroCard}>
        <View style={styles.heroBadgeRow}>
          <View style={styles.pulseLiveDot} />
          <Text style={styles.heroBadgeText}>LIVE SENTIMENT RADAR</Text>
          <View style={styles.targetBadge}>
            <Text style={styles.targetBadgeText}>{targetName} ({genderLabel})</Text>
          </View>
        </View>

        <Text style={styles.heroTitle}>Conversation Pulse</Text>
        <Text style={styles.heroSub}>
          Real-time emotional tracking, hidden intent decoding, and social dynamic analysis.
        </Text>

        {/* Big Overall Metric Banner */}
        <View style={styles.overallScoreBox}>
          <View style={styles.scoreNumberCol}>
            <Text style={styles.bigScoreNumber}>{interestScore}%</Text>
            <Text style={styles.scoreLabelText}>Overall Chemistry</Text>
          </View>

          <View style={styles.scoreDivider} />

          <View style={styles.scoreStatusCol}>
            <View style={styles.statusPill}>
              <Feather name="trending-up" size={12} color={Palette.emerald600} />
              <Text style={styles.statusPillText}>High Receptive Interest</Text>
            </View>
            <Text style={styles.statusSub}>
              {targetName} is invested in the banter and receptive to bold escalation.
            </Text>
          </View>
        </View>
      </View>

      {/* 2. INTENT & EFFORT DYNAMICS (User explicitly requested intent & effort) */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Feather name="compass" size={15} color={Palette.indigo600} />
          <Text style={styles.sectionTitle}>Intent & Effort Dynamics</Text>
        </View>

        {/* A. Detected Hidden Intent */}
        <View style={styles.intentCard}>
          <View style={styles.intentHeader}>
            <View style={styles.intentTagBox}>
              <Feather name="zap" size={11} color={Palette.indigo600} />
              <Text style={styles.intentTagText}>DETECTED INTENT</Text>
            </View>
            <Text style={styles.confidenceTag}>92% Confidence</Text>
          </View>

          <Text style={styles.intentMainStatement}>
            Playful Reluctance & Invitation to Take Lead
          </Text>
          <Text style={styles.intentExplanation}>
            {targetName} is playing low-effort to avoid appearing desperate, while leaving her schedule open. She is testing whether you will take decisive initiative or ask generic questions.
          </Text>
        </View>

        {/* B. Effort Balance Ratio (You vs Them) */}
        <View style={styles.effortCard}>
          <View style={styles.effortHeader}>
            <Text style={styles.effortTitle}>Conversation Effort Ratio</Text>
            <View style={styles.effortStatusPill}>
              <Text style={styles.effortStatusText}>Ideal Frame Balance</Text>
            </View>
          </View>

          {/* Effort Bar Comparison */}
          <View style={styles.effortBarTrack}>
            <View style={[styles.effortBarYou, { width: '48%' }]}>
              <Text style={styles.effortBarText}>You: 48%</Text>
            </View>
            <View style={[styles.effortBarThem, { width: '52%' }]}>
              <Text style={styles.effortBarText}>Them: 52%</Text>
            </View>
          </View>

          {/* Effort Micro Metrics */}
          <View style={styles.microMetricsRow}>
            <View style={styles.microMetricItem}>
              <Text style={styles.microMetricVal}>1.1 : 1</Text>
              <Text style={styles.microMetricLabel}>Message Length</Text>
            </View>
            <View style={styles.microMetricItem}>
              <Text style={styles.microMetricVal}>&lt; 3 mins</Text>
              <Text style={styles.microMetricLabel}>Response Speed</Text>
            </View>
            <View style={styles.microMetricItem}>
              <Text style={styles.microMetricVal}>1 : 2</Text>
              <Text style={styles.microMetricLabel}>Question Ratio</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 3. CHAT CONTEXT & SUBTEXT DECODER (User explicitly requested chat contexts) */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Feather name="message-square" size={15} color={Palette.indigo600} />
          <Text style={styles.sectionTitle}>Chat Context & Subtext Breakdown</Text>
        </View>

        {/* Chat Excerpt Breakdown 1 */}
        <View style={styles.chatContextCard}>
          <View style={styles.contextCardHeader}>
            <View style={styles.speakerPillThem}>
              <Text style={styles.speakerPillText}>{targetName} Sent</Text>
            </View>
            <View style={styles.contextIntentBadge}>
              <Text style={styles.contextIntentText}>Passive Hook</Text>
            </View>
          </View>

          <Text style={styles.contextQuoteText}>
            "{lastTargetMsg}"
          </Text>

          {/* Subtext Decoder Box */}
          <View style={styles.subtextBox}>
            <View style={styles.subtextBadgeRow}>
              <Feather name="eye" size={11} color={Palette.indigo600} />
              <Text style={styles.subtextBadgeTitle}>SUBTEXT DECODED</Text>
            </View>
            <Text style={styles.subtextBody}>
              "I have no actual plans tonight, but I'm not going to ask you out first. If you invite me somewhere fun and confident, I'm down."
            </Text>
          </View>

          {/* Recommended Counter Move */}
          <View style={styles.counterMoveBox}>
            <Text style={styles.counterMoveLabel}>RECOMMENDED RESPONSE:</Text>
            <Text style={styles.counterMoveText}>
              "Staying home? Sounds like you need better plans 😏 I know a great spot."
            </Text>
            <View style={styles.counterEffectRow}>
              <Feather name="arrow-up-right" size={12} color={Palette.emerald600} />
              <Text style={styles.counterEffectText}>+18% Interest Escalation</Text>
            </View>
          </View>
        </View>

        {/* Chat Excerpt Breakdown 2 */}
        <View style={styles.chatContextCard}>
          <View style={styles.contextCardHeader}>
            <View style={styles.speakerPillThem}>
              <Text style={styles.speakerPillText}>{targetName} Sent</Text>
            </View>
            <View style={styles.contextIntentBadge}>
              <Text style={styles.contextIntentText}>Banter Test</Text>
            </View>
          </View>

          <Text style={styles.contextQuoteText}>
            "haha maybe 😂"
          </Text>

          {/* Subtext Decoder Box */}
          <View style={styles.subtextBox}>
            <View style={styles.subtextBadgeRow}>
              <Feather name="eye" size={11} color={Palette.indigo600} />
              <Text style={styles.subtextBadgeTitle}>SUBTEXT DECODED</Text>
            </View>
            <Text style={styles.subtextBody}>
              "I like your energy and confidence, but I want to tease you and see if you get flustered."
            </Text>
          </View>

          {/* Recommended Counter Move */}
          <View style={styles.counterMoveBox}>
            <Text style={styles.counterMoveLabel}>RECOMMENDED RESPONSE:</Text>
            <Text style={styles.counterMoveText}>
              "That 'maybe' sounds like a solid yes disguised as plausible deniability 😏"
            </Text>
            <View style={styles.counterEffectRow}>
              <Feather name="arrow-up-right" size={12} color={Palette.emerald600} />
              <Text style={styles.counterEffectText}>+22% Attraction Spike</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 4. 4-METRIC RADAR GAUGES */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Feather name="bar-chart-2" size={15} color={Palette.indigo600} />
          <Text style={styles.sectionTitle}>Psychological Metrics</Text>
        </View>

        <View style={styles.metricsGrid}>
          {/* Metric 1 */}
          <View style={styles.gaugeCard}>
            <View style={styles.gaugeHeader}>
              <Text style={styles.gaugeLabel}>Attraction & Interest</Text>
              <Text style={styles.gaugeVal}>{interestScore}%</Text>
            </View>
            <View style={styles.gaugeTrack}>
              <View style={[styles.gaugeFill, { width: `${interestScore}%`, backgroundColor: Palette.indigo600 }]} />
            </View>
            <Text style={styles.gaugeCaption}>High engagement & fast replies</Text>
          </View>

          {/* Metric 2 */}
          <View style={styles.gaugeCard}>
            <View style={styles.gaugeHeader}>
              <Text style={styles.gaugeLabel}>Banter & Playfulness</Text>
              <Text style={styles.gaugeVal}>{playfulnessScore}%</Text>
            </View>
            <View style={styles.gaugeTrack}>
              <View style={[styles.gaugeFill, { width: `${playfulnessScore}%`, backgroundColor: Palette.emerald600 }]} />
            </View>
            <Text style={styles.gaugeCaption}>Frequent humor and teasing</Text>
          </View>

          {/* Metric 3 */}
          <View style={styles.gaugeCard}>
            <View style={styles.gaugeHeader}>
              <Text style={styles.gaugeLabel}>Romantic Chemistry</Text>
              <Text style={styles.gaugeVal}>{romanceScore}%</Text>
            </View>
            <View style={styles.gaugeTrack}>
              <View style={[styles.gaugeFill, { width: `${romanceScore}%`, backgroundColor: '#db2777' }]} />
            </View>
            <Text style={styles.gaugeCaption}>Ready for date escalation</Text>
          </View>

          {/* Metric 4 */}
          <View style={styles.gaugeCard}>
            <View style={styles.gaugeHeader}>
              <Text style={styles.gaugeLabel}>Frame & Value Balance</Text>
              <Text style={styles.gaugeVal}>{frameScore}%</Text>
            </View>
            <View style={styles.gaugeTrack}>
              <View style={[styles.gaugeFill, { width: `${frameScore}%`, backgroundColor: Palette.zinc900 }]} />
            </View>
            <Text style={styles.gaugeCaption}>You are maintaining high status</Text>
          </View>
        </View>
      </View>

      {/* 5. TACTICAL PLAYBOOK (NEXT MOVE DIRECTIVE) */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Feather name="shield" size={15} color={Palette.indigo600} />
          <Text style={styles.sectionTitle}>Wingman Tactical Playbook</Text>
        </View>

        <View style={styles.playbookCard}>
          {/* Tactical Do */}
          <View style={styles.playbookRow}>
            <View style={[styles.playbookIconCircle, { backgroundColor: '#ecfdf5' }]}>
              <Feather name="check" size={14} color={Palette.emerald600} />
            </View>
            <View style={styles.playbookTextBox}>
              <Text style={styles.playbookTitleGreen}>Next Move Directive</Text>
              <Text style={styles.playbookBody}>
                Transition from banter to a low-pressure in-person invite (e.g. coffee or dessert this weekend). Momentum is peaked right now.
              </Text>
            </View>
          </View>

          <View style={styles.playbookDivider} />

          {/* Tactical Avoid */}
          <View style={styles.playbookRow}>
            <View style={[styles.playbookIconCircle, { backgroundColor: '#fef2f2' }]}>
              <Feather name="alert-triangle" size={14} color="#dc2626" />
            </View>
            <View style={styles.playbookTextBox}>
              <Text style={styles.playbookTitleRed}>Mistake to Avoid</Text>
              <Text style={styles.playbookBody}>
                Do not ask "So what do you do for work?" or switch into boring resume questions. Keep the high-energy banter frame.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 16,
    paddingBottom: 110,
  },

  /* HERO */
  heroCard: {
    backgroundColor: '#fafafa',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
    ...ThemeShadows.sm,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  pulseLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.emerald600,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Palette.zinc700,
    letterSpacing: 0.5,
  },
  targetBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  targetBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.indigo600,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Palette.zinc900,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 12,
    color: Palette.zinc500,
    lineHeight: 17,
    marginBottom: 14,
  },
  overallScoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 14,
  },
  scoreNumberCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigScoreNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: Palette.zinc900,
    letterSpacing: -1,
  },
  scoreLabelText: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.zinc500,
  },
  scoreDivider: {
    width: 1,
    height: 44,
    backgroundColor: '#f1f5f9',
  },
  scoreStatusCol: {
    flex: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: Palette.emerald600,
  },
  statusSub: {
    fontSize: 11,
    color: Palette.zinc600,
    lineHeight: 15,
  },

  /* SECTION */
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: Palette.zinc900,
    letterSpacing: -0.2,
  },

  /* INTENT CARD */
  intentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
    ...ThemeShadows.sm,
  },
  intentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  intentTagBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.indigo50,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  intentTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: Palette.indigo600,
    letterSpacing: 0.4,
  },
  confidenceTag: {
    fontSize: 10.5,
    fontWeight: '700',
    color: Palette.emerald600,
  },
  intentMainStatement: {
    fontSize: 14,
    fontWeight: '800',
    color: Palette.zinc900,
    marginBottom: 4,
  },
  intentExplanation: {
    fontSize: 12,
    color: Palette.zinc600,
    lineHeight: 17,
  },

  /* EFFORT RATIO */
  effortCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...ThemeShadows.sm,
  },
  effortHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  effortTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Palette.zinc900,
  },
  effortStatusPill: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  effortStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.emerald600,
  },
  effortBarTrack: {
    flexDirection: 'row',
    height: 24,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
  },
  effortBarYou: {
    backgroundColor: Palette.zinc900,
    justifyContent: 'center',
    alignItems: 'center',
  },
  effortBarThem: {
    backgroundColor: Palette.indigo600,
    justifyContent: 'center',
    alignItems: 'center',
  },
  effortBarText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#ffffff',
  },
  microMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  microMetricItem: {
    alignItems: 'center',
  },
  microMetricVal: {
    fontSize: 13,
    fontWeight: '800',
    color: Palette.zinc900,
  },
  microMetricLabel: {
    fontSize: 10,
    color: Palette.zinc500,
    marginTop: 1,
  },

  /* CHAT CONTEXT & SUBTEXT DECODER CARDS */
  chatContextCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    ...ThemeShadows.sm,
  },
  contextCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  speakerPillThem: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  speakerPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: Palette.zinc700,
  },
  contextIntentBadge: {
    backgroundColor: Palette.indigo50,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  contextIntentText: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.indigo600,
  },
  contextQuoteText: {
    fontSize: 14,
    fontWeight: '800',
    color: Palette.zinc900,
    lineHeight: 19,
    marginBottom: 10,
  },
  subtextBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: Palette.indigo600,
    marginBottom: 10,
  },
  subtextBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  subtextBadgeTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: Palette.indigo600,
    letterSpacing: 0.4,
  },
  subtextBody: {
    fontSize: 12,
    color: Palette.zinc800,
    lineHeight: 16,
  },
  counterMoveBox: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  counterMoveLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: Palette.zinc500,
    marginBottom: 2,
  },
  counterMoveText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Palette.zinc900,
    lineHeight: 17,
    marginBottom: 4,
  },
  counterEffectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  counterEffectText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: Palette.emerald600,
  },

  /* METRICS GRID */
  metricsGrid: {
    gap: 8,
  },
  gaugeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...ThemeShadows.sm,
  },
  gaugeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  gaugeLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Palette.zinc800,
  },
  gaugeVal: {
    fontSize: 13,
    fontWeight: '800',
    color: Palette.zinc900,
  },
  gaugeTrack: {
    height: 6,
    backgroundColor: Palette.zinc100,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 3,
  },
  gaugeCaption: {
    fontSize: 10.5,
    color: Palette.zinc500,
  },

  /* TACTICAL PLAYBOOK */
  playbookCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...ThemeShadows.sm,
  },
  playbookRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  playbookIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  playbookTextBox: {
    flex: 1,
  },
  playbookTitleGreen: {
    fontSize: 12.5,
    fontWeight: '800',
    color: Palette.emerald600,
    marginBottom: 2,
  },
  playbookTitleRed: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#dc2626',
    marginBottom: 2,
  },
  playbookBody: {
    fontSize: 11.5,
    color: Palette.zinc700,
    lineHeight: 16,
  },
  playbookDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 10,
  },
});
