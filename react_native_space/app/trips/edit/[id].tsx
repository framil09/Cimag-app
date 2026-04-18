import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView, Alert, Platform,
  KeyboardAvoidingView, Pressable, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../../src/theme';
import { GradientButton } from '../../../src/components/GradientButton';
import { getTripById, updateTrip, Trip } from '../../../src/services/trips';

export default function EditTripScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [vehiclePlate, setVehiclePlate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [startOdometer, setStartOdometer] = useState('');
  const [endOdometer, setEndOdometer] = useState('');

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    getTripById(id)
      .then((t) => {
        setTrip(t ?? null);
        setVehiclePlate(t?.vehiclePlate ?? '');
        setPurpose(t?.purpose ?? '');
        setStartAddress(t?.startAddress ?? '');
        setEndAddress(t?.endAddress ?? '');
        setStartOdometer(String(t?.startOdometer ?? ''));
        setEndOdometer(t?.endOdometer != null ? String(t.endOdometer) : '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data: Record<string, any> = {};
      if (vehiclePlate?.trim() && vehiclePlate !== trip?.vehiclePlate) data.vehiclePlate = vehiclePlate.trim();
      if (purpose?.trim() && purpose !== trip?.purpose) data.purpose = purpose.trim();
      if (startAddress?.trim() && startAddress !== trip?.startAddress) data.startAddress = startAddress.trim();
      if (endAddress?.trim() && endAddress !== trip?.endAddress) data.endAddress = endAddress.trim();
      if (startOdometer && Number(startOdometer) !== trip?.startOdometer) data.startOdometer = Number(startOdometer);
      if (endOdometer && Number(endOdometer) !== trip?.endOdometer) data.endOdometer = Number(endOdometer);

      await updateTrip(id, data);
      Alert.alert('Sucesso', 'Viagem atualizada!', [
        { text: 'OK', onPress: () => router.canGoBack() ? router.back() : router.replace('/(tabs)') },
      ]);
    } catch (e: any) {
      Alert.alert('Erro', e?.response?.data?.message ?? 'Erro ao atualizar viagem.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.title}>Editar Viagem</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Placa do Veículo</Text>
            <TextInput style={styles.input} value={vehiclePlate} onChangeText={setVehiclePlate} autoCapitalize="characters" />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Finalidade</Text>
            <TextInput style={[styles.input, styles.textArea]} value={purpose} onChangeText={setPurpose} multiline numberOfLines={3} textAlignVertical="top" />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Endereço Inicial</Text>
            <TextInput style={styles.input} value={startAddress} onChangeText={setStartAddress} />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Endereço Final</Text>
            <TextInput style={styles.input} value={endAddress} onChangeText={setEndAddress} />
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Km Inicial</Text>
              <TextInput style={styles.input} value={startOdometer} onChangeText={setStartOdometer} keyboardType="numeric" />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Km Final</Text>
              <TextInput style={styles.input} value={endOdometer} onChangeText={setEndOdometer} keyboardType="numeric" />
            </View>
          </View>

          <GradientButton title="Salvar Alterações" onPress={handleSave} loading={saving} style={styles.saveBtn} />

          <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
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
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.sm, padding: 12, fontSize: 16, color: colors.textPrimary, backgroundColor: colors.surface },
  textArea: { minHeight: 80 },
  row: { flexDirection: 'row', gap: spacing.sm },
  halfInput: { flex: 1, marginBottom: spacing.md },
  saveBtn: { marginTop: spacing.md },
  cancelBtn: { alignItems: 'center', marginTop: spacing.md },
  cancelText: { fontSize: 16, color: colors.textSecondary },
});
