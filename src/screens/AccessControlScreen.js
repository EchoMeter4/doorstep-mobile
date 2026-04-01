import React, { useState, useRef, useMemo } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { zones } from '../data/mock';
import { colors } from '../theme';

const TYPE_LABELS = {
  pedestrian: 'Peatonal',
  vehicular: 'Vehicular',
  mixed: 'Mixto',
};

const TYPE_COLORS = {
  pedestrian: colors.accentBlue,
  vehicular: colors.orange,
  mixed: colors.purple,
};

function ZonePickerModal({ visible, selected, onSelect, onDismiss }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return zones;
    return zones.filter((z) => z.name.toLowerCase().includes(q));
  }, [query]);

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
            placeholderTextColor={colors.textSecondary}
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
            const isSelected = item.id === selected.id;
            return (
              <TouchableOpacity
                style={modal.row}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
              >
                <View style={modal.rowLeft}>
                  <Text style={modal.zoneName}>{item.name}</Text>
                  <View style={[modal.typeBadge, { backgroundColor: TYPE_COLORS[item.type] + '22' }]}>
                    <Text style={[modal.typeText, { color: TYPE_COLORS[item.type] }]}>
                      {TYPE_LABELS[item.type]}
                    </Text>
                  </View>
                </View>
                {isSelected && <Text style={modal.checkmark}>✓</Text>}
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
  const [selectedZone, setSelectedZone] = useState(zones[0]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [resultVisible, setResultVisible] = useState(false);
  const [resultType, setResultType] = useState(null);
  const cameraRef = useRef(null);
  const bannerOpacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
    setCapturedPhoto(photo.uri);
  };

  const showResult = (type) => {
    setResultType(type);
    setResultVisible(true);
    bannerOpacity.setValue(1);
    Animated.sequence([
      Animated.delay(1800),
      Animated.timing(bannerOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      setCapturedPhoto(null);
      setResultVisible(false);
      setResultType(null);
    });
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.permissionContainer]}>
        <Text style={styles.permissionText}>
          Se requiere acceso a la cámara para usar el control de acceso.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Permitir acceso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ZonePickerModal
        visible={pickerVisible}
        selected={selectedZone}
        onSelect={setSelectedZone}
        onDismiss={() => setPickerVisible(false)}
      />

      {/* Header */}
      <View style={styles.headerArea}>
        <Text style={styles.screenTitle}>Control de Acceso</Text>
        <TouchableOpacity
          style={styles.zoneRow}
          onPress={() => setPickerVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.zoneLabel}>Zona</Text>
          <Text style={styles.zoneName} numberOfLines={1}>{selectedZone.name}</Text>
          <Text style={styles.zoneChevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Camera */}
      <View style={styles.cameraContainer}>
        {capturedPhoto ? (
          <Image source={{ uri: capturedPhoto }} style={styles.preview} />
        ) : (
          <CameraView ref={cameraRef} style={styles.camera} facing="back" />
        )}

        {resultVisible && (
          <Animated.View
            style={[
              styles.resultBanner,
              resultType === 'authorized' ? styles.bannerGreen : styles.bannerRed,
              { opacity: bannerOpacity },
            ]}
          >
            <Text style={styles.resultText}>
              {resultType === 'authorized' ? 'Acceso Autorizado ✓' : 'Acceso Denegado ✗'}
            </Text>
          </Animated.View>
        )}
      </View>

      {/* Controls */}
      <View style={[styles.controls, { paddingBottom: insets.bottom + 16 }]}>
        {!capturedPhoto ? (
          <TouchableOpacity style={styles.shutterOuter} onPress={handleCapture}>
            <View style={styles.shutterInner} />
          </TouchableOpacity>
        ) : (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.denyButton]}
              onPress={() => showResult('denied')}
            >
              <Text style={styles.actionButtonText}>Denegar Acceso</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.authorizeButton]}
              onPress={() => showResult('authorized')}
            >
              <Text style={styles.actionButtonText}>Autorizar Acceso</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  permissionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  headerArea: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  zoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
  },
  zoneLabel: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
    marginRight: 8,
  },
  zoneName: {
    flex: 1,
    fontSize: 15,
    color: colors.textSecondary,
  },
  zoneChevron: {
    fontSize: 20,
    color: colors.textSecondary,
    fontWeight: '300',
  },
  cameraContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  preview: {
    flex: 1,
  },
  resultBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    alignItems: 'center',
  },
  bannerGreen: {
    backgroundColor: colors.green,
  },
  bannerRed: {
    backgroundColor: colors.red,
  },
  resultText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  controls: {
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: colors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accentBlue,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  authorizeButton: {
    backgroundColor: colors.green,
  },
  denyButton: {
    backgroundColor: colors.red,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  permissionText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: colors.accentBlue,
    borderRadius: 16,
    padding: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

const modal = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  doneBtn: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  doneText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.accentBlue,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.background,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.textPrimary,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
    marginLeft: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.surface,
  },
  rowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  zoneName: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  typeBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accentBlue,
  },
});
