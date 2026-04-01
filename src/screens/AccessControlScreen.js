import { useState, useRef, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  StyleSheet,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { getZones } from '../services/zoneService';
import { submitAccess } from '../services/accessService';
import { colors, fonts } from '../theme';

const TYPE_LABELS = {
  pedestrian: 'Peatonal',
  vehicular: 'Vehicular',
  mixed: 'Mixto',
};

const TYPE_COLORS = {
  pedestrian: colors.brandSecondary,
  vehicular: colors.orange,
  mixed: colors.brandPrimary,
};

const TYPE_BG = {
  pedestrian: colors.blueBg,
  vehicular: colors.orangeBg,
  mixed: colors.gray100,
};

function ZonePickerModal({ visible, zones, selected, onSelect, onDismiss }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return zones;
    return zones.filter((z) => z.name.toLowerCase().includes(q));
  }, [query, zones]);

  const handleSelect = (zone) => {
    onSelect(zone);
    setQuery('');
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onDismiss}
    >
      <SafeAreaView style={modal.container}>
        <View style={modal.header}>
          <Text style={modal.title}>Seleccionar zona</Text>
          <TouchableOpacity onPress={onDismiss} style={modal.doneBtn}>
            <Text style={modal.doneText}>Listo</Text>
          </TouchableOpacity>
        </View>

        <View style={modal.searchWrapper}>
          <TextInput
            style={modal.searchInput}
            placeholder="Buscar zona…"
            placeholderTextColor={colors.gray400}
            value={query}
            onChangeText={setQuery}
            clearButtonMode="while-editing"
            autoCorrect={false}
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          ItemSeparatorComponent={() => <View style={modal.separator} />}
          renderItem={({ item }) => {
            const isSelected = selected && item.id === selected.id;
            const typeColor = TYPE_COLORS[item.type] ?? colors.brandSecondary;
            const typeBg = TYPE_BG[item.type] ?? colors.gray100;
            return (
              <TouchableOpacity
                style={modal.row}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
              >
                <View style={modal.rowLeft}>
                  <Text style={modal.zoneName}>{item.name}</Text>
                  <View style={[modal.typeBadge, { backgroundColor: typeBg }]}>
                    <Text style={[modal.typeText, { color: typeColor }]}>
                      {TYPE_LABELS[item.type] ?? item.type}
                    </Text>
                  </View>
                </View>
                {isSelected && (
                  <Text style={modal.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </SafeAreaView>
    </Modal>
  );
}

export default function AccessControlScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [resultVisible, setResultVisible] = useState(false);
  const [resultType, setResultType] = useState(null);
  const [resultMessage, setResultMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const cameraRef = useRef(null);
  const bannerOpacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    getZones()
      .then((data) => {
        setZones(data);
        if (data.length > 0) setSelectedZone(data[0]);
      })
      .catch(() => {});
  }, []);

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
    setCapturedPhoto(photo.uri);
  };

  const showResult = (type, message) => {
    setResultType(type);
    setResultMessage(message);
    setResultVisible(true);
    bannerOpacity.setValue(1);
    Animated.sequence([
      Animated.delay(1800),
      Animated.timing(bannerOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      setCapturedPhoto(null);
      setResultVisible(false);
      setResultType(null);
      setResultMessage('');
    });
  };

  const handleSubmit = async () => {
    if (!selectedZone || !capturedPhoto || submitting) return;
    setSubmitting(true);
    try {
      const result = await submitAccess(selectedZone.id, capturedPhoto);
      showResult(result.authorized ? 'authorized' : 'denied', result.message);
    } catch {
      showResult('denied', 'Error al procesar la solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  if (!permission) {
    return <View style={s.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={[s.container, s.permissionWrap]}>
        <Text style={s.permissionText}>
          Se requiere acceso a la cámara para usar el control de acceso.
        </Text>
        <TouchableOpacity style={s.permissionButton} onPress={requestPermission}>
          <Text style={s.permissionButtonText}>Permitir acceso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <ZonePickerModal
        visible={pickerVisible}
        zones={zones}
        selected={selectedZone}
        onSelect={setSelectedZone}
        onDismiss={() => setPickerVisible(false)}
      />

      {/* Camera */}
      <View style={s.cameraWrap}>
        {capturedPhoto ? (
          <Image source={{ uri: capturedPhoto }} style={s.preview} />
        ) : (
          <CameraView ref={cameraRef} style={s.camera} facing="back" />
        )}

        {resultVisible && (
          <Animated.View
            style={[
              s.resultBanner,
              resultType === 'authorized' ? s.bannerGreen : s.bannerRed,
              { opacity: bannerOpacity },
            ]}
          >
            <Text style={s.resultText}>{resultMessage}</Text>
          </Animated.View>
        )}
      </View>

      {/* Controls */}
      <View style={[s.controls, { paddingBottom: insets.bottom + 16 }]}>
        {!capturedPhoto ? (
          <TouchableOpacity style={s.shutterOuter} onPress={handleCapture}>
            <View style={s.shutterInner} />
          </TouchableOpacity>
        ) : (
          <View style={s.actionButtons}>
            <TouchableOpacity
              style={[s.actionButton, s.cancelButton]}
              onPress={() => setCapturedPhoto(null)}
              disabled={submitting}
            >
              <Text style={s.actionButtonText}>Retomar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.actionButton, s.submitButton, submitting && { opacity: 0.65 }]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.actionButtonText}>Verificar Acceso</Text>
              }
            </TouchableOpacity>
          </View>
        )}

        {/* Zone selector — thumb-reachable */}
        <TouchableOpacity
          style={s.zoneRow}
          onPress={() => setPickerVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={s.zoneLabel}>Zona</Text>
          <Text style={s.zoneName} numberOfLines={1}>
            {selectedZone ? selectedZone.name : 'Cargando…'}
          </Text>
          <Text style={s.zoneChevron}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  permissionWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  zoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 10,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    marginHorizontal: 16,
  },
  zoneLabel: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
    marginRight: 8,
  },
  zoneName: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  zoneChevron: {
    fontSize: 20,
    color: colors.gray400,
    fontWeight: '300',
  },
  cameraWrap: {
    flex: 1,
    margin: 16,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  camera: { flex: 1 },
  preview: { flex: 1 },
  resultBanner: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 20,
    alignItems: 'center',
  },
  bannerGreen: { backgroundColor: colors.green },
  bannerRed: { backgroundColor: colors.red },
  resultText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: fonts.bold,
    letterSpacing: 0.3,
  },
  controls: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
  },
  shutterOuter: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 4, borderColor: colors.brandSecondary,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  shutterInner: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.brandSecondary,
  },
  actionButtons: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 16, width: '100%',
  },
  actionButton: {
    flex: 1, padding: 16, borderRadius: 16, alignItems: 'center',
  },
  submitButton: { backgroundColor: colors.brandSecondary },
  cancelButton: { backgroundColor: colors.gray400 },
  actionButtonText: {
    color: '#fff', fontSize: 14, fontFamily: fonts.semibold,
  },
  permissionText: {
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: colors.brandSecondary,
    borderRadius: 14, padding: 15, paddingHorizontal: 32,
  },
  permissionButtonText: {
    color: '#fff', fontSize: 15, fontFamily: fonts.semibold,
  },
});

const modal = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  title: {
    fontSize: 17, fontFamily: fonts.semibold, color: colors.textPrimary,
  },
  doneBtn: { paddingVertical: 4, paddingHorizontal: 4 },
  doneText: { fontSize: 16, fontFamily: fonts.semibold, color: colors.brandSecondary },
  searchWrapper: {
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: colors.background,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 15, fontFamily: fonts.regular, color: colors.textPrimary,
  },
  separator: {
    height: StyleSheet.hairlineWidth, backgroundColor: colors.separator, marginLeft: 16,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: colors.surface,
  },
  rowLeft: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  zoneName: { fontSize: 15, fontFamily: fonts.regular, color: colors.textPrimary },
  typeBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  typeText: { fontSize: 11, fontFamily: fonts.semibold },
  checkmark: { fontSize: 17, fontFamily: fonts.bold, color: colors.brandSecondary },
});
