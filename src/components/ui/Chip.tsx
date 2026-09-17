import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Palette } from '../../theme/colors';
import { Radius, Spacing, FontSize, FontWeight } from '../../theme';

interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const Chip: React.FC<ChipProps> = ({ label, active, onPress, style }) => {
  return (
    <TouchableOpacity
      style={[styles.base, active && styles.active, style]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Palette.zinc100,
    borderWidth: 1,
    borderColor: Palette.zinc200,
  },
  active: {
    backgroundColor: Palette.zinc900,
    borderColor: Palette.zinc900,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Palette.zinc600,
  },
  labelActive: {
    color: Palette.white,
  },
});
