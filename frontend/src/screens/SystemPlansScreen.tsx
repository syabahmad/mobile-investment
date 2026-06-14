import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, Pressable, TextInput } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { walletApi, InvestmentPlan, InvestmentSystem } from '../services/api/walletApi';

type RouteParams = {
  params: {
    system?: InvestmentSystem;
    systemId?: string;
  };
};

export default function SystemPlansScreen() {
  const route = useRoute<RouteProp<Record<string, object | undefined>, string>>() as RouteParams;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'SystemPlans'>>();
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const system = route.params?.system;
  const systemId = route.params?.systemId || (system?._id);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        // Prefer systems endpoint (may include plans)
        if (system && system.plans) {
          setPlans(system.plans);
        } else {
          // fetch systems and find plans
          try {
            const res = await walletApi.getSystems();
            const found = res.data.systems?.find(s => s._id === systemId);
            if (found) setPlans(found.plans || []);
            else {
              // fallback to fetching all plans and filtering
              const p = await walletApi.getPlans();
              setPlans(p.data.plans.filter(pl => (pl.category as any)?._id === systemId || (pl.category === systemId)));
            }
          } catch (err) {
            const p = await walletApi.getPlans();
            setPlans(p.data.plans.filter(pl => (pl.category as any)?._id === systemId || (pl.category === systemId)));
          }
        }
      } catch (err) {
        console.warn('Failed to load plans', err);
        Alert.alert('Error', 'Unable to load plans for this system');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [system, systemId]);

  const renderItem = ({ item }: { item: InvestmentPlan }) => (
    <Pressable
      style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]}
      onPress={() => navigation.navigate('TermsCondition', { selectedPlanId: item._id, selectedPlanName: item.name })}
      accessibilityLabel={`Open details for ${item.name}`}
    >
      <View style={styles.planLeft}>
        <View style={styles.planLogo}>
          <Text style={styles.planLogoText}>{(item.name || '').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()}</Text>
        </View>
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={styles.title}>{item.name}</Text>
          {item.description ? <Text numberOfLines={2} style={styles.desc}>{item.description}</Text> : null}
        </View>
      </View>

      <View style={styles.planRight}>
        <Text style={styles.rate}>{(item.dailyReturnRate * 100).toFixed(1)}%</Text>
        <Text style={styles.min}>Min Rs. {item.minInvestment.toLocaleString()}</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{system?.name || 'Plans'}</Text>

      <TextInput
        placeholder="Filter plans by name"
        placeholderTextColor="#94a3b8"
        value={query}
        onChangeText={setQuery}
        style={styles.searchInput}
      />

      {loading ? (
        <Text style={styles.loading}>Loading plans...</Text>
      ) : (
        <FlatList data={plans.filter(p => !query.trim() || p.name.toLowerCase().includes(query.toLowerCase()))} keyExtractor={p => p._id} renderItem={renderItem} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 48, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: '800', marginBottom: 8, color: '#0f172a' },
  searchInput: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, color: '#0f172a', marginBottom: 10 },
  loading: { color: '#6b7280' },
  empty: { color: '#6b7280' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    borderLeftWidth: 6,
    borderLeftColor: '#ecfeff',
  },
  cardPressed: { opacity: 0.9 },
  planLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  planLogo: { width: 52, height: 52, borderRadius: 12, backgroundColor: '#ecfeff', alignItems: 'center', justifyContent: 'center' },
  planLogoText: { fontWeight: '800', color: '#065f46', fontSize: 14 },
  title: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  desc: { color: '#64748b', fontSize: 13, marginTop: 4 },
  planRight: { alignItems: 'flex-end' },
  rate: { color: '#059669', fontWeight: '800' },
  min: { fontSize: 12, color: '#64748b' },
});
