import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { ConversationState, TargetProfile } from '../types';

interface HomeScreenViewProps {
  activeProfile?: TargetProfile;
  recentConversations: ConversationState[];
  onCreateNewChat: () => void;
  onContinueChat: (conv: ConversationState) => void;
  onOpenProfiles: () => void;
}

export const HomeScreenView: React.FC<HomeScreenViewProps> = ({
  activeProfile,
  recentConversations,
  onCreateNewChat,
  onContinueChat,
  onOpenProfiles,
}) => {
  const latestConv = recentConversations[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Full-Width Hero Card with Curved Bottom & Linear Gradient */}
      <View style={styles.heroOuterContainer}>
        <LinearGradient
          colors={['#18181b', '#312e81', '#4c1d95']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCurvedCard}
        >
          {/* Badge */}
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>VIBELY AI ENGINE</Text>
          </View>

          <Text style={styles.heroTitle}>Your AI Conversation Wingman</Text>

          {/* Visual AI Capability Cards Row */}
          <View style={styles.capabilitiesRow}>
            {/* Visual Feature 1: Context Replies */}
            <View style={styles.visualCard}>
              <View style={styles.visualIconBox}>
                <Text style={styles.visualIconText}>⚡</Text>
              </View>
              <Text style={styles.visualTitle}>Vibe Replies</Text>
              <Text style={styles.visualSub}>Playful • Flirty • Confident</Text>
            </View>

            {/* Visual Feature 2: Subtext Decoder */}
            <View style={styles.visualCard}>
              <View style={styles.visualIconBox}>
                <Text style={styles.visualIconText}>🧠</Text>
              </View>
              <Text style={styles.visualTitle}>Subtext Pulse</Text>
              <Text style={styles.visualSub}>Interest % & Coaching</Text>
            </View>

            {/* Visual Feature 3: Dialog Trees */}
            <View style={styles.visualCard}>
              <View style={styles.visualIconBox}>
                <Text style={styles.visualIconText}>🌿</Text>
              </View>
              <Text style={styles.visualTitle}>Dialog Trees</Text>
              <Text style={styles.visualSub}>If they say X → Say Y</Text>
            </View>
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity
            style={styles.createChatBtn}
            onPress={onCreateNewChat}
            activeOpacity={0.88}
          >
            <Text style={styles.plusIcon}>+</Text>
            <Text style={styles.createChatText}>Start New Session</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Main Body Section */}
      <View style={styles.bodyPadding}>
        {/* Active Target Context */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Active Context</Text>
          <TouchableOpacity onPress={onOpenProfiles}>
            <Text style={styles.changeText}>Switch Profile →</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.profileCard}
          onPress={onOpenProfiles}
          activeOpacity={0.85}
        >
          <View style={styles.profileAvatarSquare}>
            <Text style={styles.avatarEmoji}>{activeProfile?.avatarEmoji || '❤️'}</Text>
          </View>

          <View style={styles.profInfo}>
            <Text style={styles.profName}>{activeProfile?.name || 'Laxmi'}</Text>
            <Text style={styles.profMeta}>
              {activeProfile?.relationship || 'Crush'} • {activeProfile?.vibeSummary || 'Witty & Reserved'}
            </Text>
          </View>

          <View style={styles.activeTag}>
            <Text style={styles.activeTagText}>Active</Text>
          </View>
        </TouchableOpacity>

        {/* Continue Active Conversation */}
        {latestConv && (
          <View style={styles.continueSection}>
            <Text style={styles.sectionTitle}>Active Conversation</Text>
            <TouchableOpacity
              style={styles.continueCard}
              onPress={() => onContinueChat(latestConv)}
              activeOpacity={0.85}
            >
              <View style={styles.continueHeader}>
                <Text style={styles.convTarget}>{latestConv.targetName}</Text>
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreText}>{latestConv.pulseScore || 78}% Engagement</Text>
                </View>
              </View>

              <Text style={styles.convTitle} numberOfLines={1}>
                {latestConv.title}
              </Text>
              <Text style={styles.convPreview} numberOfLines={1}>
                "{latestConv.messages[latestConv.messages.length - 1]?.text || ''}"
              </Text>

              <View style={styles.continueFooter}>
                <Text style={styles.continueActionText}>Open Chat Studio →</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Recent Sessions */}
        {recentConversations.length > 1 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recent Sessions</Text>
            {recentConversations.slice(1, 4).map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.miniCard}
                onPress={() => onContinueChat(c)}
                activeOpacity={0.85}
              >
                <View style={styles.miniHeader}>
                  <Text style={styles.miniTarget}>{c.targetName}</Text>
                  <Text style={styles.miniVibe}>{c.currentVibe}</Text>
                </View>
                <Text style={styles.miniText} numberOfLines={1}>
                  "{c.messages[c.messages.length - 1]?.text || ''}"
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
    paddingBottom: 120,
  },
  heroOuterContainer: {
    marginTop: 40, // 40px top spacing below header as requested!
    width: '100%',
  },
  heroCurvedCard: {
    width: '100%',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: 36, // Curved bottom edge
    borderBottomRightRadius: 36,
    ...SHADOWS.md,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.xs + 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: SPACING.md,
    letterSpacing: -0.4,
  },
  capabilitiesRow: {
    flexDirection: 'row',
    gap: SPACING.xs + 2,
    marginBottom: SPACING.lg,
  },
  visualCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
  },
  visualIconBox: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  visualIconText: {
    fontSize: 16,
  },
  visualTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 2,
  },
  visualSub: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  createChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: SPACING.md - 2,
    borderRadius: RADIUS.md,
    gap: SPACING.xs,
    ...SHADOWS.sm,
  },
  plusIcon: {
    fontSize: 20,
    fontWeight: '900',
    color: '#18181b',
  },
  createChatText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#18181b',
    letterSpacing: 0.2,
  },
  bodyPadding: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs + 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryAccent,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  profileAvatarSquare: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: '#f4f4f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  avatarEmoji: {
    fontSize: 20,
  },
  profInfo: {
    flex: 1,
  },
  profName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  profMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  activeTag: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  activeTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accentEmerald,
  },
  continueSection: {
    marginBottom: SPACING.lg,
    gap: SPACING.xs,
  },
  continueCard: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    ...SHADOWS.sm,
  },
  continueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  convTarget: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  scoreBadge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  scoreText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryAccent,
  },
  convTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  convPreview: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: SPACING.sm,
  },
  continueFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f4f4f5',
    paddingTop: SPACING.xs + 2,
  },
  continueActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryAccent,
  },
  recentSection: {
    gap: SPACING.xs + 2,
  },
  miniCard: {
    backgroundColor: '#fafafa',
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 4,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  miniHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  miniTarget: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  miniVibe: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  miniText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
