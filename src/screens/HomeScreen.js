import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CreditCardIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from 'react-native-heroicons/solid';
import { getLogs } from '../services/accessService';
import { colors, fonts } from '../theme';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isValidDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);

const today = () => new Date().toISOString().slice(0, 10);
const thirtyDaysAgo = () =>
  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

const fmtFull = (iso) => {
  const d = new Date(iso);
  const date = d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  const time = d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return `${date} · ${time}`;
};

const getUserLabel = (users, credentialType) => {
  if (!users || users.length === 0) return 'Sin usuarios';
  if (credentialType === 'lpn') {
    const shown = users.slice(0, 2).map((u) => u.name).join(', ');
    const rest = users.length - 2;
    return rest > 0 ? `${shown} +${rest} más` : shown;
  }
  return users[0]?.name ?? 'Desconocido';
};

// ─── Badges ───────────────────────────────────────────────────────────────────

function TypeBadge({ type }) {
  const isLpn = type === 'lpn';
  return (
    <View style={[b.pill, isLpn ? b.orange : b.blue]}>
      {isLpn
        ? <TruckIcon size={11} color={colors.orangeText} />
        : <CreditCardIcon size={11} color={colors.blueText} />
      }
      <Text style={[b.text, { color: isLpn ? colors.orangeText : colors.blueText }]}>
        {isLpn ? 'Placa' : 'Credencial'}
      </Text>
    </View>
  );
}

function StatusBadge({ authorized }) {
  return (
    <View style={[b.pill, authorized ? b.green : b.red]}>
      {authorized
        ? <CheckCircleIcon size={11} color={colors.greenText} />
        : <XCircleIcon size={11} color={colors.redText} />
      }
      <Text style={[b.text, { color: authorized ? colors.greenText : colors.redText }]}>
        {authorized ? 'Autorizado' : 'No autorizado'}
      </Text>
    </View>
  );
}

function ZoneTypeBadge({ type }) {
  const isVeh = type === 'vehicular';
  return (
    <View style={[b.pill, isVeh ? b.orange : b.green]}>
      {isVeh
        ? <TruckIcon size={11} color={colors.orangeText} />
        : <UserIcon size={11} color={colors.greenText} />
      }
      <Text style={[b.text, { color: isVeh ? colors.orangeText : colors.greenText }]}>
        {isVeh ? 'Vehicular' : 'Peatonal'}
      </Text>
    </View>
  );
}

// ─── Picker Modal ─────────────────────────────────────────────────────────────

