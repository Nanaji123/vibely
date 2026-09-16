import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { ResponseOption } from '../types';

interface ResponseDeckProps {
  responses: ResponseOption[];
  onTweak: (modifier: string) => void;
  onRegenerate: () => void;
  onContinueConversation: (reply: ResponseOption) => void;
}

export const ResponseDeck: React.FC<ResponseDeckProps> = ({
  responses,
  onTweak,
  onRegenerate,
  onContinueConversation,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (id: string, text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  if (responses.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>AI Generated Replies ({responses.length})</Text>
        <TouchableOpacity style={styles.regenBtn} onPress={onRegenerate}>
          <Text style={styles.regenText}>🔄 Regenerate</Text>
        </TouchableOpacity>
      </View>

      {/* Tweak Modifiers Quick Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tweakScroll}>
        <TouchableOpacity style={styles.tweakPill} onPress={() => onTweak('shorter')}>
          <Text style={styles.tweakText}>✂️ Make shorter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tweakPill} onPress={() => onTweak('more_flirty')}>
          <Text style={styles.tweakText}>😏 More flirty</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tweakPill} onPress={() => onTweak('more_playful')}>
          <Text style={styles.tweakText}>🤪 More playful</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tweakPill} onPress={() => onTweak('more_confident')}>
          <Text style={styles.tweakText}>😎 More confident</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tweakPill} onPress={() => onTweak('emoji')}>
          <Text style={styles.tweakText}>✨ Add emoji</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Response Cards List */}
      <View style={styles.cardsList}>
        {responses.map((item) => {
          const isCopied = copiedId === item.id;
          return (
            <View key={item.id} style={styles.card}>
              {/* Category Badge */}
              <View style={styles.cardHeader}>
                <View style={[styles.badge, getCategoryBadgeStyle(item.category)]}>
                  <Text style={styles.badgeText}>{item.category}</Text>
                </View>

                {isCopied && <Text style={styles.copiedToast}>✓ Copied to clipboard!</Text>}
              </View>

              {/* Reply Quote Body */}
              <Text style={styles.replyText}>"{item.replyText}"</Text>
              <Text style={styles.explanationText}>💡 {item.explanation}</Text>

              {/* Action Buttons Row */}
              <View style={styles.actionsRow}>
                {/* Copy Button */}
                <TouchableOpacity
                  style={[styles.actionBtn, styles.copyBtn]}
                  onPress={() => handleCopy(item.id, item.replyText)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.copyBtnText}>{isCopied ? 'Copied ✓' : '📋 Copy'}</Text>
                </TouchableOpacity>

                {/* Continue Conversation Killer Feature */}
                <TouchableOpacity
                  style={[styles.actionBtn, styles.continueBtn]}
                  onPress={() => onContinueConversation(item)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.continueBtnText}>🔥 Continue Conv →</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const getCategoryBadgeStyle = (category: string) => {
  switch (category) {
    case 'Playful':
      return { backgroundColor: '#e0f2fe', borderColor: '#0284c7' };
    case 'Flirty':
      return { backgroundColor: '#ffe4e6', borderColor: '#f72585' };
    case 'Romantic':
      return { backgroundColor: '#fce7f3', borderColor: '#ec4899' };
    case 'Funny':
      return { backgroundColor: '#fef3c7', borderColor: '#d97706' };
    case 'Confident':
      return { backgroundColor: '#d1fae5', borderColor: '#10b981' };
    default:
      return { backgroundColor: '#e0e7ff', borderColor: '#6366f1' };
  }
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs + 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  regenBtn: {
    backgroundColor: '#ffffff',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  regenText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accentCyan,
  },
  tweakScroll: {
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  tweakPill: {
    backgroundColor: '#ffffff',
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tweakText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  cardsList: {
    gap: SPACING.md,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  badge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  copiedToast: {
    fontSize: 12,
    color: COLORS.accentEmerald,
    fontWeight: '700',
  },
  replyText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: SPACING.xs,
  },
  explanationText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  copyBtn: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  copyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  continueBtn: {
    backgroundColor: 'rgba(247, 37, 133, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  continueBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
});
