import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { Palette, ThemeColors } from '../theme/colors';
import { ThemeShadows } from '../theme/shadows';
import {
  ChatMessageModel,
  TargetProfileModel,
  SuggestionOptionModel,
  DialogTreeNodeModel,
} from '../domain/index';
import { AIService } from '../services/aiService';

interface ChatStudioScreenProps {
  activeProfile: TargetProfileModel;
  messages: ChatMessageModel[];
  onUpdateMessages: (msgs: ChatMessageModel[]) => void;
  onBack: () => void;
}

export const ChatStudioScreen: React.FC<ChatStudioScreenProps> = ({
  activeProfile,
  messages,
  onUpdateMessages,
  onBack,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('flirty');
  const [targetGender, setTargetGender] = useState<'female' | 'male' | 'other'>(
    (activeProfile.gender as any) || 'female'
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Modals & Sheets
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteInputText, setPasteInputText] = useState('');

  // Branching Scenario Modal
  const [branchingReply, setBranchingReply] = useState<SuggestionOptionModel | null>(null);
  const [branchScenarios, setBranchScenarios] = useState<DialogTreeNodeModel[]>([]);

  const scrollViewRef = useRef<ScrollView>(null);
  const isInitialScrollDone = useRef(false);
  const thinkingPulseAnim = useRef(new Animated.Value(1)).current;

  // Reset initial scroll status on component mount or activeProfile change
  useEffect(() => {
    isInitialScrollDone.current = false;
  }, [activeProfile.id]);

  useEffect(() => {
    if (isAiThinking) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(thinkingPulseAnim, { toValue: 1.03, duration: 600, useNativeDriver: true }),
          Animated.timing(thinkingPulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [isAiThinking, thinkingPulseAnim]);

  // Handle Android Back Gesture / Button
  useEffect(() => {
    const onBackPress = () => {
      if (showPasteModal) {
        setShowPasteModal(false);
        return true;
      }
      if (showPlusMenu) {
        setShowPlusMenu(false);
        return true;
      }
      if (branchingReply) {
        setBranchingReply(null);
        return true;
      }
      onBack();
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [showPasteModal, showPlusMenu, branchingReply, onBack]);

  // Toggle Target Gender (Her -> Him -> Them)
  const handleToggleGender = () => {
    const nextGender = targetGender === 'female' ? 'male' : targetGender === 'male' ? 'other' : 'female';
    setTargetGender(nextGender);
  };

  // When user sends a message to Vibely AI about the target's conversation
  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const prompt = inputText.trim();
    setInputText('');

    const userMsg: ChatMessageModel = {
      id: `m-${Date.now()}`,
      sender: 'you',
      text: prompt,
      timestamp: 'Just now',
    };

    const updatedWithUser = [...messages, userMsg];
    onUpdateMessages(updatedWithUser);

    setIsAiThinking(true);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // AI Wingman analyzes the scene and formulates advice + 3 suggestions in the selected genre & gender
    setTimeout(() => {
      const coachResp = AIService.generateCoachSceneResponse(
        prompt,
        selectedGenre,
        activeProfile.relationship,
        activeProfile.name,
        targetGender
      );

      const aiMsg: ChatMessageModel = {
        id: `m-ai-${Date.now()}`,
        sender: 'ai',
        text: coachResp.advice,
        sceneContext: coachResp.sceneContext,
        suggestions: coachResp.suggestions,
        timestamp: 'Just now',
      };

      onUpdateMessages([...updatedWithUser, aiMsg]);
      setIsAiThinking(false);

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }, 450);
  };

  // User SELECTS / SENDS one of the 3 AI suggestions:
  // 1. Marks selectedSuggestionId on that AI message (so other suggestions vanish and don't still show!)
  // 2. Logs user's confirmation in the chat
  // 3. AI acknowledges with follow-up encouragement
  const handleSelectSuggestion = (aiMsgId: string, option: SuggestionOptionModel) => {
    // Hide other suggestions from this AI message
    const updatedMessages = messages.map(m => {
      if (m.id === aiMsgId) {
        return {
          ...m,
          selectedSuggestionId: option.id,
        };
      }
      return m;
    });

    const userSentMsg: ChatMessageModel = {
      id: `m-${Date.now()}`,
      sender: 'you',
      text: `I sent: "${option.replyText}"`,
      timestamp: 'Just now',
    };

    const nextBatch = [...updatedMessages, userSentMsg];
    onUpdateMessages(nextBatch);

    setIsAiThinking(true);
    setTimeout(() => {
      const aiFollowUp: ChatMessageModel = {
        id: `m-ai-${Date.now()}`,
        sender: 'ai',
        text: `🔥 High confidence move! That puts the momentum squarely in ${activeProfile.name}'s court. When ${targetGender === 'female' ? 'she' : 'he'} replies back, just type what ${targetGender === 'female' ? 'she' : 'he'} said or upload a screenshot!`,
        timestamp: 'Just now',
      };
      onUpdateMessages([...nextBatch, aiFollowUp]);
      setIsAiThinking(false);

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }, 400);
  };

  // Copy with Visual Toast
  const handleCopy = async (option: SuggestionOptionModel) => {
    try {
      await Clipboard.setStringAsync(option.replyText);
      setCopiedId(option.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      setCopiedId(option.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Open Branching Next Turn Preview
  const handleOpenBranching = (option: SuggestionOptionModel) => {
    setBranchingReply(option);
    const nodes = AIService.generateContinueTree(option.replyText);
    setBranchScenarios(nodes);
  };

  // Screenshot Picker
  const handlePickScreenshot = async () => {
    setShowPlusMenu(false);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const prompt = `[Uploaded screenshot of chat with ${activeProfile.name}] "Probably just staying home lol"`;
        setInputText(prompt);
      }
    } catch (e) {
      // Ignore cancellation or permissions denial
    }
  };

  // Paste Dialogue
  const handlePasteSubmit = () => {
    if (!pasteInputText.trim()) return;
    setInputText(`She said: "${pasteInputText.trim()}"`);
    setShowPasteModal(false);
    setPasteInputText('');
  };

  // Clear Chat Stream
  const handleClearChat = () => {
    setShowPlusMenu(false);
    const welcomeMsg: ChatMessageModel = {
      id: `m-${Date.now()}`,
      sender: 'ai',
      text: `Hey! I'm your AI wingman for ${activeProfile.name}. Tell me what ${targetGender === 'female' ? 'she' : 'he'} texted you, or upload a screenshot with the + button, and I'll break down the scene and give you 3 killer responses!`,
      timestamp: 'Just now',
    };
    onUpdateMessages([welcomeMsg]);
  };

  const genresList = [
    { id: 'flirty', label: 'Flirty', icon: 'heart', color: '#e11d48' },
    { id: 'witty', label: 'Witty', icon: 'zap', color: '#4f46e5' },
    { id: 'playful', label: 'Playful', icon: 'smile', color: '#0284c7' },
    { id: 'confident', label: 'Confident', icon: 'award', color: '#059669' },
    { id: 'romantic', label: 'Romantic', icon: 'sun', color: '#db2777' },
    { id: 'warm', label: 'Warm', icon: 'shield', color: '#d97706' },
  ];

  const genderLabel = targetGender === 'female' ? '👩 Her' : targetGender === 'male' ? '👨 Him' : '🧑 Them';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* 1. AI WINGMAN COACH HEADER */}
      <View style={styles.chatNavHeader}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <Feather name="chevron-left" size={26} color={Palette.zinc900} />
        </TouchableOpacity>

        {/* Vibely AI Coach Branding & Active Subject Context */}
        <View style={styles.contactHeaderInfo}>
          <View style={styles.avatarCircle}>
            <Feather name="zap" size={18} color="#ffffff" />
            <View style={styles.onlineStatusDot} />
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.contactName}>Vibely AI</Text>
              <View style={styles.coachBadge}>
                <Text style={styles.coachBadgeText}>WINGMAN</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={styles.contactStatus}>
                Talking about: <Text style={{ fontWeight: '800' }}>{activeProfile.name}</Text> ({activeProfile.relationship})
              </Text>
              {/* Target Gender Toggle Pill */}
              <TouchableOpacity
                style={styles.genderToggleChip}
                onPress={handleToggleGender}
                activeOpacity={0.75}
              >
                <Text style={styles.genderToggleText}>{genderLabel}</Text>
                <Feather name="chevron-down" size={9} color={Palette.zinc500} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.headerActionBtn}
          onPress={() => setShowPlusMenu(true)}
          activeOpacity={0.7}
        >
          <Feather name="more-vertical" size={20} color={Palette.zinc700} />
        </TouchableOpacity>
      </View>

      {/* 2. CHAT STREAM BETWEEN USER & VIBELY AI COACH */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatScroll}
        contentContainerStyle={styles.chatContent}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => {
          if (!isInitialScrollDone.current) {
            scrollViewRef.current?.scrollToEnd({ animated: false });
            isInitialScrollDone.current = true;
          }
        }}
      >
        <View style={styles.dateStampContainer}>
          <View style={styles.dateStampBadge}>
            <Text style={styles.dateStampText}>
              Wingman Session • Strategy for {activeProfile.name} ({genderLabel})
            </Text>
          </View>
        </View>

        {/* Message Thread */}
        {messages.map((m) => {
          const isYou = m.sender === 'you';
          const isAi = m.sender === 'ai';

          return (
            <View
              key={m.id}
              style={[styles.messageRow, isYou ? styles.rowYou : styles.rowAi]}
            >
              <View
                style={[
                  styles.chatBubble,
                  isYou ? styles.bubbleYou : styles.bubbleAi,
                ]}
              >
                {/* AI Header with Icon inside bubble */}
                {isAi && (
                  <View style={styles.aiBubbleHeader}>
                    <View style={styles.aiAvatarBox}>
                      <Feather name="zap" size={12} color="#ffffff" />
                    </View>
                    <Text style={styles.aiBubbleHeaderTitle}>Vibely AI Wingman</Text>
                  </View>
                )}

                {/* 1. Scene Analysis / Subtext Context (if provided by AI) */}
                {m.sceneContext && (
                  <View style={styles.sceneContextCard}>
                    <View style={styles.sceneContextBadgeRow}>
                      <Feather name="eye" size={11} color={Palette.indigo600} />
                      <Text style={styles.sceneContextTitle}>SCENE BREAKDOWN & SIGNALS</Text>
                    </View>
                    <Text style={styles.sceneContextBody}>{m.sceneContext}</Text>
                  </View>
                )}

                {/* 2. Main Message Body */}
                <Text style={[styles.bubbleMessageText, isYou && styles.bubbleMessageTextYou]}>
                  {m.text}
                </Text>

                {/* 3. Three Tailored Reply Suggestions in Selected Genre & Gender */}
                {m.suggestions && m.suggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    {/* If user already picked one, ONLY SHOW the chosen one! Other suggestions vanish! */}
                    {m.selectedSuggestionId ? (
                      <View style={styles.chosenOptionBanner}>
                        <Feather name="check-circle" size={13} color={Palette.emerald600} />
                        <Text style={styles.chosenOptionBannerText}>
                          You selected & sent Option {m.suggestions.findIndex(s => s.id === m.selectedSuggestionId) + 1}
                        </Text>
                      </View>
                    ) : (
                      <>
                        <View style={styles.suggestionsHeader}>
                          <View style={styles.suggestionsHeaderBadge}>
                            <Feather name="message-circle" size={11} color={Palette.indigo600} />
                            <Text style={styles.suggestionsHeaderTitle}>
                              3 {selectedGenre.toUpperCase()} OPTIONS TO SAY:
                            </Text>
                          </View>
                          <Text style={styles.suggestionsHeaderSub}>Tap one to send to {activeProfile.name}</Text>
                        </View>

                        <View style={styles.suggestionCardsList}>
                          {m.suggestions.map((opt, idx) => {
                            const isCopied = copiedId === opt.id;
                            return (
                              <View key={opt.id} style={styles.suggestionCard}>
                                <View style={styles.suggestionCardTop}>
                                  <View style={styles.variantBadge}>
                                    <Text style={styles.variantBadgeNumber}>{idx + 1}</Text>
                                    <Text style={styles.variantBadgeText}>{opt.toneVariant}</Text>
                                  </View>

                                  <View style={styles.cardActionsRow}>
                                    {/* Copy to Clipboard */}
                                    <TouchableOpacity
                                      style={styles.iconCircle}
                                      onPress={() => handleCopy(opt)}
                                      activeOpacity={0.75}
                                    >
                                      <Feather
                                        name={isCopied ? 'check' : 'copy'}
                                        size={12}
                                        color={isCopied ? Palette.emerald600 : Palette.zinc600}
                                      />
                                    </TouchableOpacity>

                                    {/* Next turn branch */}
                                    <TouchableOpacity
                                      style={styles.iconCircle}
                                      onPress={() => handleOpenBranching(opt)}
                                      activeOpacity={0.75}
                                    >
                                      <Feather name="git-branch" size={12} color={Palette.indigo600} />
                                    </TouchableOpacity>
                                  </View>
                                </View>

                                {/* Quote Text */}
                                <Text style={styles.suggestionQuoteText}>"{opt.replyText}"</Text>

                                {/* Select & Send Action Button */}
                                <TouchableOpacity
                                  style={styles.selectOptionBtn}
                                  onPress={() => handleSelectSuggestion(m.id, opt)}
                                  activeOpacity={0.85}
                                >
                                  <Feather name="send" size={12} color="#ffffff" />
                                  <Text style={styles.selectOptionBtnText}>I Sent This One</Text>
                                </TouchableOpacity>
                              </View>
                            );
                          })}
                        </View>
                      </>
                    )}
                  </View>
                )}
              </View>
            </View>
          );
        })}

        {/* AI Thinking Indicator */}
        {isAiThinking && (
          <Animated.View style={[{ transform: [{ scale: thinkingPulseAnim }] }]}>
            <View style={[styles.messageRow, styles.rowAi]}>
              <View style={[styles.chatBubble, styles.bubbleAi, styles.thinkingBubble]}>
                <View style={styles.aiBubbleHeader}>
                  <View style={styles.aiAvatarBox}>
                    <Feather name="zap" size={12} color="#ffffff" />
                  </View>
                  <Text style={styles.aiBubbleHeaderTitle}>Vibely AI Wingman</Text>
                </View>
                <Text style={styles.thinkingText}>
                  Vibely AI is decoding {activeProfile.name}'s signals & crafting 3 {selectedGenre} options...
                </Text>
              </View>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* 3. GENRE / VIBE SELECTOR STRIP (Switch vibe anytime) */}
      <View style={styles.genreStripContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.genreStrip}>
          {genresList.map((g) => {
            const isSelected = selectedGenre === g.id;
            return (
              <TouchableOpacity
                key={g.id}
                style={[
                  styles.genreChip,
                  isSelected && styles.genreChipActive,
                ]}
                onPress={() => setSelectedGenre(g.id)}
                activeOpacity={0.8}
              >
                <Feather
                  name={g.icon as any}
                  size={12}
                  color={isSelected ? '#ffffff' : g.color}
                />
                <Text style={[styles.genreChipText, isSelected && styles.genreChipTextActive]}>
                  {g.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 4. QUICK CONTEXT CHIPS (Easily tell AI what she/he said) */}
      <View style={styles.quickChipsContainer}>
        <TouchableOpacity
          style={styles.quickChip}
          onPress={() => setInputText(`She said: "`)}
          activeOpacity={0.75}
        >
          <Feather name="message-square" size={11} color={Palette.zinc700} />
          <Text style={styles.quickChipText}>She said...</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickChip}
          onPress={() => setInputText(`He said: "`)}
          activeOpacity={0.75}
        >
          <Feather name="message-square" size={11} color={Palette.zinc700} />
          <Text style={styles.quickChipText}>He said...</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickChip}
          onPress={handlePickScreenshot}
          activeOpacity={0.75}
        >
          <Feather name="camera" size={11} color={Palette.indigo600} />
          <Text style={[styles.quickChipText, { color: Palette.indigo600 }]}>Screenshot</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickChip}
          onPress={() => setShowPasteModal(true)}
          activeOpacity={0.75}
        >
          <Feather name="clipboard" size={11} color={Palette.zinc700} />
          <Text style={styles.quickChipText}>Paste chat</Text>
        </TouchableOpacity>
      </View>

      {/* 5. USER CHAT INPUT BAR TO TALK TO VIBELY AI */}
      <View style={styles.inputBarContainer}>
        {/* "+" Action Menu */}
        <TouchableOpacity
          style={styles.plusMenuBtn}
          onPress={() => setShowPlusMenu(true)}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={20} color={Palette.zinc900} />
        </TouchableOpacity>

        {/* Text Input */}
        <TextInput
          style={styles.chatTextInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder={`Tell AI what ${activeProfile.name} said (e.g. She said: ...)`}
          placeholderTextColor={Palette.zinc400}
          onSubmitEditing={handleSendMessage}
          returnKeyType="send"
          onFocus={() => {
            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
          }}
        />

        {/* Send Button */}
        <TouchableOpacity
          style={[styles.sendButton, inputText.trim().length > 0 && styles.sendButtonActive]}
          onPress={handleSendMessage}
          activeOpacity={0.85}
        >
          <Feather
            name="arrow-up"
            size={18}
            color={inputText.trim().length > 0 ? '#ffffff' : Palette.zinc400}
          />
        </TouchableOpacity>
      </View>

      {/* "+" ACTION SHEET MODAL */}
      <Modal visible={showPlusMenu} animationType="fade" transparent>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowPlusMenu(false)}
        >
          <View style={styles.plusActionSheet}>
            <Text style={styles.actionSheetTitle}>Wingman Tools & Context</Text>

            {/* Upload Screenshot */}
            <TouchableOpacity
              style={styles.actionSheetItem}
              onPress={handlePickScreenshot}
              activeOpacity={0.8}
            >
              <View style={[styles.sheetIconCircle, { backgroundColor: Palette.indigo50 }]}>
                <Feather name="image" size={18} color={Palette.indigo600} />
              </View>
              <View>
                <Text style={styles.sheetItemTitle}>Upload Chat Screenshot</Text>
                <Text style={styles.sheetItemSub}>AI scans what {activeProfile.name} sent you</Text>
              </View>
            </TouchableOpacity>

            {/* Paste Dialogue Text */}
            <TouchableOpacity
              style={styles.actionSheetItem}
              onPress={() => {
                setShowPlusMenu(false);
                setShowPasteModal(true);
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.sheetIconCircle, { backgroundColor: '#fdf2f8' }]}>
                <Feather name="clipboard" size={18} color="#db2777" />
              </View>
              <View>
                <Text style={styles.sheetItemTitle}>Paste Dialogue Text</Text>
                <Text style={styles.sheetItemSub}>Paste messages from WhatsApp / Instagram</Text>
              </View>
            </TouchableOpacity>

            {/* Switch Target Gender Context */}
            <TouchableOpacity
              style={styles.actionSheetItem}
              onPress={() => {
                setShowPlusMenu(false);
                handleToggleGender();
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.sheetIconCircle, { backgroundColor: '#eff6ff' }]}>
                <Feather name="user" size={18} color="#2563eb" />
              </View>
              <View>
                <Text style={styles.sheetItemTitle}>Target Gender: {genderLabel}</Text>
                <Text style={styles.sheetItemSub}>Toggle between Her (Female) and Him (Male)</Text>
              </View>
            </TouchableOpacity>

            {/* Clear & Restart Session */}
            <TouchableOpacity
              style={styles.actionSheetItem}
              onPress={handleClearChat}
              activeOpacity={0.8}
            >
              <View style={[styles.sheetIconCircle, { backgroundColor: Palette.zinc100 }]}>
                <Feather name="rotate-ccw" size={18} color={Palette.zinc700} />
              </View>
              <View>
                <Text style={styles.sheetItemTitle}>Restart Session</Text>
                <Text style={styles.sheetItemSub}>Clear conversation to a clean slate</Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* PASTE DIALOGUE MODAL */}
      <Modal visible={showPasteModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowPasteModal(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.pasteModalCard}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.pasteModalHeader}>
                <Text style={styles.pasteModalTitle}>Paste {activeProfile.name}'s Message</Text>
                <TouchableOpacity onPress={() => setShowPasteModal(false)}>
                  <Feather name="x" size={20} color={Palette.zinc700} />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.pasteTextArea}
                value={pasteInputText}
                onChangeText={setPasteInputText}
                multiline
                placeholder="e.g. Probably just staying home lol"
                placeholderTextColor={Palette.zinc400}
              />

              <TouchableOpacity style={styles.importBtn} onPress={handlePasteSubmit} activeOpacity={0.85}>
                <Text style={styles.importBtnText}>Analyze with AI Wingman</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* BRANCHING SCENARIO MODAL */}
      <Modal visible={!!branchingReply} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.branchModalCard}>
            <View style={styles.branchModalHeader}>
              <View>
                <Text style={styles.branchModalTitle}>Next Turn Predictions</Text>
                <Text style={styles.branchModalSub}>If you send this, here is how {activeProfile.name} will respond</Text>
              </View>
              <TouchableOpacity onPress={() => setBranchingReply(null)}>
                <Feather name="x" size={20} color={Palette.zinc700} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 16 }}>
              <View style={styles.chosenQuoteBox}>
                <Text style={styles.chosenQuoteLabel}>SELECTED SUGGESTION:</Text>
                <Text style={styles.chosenQuoteText}>"{branchingReply?.replyText}"</Text>
              </View>

              <Text style={[styles.sectionHeading, { marginTop: 14, marginBottom: 8 }]}>
                Counter-Scenarios:
              </Text>

              {branchScenarios.map((node, idx) => (
                <View key={node.id} style={styles.scenarioCard}>
                  <View style={styles.scenarioHeader}>
                    <Text style={styles.scenarioIndex}>Scenario {idx + 1}</Text>
                    <Text style={styles.scenarioIntent}>{node.intent}</Text>
                  </View>
                  <Text style={styles.scenarioIfText}>If {activeProfile.name} says: {node.ifTheySay}</Text>
                  <View style={styles.scenarioThenBox}>
                    <Text style={styles.scenarioThenLabel}>Follow-up Move:</Text>
                    <Text style={styles.scenarioThenText}>{node.suggestedReply}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  chatNavHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    ...ThemeShadows.sm,
  },
  backButton: {
    padding: 4,
  },
  contactHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginLeft: 4,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Palette.zinc900,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  onlineStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.emerald600,
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  contactName: {
    fontSize: 15,
    fontWeight: '800',
    color: Palette.zinc900,
  },
  coachBadge: {
    backgroundColor: Palette.indigo50,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  coachBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Palette.indigo600,
    letterSpacing: 0.5,
  },
  genderToggleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.zinc100,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    gap: 2,
  },
  genderToggleText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: Palette.zinc700,
  },
  contactStatus: {
    fontSize: 10.5,
    color: Palette.zinc600,
  },
  headerActionBtn: {
    padding: 8,
  },
  chatScroll: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  chatContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 24,
  },
  dateStampContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  dateStampBadge: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dateStampText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.zinc500,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-start',
    gap: 8,
  },
  rowYou: {
    justifyContent: 'flex-end',
  },
  rowAi: {
    justifyContent: 'flex-start',
  },
  aiAvatarBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Palette.zinc900,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiBubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  aiBubbleHeaderTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: Palette.zinc900,
    letterSpacing: -0.1,
  },
  chatBubble: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
  },
  bubbleYou: {
    backgroundColor: Palette.zinc900,
    borderBottomRightRadius: 4,
    maxWidth: '85%',
  },
  bubbleAi: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 4,
    maxWidth: '96%',
    width: '96%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...ThemeShadows.sm,
  },
  bubbleMessageText: {
    fontSize: 14,
    color: Palette.zinc900,
    lineHeight: 20,
  },
  bubbleMessageTextYou: {
    color: '#ffffff',
  },
  thinkingBubble: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
  },
  thinkingText: {
    fontSize: 12.5,
    color: Palette.zinc500,
    fontStyle: 'italic',
  },

  /* SCENE CONTEXT CARD */
  sceneContextCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: Palette.indigo600,
  },
  sceneContextBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  sceneContextTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Palette.indigo600,
    letterSpacing: 0.5,
  },
  sceneContextBody: {
    fontSize: 12,
    color: Palette.zinc800,
    lineHeight: 17,
  },

  /* SUGGESTIONS LIST INSIDE AI MESSAGE */
  suggestionsContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  suggestionsHeader: {
    marginBottom: 8,
  },
  suggestionsHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  suggestionsHeaderTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: Palette.zinc900,
    letterSpacing: 0.3,
  },
  suggestionsHeaderSub: {
    fontSize: 10.5,
    color: Palette.zinc500,
    marginTop: 2,
  },
  suggestionCardsList: {
    gap: 8,
    marginTop: 6,
  },
  suggestionCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  suggestionCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  variantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  variantBadgeNumber: {
    backgroundColor: Palette.zinc900,
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: '800',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 3,
  },
  variantBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: Palette.indigo600,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  suggestionQuoteText: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.zinc900,
    lineHeight: 18,
    marginBottom: 8,
  },
  selectOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.zinc900,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 5,
  },
  selectOptionBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  chosenOptionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  chosenOptionBannerText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.emerald600,
  },

  /* GENRE STRIP */
  genreStripContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingVertical: 6,
  },
  genreStrip: {
    paddingHorizontal: 10,
    gap: 6,
  },
  genreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.zinc100,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    gap: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  genreChipActive: {
    backgroundColor: Palette.zinc900,
    borderColor: Palette.zinc900,
  },
  genreChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.zinc700,
  },
  genreChipTextActive: {
    color: '#ffffff',
  },

  /* QUICK PREFIX CHIPS */
  quickChipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#ffffff',
    gap: 6,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  quickChipText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: Palette.zinc700,
  },

  /* INPUT BAR */
  inputBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 6,
  },
  plusMenuBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.zinc100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatTextInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    color: Palette.zinc900,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.zinc200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: Palette.zinc900,
  },

  /* MODALS */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(9, 9, 11, 0.5)',
    justifyContent: 'flex-end',
  },
  plusActionSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
    gap: 14,
  },
  actionSheetTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Palette.zinc900,
    marginBottom: 4,
  },
  actionSheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  sheetIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.zinc900,
  },
  sheetItemSub: {
    fontSize: 11,
    color: Palette.zinc500,
  },
  pasteModalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
  },
  pasteModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  pasteModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.zinc900,
  },
  pasteTextArea: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    minHeight: 120,
    fontSize: 14,
    color: Palette.zinc900,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  importBtn: {
    backgroundColor: Palette.zinc900,
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
  },
  importBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  branchModalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 24,
  },
  branchModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  branchModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.zinc900,
  },
  branchModalSub: {
    fontSize: 11,
    color: Palette.zinc500,
  },
  chosenQuoteBox: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chosenQuoteLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Palette.zinc500,
  },
  chosenQuoteText: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.zinc900,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: Palette.zinc900,
  },
  scenarioCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  scenarioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  scenarioIndex: {
    fontSize: 12,
    fontWeight: '800',
    color: Palette.zinc900,
  },
  scenarioIntent: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.indigo600,
  },
  scenarioIfText: {
    fontSize: 13,
    color: Palette.zinc700,
    marginBottom: 8,
  },
  scenarioThenBox: {
    backgroundColor: Palette.indigo50,
    padding: 8,
    borderRadius: 6,
  },
  scenarioThenLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Palette.indigo600,
  },
  scenarioThenText: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.zinc900,
    marginTop: 2,
  },
});
