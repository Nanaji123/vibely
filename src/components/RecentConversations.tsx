import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { ConversationState } from '../types';

interface RecentConversationsProps {
  conversations: ConversationState[];
  onSelectConversation: (conv: ConversationState) => void;
}

export const RecentConversations: React.FC<RecentConversationsProps> = ({
  conversations,
  onSelectConversation,
}) => {
  if (conversations.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Recent Conversations</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {conversations.map((conv) => {
          const lastMsg = conv.messages[conv.messages.length - 1]?.text || 'No messages';
          return (
            <TouchableOpacity
              key={conv.id}
              style={styles.card}
              onPress={() => onSelectConversation(conv)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.targetName}>{conv.targetName}</Text>
                {conv.pulseScore && (
                  <View style={styles.pulseBadge}>
                    <Text style={styles.pulseText}>{conv.pulseScore}% interest</Text>
                  </View>
                )}
              </View>
              <Text style={styles.titleText} numberOfLines={1}>
                {conv.title}
              </Text>
              <Text style={styles.lastMsgText} numberOfLines={1}>
                "{lastMsg}"
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs + 2,
  },
  scrollContent: {
    gap: SPACING.sm + 2,
    paddingRight: SPACING.md,
  },
  card: {
    width: 220,
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  targetName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  pulseBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  pulseText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accentEmerald,
  },
  titleText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  lastMsgText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
