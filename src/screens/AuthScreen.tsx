import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Palette, ThemeColors } from '../theme/colors';
import { ThemeShadows } from '../theme/shadows';

interface AuthScreenProps {
  onSignInSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSignInSuccess }) => {
  const [showConfigModal, setShowConfigModal] = useState(false);

  return (
    <View style={styles.container}>
      {/* Brand Badge */}
      <View style={styles.brandBox}>
        <View style={styles.logoBadge}>
          <Feather name="zap" size={28} color="#ffffff" />
        </View>
        <Text style={styles.title}>Welcome to Vibely</Text>
        <Text style={styles.subtitle}>
          Sign in to access your personality memory profiles, sentiment history, and custom response styles.
        </Text>
      </View>

      {/* Auth Actions */}
      <View style={styles.actionsBox}>
        {/* Google Sign-In Button */}
        <TouchableOpacity
          style={styles.googleBtn}
          onPress={() => setShowConfigModal(true)}
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
          onPress={onSignInSuccess}
          activeOpacity={0.85}
        >
          <Text style={styles.demoBtnText}>Instant Demo Access →</Text>
        </TouchableOpacity>
      </View>

      {/* Google Services Config Modal Prompt */}
      <Modal visible={showConfigModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.configModalCard}>
            <Feather name="settings" size={32} color={Palette.indigo600} style={{ marginBottom: 12 }} />
            <Text style={styles.configModalTitle}>Google OAuth Setup</Text>
            <Text style={styles.configModalDesc}>
              To connect your real Google credentials, provide your{' '}
              <Text style={styles.highlightText}>google-services.json</Text> file or Client ID.
            </Text>

            <TouchableOpacity
              style={styles.continueDemoBtn}
              onPress={() => {
                setShowConfigModal(false);
                onSignInSuccess();
              }}
            >
              <Text style={styles.continueDemoText}>Continue with Demo Account →</Text>
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
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    padding: 24,
  },
  brandBox: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: Palette.zinc900,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...ThemeShadows.md,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Palette.zinc900,
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    color: Palette.zinc500,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  actionsBox: {
    gap: 12,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
    ...ThemeShadows.sm,
  },
  googleIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 9999,
    backgroundColor: '#ea4335',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIcon: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.zinc900,
  },
  demoBtn: {
    backgroundColor: Palette.zinc100,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  demoBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.zinc800,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 9, 11, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  configModalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    ...ThemeShadows.md,
  },
  configModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.zinc900,
    marginBottom: 6,
  },
  configModalDesc: {
    fontSize: 13,
    color: Palette.zinc500,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  highlightText: {
    fontWeight: '800',
    color: Palette.indigo600,
  },
  continueDemoBtn: {
    backgroundColor: Palette.zinc900,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 8,
    width: '100%',
    alignItems: 'center',
  },
  continueDemoText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  cancelConfigBtn: {
    paddingVertical: 4,
  },
  cancelConfigText: {
    fontSize: 12,
    color: Palette.zinc400,
    fontWeight: '600',
  },
});
