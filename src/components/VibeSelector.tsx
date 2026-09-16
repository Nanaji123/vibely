import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { VIBES, INTENTS } from '../constants/vibes';

interface VibeSelectorProps {
  selectedVibe: string;
  setSelectedVibe: (vibe: string) => void;
  selectedIntent: string;
  setSelectedIntent: (intent: string) => void;
  onGenerate: () => void;
  isGenerating?: boolean;
}

export const VibeSelector: React.FC<VibeSelectorProps> = ({
  selectedVibe,
  setSelectedVibe,
  selectedIntent,
  setSelectedIntent,
  onGenerate,
  isGenerating = false,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>3. Pick the Vibe ✨</Text>

      {/* Vibe Pills Horizontal List */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.vibeScroll}>
        {VIBES.map((vibe) => {
          const isSelected = selectedVibe === vibe.id;
          return (
            <TouchableOpacity
              key={vibe.id}
              style={[
                styles.vibePill,
                isSelected && { backgroundColor: vibe.color || COLORS.primary, borderColor: vibe.color },
              ]}
              onPress={() => setSelectedVibe(vibe.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.vibeEmoji}>{vibe.emoji}</Text>
              <Text style={[styles.vibeText, isSelected && styles.vibeTextActive]}>{vibe.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Conversation Intent Picker */}
      <Text style={styles.sublabel}>Conversation Intent:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.intentScroll}>
        {INTENTS.map((intent) => {
          const isSelected = selectedIntent === intent.id;
          return (
            <TouchableOpacity
              key={intent.id}
              style={[styles.intentCard, isSelected && styles.intentCardActive]}
              onPress={() => setSelectedIntent(intent.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.intentEmoji}>{intent.emoji}</Text>
              <Text style={[styles.intentText, isSelected && styles.intentTextActive]}>
                {intent.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Main CTA Button */}
      <TouchableOpacity
        style={[styles.generateBtn, isGenerating && styles.btnDisabled]}
        onPress={onGenerate}
        disabled={isGenerating}
        activeOpacity={0.85}
      >
        <Text style={styles.generateBtnText}>
          {isGenerating ? 'AI Wingman is thinking...' : 'Generate AI Replies 🚀'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
  },
  label: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs + 2,
  },
  sublabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  vibeScroll: {
    gap: SPACING.xs + 2,
    paddingRight: SPACING.md,
    paddingVertical: 4,
  },
  vibePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
    ...SHADOWS.sm,
  },
  vibeEmoji: {
    fontSize: 16,
  },
  vibeText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  vibeTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  intentScroll: {
    gap: SPACING.xs,
    paddingRight: SPACING.md,
  },
  intentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs + 4,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  intentCardActive: {
    backgroundColor: '#f0f9ff',
    borderColor: COLORS.accentCyan,
  },
  intentEmoji: {
    fontSize: 14,
  },
  intentText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  intentTextActive: {
    color: COLORS.accentCyan,
    fontWeight: '700',
  },
  generateBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.md,
    ...SHADOWS.md,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  generateBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
});
