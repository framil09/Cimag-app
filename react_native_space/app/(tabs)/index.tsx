import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, Image,
} from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { GradientButton } from '../../src/components/GradientButton';
import { colors, spacing, borderRadius, shadows } from '../../src/theme';
import { getActiveTrip, getMonthlyStats, listTrips, Trip, MonthlyStats } from '../../src/services/trips';
import { formatDateTime, formatKm, truncateAddress, formatRelative } from '../../src/utils/formatters';

export default function HomeScreen() {
  const { user } = useAuth();
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [activeRes, statsRes, tripsRes] = await Promise.all([
        getActiveTrip().catch(() => ({ trip: null })),
        getMonthlyStats().catch(() => ({ tripCount: 0, totalKm: 0, month: 0, year: 0 })),
        listTrips({ page: 1, limit: 3 }).catch(() => ({ items: [], total: 0, page: 1, totalPages: 0 })),
      ]);
      setActiveTrip(activeRes?.trip ?? null);
      setStats(statsRes ?? null);
      setRecentTrips(tripsRes?.items ?? []);
    } catch {
      // handled individually
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Image source={require('../../assets/images/cimag-logo.png')} style={styles.headerLogo} resizeMode="contain" />
          <Text style={styles.greeting}>Olá, {user?.name?.split(' ')?.[0] ?? 'Usuário'}</Text>
        </View>

        {/* Active Trip */}
        {activeTrip ? (
          <View style={[styles.card, styles.activeTripCard]}>
            <View style={styles.activeBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.activeBadgeText}>Viagem em andamento</Text>
            </View>
            <Text style={styles.activePlate}>{activeTrip?.vehiclePlate ?? '-'}</Text>
            <Text style={styles.activeDetail}>Início: {formatDateTime(activeTrip?.startedAt)}</Text>
            <Text style={styles.activeDetail}>{truncateAddress(activeTrip?.startAddress, 50)}</Text>
            <GradientButton
              title="Encerrar Viagem"
              onPress={() => router.push({ pathname: '/trips/end', params: { tripId: activeTrip?.id } })}
              style={styles.endBtn}
              icon={<Ionicons name="flag" size={18} color="#FFF" />}
            />
          </View>
        ) : (
          <GradientButton
            title="Iniciar Nova Viagem"
            onPress={() => router.push('/trips/start')}
            style={styles.startBtn}
            icon={<Ionicons name="car" size={20} color="#FFF" />}
          />
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.card, styles.statCard]}>
            <View style={styles.statIconWrap}>
              <Ionicons name="car" size={22} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{stats?.tripCount ?? 0}</Text>
            <Text style={styles.statLabel}>Viagens este mês</Text>
          </View>
          <View style={[styles.card, styles.statCard]}>
            <View style={styles.statIconWrap}>
              <Ionicons name="speedometer" size={22} color={colors.accent} />
            </View>
            <Text style={[styles.statValue, { color: colors.accent }]}>{formatKm(stats?.totalKm)}</Text>
            <Text style={styles.statLabel}>Km este mês</Text>
          </View>
        </View>

        {/* Recent Trips */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Viagens Recentes</Text>
          <Pressable onPress={() => router.push('/(tabs)/history')}>
            <Text style={styles.seeAll}>Ver todas</Text>
          </Pressable>
        </View>

        {(recentTrips?.length ?? 0) === 0 && !loading ? (
          <View style={styles.emptyRecent}>
            <Ionicons name="car-outline" size={40} color={colors.border} />
            <Text style={styles.emptyText}>Nenhuma viagem registrada</Text>
            <Text style={styles.emptySubText}>Inicie sua primeira viagem acima</Text>
          </View>
        ) : null}

        {(recentTrips ?? []).map((trip) => (
          <Pressable
            key={trip?.id}
            style={({ pressed }) => [styles.card, styles.tripCard, pressed && styles.pressed]}
            onPress={() => router.push({ pathname: '/trips/[id]', params: { id: trip?.id } })}
          >
            <View style={styles.tripRow}>
              <Text style={styles.tripPlate}>{trip?.vehiclePlate ?? '-'}</Text>
              <Text style={styles.tripDate}>{formatRelative(trip?.startedAt)}</Text>
            </View>
            <Text style={styles.tripRoute} numberOfLines={1}>
              {truncateAddress(trip?.startAddress)} → {truncateAddress(trip?.endAddress)}
            </Text>
            <Text style={styles.tripKm}>{formatKm(trip?.distance)} km</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  headerLogo: { width: 100, height: 40, marginRight: spacing.sm },
  greeting: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows,
    marginBottom: spacing.md,
  },
  activeTripCard: { borderLeftWidth: 4, borderLeftColor: colors.success },
  activeBadge: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  pulseDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.success, marginRight: spacing.sm },
  activeBadgeText: { fontSize: 14, fontWeight: '600', color: colors.success },
  activePlate: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  activeDetail: { fontSize: 14, color: colors.textSecondary, marginBottom: 2 },
  endBtn: { marginTop: spacing.md },
  startBtn: { marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  statCard: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.lg },
  statIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#F0FDFA',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: { fontSize: 28, fontWeight: '700', color: colors.primary },
  statLabel: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm, marginTop: spacing.sm },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  seeAll: { fontSize: 14, fontWeight: '600', color: colors.primary },
  emptyRecent: { alignItems: 'center', padding: spacing.xl, gap: spacing.sm },
  emptyText: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
  emptySubText: { fontSize: 13, color: colors.textSecondary },
  tripCard: { paddingVertical: spacing.sm + 4 },
  tripRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  tripPlate: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  tripDate: { fontSize: 12, color: colors.textSecondary },
  tripRoute: { fontSize: 13, color: colors.textSecondary, marginBottom: 4 },
  tripKm: { fontSize: 14, fontWeight: '600', color: colors.accent },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
});
