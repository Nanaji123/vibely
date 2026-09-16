import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { PulseAnalysis } from '../types';

interface PulseDashboardProps {
  analysis: PulseAnalysis;
}

export const PulseDashboard: React.FC<PulseDashboardProps> = ({ analysis }) => {
  return (
    <View style={styles.cardContainer}>
      {/* Title Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Text style={styles.titleIcon}>🧠</Text>
          <Text style={styles.title}>Conversation Pulse</Text>
        </View>
        <View style={styles.vibeBadge}>
          <Text style={styles.vibeText}>{analysis.currentVibeSummary}</Text>
        </View>
      </View>

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        {/* Interest Level */}
        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Conversation Interest</Text>
            <Text style={styles.metricValue}>{analysis.interestScore}%</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[styles.progressBarFill, { width: `${analysis.interestScore}%`, backgroundColor: COLORS.primary }]}
            />
          </View>
        </View>

        {/* Playfulness */}
        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Playfulness</Text>
            <Text style={styles.metricValue}>{analysis.playfulnessScore}%</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${analysis.playfulnessScore}%`, backgroundColor: COLORS.accentCyan },
              ]}
            />
          </View>
        </View>

        {/* Romance */}
        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Romance</Text>
            <Text style={styles.metricValue}>{analysis.romanceScore}%</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${analysis.romanceScore}%`, backgroundColor: COLORS.primaryGlow },
              ]}
            />
          </View>
        </View>

        {/* Their Effort */}
        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Their Effort Balance</Text>
            <Text style={styles.metricValue}>{analysis.effortRatio}%</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${analysis.effortRatio}%`, backgroundColor: COLORS.accentEmerald },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Subtext Decoder Box */}
      <View style={styles.subtextCard}>
        <Text style={styles.subtextTitle}>🔍 Subtext Decoder</Text>
        <Text style={styles.subtextContent}>{analysis.subtext}</Text>
      </View>

      {/* Actionable Observation & Suggestion */}
      <View style={styles.coachingCard}>
        <Text style={styles.observationText}>{analysis.observation}</Text>
        <Text style={styles.suggestionText}>{analysis.suggestion}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...SHADOWS.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titleIcon: {
    fontSize: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  vibeBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#0284c7',
  },
  vibeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284c7',
  },
  metricsGrid: {
    gap: SPACING.sm + 2,
    marginBottom: SPACING.md,
  },
  metricItem: {
    gap: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  subtextCard: {
    backgroundColor: '#f5f3ff',
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 4,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#ddd6fe',
  },
  subtextTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.secondary,
    marginBottom: 2,
  },
  subtextContent: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  coachingCard: {
    backgroundColor: '#fff0f6',
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 4,
    borderWidth: 1,
    borderColor: '#ffdeeb',
    gap: 4,
  },
  observationText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
});
