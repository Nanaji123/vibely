import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { ResponseOption, BranchingNode } from '../types';
import { AIService } from '../services/aiService';

interface ContinueTreeModalProps {
  visible: boolean;
  selectedReply: ResponseOption | null;
  lastMessage: string;
  onClose: () => void;
}

export const ContinueTreeModal: React.FC<ContinueTreeModalProps> = ({
  visible,
  selectedReply,
  lastMessage,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'branches' | 'roleplay'>('branches');
  const branches = selectedReply ? AIService.generateContinueTree(selectedReply.replyText) : [];

  // Practice Roleplay state
  const [roleplayHistory, setRoleplayHistory] = useState<
    { sender: 'them' | 'you'; text: string }[]
  >([
    { sender: 'them', text: lastMessage || 'Probably just staying home lol' },
    { sender: 'you', text: selectedReply?.replyText || 'Sounds like you need better plans 😏' },
  ]);
  const [userRoleplayInput, setUserRoleplayInput] = useState('');

  const handleSendRoleplay = (replyText?: string) => {
    const textToSend = replyText || userRoleplayInput;
    if (!textToSend.trim()) return;

    const updated = [
      ...roleplayHistory,
      { sender: 'you' as const, text: textToSend },
    ];
    setRoleplayHistory(updated);
    setUserRoleplayInput('');

    setTimeout(() => {
      setRoleplayHistory((prev) => [
        ...prev,
        { sender: 'them', text: 'Haha okay, what do you suggest we do then? 😏' },
      ]);
    }, 1000);
  };

  if (!selectedReply) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>🔥 Continue Conversation</Text>
              <Text style={styles.subtitle}>Practice & see where the conversation goes</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Mode Switcher */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'branches' && styles.tabActive]}
              onPress={() => setActiveTab('branches')}
            >
              <Text style={[styles.tabText, activeTab === 'branches' && styles.tabTextActive]}>
                🌿 Dialog Branches
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'roleplay' && styles.tabActive]}
              onPress={() => setActiveTab('roleplay')}
            >
              <Text style={[styles.tabText, activeTab === 'roleplay' && styles.tabTextActive]}>
                🎭 Practice Roleplay
              </Text>
            </TouchableOpacity>
          </View>

          {/* Context Banner */}
          <View style={styles.contextBanner}>
            <Text style={styles.contextLabel}>THEIR LAST MESSAGE:</Text>
            <Text style={styles.contextThem}>"{lastMessage}"</Text>
            <Text style={styles.arrowDown}>↓</Text>
            <Text style={styles.contextLabel}>YOUR CHOSEN REPLY:</Text>
            <Text style={styles.contextYou}>"{selectedReply.replyText}"</Text>
          </View>

          {/* Body */}
          <ScrollView style={styles.bodyScroll} contentContainerStyle={styles.bodyContent}>
            {activeTab === 'branches' && (
              <View style={styles.branchesList}>
                <Text style={styles.sectionHeader}>IF THEY SAY...</Text>

                {branches.map((node, index) => (
                  <View key={node.id} style={styles.nodeCard}>
                    {/* If they say */}
                    <View style={styles.ifBox}>
                      <Text style={styles.ifLabel}>Scenario {index + 1}:</Text>
                      <Text style={styles.ifText}>{node.ifTheySay}</Text>
                    </View>

                    {/* AI Suggested Response */}
                    <View style={styles.thenBox}>
                      <View style={styles.thenHeader}>
                        <Text style={styles.thenLabel}>YOUR BEST REPLY:</Text>
                        <Text style={styles.intentTag}>{node.intent}</Text>
                      </View>
                      <Text style={styles.thenText}>"{node.suggestedReply}"</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.testBranchBtn}
                      onPress={() => {
                        setActiveTab('roleplay');
                        handleSendRoleplay(node.suggestedReply);
                      }}
                    >
                      <Text style={styles.testBranchText}>Test this direction in Practice →</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {activeTab === 'roleplay' && (
              <View style={styles.roleplayContainer}>
                <Text style={styles.sectionHeader}>Interactive Practice Chat:</Text>

                {roleplayHistory.map((item, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.chatBubble,
                      item.sender === 'you' ? styles.youBubble : styles.themBubble,
                    ]}
                  >
                    <Text style={[styles.chatSender, item.sender === 'you' && styles.chatSenderYou]}>
                      {item.sender === 'you' ? 'You' : 'Them'}
                    </Text>
                    <Text style={[styles.chatMsgText, item.sender === 'you' && styles.chatMsgYouText]}>
                      {item.text}
                    </Text>
                  </View>
                ))}

                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.roleplayInput}
                    value={userRoleplayInput}
                    onChangeText={setUserRoleplayInput}
                    placeholder="Type counter-reply to test..."
                    placeholderTextColor={COLORS.textMuted}
                  />
                  <TouchableOpacity
                    style={styles.sendBtn}
                    onPress={() => handleSendRoleplay()}
                  >
                    <Text style={styles.sendBtnText}>Send</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
              <Text style={styles.doneText}>Done Practice</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    maxHeight: '90%',
    minHeight: '75%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...SHADOWS.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  closeBtnText: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
    gap: SPACING.xs,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: SPACING.xs + 4,
    borderRadius: RADIUS.md,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  contextBanner: {
    backgroundColor: '#f8fafc',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    padding: SPACING.sm + 4,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  contextLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  contextThem: {
    fontSize: 13,
    color: COLORS.accentCyan,
    fontWeight: '600',
  },
  arrowDown: {
    fontSize: 12,
    color: COLORS.primary,
    marginVertical: 2,
  },
  contextYou: {
    fontSize: 13,
    color: COLORS.primaryGlow,
    fontWeight: '700',
  },
  bodyScroll: {
    flex: 1,
  },
  bodyContent: {
    padding: SPACING.md,
  },
  branchesList: {
    gap: SPACING.md,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  nodeCard: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: SPACING.xs + 2,
    ...SHADOWS.sm,
  },
  ifBox: {
    backgroundColor: '#fef3c7',
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  ifLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#d97706',
  },
  ifText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  thenBox: {
    backgroundColor: '#fff0f6',
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#ffdeeb',
  },
  thenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  thenLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
  },
  intentTag: {
    fontSize: 10,
    color: COLORS.accentCyan,
    fontWeight: '700',
  },
  thenText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  testBranchBtn: {
    backgroundColor: '#f8fafc',
    paddingVertical: SPACING.xs + 4,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  testBranchText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accentCyan,
  },
  roleplayContainer: {
    gap: SPACING.sm,
  },
  chatBubble: {
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    marginBottom: 4,
  },
  youBubble: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-end',
    width: '85%',
  },
  themBubble: {
    backgroundColor: '#f1f5f9',
    alignSelf: 'flex-start',
    width: '85%',
  },
  chatSender: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  chatSenderYou: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  chatMsgText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  chatMsgYouText: {
    color: '#ffffff',
  },
  inputRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  roleplayInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: COLORS.textPrimary,
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sendBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
  },
  sendBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  footer: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  doneBtn: {
    backgroundColor: '#f8fafc',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  doneText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});
