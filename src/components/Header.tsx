import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { TargetProfile, UserSubscription } from '../types';

interface HeaderProps {
  activeProfile?: TargetProfile;
  subscription: UserSubscription;
  onOpenProfiles: () => void;
  onOpenPaywall: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeProfile,
  subscription,
  onOpenProfiles,
  onOpenPaywall,
}) => {
  return (
    <View style={styles.container}>
      {/* Brand Title */}
      <View style={styles.brandRow}>
        <View style={styles.logoMark}>
          <Text style={styles.logoIcon}>V</Text>
        </View>
        <View>
          <Text style={styles.brandText}>Vibely</Text>
          <Text style={styles.subtext}>Conversation Assistant</Text>
        </View>
      </View>

      {/* Right Controls: Profile & Subscription */}
      <View style={styles.actionsRow}>
        {/* Profile Pill */}
        <TouchableOpacity style={styles.profilePill} onPress={onOpenProfiles} activeOpacity={0.8}>
          <View style={styles.statusDot} />
          <Text style={styles.profileName} numberOfLines={1}>
            {activeProfile?.name || 'General'}
          </Text>
        </TouchableOpacity>

        {/* Plan Badge */}
        <TouchableOpacity style={styles.planBadge} onPress={onOpenPaywall} activeOpacity={0.8}>
          {subscription.unlimited ? (
            <Text style={styles.proText}>PRO</Text>
          ) : (
            <Text style={styles.creditsText}>{subscription.creditsRemaining} Credits</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e7',
    ...SHADOWS.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  logoMark: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
  brandText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
  },
  subtext: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs + 2,
  },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f5',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.accentEmerald,
  },
  profileName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    maxWidth: 75,
  },
  planBadge: {
    backgroundColor: '#18181b',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.md,
  },
  creditsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  proText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
});