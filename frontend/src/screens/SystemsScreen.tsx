import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, TextInput, RefreshControl } from 'react-native';
import { walletApi, InvestmentSystem } from '../services/api/walletApi';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

export default function SystemsScreen() {
  const [systems, setSystems] = useState<InvestmentSystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Systems'>>();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await walletApi.getSystems();
        setSystems(res.data.systems || []);
      } catch (err) {
        console.warn('Failed to load systems', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await walletApi.getSystems();
      setSystems(res.data.systems || []);
    } catch (err) {
      console.warn('Refresh failed', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const renderItem = ({ item }: { item: InvestmentSystem }) => (
    <Pressable
      style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]}
      onPress={() => navigation.navigate('SystemPlans', { system: item })}
      accessibilityLabel={`Open ${item.name} plans`}
    >
      <View style={styles.cardLeft}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>{(item.name || '').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()}</Text>
        </View>
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={styles.title}>{item.name}</Text>
          <Text numberOfLines={2} style={styles.desc}>{item.description || 'No description available'}</Text>
        </View>
      </View>

      <View style={styles.cardRight}>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{item.plans?.length ?? 0}</Text>
        </View>
        <Text style={styles.goLabel}>View</Text>
      </View>
    </Pressable>
  );

  const filtered = query.trim() ? systems.filter(s => s.name.toLowerCase().includes(query.toLowerCase()) || (s.description || '').toLowerCase().includes(query.toLowerCase())) : systems;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Explore Systems</Text>

      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search systems (e.g. Car, Apartment)"
          placeholderTextColor="#94a3b8"
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
      </View>

      <Text style={styles.sub}>Choose a system to view available investment plans</Text>

      <FlatList
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 36 }}
        data={filtered}
        keyExtractor={s => s._id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>{loading ? 'Loading systems...' : 'No systems found'}</Text>
            <Text style={styles.emptySub}>Create systems from admin, or try refreshing.</Text>
          </View>
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 48, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: '800', marginBottom: 8, color: '#0f172a' },
  sub: { color: '#475569', fontSize: 13, marginBottom: 8 },
  loading: { color: '#6b7280' },
  searchRow: { marginBottom: 8 },
  searchInput: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, color: '#0f172a' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderLeftWidth: 6,
    borderLeftColor: '#e0f2fe',
  },
  cardPressed: { opacity: 0.9 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  logoCircle: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#3730a3', fontWeight: '800', fontSize: 16 },
  title: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  desc: { color: '#64748b', fontSize: 13, marginTop: 4 },
  cardRight: { alignItems: 'flex-end', marginLeft: 12 },
  countBadge: { backgroundColor: '#ecfeff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, minWidth: 48, alignItems: 'center' },
  countText: { fontWeight: '800', color: '#064e3b' },
  goLabel: { color: '#0ea5e9', fontSize: 13, marginTop: 6, fontWeight: '700' },
  emptyBox: { padding: 28, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 6 },
  emptySub: { color: '#64748b' },
});
