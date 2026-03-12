import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { recentAccesses } from '../data/mock';
import { colors } from '../theme';

const stats = [
  { label: 'Accesos hoy', value: '47' },
  { label: 'Autorizados', value: '39' },
  { label: 'Denegados', value: '8' },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
    >
      {/* Large title header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.largeTitle}>Inicio</Text>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userRole}>{user?.role}</Text>
      </View>

      <View style={styles.body}>
        {/* Stats row */}
        <View style={styles.statsRow}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Recent accesses */}
        <Text style={styles.sectionTitle}>Accesos recientes</Text>
        <View style={styles.accessList}>
          {recentAccesses.map((entry, index) => (
            <View key={entry.id}>
              <View style={styles.accessRow}>
                <View style={styles.accessInfo}>
                  <Text style={styles.accessName}>{entry.name}</Text>
                  <Text style={styles.accessZone}>{entry.zone}</Text>
                </View>
                <View style={styles.accessRight}>
                  <Text style={styles.accessTime}>{entry.time}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      entry.status === 'authorized' ? styles.badgeGreen : styles.badgeRed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: entry.status === 'authorized' ? colors.green : colors.red },
                      ]}
                    >
                      {entry.status === 'authorized' ? 'Autorizado' : 'Denegado'}
                    </Text>
                  </View>
                </View>
              </View>
              {index < recentAccesses.length - 1 && (
                <View style={styles.rowSeparator} />
              )}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  userRole: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  body: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.accent,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  accessList: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  accessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
    marginLeft: 16,
  },
  accessInfo: {
    flex: 1,
  },
  accessName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  accessZone: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  accessRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  accessTime: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeGreen: {
    backgroundColor: colors.green + '22',
  },
  badgeRed: {
    backgroundColor: colors.red + '1A',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
