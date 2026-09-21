import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Palette } from '../theme/colors';
import { ThemeShadows } from '../theme/shadows';
import { PrimaryButton } from '../components/ui';
import { useApp } from '../context/AppContext';

interface OnboardingScreenProps {
  onDone: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onDone }) => {
  const { account, saveDisplayName } = useApp();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (account?.googleName && !name) {
      setName(account.googleName);
    }
  }, [account?.googleName]);

  const handleContinue = async () => {
    const trimmed = name.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      await saveDisplayName(trimmed);
      onDone();
    } catch (err) {
      Alert.alert('Could not save your name', err instanceof Error ? err.message : 'Please try again.');
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <View style={styles.logoBadge}>
          <Feather name="user" size={28} color="#ffffff" />
        </View>
        <Text style={styles.title}>What should we call you?</Text>
        <Text style={styles.subtitle}>
          Your wingman will use this name across the app. You can always change it later.
        </Text>

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={Palette.zinc400}
          autoFocus
          autoCapitalize="words"
          autoCorrect={false}
          maxLength={60}
          returnKeyType="done"
          onSubmitEditing={handleContinue}
        />

        {account?.email ? (
          <View style={styles.emailRow}>
            <Feather name="mail" size={13} color={Palette.zinc500} />
            <Text style={styles.emailText} numberOfLines={1}>
              Signed in as {account.email}
            </Text>
          </View>
        ) : null}

        <PrimaryButton
          label="Continue"
          icon="arrow-right"
          onPress={handleContinue}
          loading={saving}
          disabled={!name.trim()}
          style={styles.cta}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
  },
  content: {
    padding: 24,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: Palette.zinc900,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    ...ThemeShadows.md,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Palette.zinc900,
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Palette.zinc500,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
    marginBottom: 28,
  },
  input: {
    backgroundColor: Palette.zinc100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.zinc200,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '600',
    color: Palette.zinc900,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  emailText: {
    fontSize: 12,
    color: Palette.zinc500,
    fontWeight: '600',
    maxWidth: '85%',
  },
  cta: {
    marginTop: 24,
  },
});
