import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { userData } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Profile</Text>
      <Text style={styles.sub}>Your account information and current status.</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatarWrap}>
          {userData?.dp ? (
            <Image source={{ uri: userData.dp }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{(userData?.name || 'U').charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </View>
        <Text style={styles.name}>{userData?.name || 'User'}</Text>
        <Text style={styles.email}>{userData?.email || 'No email available'}</Text>
      </View>

      <View style={styles.infoCard}>
        <InfoRow label="Phone" value={userData?.phone || 'Not added'} />
        <InfoRow label="Role" value={userData?.role || 'user'} />
        <InfoRow label="Verified" value={userData?.isVerified ? 'Yes' : 'No'} />
        <InfoRow label="Balance" value={`Rs. ${Number(userData?.currentBalance || 0).toLocaleString()}`} />
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, paddingTop: 48 },
  header: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  sub: { marginTop: 6, marginBottom: 16, color: '#64748b', fontSize: 13 },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  avatarWrap: { marginBottom: 14 },
  avatar: { width: 84, height: 84, borderRadius: 42 },
  avatarPlaceholder: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#047857' },
  name: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  email: { marginTop: 4, fontSize: 13, color: '#64748b' },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  rowLabel: { fontSize: 13, fontWeight: '700', color: '#475569' },
  rowValue: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
});
