import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, TextInput, RefreshControl, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadows } from '../../src/theme';
import { listTrips, Trip } from '../../src/services/trips';
import { formatDateTime, formatKm, truncateAddress } from '../../src/utils/formatters';
import { EmptyState } from '../../src/components/EmptyState';

export default function HistoryScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vehicleFilter, setVehicleFilter] = useState('');

  const fetchTrips = useCallback(async (p = 1, append = false) => {
    try {
      const params: Record<string, any> = { page: p, limit: 20 };
      if (vehicleFilter?.trim()) params.vehiclePlate = vehicleFilter.trim().toUpperCase();
      const res = await listTrips(params);
      setTrips(prev => append ? [...(prev ?? []), ...(res?.items ?? [])] : (res?.items ?? []));
      setPage(res?.page ?? 1);
      setTotalPages(res?.totalPages ?? 1);
    } catch {
      if (!append) setTrips([]);
    } finally {
      setLoading(false);
    }
  }, [vehicleFilter]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchTrips(1);
    }, [fetchTrips])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTrips(1);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (page < totalPages) {
      fetchTrips(page + 1, true);
    }
  };

  const renderItem = ({ item }: { item: Trip }) => (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => {
        if (Platform.OS === 'web') (document.activeElement as HTMLElement)?.blur?.();
        router.push({ pathname: '/trips/[id]', params: { id: item?.id } });
      }}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.plate}>{item?.vehiclePlate ?? '-'}</Text>
        <View style={[styles.statusBadge, item?.status === 'active' ? styles.statusActive : styles.statusCompleted]}>
          <Text style={[styles.statusText, item?.status === 'active' ? styles.statusTextActive : styles.statusTextCompleted]}>
            {item?.status === 'active' ? 'Ativa' : 'Concluída'}
          </Text>
        </View>
      </View>
      <View style={styles.driverRow}>
        <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
        <Text style={styles.driver}>{item?.driverName ?? '-'}</Text>
      </View>
      <Text style={styles.route} numberOfLines={1}>
        {truncateAddress(item?.startAddress)} → {truncateAddress(item?.endAddress)}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.date}>{formatDateTime(item?.startedAt)}</Text>
        <Text style={styles.km}>{formatKm(item?.distance)} km</Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>Histórico de Viagens</Text>

      <View style={styles.filterRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Filtrar por placa..."
            placeholderTextColor={colors.textSecondary}
            value={vehicleFilter}
            onChangeText={setVehicleFilter}
            autoCapitalize="characters"
            onSubmitEditing={() => { setLoading(true); fetchTrips(1); }}
            returnKeyType="search"
          />
          {vehicleFilter ? (
            <Pressable onPress={() => { setVehicleFilter(''); }}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <FlatList
        data={trips ?? []}
        renderItem={renderItem}
        keyExtractor={(item) => item?.id ?? Math.random().toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={!loading ? <EmptyState icon="car-outline" message="Nenhuma viagem registrada" submessage="Suas viagens aparecerão aqui" /> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, padding: spacing.md, paddingBottom: 0 },
  filterRow: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.textPrimary },
  list: { padding: spacing.md, paddingTop: 0 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm + 4,
    ...shadows,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  plate: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  statusActive: { backgroundColor: '#D1FAE5' },
  statusCompleted: { backgroundColor: '#E0E7FF' },
  statusText: { fontSize: 11, fontWeight: '600' },
  statusTextActive: { color: '#065F46' },
  statusTextCompleted: { color: '#3730A3' },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  driver: { fontSize: 13, color: colors.textSecondary },
  route: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.sm },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 12, color: colors.textSecondary },
  km: { fontSize: 14, fontWeight: '700', color: colors.accent },
});
