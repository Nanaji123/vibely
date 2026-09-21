import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Modal,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Pressable,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Palette } from '../theme/colors';
import { ThemeShadows } from '../theme/shadows';
import { TargetProfileModel } from '../domain/index';
import { RELATIONSHIPS, PERSONALITY_TRAITS } from '../constants/vibes';
import { usePullRefresh } from '../lib/usePullRefresh';
import { PaywallError } from '../context/AppContext';

interface ProfileManagerScreenProps {
  profiles: TargetProfileModel[];
  activeProfile: TargetProfileModel;
  onSelectProfile: (profile: TargetProfileModel) => void;
  onAddProfile: (profile: Omit<TargetProfileModel, 'id' | 'updatedAt'>) => void | Promise<unknown>;
  onEditProfile?: (id: string, profile: Partial<TargetProfileModel>) => void;
  onDeleteProfile?: (id: string) => void;
}

const GENDERS: { id: TargetProfileModel['gender']; label: string }[] = [
  { id: 'female', label: 'Her' },
  { id: 'male', label: 'Him' },
  { id: 'other', label: 'Them' },
];

const EMOJIS = ['❤️', '🔥', '✨', '🌙', '🌸', '😏', '🦋', '💫', '🍀', '🎯'];

const relationshipLabel = (id: string) => RELATIONSHIPS.find((r) => r.id === id)?.label ?? id;
const traitLabel = (id: string) => PERSONALITY_TRAITS.find((t) => t.id === id)?.label ?? id;

const splitList = (s: string) =>
  s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

