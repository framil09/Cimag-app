import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator, Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../src/theme';
import { getTripById, deleteTrip, Trip } from '../../src/services/trips';
import { getFileUrl } from '../../src/services/upload';
import { formatDateTime, formatKm } from '../../src/utils/formatters';

export default function TripDetailScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [startPhotoUrl, setStartPhotoUrl] = useState<string | null>(null);
  const [endPhotoUrl, setEndPhotoUrl] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    getTripById(id)
      .then(async (t) => {
        setTrip(t ?? null);
        if (t?.startOdometerPhotoId) {
          try {
            const res = await getFileUrl(t.startOdometerPhotoId, 'view');
            setStartPhotoUrl(res?.url ?? null);
          } catch {}
        }
        if (t?.endOdometerPhotoId) {
          try {
            const res = await getFileUrl(t.endOdometerPhotoId, 'view');
            setEndPhotoUrl(res?.url ?? null);
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = () => {
    Alert.alert(
      'Excluir Viagem',
      'Tem certeza que deseja excluir esta viagem? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteTrip(id);
              Alert.alert('Sucesso', 'Viagem excluída.', [
                { text: 'OK', onPress: () => router.replace('/(tabs)/history') },
              ]);
            } catch (e: any) {
              Alert.alert('Erro', e?.response?.data?.message ?? 'Erro ao excluir viagem.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  if (!trip) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.title}>Viagem não encontrada</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.title}>Detalhes da Viagem</Text>
        </View>

        {/* Status */}
        <View style={[styles.statusBadge, trip?.status === 'active' ? styles.statusActive : styles.statusCompleted]}>
          <Ionicons name={trip?.status === 'active' ? 'radio-button-on' : 'checkmark-circle'} size={14} color={trip?.status === 'active' ? '#065F46' : '#3730A3'} />
          <Text style={[styles.statusText, trip?.status === 'active' ? { color: '#065F46' } : { color: '#3730A3' }]}>
            {trip?.status === 'active' ? 'Ativa' : 'Concluída'}
          </Text>
        </View>

        {/* Info Cards */}
        <View style={styles.card}>
          <InfoRow icon="calendar" label="Data e Hora" value={`${formatDateTime(trip?.startedAt)}${trip?.endedAt ? ` → ${formatDateTime(trip?.endedAt)}` : ''}`} />
          <InfoRow icon="car" label="Placa" value={trip?.vehiclePlate ?? '-'} />
          <InfoRow icon="person" label="Motorista" value={trip?.driverName ?? '-'} />
          <InfoRow icon="document-text" label="Finalidade" value={trip?.purpose ?? '-'} />
        </View>

        {/* Route */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Rota</Text>
          <View style={styles.routeTimeline}>
            <View style={styles.routeRow}>
              <View style={styles.routeDotCol}>
                <Ionicons name="ellipse" size={12} color={colors.success} />
                {trip?.endAddress ? <View style={styles.routeLine} /> : null}
              </View>
              <Text style={styles.routeText}>{trip?.startAddress ?? '-'}</Text>
            </View>
            {trip?.endAddress ? (
              <View style={styles.routeRow}>
                <View style={styles.routeDotCol}>
                  <Ionicons name="ellipse" size={12} color={colors.error} />
                </View>
                <Text style={styles.routeText}>{trip.endAddress}</Text>
              </View>
            ) : null}
          </View>
          {trip?.distance != null ? (
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceText}>{formatKm(trip.distance)} km</Text>
            </View>
          ) : null}
        </View>

        {/* Odometer */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hodômetro</Text>
          <View style={styles.odometerRow}>
            <View style={styles.odometerCol}>
              <Text style={styles.odometerLabel}>Km Inicial</Text>
              <Text style={styles.odometerValue}>{formatKm(trip?.startOdometer)}</Text>
              {startPhotoUrl ? (
                <Image source={{ uri: startPhotoUrl }} style={styles.odometerPhoto} resizeMode="cover" />
              ) : null}
            </View>
            <View style={styles.odometerCol}>
              <Text style={styles.odometerLabel}>Km Final</Text>
              <Text style={styles.odometerValue}>{trip?.endOdometer != null ? formatKm(trip.endOdometer) : '-'}</Text>
              {endPhotoUrl ? (
                <Image source={{ uri: endPhotoUrl }} style={styles.odometerPhoto} resizeMode="cover" />
              ) : null}
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <Pressable
            style={styles.editBtn}
            onPress={() => router.push({ pathname: '/trips/edit/[id]', params: { id: trip?.id } })}
          >
            <Ionicons name="pencil" size={18} color={colors.primary} />
            <Text style={styles.editBtnText}>Editar</Text>
          </Pressable>
          <Pressable style={styles.deleteBtn} onPress={handleDelete} disabled={deleting}>
            <Ionicons name="trash" size={18} color={colors.error} />
            <Text style={styles.deleteBtnText}>{deleting ? 'Excluindo...' : 'Excluir'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={infoStyles.row}>
      <Ionicons name={icon as any} size={18} color={colors.textSecondary} />
      <View style={infoStyles.textCol}>
        <Text style={infoStyles.label}>{label}</Text>
        <Text style={infoStyles.value}>{value}</Text>
      </View>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm + 4 },
  textCol: { flex: 1 },
  label: { fontSize: 12, color: colors.textSecondary },
  value: { fontSize: 15, color: colors.textPrimary, fontWeight: '500' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  backBtn: { padding: spacing.sm, marginRight: spacing.sm },
  title: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  statusBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginBottom: spacing.md },
  statusActive: { backgroundColor: '#D1FAE5' },
  statusCompleted: { backgroundColor: '#E0E7FF' },
  statusText: { fontSize: 13, fontWeight: '600' },
  card: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, ...shadows, marginBottom: spacing.md },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  routeTimeline: { gap: 0 },
  routeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, minHeight: 36 },
  routeDotCol: { alignItems: 'center', width: 14, paddingTop: 2 },
  routeLine: { width: 2, flex: 1, backgroundColor: colors.border, marginVertical: 2, minHeight: 16 },
  routeText: { flex: 1, fontSize: 14, color: colors.textPrimary },
  distanceBadge: { alignSelf: 'flex-start', backgroundColor: '#F0FDFA', paddingHorizontal: 12, paddingVertical: 6, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: colors.primary, marginTop: 4 },
  distanceText: { fontSize: 16, fontWeight: '700', color: colors.primary },
  odometerRow: { flexDirection: 'row', gap: spacing.md },
  odometerCol: { flex: 1, alignItems: 'center' },
  odometerLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  odometerValue: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  odometerPhoto: { width: '100%', height: 100, borderRadius: borderRadius.sm },
  actionsRow: { flexDirection: 'row', gap: spacing.md },
  editBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12, borderWidth: 1, borderColor: colors.primary, borderRadius: borderRadius.md },
  editBtnText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  deleteBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12, borderWidth: 1, borderColor: colors.error, borderRadius: borderRadius.md },
  deleteBtnText: { fontSize: 14, fontWeight: '600', color: colors.error },
});
