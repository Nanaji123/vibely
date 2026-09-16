import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { RelationshipPicker } from './RelationshipPicker';
import { VibeSelector } from './VibeSelector';
import { ResponseDeck } from './ResponseDeck';
import { ChatMessage, ResponseOption, TargetProfile } from '../types';

interface ChatStudioViewProps {
  activeProfile?: TargetProfile;
  targetName: string;
  setTargetName: (name: string) => void;
  relationship: string;
  setRelationship: (rel: string) => void;
  selectedTraits: string[];
  setSelectedTraits: (traits: string[]) => void;
  customNotes: string;
  setCustomNotes: (notes: string) => void;

  messages: ChatMessage[];
  selectedVibe: string;
  setSelectedVibe: (vibe: string) => void;
  selectedIntent: string;
  setSelectedIntent: (intent: string) => void;

  responses: ResponseOption[];
  isGenerating: boolean;
  onGenerate: () => void;
  onTweak: (modifier: string) => void;
  onContinueConversation: (reply: ResponseOption) => void;
  onOpenInputMode: (mode: 'screenshot' | 'paste' | 'manual') => void;
  onBackToHome: () => void;
}

export const ChatStudioView: React.FC<ChatStudioViewProps> = ({
  activeProfile,
  targetName,
  setTargetName,
  relationship,
  setRelationship,
  selectedTraits,
  setSelectedTraits,
  customNotes,
  setCustomNotes,
  messages,
  selectedVibe,
  setSelectedVibe,
  selectedIntent,
  setSelectedIntent,
  responses,
  isGenerating,
  onGenerate,
  onTweak,
  onContinueConversation,
  onOpenInputMode,
  onBackToHome,
}) => {
  const [showConfigAccordion, setShowConfigAccordion] = useState<boolean>(false);

  return (
    <View style={styles.fullScreenContainer}>
      {/* Fullscreen Dedicated Top Header (NO GLOBAL HEADER) */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={onBackToHome} activeOpacity={0.8}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.targetInfo}>
          <Text style={styles.targetNameText}>{targetName || 'New Chat'}</Text>
          <Text style={styles.relBadgeText}>{relationship}</Text>
        </View>

        <TouchableOpacity
          style={styles.configToggleBtn}
          onPress={() => setShowConfigAccordion(!showConfigAccordion)}
          activeOpacity={0.8}
        >
          <Text style={styles.configToggleText}>{showConfigAccordion ? 'Done' : '⚙️ Setup'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
        {/* Dialogue Input Trigger Banner */}
        <View style={styles.uploadBanner}>
          <Text style={styles.bannerTitle}>1. Add Conversation Dialogue</Text>
          <View style={styles.uploadActionsRow}>
            <TouchableOpacity
              style={styles.uploadMiniBtn}
              onPress={() => onOpenInputMode('screenshot')}
              activeOpacity={0.85}
            >
              <Text style={styles.miniBtnIcon}>📸</Text>
              <Text style={styles.miniBtnText}>Screenshot</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.uploadMiniBtn}
              onPress={() => onOpenInputMode('paste')}
              activeOpacity={0.85}
            >
              <Text style={styles.miniBtnIcon}>📋</Text>
              <Text style={styles.miniBtnText}>Paste</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.uploadMiniBtn}
              onPress={() => onOpenInputMode('manual')}
              activeOpacity={0.85}
            >
              <Text style={styles.miniBtnIcon}>✍️</Text>
              <Text style={styles.miniBtnText}>Type</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Current Dialogue Bubbles */}
        {messages.length > 0 && (
          <View style={styles.dialogueBox}>
            <Text style={styles.dialogueTitle}>Extracted Dialogue ({messages.length} msgs):</Text>
            {messages.map((m) => (
              <View
                key={m.id}
                style={[
                  styles.bubble,
                  m.sender === 'you' ? styles.bubbleYou : styles.bubbleThem,
                ]}
              >
                <Text style={[styles.senderName, m.sender === 'you' && styles.senderYou]}>
                  {m.sender === 'you' ? 'You' : targetName}
                </Text>
                <Text style={[styles.bubbleText, m.sender === 'you' && styles.textYou]}>
                  {m.text}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Optional Relationship & Personality Tuner */}
        {showConfigAccordion && (
          <RelationshipPicker
            targetName={targetName}
            setTargetName={setTargetName}
            selectedRelationship={relationship}
            setSelectedRelationship={setRelationship}
            selectedTraits={selectedTraits}
            setSelectedTraits={setSelectedTraits}
            customNotes={customNotes}
            setCustomNotes={setCustomNotes}
          />
        )}

        {/* Vibe & Scenario Intent Selector */}
        <VibeSelector
          selectedVibe={selectedVibe}
          setSelectedVibe={setSelectedVibe}
          selectedIntent={selectedIntent}
          setSelectedIntent={setSelectedIntent}
          onGenerate={onGenerate}
          isGenerating={isGenerating}
        />

        {/* AI Generated Replies Deck */}
        {responses.length > 0 && (
          <ResponseDeck
            responses={responses}
            onTweak={onTweak}
            onRegenerate={onGenerate}
            onContinueConversation={onContinueConversation}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    ...SHADOWS.sm,
  },
  backBtn: {
    paddingVertical: SPACING.xs,
    paddingRight: SPACING.sm,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  targetInfo: {
    alignItems: 'center',
  },
  targetNameText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  relBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accentCyan,
    textTransform: 'uppercase',
  },
  configToggleBtn: {
    paddingVertical: SPACING.xs,
    paddingLeft: SPACING.sm,
  },
  configToggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl * 2,
  },
  uploadBanner: {
    backgroundColor: '#f8fafc',
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...SHADOWS.sm,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  uploadActionsRow: {
    flexDirection: 'row',
    gap: SPACING.xs + 2,
  },
  uploadMiniBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: SPACING.xs + 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 4,
  },
  miniBtnIcon: {
    fontSize: 14,
  },
  miniBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  dialogueBox: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.xs + 2,
  },
  dialogueTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  bubble: {
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.md,
  },
  bubbleYou: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-end',
    width: '85%',
  },
  bubbleThem: {
    backgroundColor: '#f1f5f9',
    alignSelf: 'flex-start',
    width: '85%',
  },
  senderName: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  senderYou: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  bubbleText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  textYou: {
    color: '#ffffff',
  },
});