export const ProfileManagerScreen: React.FC<ProfileManagerScreenProps> = ({
  profiles,
  activeProfile,
  onSelectProfile,
  onAddProfile,
  onEditProfile,
  onDeleteProfile,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [gender, setGender] = useState<TargetProfileModel['gender']>('female');
  const [relationship, setRelationship] = useState('crush');
  const [traits, setTraits] = useState<string[]>([]);
  const [emoji, setEmoji] = useState('❤️');
  const [likes, setLikes] = useState('');
  const [avoid, setAvoid] = useState('');
  const [notes, setNotes] = useState('');
  const [showMore, setShowMore] = useState(false);
  const { refreshing, onRefresh } = usePullRefresh();

  const openCreate = () => {
    setEditingId(null);
    setName('');
    setGender('female');
    setRelationship('crush');
    setTraits([]);
    setEmoji('❤️');
    setLikes('');
    setAvoid('');
    setNotes('');
    setShowMore(false);
    setShowModal(true);
  };

  const openEdit = (p: TargetProfileModel) => {
    setEditingId(p.id);
    setName(p.name);
    setGender(p.gender || 'female');
    setRelationship(p.relationship);
    setTraits(p.personalityTraits ?? []);
    setEmoji(p.avatarEmoji || '❤️');
    setLikes((p.likes ?? []).join(', '));
    setAvoid((p.thingsToAvoid ?? []).join(', '));
    setNotes(p.vibeSummary ?? '');
    setShowMore(!!(p.likes?.length || p.thingsToAvoid?.length || p.vibeSummary));
    setShowModal(true);
  };

  const toggleTrait = (id: string) =>
    setTraits((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : prev.length < 4 ? [...prev, id] : prev));

  const canSave = name.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    const payload = {
      name: name.trim(),
      gender,
      relationship,
      personalityTraits: traits,
      likes: splitList(likes),
      thingsToAvoid: splitList(avoid),
      vibeSummary: notes.trim(),
      avatarEmoji: emoji,
    };
    setShowModal(false);
    if (editingId && onEditProfile) {
      onEditProfile(editingId, payload);
      return;
    }
    Promise.resolve(onAddProfile(payload)).catch((err) => {
      // The paywall sheet already explains a PaywallError
      if (err instanceof PaywallError) return;
      Alert.alert('Could not add person', err instanceof Error ? err.message : 'Please try again.');
    });
  };

  const confirmDelete = (p: TargetProfileModel) => {
    if (!onDeleteProfile) return;
    Alert.alert(`Remove ${p.name}?`, 'Their chats stay, but the wingman will forget their profile.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => onDeleteProfile(p.id) },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Palette.zinc900} />}
    >
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>People</Text>
          <Text style={styles.subtitle}>Who you're texting. The wingman tailors every reply to them.</Text>
        </View>
        {profiles.length > 0 ? (
          <TouchableOpacity style={styles.addBtn} onPress={openCreate} activeOpacity={0.85} accessibilityLabel="Add person">
            <Feather name="plus" size={18} color="#ffffff" />
          </TouchableOpacity>
        ) : null}
      </View>

      {profiles.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyArt}>
            <Text style={styles.emptyEmoji}>💬</Text>
          </View>
          <Text style={styles.emptyTitle}>Add who you're texting</Text>
          <Text style={styles.emptySub}>
            A name and a relationship is enough to start. Add their personality and the replies get sharper.
          </Text>
          <TouchableOpacity style={styles.emptyCta} onPress={openCreate} activeOpacity={0.9}>
            <Feather name="user-plus" size={16} color="#ffffff" />
            <Text style={styles.emptyCtaText}>Add a person</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.list}>
          {profiles.map((p) => {
            const active = p.id === activeProfile.id;
            return (
              <TouchableOpacity
                key={p.id}
                style={[styles.card, active && styles.cardActive]}
                onPress={() => onSelectProfile(p)}
                activeOpacity={0.88}
              >
                <View style={styles.cardAvatar}>
                  <Text style={styles.cardAvatarEmoji}>{p.avatarEmoji || '❤️'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.cardNameRow}>
                    <Text style={styles.cardName} numberOfLines={1}>
                      {p.name}
                    </Text>
                    {active ? (
                      <View style={styles.activePill}>
                        <Text style={styles.activePillText}>ACTIVE</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.cardMeta}>
                    {relationshipLabel(p.relationship)} · {GENDERS.find((g) => g.id === p.gender)?.label ?? 'Them'}
                  </Text>
                  {p.personalityTraits.length > 0 ? (
                    <View style={styles.traitRow}>
                      {p.personalityTraits.map((t) => (
                        <View key={t} style={styles.traitChip}>
                          <Text style={styles.traitChipText}>{traitLabel(t)}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => openEdit(p)} hitSlop={6} accessibilityLabel="Edit">
                    <Feather name="edit-2" size={14} color={Palette.zinc600} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => confirmDelete(p)} hitSlop={6} accessibilityLabel="Remove">
                    <Feather name="trash-2" size={14} color={Palette.rose600} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* ADD / EDIT SHEET */}
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.backdrop}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowModal(false)} />
            <View style={styles.sheet}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>{editingId ? 'Edit person' : 'New person'}</Text>
                <TouchableOpacity onPress={() => setShowModal(false)} hitSlop={8}>
                  <Feather name="x" size={20} color={Palette.zinc700} />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.sheetBody} keyboardShouldPersistTaps="handled">
                <View style={styles.nameRow}>
                  <TouchableOpacity
                    style={styles.emojiPick}
                    onPress={() => setEmoji(EMOJIS[(EMOJIS.indexOf(emoji) + 1) % EMOJIS.length])}
                    activeOpacity={0.8}
                    accessibilityLabel="Change emoji"
                  >
                    <Text style={styles.emojiPickText}>{emoji}</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.nameInput}
                    value={name}
                    onChangeText={setName}
                    placeholder="Their name"
                    placeholderTextColor={Palette.zinc400}
                    autoFocus={!editingId}
                    returnKeyType="done"
                  />
                </View>

                <Text style={styles.label}>Who are they?</Text>
                <View style={styles.segment}>
                  {GENDERS.map((g) => (
                    <TouchableOpacity
                      key={g.id}
                      style={[styles.segmentItem, gender === g.id && styles.segmentItemActive]}
                      onPress={() => setGender(g.id)}
                    >
                      <Text style={[styles.segmentText, gender === g.id && styles.segmentTextActive]}>{g.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Relationship</Text>
                <View style={styles.chips}>
                  {RELATIONSHIPS.map((r) => (
                    <TouchableOpacity
                      key={r.id}
                      style={[styles.chip, relationship === r.id && styles.chipActive]}
                      onPress={() => setRelationship(r.id)}
                    >
                      <Text style={[styles.chipText, relationship === r.id && styles.chipTextActive]}>{r.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.labelRow}>
                  <Text style={styles.label}>Personality</Text>
                  <Text style={styles.labelHint}>pick up to 4</Text>
                </View>
                <View style={styles.chips}>
                  {PERSONALITY_TRAITS.map((t) => {
                    const on = traits.includes(t.id);
                    return (
                      <TouchableOpacity key={t.id} style={[styles.chip, on && styles.chipActive]} onPress={() => toggleTrait(t.id)}>
                        <Text style={[styles.chipText, on && styles.chipTextActive]}>{t.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity style={styles.moreToggle} onPress={() => setShowMore((v) => !v)} activeOpacity={0.7}>
                  <Text style={styles.moreToggleText}>More details</Text>
                  <Feather name={showMore ? 'chevron-up' : 'chevron-down'} size={16} color={Palette.zinc500} />
                </TouchableOpacity>

                {showMore ? (
                  <View style={styles.moreBox}>
                    <Text style={styles.label}>Things they like</Text>
                    <TextInput
                      style={styles.input}
                      value={likes}
                      onChangeText={setLikes}
                      placeholder="Movies, matcha, gym — comma separated"
                      placeholderTextColor={Palette.zinc400}
                    />
                    <Text style={styles.label}>Avoid mentioning</Text>
                    <TextInput
                      style={styles.input}
                      value={avoid}
                      onChangeText={setAvoid}
                      placeholder="Their ex, work stress…"
                      placeholderTextColor={Palette.zinc400}
                    />
                    <Text style={styles.label}>Notes for the wingman</Text>
                    <TextInput
                      style={[styles.input, styles.inputMulti]}
                      value={notes}
                      onChangeText={setNotes}
                      placeholder="Anything that helps: how you met, inside jokes, what you're going for"
                      placeholderTextColor={Palette.zinc400}
                      multiline
                    />
                  </View>
                ) : null}

                <TouchableOpacity style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]} onPress={save} disabled={!canSave} activeOpacity={0.9}>
                  <Text style={styles.saveBtnText}>{editingId ? 'Save changes' : 'Add person'}</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  content: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 120 },

  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 18 },
  title: { fontSize: 26, fontWeight: '800', color: Palette.zinc900, letterSpacing: -0.6 },
  subtitle: { fontSize: 13, color: Palette.zinc500, marginTop: 3, lineHeight: 18 },
  addBtn: { width: 40, height: 40, borderRadius: 14, backgroundColor: Palette.zinc900, alignItems: 'center', justifyContent: 'center', ...ThemeShadows.md },

  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 12 },
  emptyArt: { width: 84, height: 84, borderRadius: 28, backgroundColor: Palette.zinc100, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  emptyEmoji: { fontSize: 36 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: Palette.zinc900, letterSpacing: -0.3 },
  emptySub: { fontSize: 14, lineHeight: 20, color: Palette.zinc500, textAlign: 'center', marginTop: 8, maxWidth: 300 },
  emptyCta: {
    marginTop: 22,
    height: 50,
    paddingHorizontal: 22,
    borderRadius: 14,
    backgroundColor: Palette.zinc900,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...ThemeShadows.md,
  },
  emptyCtaText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },

  list: { gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Palette.zinc200,
    backgroundColor: '#ffffff',
  },
  cardActive: { borderColor: Palette.zinc900, backgroundColor: Palette.zinc50 },
  cardAvatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: Palette.zinc100, alignItems: 'center', justifyContent: 'center' },
  cardAvatarEmoji: { fontSize: 24 },
  cardNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardName: { fontSize: 16, fontWeight: '800', color: Palette.zinc900, flexShrink: 1 },
  activePill: { backgroundColor: Palette.zinc900, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 },
  activePillText: { color: '#ffffff', fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  cardMeta: { fontSize: 12, color: Palette.zinc500, marginTop: 2 },
  traitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 8 },
  traitChip: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: Palette.zinc200, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  traitChipText: { fontSize: 10, fontWeight: '700', color: Palette.zinc600 },
  cardActions: { gap: 6 },
  iconBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#ffffff', borderWidth: 1, borderColor: Palette.zinc200, alignItems: 'center', justifyContent: 'center' },

  backdrop: { flex: 1, backgroundColor: 'rgba(9,9,11,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#ffffff', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '92%', ...ThemeShadows.lg },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Palette.zinc200, alignSelf: 'center', marginTop: 10 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 6 },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: Palette.zinc900, letterSpacing: -0.4 },
  sheetBody: { paddingHorizontal: 20, paddingBottom: 36 },

  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  emojiPick: { width: 52, height: 52, borderRadius: 16, backgroundColor: Palette.zinc100, alignItems: 'center', justifyContent: 'center' },
  emojiPickText: { fontSize: 26 },
  nameInput: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Palette.zinc200,
    paddingHorizontal: 16,
    fontSize: 17,
    fontWeight: '700',
    color: Palette.zinc900,
  },
  label: { fontSize: 12, fontWeight: '800', color: Palette.zinc500, letterSpacing: 0.4, textTransform: 'uppercase', marginTop: 18, marginBottom: 8 },
  labelRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  labelHint: { fontSize: 11, color: Palette.zinc400, fontWeight: '600' },
  segment: { flexDirection: 'row', backgroundColor: Palette.zinc100, borderRadius: 14, padding: 4, gap: 4 },
  segmentItem: { flex: 1, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  segmentItemActive: { backgroundColor: '#ffffff', ...ThemeShadows.sm },
  segmentText: { fontSize: 14, fontWeight: '700', color: Palette.zinc500 },
  segmentTextActive: { color: Palette.zinc900 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 13, height: 36, borderRadius: 999, borderWidth: 1.5, borderColor: Palette.zinc200, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' },
  chipActive: { borderColor: Palette.zinc900, backgroundColor: Palette.zinc900 },
  chipText: { fontSize: 13, fontWeight: '700', color: Palette.zinc700 },
  chipTextActive: { color: '#ffffff' },
  moreToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, paddingVertical: 10, borderTopWidth: 1, borderTopColor: Palette.zinc100 },
  moreToggleText: { fontSize: 14, fontWeight: '700', color: Palette.zinc700 },
  moreBox: {},
  input: { height: 46, borderRadius: 14, borderWidth: 1.5, borderColor: Palette.zinc200, paddingHorizontal: 14, fontSize: 14, color: Palette.zinc900 },
  inputMulti: { height: 84, paddingTop: 12, textAlignVertical: 'top' },
  saveBtn: { marginTop: 24, height: 52, borderRadius: 16, backgroundColor: Palette.zinc900, alignItems: 'center', justifyContent: 'center', ...ThemeShadows.md },
  saveBtnDisabled: { backgroundColor: Palette.zinc200 },
  saveBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
});
