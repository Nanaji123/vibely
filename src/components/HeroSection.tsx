import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

interface HeroSectionProps {
  onSelectMode: (mode: 'screenshot' | 'paste' | 'manual') => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSelectMode }) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerBox}>
        <Text style={styles.title}>What should I say? 💬</Text>
        <Text style={styles.subtitle}>
          Upload or paste your conversation to get context-aware, high-vibe replies & strategic analysis.
        </Text>
      </View>

      <View style={styles.actionsGrid}>
        {/* Screenshot Upload Button */}
        <TouchableOpacity
          style={[styles.actionBtn, styles.btnGradient1]}
          onPress={() => onSelectMode('screenshot')}
          activeOpacity={0.85}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>📸</Text>
          </View>
          <View style={styles.btnTextContainer}>
            <Text style={styles.btnTitle}>Upload Screenshot</Text>
            <Text style={styles.btnSubtitle}>Auto-extract chat bubbles</Text>
          </View>
          <Text style={styles.arrowIcon}>→</Text>
        </TouchableOpacity>

        {/* Paste Conversation Button */}
        <TouchableOpacity
          style={[styles.actionBtn, styles.btnGradient2]}
          onPress={() => onSelectMode('paste')}
          activeOpacity={0.85}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>📋</Text>
          </View>
          <View style={styles.btnTextContainer}>
            <Text style={styles.btnTitle}>Paste Chat</Text>
            <Text style={styles.btnSubtitle}>Quick text parser</Text>
          </View>
          <Text style={styles.arrowIcon}>→</Text>
        </TouchableOpacity>

        {/* Start from Scratch / Type Manual */}
        <TouchableOpacity
          style={[styles.actionBtn, styles.btnGradient3]}
          onPress={() => onSelectMode('manual')}
          activeOpacity={0.85}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>✍️</Text>
          </View>
          <View style={styles.btnTextContainer}>
            <Text style={styles.btnTitle}>Start from Scratch</Text>
            <Text style={styles.btnSubtitle}>Type messages manually</Text>
          </View>
          <Text style={styles.arrowIcon}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.lg,
    padding: SPACING.md + 4,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...SHADOWS.sm,
  },
  headerBox: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  actionsGrid: {
    gap: SPACING.sm + 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  btnGradient1: {
    backgroundColor: '#fff0f6',
    borderColor: '#ffdeeb',
  },
  btnGradient2: {
    backgroundColor: '#f5f3ff',
    borderColor: '#ddd6fe',
  },
  btnGradient3: {
    backgroundColor: '#f0f9ff',
    borderColor: '#bae6fd',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm + 4,
    ...SHADOWS.sm,
  },
  iconText: {
    fontSize: 18,
  },
  btnTextContainer: {
    flex: 1,
  },
  btnTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  btnSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  arrowIcon: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
});
