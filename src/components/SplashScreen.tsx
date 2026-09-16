import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2200);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      {/* Brand Icon */}
      <View style={styles.logoBadge}>
        <Text style={styles.logoIcon}>⚡</Text>
      </View>

      <Text style={styles.brandTitle}>Vibely</Text>
      <Text style={styles.tagline}>Never get stuck on what to say.</Text>

      <View style={styles.loadingBox}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>Initializing wingman context...</Text>
      </View>

      <TouchableOpacity style={styles.skipBtn} onPress={onFinish} activeOpacity={0.8}>
        <Text style={styles.skipText}>Tap to start →</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgMain,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  logoIcon: {
    fontSize: 36,
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl * 2,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  skipBtn: {
    position: 'absolute',
    bottom: SPACING.xl * 1.5,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
