import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { Palette } from '../theme/colors';
import { ThemeShadows } from '../theme/shadows';
import { ConversationModel, TargetProfileModel } from '../domain/index';

interface PulseAnalysisScreenProps {
  activeProfile?: TargetProfileModel;
  hasProfiles: boolean;
  conversation?: ConversationModel;
  onAnalyze: () => Promise<void>;
}

const effortLabel = (youPct: number) =>
  youPct > 60 ? "You're doing most of the work" : youPct < 40 ? 'They are investing more' : 'Balanced effort';

export const PulseAnalysisScreen: React.FC<PulseAnalysisScreenProps> = ({
  activeProfile,
  hasProfiles,
  conversation,
  onAnalyze,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoRan = useRef<string | null>(null);
  const scoreAnim = useSharedValue(0);

  useEffect(() => {
    scoreAnim.value = withTiming(1, { duration: 650 });
  }, []);
  const scoreAnimStyle = useAnimatedStyle(() => ({
    opacity: scoreAnim.value,
    transform: [{ translateY: (1 - scoreAnim.value) * 16 }],
  }));

  const analysis = conversation?.analysis;
  const targetName = activeProfile?.name || conversation?.targetName || '';
  const genderLabel =
    activeProfile?.gender === 'female' ? '👩 Her' : activeProfile?.gender === 'male' ? '👨 Him' : '🧑 Them';

  // Only real chat content counts (the coach's own messages are not the conversation)
  const hasChat = !!conversation?.messages?.some((m) => m.sender !== 'ai');
  const canAnalyze = hasProfiles && !!conversation?.id && hasChat;
  const isStale = !!analysis && analysis.analyzedMessageCount !== undefined && analysis.analyzedMessageCount !== conversation?.messages.length;

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      await onAnalyze();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Analyze automatically the first time a conversation without an analysis is viewed
  useEffect(() => {
    if (canAnalyze && !analysis && conversation?.id && autoRan.current !== conversation.id) {
      autoRan.current = conversation.id;
      run();
    }
  }, [canAnalyze, analysis, conversation?.id]);

  if (!hasProfiles || !conversation?.id || !hasChat) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.stateBox}>
          <Feather name="activity" size={28} color={Palette.indigo600} />
          <Text style={styles.stateTitle}>
            {!hasProfiles ? 'Add someone to analyze' : 'Nothing to analyze yet'}
          </Text>
          <Text style={styles.stateSub}>
            {!hasProfiles
              ? 'Create a profile on the People tab, then share a conversation to see the chemistry pulse.'
              : `Share what ${targetName || 'they'} said in a chat and the pulse will decode interest, intent and effort.`}
          </Text>
        </View>
      </ScrollView>
    );
  }

  if (!analysis) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.stateBox}>
          {loading ? (
            <>
              <ActivityIndicator color={Palette.indigo600} />
              <Text style={styles.stateTitle}>Reading the conversation…</Text>
              <Text style={styles.stateSub}>Decoding {targetName}'s interest, intent and effort.</Text>
            </>
          ) : (
            <>
              <Feather name="alert-circle" size={28} color={Palette.zinc400} />
              <Text style={styles.stateTitle}>{error ? 'Could not analyze' : 'Ready to analyze'}</Text>
              {error ? <Text style={styles.stateSub}>{error}</Text> : null}
              <TouchableOpacity style={styles.retryBtn} onPress={run} activeOpacity={0.85}>
                <Text style={styles.retryText}>{error ? 'Try again' : 'Analyze conversation'}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    );
  }

  const youPct = Math.round(analysis.effortRatio);
  const themPct = 100 - youPct;
  const gauges = [
    { label: 'Attraction & Interest', value: analysis.interestScore, color: Palette.indigo600 },
    { label: 'Banter & Playfulness', value: analysis.playfulnessScore, color: Palette.emerald600 },
    { label: 'Romantic Chemistry', value: analysis.romanceScore, color: '#db2777' },
    ...(analysis.frameScore !== undefined
      ? [{ label: 'Frame & Value Balance', value: analysis.frameScore, color: Palette.zinc900 }]
      : []),
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={run}
          tintColor={Palette.indigo600}
          colors={[Palette.indigo600, Palette.zinc900]}
        />
      }
    >
      <Animated.View style={scoreAnimStyle}>
        {/* HERO */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadgeRow}>
            <View style={styles.pulseLiveDot} />
            <Text style={styles.heroBadgeText}>AI SENTIMENT ANALYSIS</Text>
            <View style={styles.targetBadge}>
              <Text style={styles.targetBadgeText}>{targetName} ({genderLabel})</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>Conversation Pulse</Text>
          <Text style={styles.heroSub}>Based on your actual conversation with {targetName}.</Text>

          <View style={styles.overallScoreBox}>
            <View style={styles.scoreNumberCol}>
              <Text style={styles.bigScoreNumber}>{analysis.interestScore}%</Text>
              <Text style={styles.scoreLabelText}>Overall Chemistry</Text>
            </View>
            <View style={styles.scoreDivider} />
            <View style={styles.scoreStatusCol}>
              {analysis.currentVibeSummary ? (
                <View style={styles.statusPill}>
                  <Feather name="trending-up" size={12} color={Palette.emerald600} />
                  <Text style={styles.statusPillText}>{analysis.currentVibeSummary}</Text>
                </View>
              ) : null}
              {analysis.observation ? <Text style={styles.statusSub}>{analysis.observation}</Text> : null}
            </View>
          </View>

          {isStale ? (
            <TouchableOpacity style={styles.staleRow} onPress={run} activeOpacity={0.8} disabled={loading}>
              <Feather name="refresh-cw" size={12} color={Palette.indigo600} />
              <Text style={styles.staleText}>{loading ? 'Updating…' : 'New messages since this analysis. Tap to update'}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {error ? <Text style={[styles.stateSub, { marginBottom: 12 }]}>{error}</Text> : null}

        {/* INTENT & EFFORT */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Feather name="compass" size={15} color={Palette.indigo600} />
            <Text style={styles.sectionTitle}>Intent & Effort Dynamics</Text>
          </View>

          {analysis.detectedIntent ? (
            <View style={styles.intentCard}>
              <View style={styles.intentHeader}>
                <View style={styles.intentTagBox}>
                  <Feather name="zap" size={11} color={Palette.indigo600} />
                  <Text style={styles.intentTagText}>DETECTED INTENT</Text>
                </View>
              </View>
              <Text style={styles.intentMainStatement}>{analysis.detectedIntent}</Text>
              {analysis.intentExplanation ? (
                <Text style={styles.intentExplanation}>{analysis.intentExplanation}</Text>
              ) : null}
            </View>
          ) : null}

          <View style={styles.effortCard}>
            <View style={styles.effortHeader}>
              <Text style={styles.effortTitle}>Conversation Effort Ratio</Text>
              <View style={styles.effortStatusPill}>
                <Text style={styles.effortStatusText}>{effortLabel(youPct)}</Text>
              </View>
            </View>
            <View style={styles.effortBarTrack}>
              <View style={[styles.effortBarYou, { width: `${Math.max(youPct, 8)}%` }]}>
                <Text style={styles.effortBarText}>You: {youPct}%</Text>
              </View>
              <View style={[styles.effortBarThem, { width: `${Math.max(themPct, 8)}%` }]}>
                <Text style={styles.effortBarText}>Them: {themPct}%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* MOMENTS */}
        {analysis.moments && analysis.moments.length > 0 ? (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Feather name="message-square" size={15} color={Palette.indigo600} />
              <Text style={styles.sectionTitle}>Chat Context & Subtext Breakdown</Text>
            </View>
            {analysis.moments.map((m, i) => (
              <View key={i} style={styles.chatContextCard}>
                <View style={styles.contextCardHeader}>
                  <View style={styles.speakerPillThem}>
                    <Text style={styles.speakerPillText}>{targetName} Sent</Text>
                  </View>
                </View>
                <Text style={styles.contextQuoteText}>"{m.theirMessage}"</Text>
                {m.subtext ? (
                  <View style={styles.subtextBox}>
                    <View style={styles.subtextBadgeRow}>
                      <Feather name="eye" size={11} color={Palette.indigo600} />
                      <Text style={styles.subtextBadgeTitle}>SUBTEXT DECODED</Text>
                    </View>
                    <Text style={styles.subtextBody}>{m.subtext}</Text>
                  </View>
                ) : null}
                {m.recommendedReply ? (
                  <View style={styles.counterMoveBox}>
                    <Text style={styles.counterMoveLabel}>RECOMMENDED RESPONSE:</Text>
                    <Text style={styles.counterMoveText}>"{m.recommendedReply}"</Text>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* METRICS */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Feather name="bar-chart-2" size={15} color={Palette.indigo600} />
            <Text style={styles.sectionTitle}>Psychological Metrics</Text>
          </View>
          <View style={styles.metricsGrid}>
            {gauges.map((g) => (
              <View key={g.label} style={styles.gaugeCard}>
                <View style={styles.gaugeHeader}>
                  <Text style={styles.gaugeLabel}>{g.label}</Text>
                  <Text style={styles.gaugeVal}>{g.value}%</Text>
                </View>
                <View style={styles.gaugeTrack}>
                  <View style={[styles.gaugeFill, { width: `${g.value}%`, backgroundColor: g.color }]} />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* PLAYBOOK */}
        {analysis.doNext || analysis.suggestion || analysis.avoid ? (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Feather name="shield" size={15} color={Palette.indigo600} />
              <Text style={styles.sectionTitle}>Wingman Tactical Playbook</Text>
            </View>
            <View style={styles.playbookCard}>
              {analysis.doNext || analysis.suggestion ? (
                <View style={styles.playbookRow}>
                  <View style={[styles.playbookIconCircle, { backgroundColor: '#ecfdf5' }]}>
                    <Feather name="check" size={14} color={Palette.emerald600} />
                  </View>
                  <View style={styles.playbookTextBox}>
                    <Text style={styles.playbookTitleGreen}>Next Move Directive</Text>
                    <Text style={styles.playbookBody}>{analysis.doNext || analysis.suggestion}</Text>
                  </View>
                </View>
              ) : null}
              {(analysis.doNext || analysis.suggestion) && analysis.avoid ? <View style={styles.playbookDivider} /> : null}
              {analysis.avoid ? (
                <View style={styles.playbookRow}>
                  <View style={[styles.playbookIconCircle, { backgroundColor: '#fef2f2' }]}>
                    <Feather name="alert-triangle" size={14} color="#dc2626" />
                  </View>
                  <View style={styles.playbookTextBox}>
                    <Text style={styles.playbookTitleRed}>Mistake to Avoid</Text>
                    <Text style={styles.playbookBody}>{analysis.avoid}</Text>
                  </View>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}
      </Animated.View>
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
  stateBox: {
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    paddingVertical: 40,
    paddingHorizontal: 24,
    gap: 10,
    marginTop: 8,
  },
  stateTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Palette.zinc900,
    textAlign: 'center',
  },
  stateSub: {
    fontSize: 13,
    color: Palette.zinc500,
    textAlign: 'center',
    lineHeight: 19,
  },
  retryBtn: {
    marginTop: 6,
    backgroundColor: Palette.zinc900,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
  },
  retryText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  staleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: Palette.indigo50,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  staleText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Palette.indigo600,
  },
});
