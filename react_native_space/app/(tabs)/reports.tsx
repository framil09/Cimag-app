import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Platform, Linking,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadows } from '../../src/theme';
import { GradientButton } from '../../src/components/GradientButton';
import { DatePickerModal } from '../../src/components/DatePickerModal';
import { generateReport, listReports, getReportDownloadUrl, Report } from '../../src/services/reports';
import { formatDate, formatKm } from '../../src/utils/formatters';
import * as Sharing from 'expo-sharing';

export default function ReportsScreen() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [generating, setGenerating] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [lastResult, setLastResult] = useState<{ tripCount: number; totalKm: number; reportUrl: string } | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const applyPreset = (preset: 'thisMonth' | 'lastMonth' | 'last3Months') => {
    const now = new Date();
    let start: Date;
    let end: Date;
    if (preset === 'thisMonth') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = now;
    } else if (preset === 'lastMonth') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
    } else {
      start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      end = now;
    }
    setStartDate(start.toISOString().slice(0, 10));
    setEndDate(end.toISOString().slice(0, 10));
  };

  const fetchReports = useCallback(async () => {
    try {
      const res = await listReports(1, 10);
      setReports(res?.items ?? []);
    } catch {
      // ignore
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [fetchReports])
  );

  const handleGenerate = async () => {
    if (!startDate?.trim() || !endDate?.trim()) {
      Alert.alert('Atenção', 'Informe o período do relatório (formato: AAAA-MM-DD).');
      return;
    }
    setGenerating(true);
    setLastResult(null);
    try {
      const res = await generateReport(
        new Date(startDate.trim()).toISOString(),
        new Date(endDate.trim()).toISOString(),
        vehiclePlate?.trim() || undefined,
      );
      setLastResult({
        tripCount: res?.tripCount ?? 0,
        totalKm: res?.totalKm ?? 0,
        reportUrl: res?.reportUrl ?? '',
      });
      fetchReports();
    } catch (e: any) {
      Alert.alert('Erro', e?.response?.data?.message ?? 'Erro ao gerar relatório.');
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = async (url: string) => {
    try {
      if (Platform.OS === 'web') {
        window.open(url, '_blank');
      } else {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(url);
        } else {
          Linking.openURL(url);
        }
      }
    } catch {
      Linking.openURL(url);
    }
  };

  const handleDownloadReport = async (reportId: string) => {
    try {
      const res = await getReportDownloadUrl(reportId);
      const url = res?.url;
      if (url) {
        if (Platform.OS === 'web') {
          window.open(url, '_blank');
        } else {
          Linking.openURL(url);
        }
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível obter o relatório.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Relatórios</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Gerar Novo Relatório</Text>

          {/* Quick presets */}
          <View style={styles.presetRow}>
            <Pressable style={styles.presetBtn} onPress={() => applyPreset('thisMonth')}>
              <Text style={styles.presetText}>Este mês</Text>
            </Pressable>
            <Pressable style={styles.presetBtn} onPress={() => applyPreset('lastMonth')}>
              <Text style={styles.presetText}>Mês anterior</Text>
            </Pressable>
            <Pressable style={styles.presetBtn} onPress={() => applyPreset('last3Months')}>
              <Text style={styles.presetText}>Últimos 3 meses</Text>
            </Pressable>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Data Início</Text>
              <Pressable style={styles.dateField} onPress={() => setShowStartPicker(true)}>
                <Ionicons name="calendar-outline" size={18} color={startDate ? colors.primary : colors.textSecondary} />
                <Text style={[styles.dateFieldText, !startDate && styles.dateFieldPlaceholder]}>
                  {startDate ? startDate.split('-').reverse().join('/') : 'Selecionar data'}
                </Text>
              </Pressable>
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Data Fim</Text>
              <Pressable style={styles.dateField} onPress={() => setShowEndPicker(true)}>
                <Ionicons name="calendar-outline" size={18} color={endDate ? colors.primary : colors.textSecondary} />
                <Text style={[styles.dateFieldText, !endDate && styles.dateFieldPlaceholder]}>
                  {endDate ? endDate.split('-').reverse().join('/') : 'Selecionar data'}
                </Text>
              </Pressable>
            </View>
          </View>

          <DatePickerModal
            visible={showStartPicker}
            onClose={() => setShowStartPicker(false)}
            onSelect={setStartDate}
            initialDate={startDate}
            title="Data Início"
          />
          <DatePickerModal
            visible={showEndPicker}
            onClose={() => setShowEndPicker(false)}
            onSelect={setEndDate}
            initialDate={endDate}
            title="Data Fim"
          />

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Placa do Veículo (opcional)</Text>
            <TextInput
              style={styles.input}
              value={vehiclePlate}
              onChangeText={setVehiclePlate}
              placeholder="Todos os veículos"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="characters"
            />
          </View>

          <GradientButton
            title="Gerar Relatório PDF"
            onPress={handleGenerate}
            loading={generating}
            icon={<Ionicons name="document-text" size={18} color="#FFF" />}
          />

          {lastResult ? (
            <View style={styles.resultBox}>
              <Text style={styles.resultText}>
                Relatório gerado: {lastResult.tripCount} viagens, {formatKm(lastResult.totalKm)} km
              </Text>
              <Pressable
                style={styles.shareBtn}
                onPress={() => handleShare(lastResult.reportUrl)}
              >
                <Ionicons name="share-outline" size={18} color={colors.primary} />
                <Text style={styles.shareBtnText}>Compartilhar / Baixar</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>Relatórios Anteriores</Text>
        {(reports?.length ?? 0) === 0 ? (
          <Text style={styles.emptyText}>Nenhum relatório gerado</Text>
        ) : null}
        {(reports ?? []).map((r) => (
          <Pressable key={r?.id} style={styles.reportCard} onPress={() => handleDownloadReport(r?.id)}>
            <View style={styles.reportRow}>
              <Ionicons name="document" size={20} color={colors.accent} />
              <View style={styles.reportInfo}>
                <Text style={styles.reportPeriod}>
                  {formatDate(r?.startDate)} - {formatDate(r?.endDate)}
                </Text>
                <Text style={styles.reportMeta}>
                  {r?.tripCount ?? 0} viagens • {formatKm(r?.totalKm)} km
                  {r?.vehiclePlate ? ` • ${r.vehiclePlate}` : ''}
                </Text>
              </View>
              <Ionicons name="download-outline" size={20} color={colors.textSecondary} />
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  title: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, ...shadows, marginBottom: spacing.lg },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },
  presetRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md, flexWrap: 'wrap' },
  presetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  presetText: { fontSize: 12, fontWeight: '600', color: colors.primary },
  inputRow: { flexDirection: 'row', gap: spacing.sm },
  inputHalf: { flex: 1, marginBottom: spacing.md },
  inputContainer: { marginBottom: spacing.md },
  label: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.sm, padding: 10, fontSize: 14, color: colors.textPrimary, backgroundColor: colors.background },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: 10,
    backgroundColor: colors.background,
  },
  dateFieldText: { fontSize: 14, color: colors.textPrimary },
  dateFieldPlaceholder: { color: colors.textSecondary },
  resultBox: { marginTop: spacing.md, padding: spacing.sm, backgroundColor: '#D1FAE5', borderRadius: borderRadius.sm },
  resultText: { fontSize: 14, fontWeight: '600', color: '#065F46', marginBottom: spacing.sm },
  shareBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  shareBtnText: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  emptyText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', padding: spacing.lg },
  reportCard: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, ...shadows },
  reportRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  reportInfo: { flex: 1 },
  reportPeriod: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  reportMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});
