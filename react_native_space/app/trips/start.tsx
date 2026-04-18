import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView, Alert, Platform,
  KeyboardAvoidingView, Pressable, ActivityIndicator, Image,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, borderRadius, shadows } from '../../src/theme';
import { GradientButton } from '../../src/components/GradientButton';
import { startTrip } from '../../src/services/trips';
import { reverseGeocode } from '../../src/services/geocode';
import { extractOdometerReading } from '../../src/services/ocr';
import { uploadFileToS3 } from '../../src/services/upload';

export default function StartTripScreen() {
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [startOdometer, setStartOdometer] = useState('');
  const [startAddress, setStartAddress] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoFileId, setPhotoFileId] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrConfidence, setOcrConfidence] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [locationError, setLocationError] = useState(false);

  const fetchLocation = async () => {
    setLoadingLocation(true);
    setLocationError(false);
    try {
      // On web, try browser geolocation directly for reliability
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
          setStartAddress(geo?.address ?? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } catch {
          setStartAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão negada', 'Precisamos da localização para registrar a viagem.');
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
            setStartAddress(geo?.address ?? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          } catch {
            setStartAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        } else {
          setLocationError(true);
        }
      }
    } catch (e) {
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
        Alert.alert('Permissão negada', 'Precisamos da câmera para fotografar o hodômetro.');
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

      // Upload photo
      if (asset.uri) {
        try {
          const fileRecord = await uploadFileToS3(asset.uri, `odometer_start_${Date.now()}.jpg`, 'image/jpeg');
          setPhotoFileId(fileRecord?.id ?? null);
        } catch {
          // Photo upload failed, continue without
        }
      }

      // OCR
      if (asset.base64) {
        setOcrLoading(true);
        try {
          const ocr = await extractOdometerReading(asset.base64);
          if (ocr?.reading != null) {
            setStartOdometer(String(ocr.reading));
            setOcrConfidence(ocr.confidence ?? null);
          }
        } catch {
          // OCR failed, user can enter manually
        } finally {
          setOcrLoading(false);
        }
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível capturar a foto.');
    }
  };

  const handleSubmit = async () => {
    if (!vehiclePlate?.trim()) {
      Alert.alert('Atenção', 'Informe a placa do veículo.');
      return;
    }
    if (!purpose?.trim()) {
      Alert.alert('Atenção', 'Informe a finalidade da viagem.');
      return;
    }
    if (!photoUri) {
      Alert.alert('Atenção', 'Tire uma foto do hodômetro para iniciar a viagem.');
      return;
    }
    if (!startOdometer?.trim() || isNaN(Number(startOdometer))) {
      Alert.alert('Atenção', 'Informe o km inicial válido.');
      return;
    }
    if (lat == null || lng == null) {
      Alert.alert('Atenção', 'Aguarde a obtenção da localização.');
      return;
    }

    setSubmitting(true);
    try {
      await startTrip({
        vehiclePlate: vehiclePlate.trim().toUpperCase(),
        purpose: purpose.trim(),
        startLat: lat,
        startLng: lng,
        startAddress: startAddress?.trim() || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        startOdometer: Number(startOdometer),
        startOdometerPhotoId: photoFileId ?? undefined,
      });
      Alert.alert('Sucesso', 'Viagem iniciada com sucesso!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch (e: any) {
      Alert.alert('Erro', e?.response?.data?.message ?? 'Erro ao iniciar viagem.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.title}>Iniciar Viagem</Text>
          </View>

          {/* Vehicle Plate */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Placa do Veículo</Text>
            <TextInput
              style={styles.input}
              value={vehiclePlate}
              onChangeText={setVehiclePlate}
              placeholder="ABC-1D23"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="characters"
              accessibilityLabel="Placa do Veículo"
            />
          </View>

          {/* Purpose */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Finalidade da Viagem <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, styles.textArea, !purpose?.trim() && styles.inputRequired]}
              value={purpose}
              onChangeText={setPurpose}
              placeholder="Visita técnica ao município de..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              accessibilityLabel="Finalidade da Viagem"
            />
          </View>

          {/* Location */}
          <View style={[styles.card, styles.locationCard]}>
            <View style={styles.locationHeader}>
              <Ionicons name="location" size={20} color={colors.primary} />
              <Text style={styles.cardLabel}>Localização Inicial</Text>
            </View>
            {loadingLocation ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Obtendo localização...</Text>
              </View>
            ) : lat != null && lng != null ? (
              <>
                <Text style={styles.addressText}>{startAddress || 'Localização obtida'}</Text>
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

          {/* Odometer */}
          <View style={[styles.card, !photoUri && styles.cardRequired]}>
            <Text style={styles.cardLabel}>Km Inicial (Hodômetro) <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, styles.odometerInput]}
              value={startOdometer}
              onChangeText={setStartOdometer}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              accessibilityLabel="Km Inicial"
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

          <GradientButton
            title="Iniciar Viagem"
            onPress={handleSubmit}
            loading={submitting}
            disabled={loadingLocation}
            icon={<Ionicons name="car" size={20} color="#FFF" />}
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
  inputContainer: { marginBottom: spacing.md },
  label: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.sm,
    padding: 12, fontSize: 16, color: colors.textPrimary, backgroundColor: colors.surface,
  },
  textArea: { minHeight: 80 },
  card: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.md, ...shadows, marginBottom: spacing.md,
  },
  locationCard: {},
  locationHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  cardLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  loadingText: { fontSize: 14, color: colors.textSecondary },
  addressText: { fontSize: 14, color: colors.textPrimary, marginBottom: 4 },
  coordText: { fontSize: 12, color: colors.textSecondary },
  refreshBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm, paddingVertical: 4 },
  refreshText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  odometerInput: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: spacing.sm },
  ocrConfidence: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.sm },
  photoActions: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  photoBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, padding: 10, borderWidth: 1, borderColor: colors.primary,
    borderRadius: borderRadius.sm, backgroundColor: '#F0FDFA',
  },
  photoBtnHighlight: { backgroundColor: colors.primary },
  photoBtnText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  photoBtnTextHighlight: { color: '#FFF' },
  photoPreview: { width: '100%', height: 150, borderRadius: borderRadius.sm },
  photoRequired: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm, backgroundColor: '#FEF2F2', padding: 8, borderRadius: borderRadius.sm },
  photoRequiredText: { fontSize: 13, color: colors.error, fontWeight: '500' },
  photoOk: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.xs },
  photoOkText: { fontSize: 13, color: '#059669', fontWeight: '500' },
  required: { color: colors.error, fontSize: 14 },
  inputRequired: { borderColor: '#FCA5A5' },
  cardRequired: { borderWidth: 1, borderColor: '#FCA5A5' },
});
