import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Palette } from '../../theme/colors';
import { ThemeShadows } from '../../theme/shadows';

export type MainTabKey = 'Home' | 'Pulse' | 'Profiles' | 'Pro';

const TAB_META: Record<MainTabKey, { label: string; icon: keyof typeof Feather.glyphMap }> = {
  Home: { label: 'Home', icon: 'home' },
  Pulse: { label: 'Pulse', icon: 'activity' },
  Profiles: { label: 'People', icon: 'users' },
  Pro: { label: 'Pro', icon: 'zap' },
};

const TabButton: React.FC<{
  tab: { key: MainTabKey; label: string; icon: keyof typeof Feather.glyphMap };
  isActive: boolean;
  onPress: () => void;
}> = ({ tab, isActive, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      friction: 5,
      tension: 300,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.tabItem, isActive && styles.tabItemActive]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.85}
      >
        <Feather name={tab.icon} size={18} color={isActive ? '#ffffff' : Palette.zinc500} />
        <Text style={[styles.tabLabel, isActive ? styles.tabLabelActive : styles.tabLabelInactive]}>
          {tab.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const FloatingTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  return (
    <View style={styles.outerContainer} pointerEvents="box-none">
      <View style={styles.floatingBar}>
        {state.routes.map((route, index) => {
          const key = route.name as MainTabKey;
          const meta = TAB_META[key];
          if (!meta) return null;
          const isActive = state.index === index;

          return (
            <TabButton
              key={route.key}
              tab={{ key, ...meta }}
              isActive={isActive}
              onPress={() => {
                if (!isActive) {
                  navigation.navigate(route.name);
                }
              }}
            />
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
    width: '75%',
    maxWidth: 295,
    ...ThemeShadows.md,
  },
  tabItem: {
    flexDirection: 'column',
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
