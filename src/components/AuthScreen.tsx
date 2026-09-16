import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

interface AuthScreenProps {
  onSignInSuccess: (user: { name: string; email: string }) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSignInSuccess }) => {
  const [showConfigModal, setShowConfigModal] = useState(false);

  const handleGoogleSignIn = () => {
    // Prompt user about Google Services JSON config
    setShowConfigModal(true);
  };

  const handleDemoSignIn = () => {
    onSignInSuccess({
      name: 'Alex Developer',
      email: 'alex.vibely@gmail.com',
    });
  };

  return (
    <View style={styles.container}>
      {/* Brand Badge */}
      <View style={styles.brandBox}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoIcon}>⚡</Text>
        </View>
        <Text style={styles.title}>Welcome to Vibely</Text>
        <Text style={styles.subtitle}>
          Sign in to save your conversation history, target profiles, and custom AI vibes.
        </Text>
      </View>

      {/* Auth Actions */}
      <View style={styles.actionsBox}>
        {/* Google Sign-In Button */}
        <TouchableOpacity
          style={styles.googleBtn}
          onPress={handleGoogleSignIn}
          activeOpacity={0.85}
        >
          <View style={styles.googleIconCircle}>
            <Text style={styles.googleIcon}>G</Text>
          </View>
          <Text style={styles.googleBtnText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Demo Fast Login */}
        <TouchableOpacity
          style={styles.demoBtn}
          onPress={handleDemoSignIn}
          activeOpacity={0.85}
        >
          <Text style={styles.demoBtnText}>⚡ Demo Quick Start (Instant Access)</Text>
        </TouchableOpacity>
      </View>

      {/* Google Services Config Modal Prompt */}
      <Modal visible={showConfigModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.configModalCard}>
            <Text style={styles.configModalIcon}>📁</Text>
            <Text style={styles.configModalTitle}>Google Auth Config Notice</Text>
            <Text style={styles.configModalDesc}>
              To enable native production Google OAuth Sign-In, please provide your{' '}
              <Text style={styles.highlightText}>google-services.json</Text> file or Google Web Client ID.
            </Text>

            <TouchableOpacity
              style={styles.continueDemoBtn}
              onPress={() => {
                setShowConfigModal(false);
                handleDemoSignIn();
              }}
            >
              <Text style={styles.continueDemoText}>Continue with Demo Session →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelConfigBtn}
              onPress={() => setShowConfigModal(false)}
            >
              <Text style={styles.cancelConfigText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgMain,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  brandBox: {
    alignItems: 'center',
    marginBottom: SPACING.xl * 1.5,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  logoIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: SPACING.sm,
  },
  actionsBox: {
    gap: SPACING.md,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: SPACING.sm + 4,
    ...SHADOWS.sm,
  },
  googleIconCircle: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.full,
    backgroundColor: '#ea4335',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIcon: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  demoBtn: {
    backgroundColor: COLORS.bgCardHover,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  demoBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  configModalCard: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  configModalIcon: {
    fontSize: 40,
    marginBottom: SPACING.xs,
  },
  configModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  configModalDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  highlightText: {
    fontWeight: '800',
    color: COLORS.primary,
  },
  continueDemoBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xs,
    width: '100%',
    alignItems: 'center',
  },
  continueDemoText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  cancelConfigBtn: {
    paddingVertical: SPACING.xs,
  },
  cancelConfigText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
});
