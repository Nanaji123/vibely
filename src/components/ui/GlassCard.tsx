import React from 'react';
import { StyleSheet, ViewProps, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Radius, Spacing } from '../../theme';

interface GlassCardProps extends ViewProps {
  padded?: boolean;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  style?: ViewStyle | ViewStyle[];
}

/** Frosted-glass surface for premium overlays (profile switcher, sheets, badges). */
export const GlassCard: React.FC<GlassCardProps> = ({
  padded = true,
  intensity = 40,
  tint = 'light',
  style,
  children,
  ...rest
}) => {
  return (
    <BlurView
      intensity={intensity}
      tint={tint}
      style={[styles.base, padded && styles.padded, style]}
      {...rest}
    >
      {children}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(228, 228, 231, 0.6)',
    ...(Platform.OS === 'android' ? { backgroundColor: 'rgba(255,255,255,0.9)' } : null),
  },
  padded: {
    padding: Spacing.md,
  },
});
