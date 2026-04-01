import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { getLogs } from '../services/accessService';
import { colors } from '../theme';
import LogoMark from '../components/LogoMark';

export default function HomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    getLogs(today, today)
      .then(setLogs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = logs.length;
  const authorized = logs.filter((l) => l.authorized).length;
  const denied = total - authorized;

  const stats = [
    { label: 'Accesos hoy', value: String(total) },
    { label: 'Autorizados', value: String(authorized) },
    { label: 'Denegados', value: String(denied) },
  ];

  const recent = logs.slice(0, 4).map((l) => ({
    id: l.id,
    name: l.users[0]?.name ?? 'Desconocido',
    zone: l.zone.name,
    time: new Date(l.timestamp).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    status: l.authorized ? 'authorized' : 'denied',
  }));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.largeTitle}>Inicio</Text>
            {user?.role ? <Text style={styles.userRole}>{user.role}</Text> : null}
          </View>
          <View style={styles.headerBrand}>
            <LogoMark size={40} radius={11} />
            <Text style={styles.brandName}>Doorstep</Text>
          </View>
        </View>
        <Text style={styles.userName}>Bienvenido, {user?.name}</Text>
      </View>

      <View style={styles.body}>
        {/* Stats row */}
        <View style={styles.statsRow}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statCard}>
              {loading
                ? <ActivityIndicator color={colors.accentBlue} />
                : <Text style={styles.statValue}>{s.value}</Text>
              }
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Recent accesses */}
        <Text style={styles.sectionTitle}>Accesos recientes</Text>
        <View style={styles.accessList}>
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.accentBlue} />
            </View>
          ) : recent.length === 0 ? (
            <View style={styles.loadingRow}>
              <Text style={styles.emptyText}>Sin accesos hoy</Text>
            </View>
          ) : (
            recent.map((entry, index) => (
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
                {index < recent.length - 1 && (
                  <View style={styles.rowSeparator} />
                )}
              </View>
            ))
          )}
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
    paddingBottom: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  userRole: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerBrand: {
    alignItems: 'center',
    gap: 4,
  },
  brandName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accent,
    letterSpacing: 0.3,
  },
  userName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textSecondary,
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
    borderRadius: 20,
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
    color: colors.accentBlue,
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
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingRow: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
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