function PickerModal({ visible, title, options, selected, onSelect, onDismiss }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <TouchableOpacity style={pm.overlay} activeOpacity={1} onPress={onDismiss} />
      <View style={pm.sheet}>
        <View style={pm.handle} />
        <Text style={pm.title}>{title}</Text>
        {options.map((opt) => (
          <TouchableOpacity
            key={String(opt.value)}
            style={pm.row}
            onPress={() => { onSelect(opt.value); onDismiss(); }}
            activeOpacity={0.7}
          >
            <Text style={[pm.rowText, selected === opt.value && pm.rowTextActive]}>
              {opt.label}
            </Text>
            {selected === opt.value && (
              <CheckCircleIcon size={18} color={colors.brandSecondary} />
            )}
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={pm.cancelBtn} onPress={onDismiss}>
          <Text style={pm.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

// ─── Log Card ─────────────────────────────────────────────────────────────────

function LogCard({ log, onPress }) {
  return (
    <TouchableOpacity style={lc.row} onPress={onPress} activeOpacity={0.7}>
      <View style={lc.left}>
        <View style={lc.topLine}>
          <Text style={lc.credential}>{log.credentialValue}</Text>
          <TypeBadge type={log.credentialType} />
        </View>
        <Text style={lc.users} numberOfLines={1}>
          {getUserLabel(log.users, log.credentialType)}
        </Text>
        <Text style={lc.meta}>
          {log.zone?.name}{'  ·  '}{fmtDate(log.timestamp)}{'  ·  '}{fmtTime(log.timestamp)}
        </Text>
      </View>
      <View style={lc.right}>
        <StatusBadge authorized={log.authorized} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Detail Sheet ─────────────────────────────────────────────────────────────

function DetailField({ label, children }) {
  return (
    <View style={ds.field}>
      <Text style={ds.fieldLabel}>{label}</Text>
      <View>{children}</View>
    </View>
  );
}

function ResumenTab({ log }) {
  return (
    <ScrollView contentContainerStyle={ds.tabContent}>
      <DetailField label="ID DE REGISTRO">
        <Text style={ds.value} selectable>{log.id}</Text>
      </DetailField>
      <DetailField label="FECHA Y HORA">
        <Text style={ds.value}>{fmtFull(log.timestamp)}</Text>
      </DetailField>
      <DetailField label="ZONA">
        <Text style={ds.value}>{log.zone?.name}</Text>
      </DetailField>
      <DetailField label="TIPO DE ZONA">
        <ZoneTypeBadge type={log.zone?.type} />
      </DetailField>
      <View style={ds.divider} />
      <DetailField label="USUARIO(S)">
        {!log.users?.length
          ? <Text style={ds.italic}>Sin usuarios</Text>
          : log.users.map((u) => <Text key={u.id} style={ds.value}>{u.name}</Text>)
        }
      </DetailField>
      <DetailField label="CREDENCIAL">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TypeBadge type={log.credentialType} />
          <Text style={ds.value}>{log.credentialValue}</Text>
        </View>
      </DetailField>
      <DetailField label="ESTATUS">
        <StatusBadge authorized={log.authorized} />
      </DetailField>
    </ScrollView>
  );
}

function UsuarioTab({ log }) {
  const users = log.users ?? [];
  return (
    <ScrollView contentContainerStyle={ds.tabContent}>
      {users.length === 0 ? (
        <Text style={ds.italic}>Sin usuarios asociados</Text>
      ) : (
        users.map((u, i) => (
          <View key={u.id} style={[ds.userCard, i > 0 && { marginTop: 12 }]}>
            <View style={ds.avatar}>
              <Text style={ds.avatarText}>{u.name?.[0]?.toUpperCase() ?? '?'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={ds.userName}>{u.name}</Text>
              {u.credential && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <TypeBadge type={u.credential.type === 'lpn' ? 'lpn' : 'credential'} />
                  <Text style={ds.credNum}>{u.credential.number}</Text>
                </View>
              )}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function ZonaTab({ log }) {
  return (
    <ScrollView contentContainerStyle={ds.tabContent}>
      <DetailField label="NOMBRE">
        <Text style={ds.value}>{log.zone?.name}</Text>
      </DetailField>
      <DetailField label="TIPO">
        <ZoneTypeBadge type={log.zone?.type} />
      </DetailField>
    </ScrollView>
  );
}

const TABS = ['Resumen', 'Usuario', 'Zona'];

function DetailSheet({ log, onClose }) {
  const [activeTab, setActiveTab] = useState(0);
  if (!log) return null;
  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={ds.container}>
        <View style={ds.header}>
          <View style={{ flex: 1 }}>
            <Text style={ds.headerTitle}>{log.credentialValue}</Text>
            <Text style={ds.headerSub}>{fmtDate(log.timestamp)} · {fmtTime(log.timestamp)}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={ds.closeBtn}>
            <XMarkIcon size={18} color={colors.gray500} />
          </TouchableOpacity>
        </View>

        <View style={ds.tabBar}>
          {TABS.map((tab, i) => (
            <TouchableOpacity key={tab} style={ds.tabItem} onPress={() => setActiveTab(i)}>
              <Text style={[ds.tabText, activeTab === i && ds.tabTextActive]}>{tab}</Text>
              {activeTab === i && <View style={ds.tabLine} />}
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ flex: 1 }}>
          {activeTab === 0 && <ResumenTab log={log} />}
          {activeTab === 1 && <UsuarioTab log={log} />}
          {activeTab === 2 && <ZonaTab log={log} />}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const [from, setFrom] = useState(thirtyDaysAgo);
  const [to, setTo] = useState(today);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [authorizedOn, setAuthorizedOn] = useState(false);
  const [deniedOn, setDeniedOn] = useState(false);
  const [zoneFilter, setZoneFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);

  const [selectedLog, setSelectedLog] = useState(null);
  const [zonePickerVisible, setZonePickerVisible] = useState(false);
  const [typePickerVisible, setTypePickerVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = (isRefresh = false) => {
    if (!isValidDate(from) || !isValidDate(to)) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    getLogs(from, to)
      .then(setLogs)
      .catch(() => setLogs([]))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchLogs();
  }, [from, to]);

  const zoneOptions = useMemo(() => {
    const names = [...new Set(logs.map((l) => l.zone?.name).filter(Boolean))];
    return [
      { label: 'Todas las zonas', value: null },
      ...names.map((n) => ({ label: n, value: n })),
    ];
  }, [logs]);

  const typeOptions = [
    { label: 'Todos', value: null },
    { label: 'Credencial', value: 'credential' },
    { label: 'Placa', value: 'lpn' },
  ];

  const baseFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter((log) => {
      if (q) {
        const hit =
          log.credentialValue?.toLowerCase().includes(q) ||
          log.zone?.name?.toLowerCase().includes(q) ||
          log.users?.some((u) => u.name?.toLowerCase().includes(q));
        if (!hit) return false;
      }
      if (zoneFilter && log.zone?.name !== zoneFilter) return false;
      if (typeFilter && log.credentialType !== typeFilter) return false;
      return true;
    });
  }, [logs, search, zoneFilter, typeFilter]);

  const filteredLogs = useMemo(() => {
    if (!authorizedOn && !deniedOn) return baseFiltered;
    return baseFiltered.filter((l) => {
      if (authorizedOn && !deniedOn) return l.authorized;
      if (deniedOn && !authorizedOn) return !l.authorized;
      return true;
    });
  }, [baseFiltered, authorizedOn, deniedOn]);

  const authorizedCount = useMemo(() => baseFiltered.filter((l) => l.authorized).length, [baseFiltered]);
  const deniedCount = useMemo(() => baseFiltered.filter((l) => !l.authorized).length, [baseFiltered]);

  const zoneLabel = zoneOptions.find((o) => o.value === zoneFilter)?.label ?? 'Zona';
  const typeLabel = typeOptions.find((o) => o.value === typeFilter)?.label ?? 'Tipo';

  return (
    <View style={[s.screen, { paddingTop: 8 }]}>
      <PickerModal
        visible={zonePickerVisible}
        title="Zona"
        options={zoneOptions}
        selected={zoneFilter}
        onSelect={setZoneFilter}
        onDismiss={() => setZonePickerVisible(false)}
      />
      <PickerModal
        visible={typePickerVisible}
        title="Tipo de acceso"
        options={typeOptions}
        selected={typeFilter}
        onSelect={setTypeFilter}
        onDismiss={() => setTypePickerVisible(false)}
      />
      {selectedLog && <DetailSheet log={selectedLog} onClose={() => setSelectedLog(null)} />}

      <View style={s.card}>
        {/* ── Filter toolbar ── */}
        <View style={s.toolbar}>
          {/* Search */}
          <View style={s.searchRow}>
            <MagnifyingGlassIcon size={15} color={colors.gray400} />
            <TextInput
              style={s.searchInput}
              placeholder="Buscar registro..."
              placeholderTextColor={colors.gray400}
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
            />
          </View>

          {/* Status pills */}
          <View style={s.pillRow}>
            <TouchableOpacity
              style={[s.pill, authorizedOn && s.pillGreen]}
              onPress={() => setAuthorizedOn((v) => !v)}
              activeOpacity={0.8}
            >
              <View style={[s.dot, { backgroundColor: authorizedOn ? colors.green : colors.gray400 }]} />
              <Text style={[s.pillText, authorizedOn && { color: colors.greenText }]}>
                Autorizado · {authorizedCount}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.pill, deniedOn && s.pillRed]}
              onPress={() => setDeniedOn((v) => !v)}
              activeOpacity={0.8}
            >
              <View style={[s.dot, { backgroundColor: deniedOn ? colors.red : colors.gray400 }]} />
              <Text style={[s.pillText, deniedOn && { color: colors.redText }]}>
                No autorizado · {deniedCount}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Dropdowns */}
          <View style={s.dropRow}>
            <TouchableOpacity style={s.drop} onPress={() => setZonePickerVisible(true)}>
              <Text style={[s.dropText, zoneFilter && s.dropTextActive]} numberOfLines={1}>
                {zoneLabel}
              </Text>
              <ChevronDownIcon size={13} color={zoneFilter ? colors.brandSecondary : colors.gray400} />
            </TouchableOpacity>
            <TouchableOpacity style={s.drop} onPress={() => setTypePickerVisible(true)}>
              <Text style={[s.dropText, typeFilter && s.dropTextActive]} numberOfLines={1}>
                {typeLabel}
              </Text>
              <ChevronDownIcon size={13} color={typeFilter ? colors.brandSecondary : colors.gray400} />
            </TouchableOpacity>
          </View>

          {/* Date range */}
          <View style={s.dateRow}>
            <Text style={s.dateLabel}>Desde</Text>
            <TextInput
              style={[s.dateInput, loading && { opacity: 0.5 }]}
              value={from}
              onChangeText={setFrom}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.gray400}
              editable={!loading}
            />
            <Text style={s.dateSep}>→</Text>
            <Text style={s.dateLabel}>Hasta</Text>
            <TextInput
              style={[s.dateInput, loading && { opacity: 0.5 }]}
              value={to}
              onChangeText={setTo}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.gray400}
              editable={!loading}
            />
            {loading && <Text style={s.loadingText}>Cargando...</Text>}
          </View>
        </View>

        {/* Divider */}
        <View style={s.divider} />

        {/* Log list */}
        <FlatList
          data={filteredLogs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <LogCard log={item} onPress={() => setSelectedLog(item)} />
          )}
          ItemSeparatorComponent={() => <View style={s.rowSep} />}
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <Text style={s.emptyText}>
                {loading ? 'Cargando registros...' : 'No se encontraron registros'}
              </Text>
            </View>
          }
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchLogs(true)}
              tintColor={colors.brandSecondary}
            />
          }
        />
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const b = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  text: { fontSize: 11, fontFamily: fonts.semibold },
  blue: { backgroundColor: colors.blueBg },
  orange: { backgroundColor: colors.orangeBg },
  green: { backgroundColor: colors.greenBg },
  red: { backgroundColor: colors.redBg },
});

const lc = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.surface,
  },
  left: { flex: 1, gap: 3 },
  right: { marginLeft: 12 },
  topLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  credential: { fontSize: 14, fontFamily: fonts.semibold, color: colors.gray900 },
  users: { fontSize: 13, fontFamily: fonts.regular, color: colors.gray700 },
  meta: { fontSize: 12, fontFamily: fonts.regular, color: colors.gray400 },
});

