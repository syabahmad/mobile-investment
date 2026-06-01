import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, TextInput, RefreshControl, Image } from 'react-native';
import api from '../services/api';

type CommunityPost = {
  id: string;
  title: string;
  body: string;
  author: string;
  authorAvatar?: string | null;
  createdAt: string;
  category: 'update' | 'announcement' | 'education';
};

const SAMPLE_POSTS: CommunityPost[] = [
  {
    id: '1',
    title: 'New weekly ROI update',
    body: 'This week our team processed the latest approved returns. Check the dashboard analytics for your updated balance.',
    author: 'SmartInvest Admin',
    createdAt: '10 min ago',
    category: 'update',
  },
  {
    id: '2',
    title: 'Apartment plan now available',
    body: 'A new Apartment system has been added with multiple plan options. Open the Plans tab to review it.',
    author: 'SmartInvest Admin',
    createdAt: '2 hours ago',
    category: 'announcement',
  },
  {
    id: '3',
    title: 'How to choose a plan',
    body: 'Choose a plan based on your comfort with minimum investment, return rate, and long-term goals.',
    author: 'SmartInvest Team',
    createdAt: 'Yesterday',
    category: 'education',
  },
];

export default function CommunityScreen() {
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [postsData, setPostsData] = useState<CommunityPost[]>(SAMPLE_POSTS);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => { fetchPosts(); }, []);
  useEffect(() => {
    try {
      // show which baseURL axios is using (helps debug emulator vs local backend)
      // eslint-disable-next-line no-console
      console.log('API baseURL:', (api as any).defaults?.baseURL);
    } catch (e) {}
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/community/posts');
      const remote = (res.data.posts || []).map((p: any) => ({
        id: p._id,
        title: p.title,
        body: p.body,
        author: p.author || 'Admin',
        authorAvatar: p.authorAvatar || null,
        createdAt: new Date(p.createdAt).toLocaleString(),
        category: p.category || 'update',
      }));
      setPostsData(remote.length ? remote : SAMPLE_POSTS);
      setFetchError(null);
    } catch (err: any) {
      // keep sample posts on error, but expose the message to help debugging
      // eslint-disable-next-line no-console
      console.warn('Failed to fetch community posts', err);
      setFetchError(err?.message || 'Failed to fetch posts');
    }
  };

  const posts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return postsData;
    return postsData.filter(post =>
      post.title.toLowerCase().includes(q) ||
      post.body.toLowerCase().includes(q) ||
      post.author.toLowerCase().includes(q)
    );
  }, [query, postsData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: CommunityPost }) => (
    <View style={styles.chatRow}>
      <View style={styles.avatarWrap}>
        {item.authorAvatar ? (
          <Image source={{ uri: item.authorAvatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}><Text style={styles.avatarInitial}>{(item.author||'A').charAt(0)}</Text></View>
        )}
      </View>

      <View style={styles.chatBubbleWrap}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatAuthor}>{item.author}</Text>
          <Text style={styles.chatTime}>{item.createdAt}</Text>
        </View>
        <View style={styles.chatBubble}>
          <Text style={styles.chatTitle}>{item.title}</Text>
          <Text style={styles.chatBody}>{item.body}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Community</Text>
      <Text style={styles.subtitle}>Read-only updates shared by the SmartInvest admin team.</Text>
      {fetchError ? (
        <View style={{ marginTop: 8, marginBottom: 8 }}>
          <Text style={{ color: '#b91c1c', fontSize: 12 }}>Unable to load posts: {fetchError}</Text>
          <Text style={{ color: '#475569', fontSize: 12 }}>Check API URL and network (see console log for baseURL).</Text>
        </View>
      ) : null}

      <TextInput
        placeholder="Search updates"
        placeholderTextColor="#94a3b8"
        value={query}
        onChangeText={setQuery}
        style={styles.searchInput}
      />

      <FlatList
        inverted
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 140 }}
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No posts found</Text>
            <Text style={styles.emptyText}>Try a different search or wait for new admin updates.</Text>
          </View>
        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 48, backgroundColor: '#f8fafc' },
  header: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  subtitle: { marginTop: 6, marginBottom: 12, color: '#64748b', fontSize: 13 },
  searchInput: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chatRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  avatarWrap: { width: 44, marginRight: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#c7d2fe', alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: '#312e81', fontWeight: '800' },
  chatBubbleWrap: { flex: 1 },
  chatHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  chatAuthor: { fontSize: 13, fontWeight: '800', color: '#0f172a' },
  chatTime: { fontSize: 11, color: '#94a3b8' },
  chatBubble: { backgroundColor: '#ffffff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e6eef2' },
  chatTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  chatBody: { marginTop: 6, color: '#475569', fontSize: 14, lineHeight: 20 },
  postTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  badgeWrap: { backgroundColor: '#ecfeff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: '800', color: '#0f766e' },
  timeText: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
  postTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  postBody: { fontSize: 14, lineHeight: 21, color: '#475569', marginTop: 8 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  authorText: { fontSize: 12, color: '#64748b', fontWeight: '600', flex: 1, paddingRight: 8 },
  readButton: { backgroundColor: '#00A86B', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  readButtonText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  emptyBox: { padding: 24, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  emptyText: { marginTop: 6, textAlign: 'center', color: '#64748b' },
  footerNote: { position: 'absolute', left: 16, right: 16, bottom: 18, backgroundColor: '#0f172a', paddingVertical: 12, borderRadius: 999, alignItems: 'center' },
  footerNoteText: { color: '#e6eef2', fontSize: 13, fontWeight: '600' },
});