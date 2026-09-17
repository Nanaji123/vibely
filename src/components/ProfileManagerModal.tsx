import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { TargetProfile } from '../types';

interface ProfileManagerModalProps {
  visible: boolean;
  profiles: TargetProfile[];
  activeProfile?: TargetProfile;
  onSelectProfile: (profile: TargetProfile) => void;
  onAddProfile: (profile: Omit<TargetProfile, 'id' | 'updatedAt'>) => void;
  onClose: () => void;
}

export const ProfileManagerModal: React.FC<ProfileManagerModalProps> = ({
  visible,
  profiles,
  activeProfile,
  onSelectProfile,
  onAddProfile,
  onClose,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('crush');
  const [emoji, setEmoji] = useState('❤️');
  const [likesText, setLikesText] = useState('');
  const [avoidText, setAvoidText] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    const newProf = {
      name: name.trim(),
      relationship,
      personalityTraits: ['playful', 'sarcastic'],
      likes: likesText.split(',').map((s) => s.trim()).filter(Boolean),
      thingsToAvoid: avoidText.split(',').map((s) => s.trim()).filter(Boolean),
      vibeSummary: 'Custom profile',
      avatarEmoji: emoji,
    };
    onAddProfile(newProf);
    setIsCreating(false);
    setName('');
    setLikesText('');
    setAvoidText('');
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <Text style={styles.icon}>🎭</Text>
                <View>
                  <Text style={styles.title}>Personality Memory</Text>
                  <Text style={styles.subtitle}>Profiles auto-inject context into AI replies</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

          <ScrollView style={styles.bodyScroll} contentContainerStyle={styles.bodyContent}>
            {!isCreating ? (
              <View style={styles.profilesList}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Saved Profiles ({profiles.length})</Text>
                  <TouchableOpacity
                    style={styles.createBtn}
                    onPress={() => setIsCreating(true)}
                  >
                    <Text style={styles.createBtnText}>+ New Profile</Text>
                  </TouchableOpacity>
                </View>

                {profiles.map((prof) => {
                  const isActive = activeProfile?.id === prof.id;
                  return (
                    <TouchableOpacity
                      key={prof.id}
                      style={[styles.profileCard, isActive && styles.profileCardActive]}
                      onPress={() => {
                        onSelectProfile(prof);
                        onClose();
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.profAvatar}>{prof.avatarEmoji}</Text>
                      <View style={styles.profInfo}>
                        <View style={styles.profHeader}>
                          <Text style={styles.profName}>{prof.name}</Text>
                          <Text style={styles.profRelBadge}>{prof.relationship}</Text>
                        </View>
                        <Text style={styles.profSummary}>{prof.vibeSummary}</Text>

                        {/* Likes pills */}
                        {prof.likes.length > 0 && (
                          <Text style={styles.profDetail}>
                            Likes: {prof.likes.join(', ')}
                          </Text>
                        )}
                      </View>
                      {isActive && <Text style={styles.activeCheck}>✓ Active</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.formContainer}>
                <Text style={styles.sectionTitle}>Create Target Profile</Text>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Name:</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Laxmi"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Emoji:</Text>
                  <View style={styles.emojiRow}>
                    {['❤️', '💕', '💍', '👫', '😎', '😂', '🔥', '✨'].map((e) => (
                      <TouchableOpacity
                        key={e}
                        style={[styles.emojiPill, emoji === e && styles.emojiPillActive]}
                        onPress={() => setEmoji(e)}
                      >
                        <Text style={styles.emojiText}>{e}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Things She/He Likes (Comma separated):</Text>
                  <TextInput
                    style={styles.input}
                    value={likesText}
                    onChangeText={setLikesText}
                    placeholder="e.g. Movies, Manhwa, Coffee, Gaming"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Things to Avoid (Comma separated):</Text>
                  <TextInput
                    style={styles.input}
                    value={avoidText}
                    onChangeText={setAvoidText}
                    placeholder="e.g. Too serious, Too many questions"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>

                <View style={styles.formActions}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setIsCreating(false)}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                    <Text style={styles.saveText}>Save Profile</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
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
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.lg,
    maxHeight: '85%',
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 22,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  closeBtnText: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  bodyScroll: {
    flex: 1,
  },
  bodyContent: {
    padding: SPACING.md,
  },
  profilesList: {
    gap: SPACING.sm + 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  createBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
  },
  createBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: SPACING.sm + 4,
    ...SHADOWS.sm,
  },
  profileCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#fff0f6',
  },
  profAvatar: {
    fontSize: 26,
  },
  profInfo: {
    flex: 1,
    gap: 2,
  },
  profHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  profRelBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accentCyan,
    textTransform: 'uppercase',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  profSummary: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  profDetail: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  activeCheck: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.accentEmerald,
  },
  formContainer: {
    gap: SPACING.md,
  },
  field: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    color: COLORS.textPrimary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emojiRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  emojiPill: {
    padding: 8,
    borderRadius: RADIUS.md,
    backgroundColor: '#f8fafc',
  },
  emojiPillActive: {
    backgroundColor: COLORS.primary,
  },
  emojiText: {
    fontSize: 18,
  },
  formActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  saveText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '800',
  },
});
