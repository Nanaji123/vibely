import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Palette } from '../theme/colors';
import { ThemeShadows } from '../theme/shadows';
import { authClient } from '../lib/authClient';

export const AuthScreen: React.FC = () => {
  const [signingIn, setSigningIn] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    setHint(null);
    try {
      // The client resolves with { data, error } rather than throwing on server/network errors
      const result = await authClient.signIn.social({ provider: 'google', callbackURL: 'vibely://' });
      if (result?.error) {
        Alert.alert(
          'Sign-in failed',
          result.error.message || 'Could not start Google sign-in. Check your connection and try again.'
        );
      } else {
        // The browser closes when it finishes, cancelled or not; confirm a session actually exists
        const session = await authClient.getSession();
        if (!session.data) {
          setHint("Sign-in didn't finish. Tap Continue with Google to try again.");
        }
      }
    } catch (err) {
      Alert.alert('Sign-in failed', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setSigningIn(false);
    }
  };

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
        <TouchableOpacity
          style={styles.googleBtn}
          onPress={handleGoogleSignIn}
          activeOpacity={0.85}
          disabled={signingIn}
        >
          {signingIn ? (
            <ActivityIndicator size="small" color={Palette.zinc900} />
          ) : (
            <>
              <View style={styles.googleIconCircle}>
                <Text style={styles.googleIcon}>G</Text>
              </View>
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
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
  hint: {
    fontSize: 13,
    color: Palette.zinc500,
    textAlign: 'center',
    lineHeight: 18,
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.zinc900,
  },
});
