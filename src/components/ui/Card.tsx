import React from 'react';
import { View, StyleSheet, ViewProps, ViewStyle } from 'react-native';
import { Palette } from '../../theme/colors';
import { ThemeShadows } from '../../theme/shadows';
import { Radius, Spacing } from '../../theme';

interface CardProps extends ViewProps {
  padded?: boolean;
  elevated?: boolean;
  style?: ViewStyle | ViewStyle[];
}

export const Card: React.FC<CardProps> = ({ padded = true, elevated = true, style, children, ...rest }) => {
  return (
    <View
      style={[styles.base, padded && styles.padded, elevated && ThemeShadows.sm, style]}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.zinc200,
  },
  padded: {
    padding: Spacing.md,
  },
});
