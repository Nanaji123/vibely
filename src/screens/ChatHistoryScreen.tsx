import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, RefreshControl, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Palette } from '../theme/colors';
import { ThemeShadows } from '../theme/shadows';
import { ConversationModel } from '../domain/index';
import { usePullRefresh } from '../lib/usePullRefresh';

interface ChatHistoryScreenProps {
  conversations: ConversationModel[];
  onBack: () => void;
  onOpenConversation: (conv: ConversationModel) => void;
  onDeleteConversation: (id: string) => Promise<void>;
}

const formatWhen = (iso: string) => {
  const d = new Date(iso);
  const ms = Date.now() - d.getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

// Something readable from the tail of the thread: their last line beats the coach's advice
const previewOf = (c: ConversationModel) => {
  const msgs = [...c.messages].reverse();
  const theirs = msgs.find((m) => m.sender === 'them')?.text;
  if (theirs) return theirs;
  const last = msgs[0];
  return last ? last.text : c.title;
};

export const ChatHistoryScreen: React.FC<ChatHistoryScreenProps> = ({
  conversations,
  onBack,
  onOpenConversation,
  onDeleteConversation,
}) => {
  const [query, setQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { refreshing, onRefresh } = usePullRefresh();

  const sorted = useMemo(
    () => [...conversations].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [conversations]
  );
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((c) => c.targetName.toLowerCase().includes(q) || previewOf(c).toLowerCase().includes(q));
  }, [sorted, query]);

  const confirmDelete = (c: ConversationModel) => {
    Alert.alert(`Delete chat with ${c.targetName}?`, 'This removes the whole thread and its analysis. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeletingId(c.id);
          try {
            await onDeleteConversation(c.id);
          } catch (err) {
            Alert.alert('Could not delete', err instanceof Error ? err.message : 'Please try again.');
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7} hitSlop={8}>
          <Feather name="arrow-left" size={20} color={Palette.zinc900} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>All chats</Text>
          <Text style={styles.subtitle}>
            {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}
          </Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Feather name="search" size={15} color={Palette.zinc400} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name or message"
          placeholderTextColor={Palette.zinc400}
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>

      <FlatList
        data={shown}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Palette.zinc900} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="message-square" size={26} color={Palette.zinc400} />
            <Text style={styles.emptyTitle}>{query ? 'No matches' : 'No chats yet'}</Text>
            <Text style={styles.emptySub}>{query ? 'Try a different name or word.' : 'Your conversations will show up here.'}</Text>
          </View>
        }
        renderItem={({ item: c }) => {
          const deleting = deletingId === c.id;
          return (
            <TouchableOpacity style={[styles.row, deleting && styles.rowDeleting]} onPress={() => onOpenConversation(c)} activeOpacity={0.85} disabled={deleting}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{(c.targetName[0] || '?').toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.rowTop}>
                  <Text style={styles.name} numberOfLines={1}>
                    {c.targetName}
                  </Text>
                  <Text style={styles.when}>{formatWhen(c.updatedAt)}</Text>
                </View>
                <Text style={styles.preview} numberOfLines={2}>
                  {previewOf(c)}
                </Text>
                <View style={styles.metaRow}>
                  {c.pulseScore !== undefined ? (
                    <View style={styles.metaChip}>
                      <Feather name="activity" size={10} color={Palette.emerald600} />
                      <Text style={styles.metaChipText}>{c.pulseScore}% pulse</Text>
                    </View>
                  ) : null}
                  <View style={styles.metaChip}>
                    <Text style={styles.metaChipText}>{c.currentVibe}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => confirmDelete(c)} hitSlop={8} accessibilityLabel="Delete chat">
                <Feather name="trash-2" size={15} color={Palette.rose600} />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 12 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: Palette.zinc100, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: Palette.zinc900, letterSpacing: -0.4 },
  subtitle: { fontSize: 12, color: Palette.zinc500, marginTop: 1 },
  searchBox: {
    marginHorizontal: 18,
    marginBottom: 8,
    height: 44,
    borderRadius: 14,
    backgroundColor: Palette.zinc100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, fontSize: 14, color: Palette.zinc900 },
  list: { paddingHorizontal: 18, paddingTop: 6, paddingBottom: 40, gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: Palette.zinc200,
    ...ThemeShadows.sm,
  },
  rowDeleting: { opacity: 0.4 },
  avatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: Palette.zinc100, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '800', color: Palette.zinc900 },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  name: { fontSize: 15, fontWeight: '800', color: Palette.zinc900, flexShrink: 1 },
  when: { fontSize: 11, color: Palette.zinc400, fontWeight: '600' },
  preview: { fontSize: 12, color: Palette.zinc500, marginTop: 2, lineHeight: 17 },
  metaRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Palette.zinc50, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 999 },
  metaChipText: { fontSize: 10, fontWeight: '700', color: Palette.zinc600, textTransform: 'capitalize' },
  deleteBtn: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.rose50 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: Palette.zinc900 },
  emptySub: { fontSize: 13, color: Palette.zinc500 },
});
