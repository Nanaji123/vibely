import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Palette, ThemeColors } from '../theme/colors';
import { ThemeShadows } from '../theme/shadows';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      {/* Brand Icon Badge */}
      <View style={styles.logoBadge}>
        <Feather name="zap" size={32} color="#ffffff" />
      </View>

      <Text style={styles.brandTitle}>Vibely</Text>
      <Text style={styles.tagline}>Never get stuck on what to say.</Text>

      <View style={styles.loadingBox}>
        <ActivityIndicator size="small" color={Palette.zinc900} />
        <Text style={styles.loadingText}>Initializing conversational engine...</Text>
      </View>

      <TouchableOpacity style={styles.skipBtn} onPress={onFinish} activeOpacity={0.8}>
        <Text style={styles.skipText}>Tap to enter →</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: Palette.zinc900,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...ThemeShadows.md,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: Palette.zinc900,
    letterSpacing: -0.6,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '500',
    color: Palette.zinc500,
    textAlign: 'center',
    marginBottom: 40,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  loadingText: {
    fontSize: 13,
    color: Palette.zinc600,
    fontWeight: '600',
  },
  skipBtn: {
    position: 'absolute',
    bottom: 40,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.indigo600,
  },
});
