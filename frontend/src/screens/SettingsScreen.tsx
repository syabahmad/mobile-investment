import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';

const settingsItems = [
  { title: 'Notifications', subtitle: 'Manage update alerts and reminders' },
  { title: 'Security', subtitle: 'Change PIN and app security options' },
  { title: 'Help Center', subtitle: 'Get support and common answers' },
  { title: 'About SmartInvest', subtitle: 'App version and legal information' },
];

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Settings</Text>
      <Text style={styles.sub}>Control how SmartInvest behaves on your device.</Text>

      {settingsItems.map((item) => (
        <Pressable key={item.title} style={styles.card}>
          <View style={styles.dot} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSub}>{item.subtitle}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, paddingTop: 28 },
  header: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  sub: { marginTop: 6, marginBottom: 16, color: '#64748b', fontSize: 13 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#00A86B', marginRight: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  cardSub: { fontSize: 12, color: '#64748b', marginTop: 3 },
  chevron: { fontSize: 28, color: '#94a3b8', marginLeft: 8 },
});
