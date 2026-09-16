import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../constants/theme';

export type TabKey = 'home' | 'pulse' | 'convos' | 'profiles' | 'premium';

interface BottomTabBarProps {
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
  unreadConvosCount?: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabPress,
  unreadConvosCount = 0,
}) => {
  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'home', label: 'Home', icon: '🏠' },
    { key: 'pulse', label: 'Pulse', icon: '🧠' },
    { key: 'convos', label: 'Convos', icon: '💬' },
    { key: 'profiles', label: 'Profiles', icon: '🎭' },
    { key: 'premium', label: 'Pro', icon: '⚡' },
  ];

  return (
    <View style={styles.floatingContainer}>
      <View style={styles.barCard}>
        {tabs.map((t) => {
          const isActive = activeTab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              style={[styles.tabBtn, isActive && styles.tabBtnActive]}
              onPress={() => onTabPress(t.key)}
              activeOpacity={0.8}
            >
              <Text style={styles.tabIcon}>{t.icon}</Text>
              {isActive && <Text style={styles.tabLabel}>{t.label}</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
    alignItems: 'center',
  },
  barCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.xs + 4,
    paddingVertical: SPACING.xs + 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    width: '100%',
    ...SHADOWS.md,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 4,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  tabBtnActive: {
    backgroundColor: '#fff0f6',
    borderWidth: 1,
    borderColor: '#ffdeeb',
  },
  tabIcon: {
    fontSize: 18,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
});
