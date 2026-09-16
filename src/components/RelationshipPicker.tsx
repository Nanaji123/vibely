import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { RELATIONSHIPS, PERSONALITY_TRAITS } from '../constants/vibes';

interface RelationshipPickerProps {
  targetName: string;
  setTargetName: (name: string) => void;
  selectedRelationship: string;
  setSelectedRelationship: (rel: string) => void;
  selectedTraits: string[];
  setSelectedTraits: (traits: string[]) => void;
  customNotes: string;
  setCustomNotes: (notes: string) => void;
}

export const RelationshipPicker: React.FC<RelationshipPickerProps> = ({
  targetName,
  setTargetName,
  selectedRelationship,
  setSelectedRelationship,
  selectedTraits,
  setSelectedTraits,
  customNotes,
  setCustomNotes,
}) => {
  const toggleTrait = (traitId: string) => {
    if (selectedTraits.includes(traitId)) {
      setSelectedTraits(selectedTraits.filter((t) => t !== traitId));
    } else {
      setSelectedTraits([...selectedTraits, traitId]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Target Name Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>2. Who are you chatting with?</Text>
        <TextInput
          style={styles.textInput}
          value={targetName}
          onChangeText={setTargetName}
          placeholder="e.g. Laxmi, Sarah, Alex..."
          placeholderTextColor={COLORS.textMuted}
        />
      </View>

      {/* Relationship Cards */}
      <View style={styles.sectionBox}>
        <Text style={styles.sublabel}>Select Relationship Stage:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowScroll}>
          {RELATIONSHIPS.map((rel) => {
            const isSelected = selectedRelationship === rel.id;
            return (
              <TouchableOpacity
                key={rel.id}
                style={[styles.relCard, isSelected && styles.relCardActive]}
                onPress={() => setSelectedRelationship(rel.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.relEmoji}>{rel.emoji}</Text>
                <Text style={[styles.relText, isSelected && styles.relTextActive]}>{rel.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Personality Traits Multi-select Pills */}
      <View style={styles.sectionBox}>
        <Text style={styles.sublabel}>What's their personality?</Text>
        <View style={styles.pillsWrap}>
          {PERSONALITY_TRAITS.map((trait) => {
            const isSelected = selectedTraits.includes(trait.id);
            return (
              <TouchableOpacity
                key={trait.id}
                style={[styles.traitPill, isSelected && styles.traitPillActive]}
                onPress={() => toggleTrait(trait.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.traitEmoji}>{trait.emoji}</Text>
                <Text style={[styles.traitText, isSelected && styles.traitTextActive]}>
                  {trait.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Custom Context / Notes */}
      <View style={styles.sectionBox}>
        <Text style={styles.sublabel}>Things they like / Things to avoid (Optional):</Text>
        <TextInput
          style={styles.notesInput}
          value={customNotes}
          onChangeText={setCustomNotes}
          placeholder="e.g. Likes: Movies, Manhwa. Avoid: Asking too many questions..."
          placeholderTextColor={COLORS.textMuted}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs + 2,
  },
  sublabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs + 2,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    color: COLORS.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...SHADOWS.sm,
  },
  sectionBox: {
    marginBottom: SPACING.md,
  },
  rowScroll: {
    gap: SPACING.xs + 2,
    paddingRight: SPACING.md,
  },
  relCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  relCardActive: {
    backgroundColor: 'rgba(247, 37, 133, 0.12)',
    borderColor: COLORS.primary,
  },
  relEmoji: {
    fontSize: 16,
  },
  relText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  relTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  traitPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 4,
  },
  traitPillActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  traitEmoji: {
    fontSize: 13,
  },
  traitText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  traitTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  notesInput: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.textPrimary,
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
});
