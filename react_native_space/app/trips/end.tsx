import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView, Alert, Platform,
  KeyboardAvoidingView, Pressable, ActivityIndicator, Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, borderRadius, shadows } from '../../src/theme';
import { GradientButton } from '../../src/components/GradientButton';
import { endTrip as endTripApi, getTripById, Trip } from '../../src/services/trips';
import { reverseGeocode } from '../../src/services/geocode';
import { extractOdometerReading } from '../../src/services/ocr';
import { uploadFileToS3 } from '../../src/services/upload';
import { formatDateTime, formatKm } from '../../src/utils/formatters';

export default function EndTripScreen() {
  const { tripId = '' } = useLocalSearchParams<{ tripId: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [endOdometer, setEndOdometer] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [loadingTrip, setLoadingTrip] = useState(true);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoFileId, setPhotoFileId] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrConfidence, setOcrConfidence] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [locationError, setLocationError] = useState(false);

  useEffect(() => {
    if (tripId) {
      getTripById(tripId).then((t) => {
        setTrip(t ?? null);
      }).catch(() => {}).finally(() => setLoadingTrip(false));
    } else {
      setLoadingTrip(false);
    }
  }, [tripId]);

  const fetchLocation = async () => {
    setLoadingLocation(true);
    setLocationError(false);
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000,
          });
        });
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        setLat(latitude);
        setLng(longitude);
        try {
          const geo = await reverseGeocode(latitude, longitude);
          setEndAddress(geo?.address ?? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } catch {
          setEndAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError(true);
          setLoadingLocation(false);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const latitude = loc?.coords?.latitude;
        const longitude = loc?.coords?.longitude;
        if (latitude != null && longitude != null) {
          setLat(latitude);
          setLng(longitude);
          try {
            const geo = await reverseGeocode(latitude, longitude);
            setEndAddress(geo?.address ?? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          } catch {
            setEndAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        } else {
          setLocationError(true);
        }
      }
    } catch {
      setLocationError(true);
    } finally {
      setLoadingLocation(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos da câmera.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        base64: true,
      });
      if (result?.canceled || !result?.assets?.[0]) return;
      const asset = result.assets[0];
      setPhotoUri(asset.uri ?? null);

      if (asset.uri) {
        try {
          const fileRecord = await uploadFileToS3(asset.uri, `odometer_end_${Date.now()}.jpg`, 'image/jpeg');
          setPhotoFileId(fileRecord?.id ?? null);
        } catch {}
      }

      if (asset.base64) {
        setOcrLoading(true);
        try {
          const ocr = await extractOdometerReading(asset.base64);
          if (ocr?.reading != null) {
            setEndOdometer(String(ocr.reading));
            setOcrConfidence(ocr.confidence ?? null);
          }
        } catch {} finally {
          setOcrLoading(false);
        }
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível capturar a foto.');
    }
  };

  const calculatedDistance = (() => {
    const startKm = trip?.startOdometer ?? 0;
    const endKm = Number(endOdometer) || 0;
    return endKm >= startKm ? endKm - startKm : 0;
  })();

  const handleSubmit = async () => {
    if (!photoUri) {
      Alert.alert('Atenção', 'Tire uma foto do hodômetro para encerrar a viagem.');
      return;
    }
    if (!endOdometer?.trim() || isNaN(Number(endOdometer))) {
      Alert.alert('Atenção', 'Informe o km final válido.');
      return;
    }
    if (Number(endOdometer) < (trip?.startOdometer ?? 0)) {
      Alert.alert('Atenção', 'O km final deve ser maior ou igual ao km inicial.');
      return;
    }
    if (lat == null || lng == null) {
      Alert.alert('Atenção', 'Aguarde a obtenção da localização.');
      return;
    }

    setSubmitting(true);
    try {
      await endTripApi(tripId, {
        endLat: lat,
        endLng: lng,
        endAddress: endAddress?.trim() || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        endOdometer: Number(endOdometer),
        endOdometerPhotoId: photoFileId ?? undefined,
      });
      Alert.alert('Viagem Encerrada', `Distância percorrida: ${calculatedDistance} km`, [
        { text: 'Voltar ao Início', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch (e: any) {
      Alert.alert('Erro', e?.response?.data?.message ?? 'Erro ao encerrar viagem.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.title}>Encerrar Viagem</Text>
          </View>

          {/* Trip Summary */}
          {trip ? (
            <View style={[styles.card, styles.summaryCard]}>
              <Text style={styles.summaryPlate}>{trip?.vehiclePlate ?? '-'}</Text>
              <Text style={styles.summaryDetail}>Início: {formatDateTime(trip?.startedAt)}</Text>
              <Text style={styles.summaryDetail}>{trip?.startAddress ?? '-'}</Text>
              <Text style={styles.summaryDetail}>Km Inicial: {formatKm(trip?.startOdometer)}</Text>
            </View>
          ) : loadingTrip ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginBottom: spacing.md }} />
          ) : null}

          {/* End Location */}
          <View style={styles.card}>
            <View style={styles.locationHeader}>
              <Ionicons name="location" size={20} color={colors.error} />
              <Text style={styles.cardLabel}>Localização Final</Text>
            </View>
            {loadingLocation ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Obtendo localização...</Text>
              </View>
            ) : lat != null && lng != null ? (
              <>
                <Text style={styles.addressText}>{endAddress || 'Localização obtida'}</Text>
                <Text style={styles.coordText}>{lat.toFixed(6)}, {lng.toFixed(6)}</Text>
                <Pressable style={styles.refreshBtn} onPress={fetchLocation}>
                  <Ionicons name="refresh" size={16} color={colors.primary} />
                  <Text style={styles.refreshText}>Atualizar localização</Text>
                </Pressable>
              </>
            ) : (
              <View>
                <Text style={styles.addressText}>Localização não disponível</Text>
                <Pressable style={styles.refreshBtn} onPress={fetchLocation}>
                  <Ionicons name="refresh" size={16} color={colors.primary} />
                  <Text style={styles.refreshText}>Tentar novamente</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* End Odometer */}
          <View style={[styles.card, !photoUri && styles.cardRequired]}>
            <Text style={styles.cardLabel}>Km Final (Hodômetro) <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, styles.odometerInput]}
              value={endOdometer}
              onChangeText={setEndOdometer}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
            {ocrLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Processando leitura...</Text>
              </View>
            ) : null}
            {ocrConfidence ? (
              <Text style={styles.ocrConfidence}>
                Confiança OCR: {ocrConfidence === 'high' ? 'Alta' : ocrConfidence === 'medium' ? 'Média' : 'Baixa'}
              </Text>
            ) : null}

            {!photoUri ? (
              <View style={styles.photoRequired}>
                <Ionicons name="alert-circle" size={16} color={colors.error} />
                <Text style={styles.photoRequiredText}>Foto do hodômetro obrigatória</Text>
              </View>
            ) : null}

            <Pressable style={[styles.photoBtn, !photoUri && styles.photoBtnHighlight]} onPress={handleTakePhoto}>
              <Ionicons name="camera" size={20} color={!photoUri ? '#FFF' : colors.primary} />
              <Text style={[styles.photoBtnText, !photoUri && styles.photoBtnTextHighlight]}>Fotografar Hodômetro</Text>
            </Pressable>

            {photoUri ? (
              <View>
                <Image source={{ uri: photoUri }} style={styles.photoPreview} resizeMode="cover" />
                <View style={styles.photoOk}>
                  <Ionicons name="checkmark-circle" size={16} color="#059669" />
                  <Text style={styles.photoOkText}>Foto registrada</Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* Distance */}
          {endOdometer && Number(endOdometer) >= (trip?.startOdometer ?? 0) ? (
            <View style={styles.distanceCard}>
              <Text style={styles.distanceLabel}>Distância percorrida</Text>
              <Text style={styles.distanceValue}>{calculatedDistance} km</Text>
            </View>
          ) : null}

          <GradientButton
            title="Encerrar Viagem"
            onPress={handleSubmit}
            loading={submitting}
            disabled={loadingLocation || loadingTrip}
            icon={<Ionicons name="flag" size={20} color="#FFF" />}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  backBtn: { padding: spacing.sm, marginRight: spacing.sm },
  title: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  card: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, ...shadows, marginBottom: spacing.md },
  summaryCard: { borderLeftWidth: 4, borderLeftColor: colors.primary },
  summaryPlate: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  summaryDetail: { fontSize: 14, color: colors.textSecondary, marginBottom: 2 },
  locationHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  cardLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  loadingText: { fontSize: 14, color: colors.textSecondary },
  addressText: { fontSize: 14, color: colors.textPrimary },
  coordText: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  refreshBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm, paddingVertical: 4 },
  refreshText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.sm, padding: 12, fontSize: 16, color: colors.textPrimary, backgroundColor: colors.background },
  odometerInput: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: spacing.sm },
  ocrConfidence: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.sm },
  photoActions: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  photoBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, borderWidth: 1, borderColor: colors.primary, borderRadius: borderRadius.sm, backgroundColor: '#F0FDFA' },
  photoBtnHighlight: { backgroundColor: colors.primary },
  photoBtnText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  photoBtnTextHighlight: { color: '#FFF' },
  photoPreview: { width: '100%', height: 150, borderRadius: borderRadius.sm, marginTop: spacing.sm },
  photoRequired: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm, backgroundColor: '#FEF2F2', padding: 8, borderRadius: borderRadius.sm },
  photoRequiredText: { fontSize: 13, color: colors.error, fontWeight: '500' },
  photoOk: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.xs },
  photoOkText: { fontSize: 13, color: '#059669', fontWeight: '500' },
  required: { color: colors.error, fontSize: 14 },
  cardRequired: { borderWidth: 1, borderColor: '#FCA5A5' },
  distanceCard: { backgroundColor: '#F0FDFA', borderRadius: borderRadius.lg, padding: spacing.md, alignItems: 'center', marginBottom: spacing.md, borderWidth: 1, borderColor: colors.primary },
  distanceLabel: { fontSize: 14, color: colors.textSecondary },
  distanceValue: { fontSize: 32, fontWeight: '700', color: colors.primary },
});