const pm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: colors.gray200,
    alignSelf: 'center', marginBottom: 16,
  },
  title: { fontSize: 16, fontFamily: fonts.semibold, color: colors.textPrimary, marginBottom: 8 },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.separator,
  },
  rowText: { fontSize: 15, fontFamily: fonts.regular, color: colors.textPrimary },
  rowTextActive: { color: colors.brandSecondary, fontFamily: fonts.medium },
  cancelBtn: {
    marginTop: 16, padding: 14, alignItems: 'center',
    backgroundColor: colors.gray100, borderRadius: 14,
  },
  cancelText: { fontSize: 14, fontFamily: fonts.medium, color: colors.gray700 },
});

const ds = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.separator,
  },
  headerTitle: { fontSize: 19, fontFamily: fonts.semibold, color: colors.textPrimary },
  headerSub: { fontSize: 12, fontFamily: fonts.regular, color: colors.textSecondary, marginTop: 2 },
  closeBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center',
    marginLeft: 12,
  },
  tabBar: {
    flexDirection: 'row', paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.separator,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 12, position: 'relative' },
  tabText: { fontSize: 13, fontFamily: fonts.medium, color: colors.gray400 },
  tabTextActive: { color: colors.brandSecondary },
  tabLine: {
    position: 'absolute', bottom: 0, left: '15%', right: '15%',
    height: 2, backgroundColor: colors.brandSecondary, borderRadius: 1,
  },
  tabContent: { padding: 20, gap: 4 },
  field: { marginBottom: 18 },
  fieldLabel: {
    fontSize: 10, fontFamily: fonts.semibold, color: colors.textSecondary,
    letterSpacing: 0.8, marginBottom: 6,
  },
  value: { fontSize: 14, fontFamily: fonts.regular, color: colors.textPrimary },
  italic: { fontSize: 14, fontFamily: fonts.regular, color: colors.textSecondary, fontStyle: 'italic' },
  divider: { height: 1, backgroundColor: colors.separator, marginVertical: 8 },
  userCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.background, borderRadius: 14, padding: 14,
  },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: colors.brandSecondary + '1A',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 17, fontFamily: fonts.semibold, color: colors.brandSecondary },
  userName: { fontSize: 14, fontFamily: fonts.medium, color: colors.textPrimary },
  credNum: { fontSize: 12, fontFamily: fonts.regular, color: colors.textSecondary },
});

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  toolbar: { padding: 14, gap: 10 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.gray100, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: {
    flex: 1, fontSize: 13, fontFamily: fonts.regular,
    color: colors.textPrimary, padding: 0,
  },
  pillRow: { flexDirection: 'row', gap: 8 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: colors.border, borderRadius: 100,
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: colors.surface,
  },
  pillGreen: { borderColor: colors.greenBorder, backgroundColor: colors.greenBg },
  pillRed: { borderColor: colors.redBorder, backgroundColor: colors.redBg },
  dot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { fontSize: 12, fontFamily: fonts.medium, color: colors.gray500 },
  dropRow: { flexDirection: 'row', gap: 8 },
  drop: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: colors.border, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  dropText: { flex: 1, fontSize: 13, fontFamily: fonts.regular, color: colors.gray500 },
  dropTextActive: { color: colors.brandSecondary, fontFamily: fonts.medium },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateLabel: { fontSize: 11, fontFamily: fonts.medium, color: colors.gray500 },
  dateInput: {
    flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 6, fontSize: 11,
    fontFamily: fonts.regular, color: colors.textPrimary,
  },
  dateSep: { fontSize: 13, color: colors.gray400 },
  loadingText: { fontSize: 11, fontFamily: fonts.regular, color: colors.gray400 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  rowSep: { height: StyleSheet.hairlineWidth, backgroundColor: colors.separator, marginLeft: 16 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 48 },
  emptyText: { fontSize: 14, fontFamily: fonts.regular, color: colors.gray400, textAlign: 'center' },
});
