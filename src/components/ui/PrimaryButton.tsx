import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Palette } from '../../theme/colors';
import { Radius, Spacing, FontSize, FontWeight } from '../../theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Feather.glyphMap;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onPress,
  icon,
  variant = 'primary',
  loading,
  disabled,
  style,
}) => {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], isDisabled && styles.disabled, style]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'secondary' ? Palette.zinc900 : Palette.white} />
      ) : (
        <>
          {icon && (
            <Feather
              name={icon}
              size={16}
              color={variant === 'secondary' ? Palette.zinc900 : Palette.white}
            />
          )}
          <Text style={[styles.label, styles[`${variant}Label` as const]]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: 14,
    borderRadius: Radius.md,
  },
  primary: {
    backgroundColor: Palette.zinc900,
  },
  secondary: {
    backgroundColor: Palette.zinc100,
    borderWidth: 1,
    borderColor: Palette.zinc200,
  },
  danger: {
    backgroundColor: '#fef2f2',
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  primaryLabel: {
    color: Palette.white,
  },
  secondaryLabel: {
    color: Palette.zinc900,
  },
  dangerLabel: {
    color: '#dc2626',
  },
});
