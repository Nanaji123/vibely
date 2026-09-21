import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Palette } from '../../theme/colors';
import { ThemeShadows } from '../../theme/shadows';

export type MainTabKey = 'Home' | 'Pulse' | 'Profiles';

const TAB_META: Record<MainTabKey, { label: string; icon: keyof typeof Feather.glyphMap }> = {
  Home: { label: 'Home', icon: 'message-circle' },
  Pulse: { label: 'Pulse', icon: 'activity' },
  Profiles: { label: 'People', icon: 'users' },
};

// Static layout: the active tab is a dark pill with its label, the others are icons.
// No animated width/colour here; those flicker on the JS driver during tab transitions.
const TabButton: React.FC<{
  label: string;
  icon: keyof typeof Feather.glyphMap;
  isActive: boolean;
  onPress: () => void;
}> = ({ label, icon, isActive, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="tab"
    accessibilityState={{ selected: isActive }}
    accessibilityLabel={label}
    style={({ pressed }) => [styles.pill, isActive && styles.pillActive, pressed && styles.pillPressed]}
  >
    <Feather name={icon} size={18} color={isActive ? '#ffffff' : Palette.zinc500} />
    {isActive ? <Text style={styles.label}>{label}</Text> : null}
  </Pressable>
);

export const FloatingTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.outer, { bottom: Math.max(insets.bottom, 12) + 4 }]} pointerEvents="box-none">
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const meta = TAB_META[route.name as MainTabKey];
          if (!meta) return null;
          const isActive = state.index === index;
          return (
            <TabButton
              key={route.key}
              label={meta.label}
              icon={meta.icon}
              isActive={isActive}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!isActive && !event.defaultPrevented) navigation.navigate(route.name);
              }}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255,255,255,0.97)' : '#ffffff',
    borderRadius: 999,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(228,228,231,0.9)',
    gap: 4,
    ...ThemeShadows.lg,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 999,
    gap: 8,
  },
  pillActive: {
    backgroundColor: Palette.zinc900,
    paddingHorizontal: 18,
  },
  pillPressed: {
    opacity: 0.7,
  },
  label: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
