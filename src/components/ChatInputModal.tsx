import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { ChatMessage, SenderRole } from '../types';
import { AIService } from '../services/aiService';

interface ChatInputModalProps {
  visible: boolean;
  initialMode: 'screenshot' | 'paste' | 'manual';
  onClose: () => void;
  onSubmitMessages: (messages: ChatMessage[], title: string) => void;
}

export const ChatInputModal: React.FC<ChatInputModalProps> = ({
  visible,
  initialMode,
  onClose,
  onSubmitMessages,
}) => {
  const [activeTab, setActiveTab] = useState<'screenshot' | 'paste' | 'manual'>(initialMode);

  // Screenshot state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isParsingImage, setIsParsingImage] = useState<boolean>(false);

  // Paste state
  const [pasteRawText, setPasteRawText] = useState<string>(
    `You: What are you doing this weekend?\nThem: Probably just staying home lol`
  );

  // Manual state
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'you', text: 'What are you doing this weekend?' },
    { id: '2', sender: 'them', text: 'Probably just staying home lol' },
  ]);
  const [inputSender, setInputSender] = useState<SenderRole>('them');
  const [inputText, setInputText] = useState<string>('');

  // Handle Image Pick
  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const uri = result.assets[0].uri;
        setSelectedImage(uri);
        setIsParsingImage(true);

        setTimeout(() => {
          const extracted = AIService.extractChatFromImage(uri);
          setMessages(extracted.messages);
          setIsParsingImage(false);
        }, 1200);
      }
    } catch (e) {
      setSelectedImage('https://via.placeholder.com/300x400/ffffff/f72585?text=Chat+Screenshot');
      setIsParsingImage(true);
      setTimeout(() => {
        setMessages([
          { id: '1', sender: 'you', text: 'What are you doing this weekend?' },
          { id: '2', sender: 'them', text: 'Probably just staying home lol' },
        ]);
        setIsParsingImage(false);
      }, 1000);
    }
  };

  // Add message manually
  const handleAddManualMessage = () => {
    if (!inputText.trim()) return;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: inputSender,
      text: inputText.trim(),
    };
    setMessages([...messages, newMsg]);
    setInputText('');
    setInputSender(inputSender === 'you' ? 'them' : 'you');
  };

  // Remove message
  const handleRemoveMessage = (id: string) => {
    setMessages(messages.filter((m) => m.id !== id));
  };

  // Process Paste Text
  const parsePasteText = (text: string): ChatMessage[] => {
    const lines = text.split('\n').filter((l) => l.trim().length > 0);
    return lines.map((line, idx) => {
      let sender: SenderRole = 'them';
      let cleanText = line.trim();

      if (/^(you|me|i):/i.test(cleanText)) {
        sender = 'you';
        cleanText = cleanText.replace(/^(you|me|i):/i, '').trim();
      } else if (/^(them|her|him|she|he|sarah|laxmi|alex):/i.test(cleanText)) {
        sender = 'them';
        cleanText = cleanText.replace(/^(them|her|him|she|he|sarah|laxmi|alex):/i, '').trim();
      } else {
        sender = idx % 2 === 0 ? 'you' : 'them';
      }

      return {
        id: `paste-${idx}`,
        sender,
        text: cleanText,
      };
    });
  };

  // Final Submit
  const handleConfirmSubmit = () => {
    let finalMsgs: ChatMessage[] = messages;

    if (activeTab === 'paste') {
      finalMsgs = parsePasteText(pasteRawText);
    }

    if (finalMsgs.length === 0) {
      finalMsgs = [{ id: '1', sender: 'them', text: 'Probably just staying home lol' }];
    }

    const title = finalMsgs[finalMsgs.length - 1]?.text || 'New Conversation';
    onSubmitMessages(finalMsgs, title);
    onClose();
  };

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
            <Text style={styles.title}>1. Add Conversation</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Mode Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'screenshot' && styles.activeTabBtn]}
              onPress={() => setActiveTab('screenshot')}
            >
              <Text style={[styles.tabText, activeTab === 'screenshot' && styles.activeTabText]}>
                📸 Screenshot
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'paste' && styles.activeTabBtn]}
              onPress={() => setActiveTab('paste')}
            >
              <Text style={[styles.tabText, activeTab === 'paste' && styles.activeTabText]}>
                📋 Paste
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'manual' && styles.activeTabBtn]}
              onPress={() => setActiveTab('manual')}
            >
              <Text style={[styles.tabText, activeTab === 'manual' && styles.activeTabText]}>
                ✍️ Type
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Contents */}
          <ScrollView style={styles.bodyScroll} contentContainerStyle={styles.bodyContent}>
            {activeTab === 'screenshot' && (
              <View style={styles.screenshotBox}>
                {!selectedImage ? (
                  <TouchableOpacity style={styles.uploadDropzone} onPress={handlePickImage}>
                    <Text style={styles.dropzoneIcon}>🖼️</Text>
                    <Text style={styles.dropzoneTitle}>Tap to select screenshot</Text>
                    <Text style={styles.dropzoneSub}>PNG, JPG or Screenshot images supported</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: selectedImage }} style={styles.previewImg} resizeMode="contain" />
                    <TouchableOpacity style={styles.repickBtn} onPress={handlePickImage}>
                      <Text style={styles.repickText}>Change Image</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {isParsingImage && (
                  <View style={styles.loadingBox}>
                    <ActivityIndicator color={COLORS.primary} size="large" />
                    <Text style={styles.loadingText}>AI is reading screenshot context...</Text>
                  </View>
                )}
              </View>
            )}

            {activeTab === 'paste' && (
              <View style={styles.pasteBox}>
                <Text style={styles.sectionLabel}>Paste conversation text below:</Text>
                <TextInput
                  style={styles.pasteInput}
                  multiline
                  value={pasteRawText}
                  onChangeText={setPasteRawText}
                  placeholder="You: Hey! What's up?\nThem: Nothing much, just chilling..."
                  placeholderTextColor={COLORS.textMuted}
                />
                <Text style={styles.tipText}>
                  💡 Tip: Prefixes like "You:" and "Them:" will be automatically recognized!
                </Text>
              </View>
            )}

            {/* Chat Bubble List */}
            <View style={styles.messagesSection}>
              <Text style={styles.sectionLabel}>Extracted Dialogue ({messages.length} messages):</Text>

              {messages.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.messageBubble,
                    item.sender === 'you' ? styles.bubbleYou : styles.bubbleThem,
                  ]}
                >
                  <View style={styles.bubbleHeader}>
                    <Text style={[styles.senderLabel, item.sender === 'you' && styles.senderYouLabel]}>
                      {item.sender === 'you' ? 'You' : 'Them'}
                    </Text>
                    <TouchableOpacity onPress={() => handleRemoveMessage(item.id)}>
                      <Text style={[styles.removeText, item.sender === 'you' && styles.removeYouText]}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.messageText, item.sender === 'you' && styles.msgYouText]}>{item.text}</Text>
                </View>
              ))}

              {/* Manual Input Controls */}
              <View style={styles.manualInputRow}>
                <TouchableOpacity
                  style={[
                    styles.roleToggleBtn,
                    inputSender === 'you' ? styles.roleYou : styles.roleThem,
                  ]}
                  onPress={() => setInputSender(inputSender === 'you' ? 'them' : 'you')}
                >
                  <Text style={styles.roleToggleText}>
                    {inputSender === 'you' ? 'You:' : 'Them:'}
                  </Text>
                </TouchableOpacity>

                <TextInput
                  style={styles.manualInput}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Type message text..."
                  placeholderTextColor={COLORS.textMuted}
                  onSubmitEditing={handleAddManualMessage}
                />

                <TouchableOpacity style={styles.addMsgBtn} onPress={handleAddManualMessage}>
                  <Text style={styles.addMsgBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Footer Submit */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.continueBtn} onPress={handleConfirmSubmit}>
              <Text style={styles.continueBtnText}>Continue to Vibe & Context →</Text>
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
    minHeight: '65%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...SHADOWS.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  closeBtnText: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
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
  activeTabBtn: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryGlow,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  bodyScroll: {
    flex: 1,
  },
  bodyContent: {
    padding: SPACING.md,
  },
  screenshotBox: {
    marginBottom: SPACING.md,
  },
  uploadDropzone: {
    height: 140,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  dropzoneIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  dropzoneTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  dropzoneSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  imagePreviewContainer: {
    alignItems: 'center',
  },
  previewImg: {
    width: '100%',
    height: 180,
    borderRadius: RADIUS.md,
  },
  repickBtn: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: RADIUS.full,
  },
  repickText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  loadingBox: {
    marginTop: 12,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.accentCyan,
    marginTop: 6,
  },
  pasteBox: {
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  pasteInput: {
    backgroundColor: '#f8fafc',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tipText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  messagesSection: {
    gap: SPACING.xs + 2,
  },
  messageBubble: {
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    marginBottom: 4,
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
  bubbleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  senderLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  senderYouLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  removeText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  removeYouText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  messageText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  msgYouText: {
    color: '#ffffff',
  },
  manualInputRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  roleToggleBtn: {
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderRadius: RADIUS.md,
  },
  roleYou: {
    backgroundColor: COLORS.primary,
  },
  roleThem: {
    backgroundColor: '#cbd5e1',
  },
  roleToggleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  manualInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: COLORS.textPrimary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  addMsgBtn: {
    width: 42,
    backgroundColor: COLORS.accentCyan,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMsgBtnText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  footer: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  continueBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
});
