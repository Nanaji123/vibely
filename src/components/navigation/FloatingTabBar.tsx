import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Palette } from '../../theme/colors';
import { ThemeShadows } from '../../theme/shadows';

export type MainTabKey = 'home' | 'pulse' | 'profiles' | 'pro';

interface FloatingTabBarProps {
  activeTab: MainTabKey;
  onSelectTab: (tab: MainTabKey) => void;
}

export const FloatingTabBar: React.FC<FloatingTabBarProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const tabs: { key: MainTabKey; label: string; icon: keyof typeof Feather.glyphMap }[] = [
    { key: 'home', label: 'Home', icon: 'home' },
    { key: 'pulse', label: 'Pulse', icon: 'activity' },
    { key: 'profiles', label: 'People', icon: 'users' },
    { key: 'pro', label: 'Pro', icon: 'zap' },
  ];

  return (
    <View style={styles.outerContainer} pointerEvents="box-none">
      <View style={styles.floatingBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => onSelectTab(tab.key)}
              activeOpacity={0.75}
            >
              <Feather
                name={tab.icon}
                size={18}
                color={isActive ? '#ffffff' : Palette.zinc500}
              />
              <Text
                style={[
                  styles.tabLabel,
                  isActive ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 22,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    width: '75%', // Decreased width as requested!
    maxWidth: 295,
    ...ThemeShadows.md,
  },
  tabItem: {
    flexDirection: 'column', // Icon on top, name below
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 18,
    gap: 3,
  },
  tabItemActive: {
    backgroundColor: Palette.zinc900,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    color: '#ffffff',
  },
  tabLabelInactive: {
    color: Palette.zinc500,
  },
});
