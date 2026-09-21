import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Image,
  Platform,
  BackHandler,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { Palette } from '../theme/colors';
import { ThemeShadows } from '../theme/shadows';
import { TargetProfileModel } from '../domain/index';

const MAX_SCREENSHOTS = 4;

interface NewSessionFlowScreenProps {
  activeProfile: TargetProfileModel;
  onBack: () => void;
  onStartNewSession: () => Promise<void>;
  onCreateCustomSession: (
    rawText: string,
    mode: 'paste' | 'type',
    profile: TargetProfileModel
  ) => Promise<void>;
  onCreateScreenshotSession: (images: string[], profile: TargetProfileModel) => Promise<void>;
  onOpenStudio: () => void;
}

export const NewSessionFlowScreen: React.FC<NewSessionFlowScreenProps> = ({
  activeProfile,
  onBack,
  onStartNewSession,
  onCreateCustomSession,
  onCreateScreenshotSession,
  onOpenStudio,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [method, setMethod] = useState<'screenshot' | 'paste' | 'type'>('screenshot');
  const [pasteText, setPasteText] = useState('');
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [imageData, setImageData] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Entrance animation for steps
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(14);

  useEffect(() => {
    fadeAnim.value = 0;
    slideAnim.value = 14;
    fadeAnim.value = withTiming(1, { duration: 280 });
    slideAnim.value = withTiming(0, { duration: 280 });
  }, [step]);

  const stepAnimStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  // Handle Android Back Gesture
  useEffect(() => {
    const onBackPress = () => {
      if (step === 2) {
        setStep(1);
        return true;
      }
      onBack();
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [step, onBack]);

  // Image Picker Handler (Direct media library, multiple selection, NO cropping)
  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        allowsEditing: false, // Disabled crop window as requested!
        quality: 0.5,
        base64: true,
        selectionLimit: MAX_SCREENSHOTS,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const room = MAX_SCREENSHOTS - imageUris.length;
        const picked = result.assets.filter(a => a.base64).slice(0, Math.max(room, 0));
        setImageUris(prev => [...prev, ...picked.map(a => a.uri)]);
        setImageData(prev => [...prev, ...picked.map(a => `data:image/jpeg;base64,${a.base64}`)]);
        setMethod('screenshot');
        setStep(2);
      }
    } catch (e) {}
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImageUris(prev => prev.filter((_, idx) => idx !== indexToRemove));
    setImageData(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Clipboard Paste Handler
  const handlePasteClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setPasteText(text);
      }
    } catch (e) {}
  };

  // Submit Handler
  const handleSubmitStep2 = async () => {
    setIsAnalyzing(true);
    try {
      if (method === 'screenshot') {
        await onCreateScreenshotSession(imageData, activeProfile);
      } else {
        await onCreateCustomSession(pasteText, 'paste', activeProfile);
      }
      onOpenStudio();
    } catch (err) {
      Alert.alert('Could not analyze', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const targetName = activeProfile.name;
  const genderLabel =
    activeProfile?.gender === 'female'
      ? '👩 Her'
      : activeProfile?.gender === 'male'
      ? '👨 Him'
      : '🧑 Them';

  return (
    <View style={styles.container}>
      {/* PROFESSIONAL TOP HEADER */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (step === 2) {
              setStep(1);
            } else {
              onBack();
            }
          }}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color={Palette.zinc900} />
          <Text style={styles.backBtnText}>
            {step === 2 ? 'Back' : 'Back'}
          </Text>
        </TouchableOpacity>

        <View style={styles.headerTitleCenter}>
          <Text style={styles.headerNavTitle}>New Wingman Session</Text>
        </View>

        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>STEP {step} OF 2</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={stepAnimStyle}>
          {/* STEP 1: SELECT METHOD */}
          {step === 1 && (
            <View style={styles.stepContainer}>
              <View style={styles.titleSection}>
                <Text style={styles.stepTitle}>Share Conversation Context</Text>
                <Text style={styles.stepSub}>
                  Select how you want to provide your recent chat dialogue to AI Wingman.
                </Text>

                {/* TARGET PROFILE CONTEXT CARD */}
                <View style={styles.activeProfileBanner}>
                  <View style={styles.activeProfileAvatar}>
                    <Text style={styles.activeProfileEmoji}>
                      {activeProfile?.avatarEmoji || '❤️'}
                    </Text>
                  </View>
                  <View style={styles.activeProfileTextCol}>
                    <View style={styles.profileBadgeRow}>
                      <Text style={styles.activeProfileTitle}>{targetName}</Text>
                      <View style={styles.genderChip}>
                        <Text style={styles.genderChipText}>{genderLabel}</Text>
                      </View>
                    </View>
                    <Text style={styles.activeProfileSub}>
                      {activeProfile?.vibeSummary || 'Witty & Reserved Context'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* METHOD SELECTION CARDS */}
              <View style={styles.cardsContainer}>
                {/* 1. Upload Screenshot Card - Directly opens phone gallery! */}
                <TouchableOpacity
                  style={[styles.methodCard, styles.methodCardPrimary]}
                  onPress={handlePickImage}
                  activeOpacity={0.85}
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#eff6ff' }]}>
                    <Feather name="image" size={22} color={Palette.indigo600} />
                  </View>
                  <View style={styles.methodInfo}>
                    <View style={styles.cardHeaderRow}>
                      <Text style={styles.methodTitle}>Upload Chat Screenshots</Text>
                      <View style={styles.recommendedBadge}>
                        <Text style={styles.recommendedText}>AI VISION</Text>
                      </View>
                    </View>
                    <Text style={styles.methodDesc}>
                      Opens phone gallery directly. Pick single or multiple chat screenshots without cropping.
                    </Text>
                  </View>
                  <View style={styles.arrowIconBox}>
                    <Feather name="chevron-right" size={18} color={Palette.zinc400} />
                  </View>
                </TouchableOpacity>

                {/* 2. Paste Dialogue Text Card */}
                <TouchableOpacity
                  style={styles.methodCard}
                  onPress={() => {
                    setMethod('paste');
                    setStep(2);
                  }}
                  activeOpacity={0.85}
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#fdf2f8' }]}>
                    <Feather name="clipboard" size={22} color="#db2777" />
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodTitle}>Paste Text Dialogue</Text>
                    <Text style={styles.methodDesc}>
                      Paste what {targetName} texted from WhatsApp, iMessage, Instagram, or Tinder.
                    </Text>
                  </View>
                  <View style={styles.arrowIconBox}>
                    <Feather name="chevron-right" size={18} color={Palette.zinc400} />
                  </View>
                </TouchableOpacity>

                {/* 3. Direct Chat Studio Card */}
                <TouchableOpacity
                  style={styles.methodCard}
                  onPress={async () => {
                    await onStartNewSession();
                    onOpenStudio();
                  }}
                  activeOpacity={0.85}
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#ecfdf5' }]}>
                    <Feather name="message-square" size={22} color={Palette.emerald600} />
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodTitle}>Type Directly in Chat</Text>
                    <Text style={styles.methodDesc}>
                      Jump straight into live Wingman chat to consult AI Wingman directly.
                    </Text>
                  </View>
                  <View style={styles.arrowIconBox}>
                    <Feather name="chevron-right" size={18} color={Palette.zinc400} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STEP 2: PROVIDE INPUT */}
          {step === 2 && (
            <View style={styles.stepContainer}>
              {method === 'screenshot' ? (
                /* SCREENSHOTS GALLERY GRID & SUBMISSION */
                <View>
                  <View style={styles.titleSection}>
                    <Text style={styles.stepTitle}>Selected Screenshots</Text>
                    <Text style={styles.stepSub}>
                      {imageUris.length > 0
                        ? `${imageUris.length} screenshot${imageUris.length > 1 ? 's' : ''} ready for AI Vision parsing.`
                        : 'No screenshots selected yet.'}
                    </Text>
                  </View>

                  {/* GALLERY GRID OF SELECTED SCREENSHOTS */}
                  {imageUris.length > 0 ? (
                    <View style={styles.galleryGridContainer}>
                      <View style={styles.galleryGrid}>
                        {imageUris.map((uri, index) => (
                          <View key={`${uri}-${index}`} style={styles.thumbnailCard}>
                            <Image source={{ uri }} style={styles.thumbnailImage} />
                            <TouchableOpacity
                              style={styles.removeImageBtn}
                              onPress={() => handleRemoveImage(index)}
                              activeOpacity={0.8}
                            >
                              <Feather name="x" size={12} color="#ffffff" />
                            </TouchableOpacity>
                            <View style={styles.thumbnailBadge}>
                              <Text style={styles.thumbnailBadgeText}>#{index + 1}</Text>
                            </View>
                          </View>
                        ))}

                        {/* Add More Screenshots Button */}
                        <TouchableOpacity
                          style={styles.addMoreCard}
                          onPress={handlePickImage}
                          activeOpacity={0.8}
                        >
                          <View style={styles.addMoreIconCircle}>
                            <Feather name="plus" size={20} color={Palette.indigo600} />
                          </View>
                          <Text style={styles.addMoreText}>Add More</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    /* Fallback empty box if all removed */
                    <TouchableOpacity
                      style={styles.emptyGalleryBox}
                      onPress={handlePickImage}
                      activeOpacity={0.8}
                    >
                      <View style={styles.emptyIconCircle}>
                        <Feather name="image" size={26} color={Palette.indigo600} />
                      </View>
                      <Text style={styles.emptyGalleryTitle}>Tap to select screenshots</Text>
                      <Text style={styles.emptyGallerySub}>Pick one or multiple images from gallery</Text>
                    </TouchableOpacity>
                  )}

                  {/* Submit CTA */}
                  <TouchableOpacity
                    style={[
                      styles.submitBtn,
                      imageUris.length === 0 && styles.submitBtnDisabled,
                    ]}
                    disabled={imageUris.length === 0 || isAnalyzing}
                    onPress={handleSubmitStep2}
                    activeOpacity={0.88}
                  >
                    {isAnalyzing ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <>
                        <Text style={styles.submitBtnText}>
                          Analyze {imageUris.length} Screenshot{imageUris.length > 1 ? 's' : ''} with AI
                        </Text>
                        <Feather name="zap" size={18} color="#ffffff" />
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                /* PASTE TEXT INPUT STEP */
                <View>
                  <View style={styles.titleSection}>
                    <Text style={styles.stepTitle}>Paste {targetName}'s Message</Text>
                    <Text style={styles.stepSub}>
                      Enter or paste the exact text received from {targetName}.
                    </Text>
                  </View>

                  <View style={styles.pasteBoxContainer}>
                    <View style={styles.pasteHeaderRow}>
                      <Text style={styles.pasteLabel}>Message Content:</Text>
                      <TouchableOpacity
                        style={styles.pasteClipBtn}
                        onPress={handlePasteClipboard}
                        activeOpacity={0.7}
                      >
                        <Feather name="clipboard" size={12} color={Palette.indigo600} />
                        <Text style={styles.pasteClipText}>Paste Clipboard</Text>
                      </TouchableOpacity>
                    </View>

                    <TextInput
                      style={styles.textArea}
                      value={pasteText}
                      onChangeText={setPasteText}
                      placeholder={`What did ${targetName} text you?`}
                      placeholderTextColor={Palette.zinc400}
                      multiline
                      autoFocus
                    />
                  </View>

                  {/* Submit CTA */}
                  <TouchableOpacity
                    style={[
                      styles.submitBtn,
                      !pasteText.trim() && styles.submitBtnDisabled,
                    ]}
                    disabled={!pasteText.trim() || isAnalyzing}
                    onPress={handleSubmitStep2}
                    activeOpacity={0.88}
                  >
                    {isAnalyzing ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <>
                        <Text style={styles.submitBtnText}>
                          Analyze Dialogue with AI Wingman
                        </Text>
                        <Feather name="zap" size={18} color="#ffffff" />
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingRight: 8,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.zinc900,
  },
  headerTitleCenter: {
    alignItems: 'center',
  },
  headerNavTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Palette.zinc900,
    letterSpacing: -0.2,
  },
  stepBadge: {
    backgroundColor: Palette.indigo50,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stepBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: Palette.indigo600,
    letterSpacing: 0.8,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  stepContainer: {
    gap: 20,
  },
  titleSection: {
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Palette.zinc900,
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  stepSub: {
    fontSize: 13,
    color: Palette.zinc500,
    lineHeight: 18,
    marginBottom: 16,
  },
  activeProfileBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  activeProfileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeProfileEmoji: {
    fontSize: 22,
  },
  activeProfileTextCol: {
    flex: 1,
  },
  profileBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  activeProfileTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Palette.zinc900,
  },
  genderChip: {
    backgroundColor: '#fdf2f8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  genderChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#db2777',
  },
  activeProfileSub: {
    fontSize: 12,
    color: Palette.zinc500,
  },
  cardsContainer: {
    gap: 14,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    gap: 14,
    ...ThemeShadows.sm,
  },
  methodCardPrimary: {
    borderColor: Palette.indigo600,
    backgroundColor: '#fafafa',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodInfo: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  methodTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Palette.zinc900,
  },
  recommendedBadge: {
    backgroundColor: Palette.indigo50,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recommendedText: {
    fontSize: 9,
    fontWeight: '900',
    color: Palette.indigo600,
    letterSpacing: 0.5,
  },
  methodDesc: {
    fontSize: 12,
    color: Palette.zinc500,
    lineHeight: 16,
    marginTop: 2,
  },
  arrowIconBox: {
    paddingLeft: 4,
  },
  galleryGridContainer: {
    marginBottom: 24,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  thumbnailCard: {
    width: 100,
    height: 140,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(9, 9, 11, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(9, 9, 11, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  thumbnailBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
  },
  addMoreCard: {
    width: 100,
    height: 140,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Palette.indigo600,
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addMoreIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.indigo50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMoreText: {
    fontSize: 12,
    fontWeight: '800',
    color: Palette.indigo600,
  },
  emptyGalleryBox: {
    backgroundColor: '#fafafa',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Palette.indigo600,
    borderStyle: 'dashed',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Palette.indigo50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyGalleryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Palette.zinc900,
    marginBottom: 2,
  },
  emptyGallerySub: {
    fontSize: 12,
    color: Palette.zinc400,
  },
  pasteBoxContainer: {
    backgroundColor: '#fafafa',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 24,
  },
  pasteHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pasteLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: Palette.zinc900,
  },
  pasteClipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.indigo50,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pasteClipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.indigo600,
  },
  textArea: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: Palette.zinc900,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  submitBtn: {
    backgroundColor: Palette.zinc900,
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...ThemeShadows.md,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
});
