import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Palette, ThemeColors } from '../theme/colors';
import { ThemeShadows } from '../theme/shadows';
import { TargetProfileModel } from '../domain';

interface ProfileManagerScreenProps {
  profiles: TargetProfileModel[];
  activeProfile: TargetProfileModel;
  onSelectProfile: (profile: TargetProfileModel) => void;
  onAddProfile: (profile: Omit<TargetProfileModel, 'id' | 'updatedAt'>) => void;
}

export const ProfileManagerScreen: React.FC<ProfileManagerScreenProps> = ({
  profiles,
  activeProfile,
  onSelectProfile,
  onAddProfile,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'female' | 'male' | 'other'>('female');
  const [relationship, setRelationship] = useState('crush');
  const [emoji, setEmoji] = useState('❤️');
  const [likes, setLikes] = useState('');
  const [avoid, setAvoid] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    onAddProfile({
      name: name.trim(),
      gender,
      relationship,
      personalityTraits: ['witty', 'reserved'],
      likes: likes.split(',').map(s => s.trim()).filter(Boolean),
      thingsToAvoid: avoid.split(',').map(s => s.trim()).filter(Boolean),
      vibeSummary: `${relationship.charAt(0).toUpperCase() + relationship.slice(1)} Context (${gender === 'female' ? 'Her' : gender === 'male' ? 'Him' : 'Them'})`,
      avatarEmoji: emoji,
    });
    setShowCreateModal(false);
    setName('');
    setGender('female');
    setLikes('');
    setAvoid('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Personality Memory</Text>
          <Text style={styles.subtitle}>Profiles auto-inject context into AI replies</Text>
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowCreateModal(true)}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={16} color="#ffffff" />
          <Text style={styles.addBtnText}>New Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Cards List */}
      <View style={styles.profilesList}>
        {profiles.map((prof) => {
          const isActive = prof.id === activeProfile.id;
          return (
            <TouchableOpacity
              key={prof.id}
              style={[styles.profileCard, isActive && styles.profileCardActive]}
              onPress={() => onSelectProfile(prof)}
              activeOpacity={0.85}
            >
              <View style={styles.avatarBox}>
                <Text style={styles.avatarEmoji}>{prof.avatarEmoji}</Text>
              </View>

              <View style={styles.profInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.profName}>{prof.name}</Text>
                  <View style={styles.relBadge}>
                    <Text style={styles.relBadgeText}>{prof.relationship}</Text>
                  </View>
                  <View style={[styles.relBadge, { backgroundColor: prof.gender === 'female' ? '#fdf2f8' : '#eff6ff' }]}>
                    <Text style={[styles.relBadgeText, { color: prof.gender === 'female' ? '#db2777' : '#2563eb' }]}>
                      {prof.gender === 'female' ? '👩 Her' : prof.gender === 'male' ? '👨 Him' : '🧑 Them'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.profSummary}>{prof.vibeSummary}</Text>

                {prof.likes.length > 0 && (
                  <Text style={styles.likesText}>
                    Likes: {prof.likes.join(' • ')}
                  </Text>
                )}
              </View>

              {isActive && (
                <View style={styles.activeCheck}>
                  <Feather name="check-circle" size={18} color={Palette.emerald600} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Create Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Target Profile</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Feather name="x" size={20} color={Palette.zinc700} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 16 }}>
              <Text style={styles.fieldLabel}>Name:</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Laxmi"
                placeholderTextColor={Palette.zinc400}
              />

              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Gender (Who are you texting?):</Text>
              <View style={styles.relChipsRow}>
                {[
                  { id: 'female', label: '👩 Female (Her)' },
                  { id: 'male', label: '👨 Male (Him)' },
                  { id: 'other', label: '🧑 Non-binary' },
                ].map((g) => (
                  <TouchableOpacity
                    key={g.id}
                    style={[styles.relChip, gender === g.id && styles.relChipActive]}
                    onPress={() => setGender(g.id as any)}
                  >
                    <Text
                      style={[
                        styles.relChipText,
                        gender === g.id && styles.relChipTextActive,
                      ]}
                    >
                      {g.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Relationship Stage:</Text>
              <View style={styles.relChipsRow}>
                {['crush', 'dating', 'partner', 'friend', 'colleague'].map((rel) => (
                  <TouchableOpacity
                    key={rel}
                    style={[styles.relChip, relationship === rel && styles.relChipActive]}
                    onPress={() => setRelationship(rel)}
                  >
                    <Text
                      style={[
                        styles.relChipText,
                        relationship === rel && styles.relChipTextActive,
                      ]}
                    >
                      {rel}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Things they like (Comma separated):</Text>
              <TextInput
                style={styles.input}
                value={likes}
                onChangeText={setLikes}
                placeholder="e.g. Movies, Matcha, Gaming"
                placeholderTextColor={Palette.zinc400}
              />

              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Things to avoid (Comma separated):</Text>
              <TextInput
                style={styles.input}
                value={avoid}
                onChangeText={setAvoid}
                placeholder="e.g. Long paragraphs, Too serious"
                placeholderTextColor={Palette.zinc400}
              />

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save Profile Context</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 16,
    paddingBottom: 110,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Palette.zinc900,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: Palette.zinc500,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.zinc900,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  profilesList: {
    gap: 12,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
    ...ThemeShadows.sm,
  },
  profileCardActive: {
    borderColor: Palette.zinc900,
    backgroundColor: '#fafafa',
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#f4f4f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 22,
  },
  profInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  profName: {
    fontSize: 15,
    fontWeight: '800',
    color: Palette.zinc900,
  },
  relBadge: {
    backgroundColor: Palette.indigo50,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  relBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.indigo600,
    textTransform: 'uppercase',
  },
  profSummary: {
    fontSize: 12,
    color: Palette.zinc500,
    marginBottom: 4,
  },
  likesText: {
    fontSize: 11,
    color: Palette.zinc400,
  },
  activeCheck: {
    paddingLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 9, 11, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Palette.zinc900,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.zinc700,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Palette.zinc100,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Palette.zinc900,
  },
  relChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  relChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: Palette.zinc100,
  },
  relChipActive: {
    backgroundColor: Palette.zinc900,
  },
  relChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.zinc600,
    textTransform: 'capitalize',
  },
  relChipTextActive: {
    color: '#ffffff',
  },
  saveBtn: {
    backgroundColor: Palette.zinc900,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
});
