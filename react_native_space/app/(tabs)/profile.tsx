import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Alert, Image, ScrollView, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/contexts/AuthContext';
import { GradientButton } from '../../src/components/GradientButton';
import { colors, spacing, borderRadius, shadows } from '../../src/theme';

export default function ProfileScreen() {
  const { user, updateUser, logout } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSave = async () => {
    if (!name?.trim()) {
      Alert.alert('Atenção', 'O nome não pode estar vazio.');
      return;
    }
    setSaving(true);
    try {
      await updateUser(name.trim());
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (e: any) {
      Alert.alert('Erro', e?.response?.data?.message ?? 'Erro ao atualizar perfil.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            try {
              await logout();
            } catch {
              // ignore
            }
          },
        },
      ],
    );
  };

  const initials = (user?.name ?? 'U')
    .split(' ')
    .map((w) => w?.[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Perfil</Text>

        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarRing}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </LinearGradient>
          <Text style={styles.avatarName}>{user?.name ?? 'Usuário'}</Text>
          <Text style={styles.avatarEmail}>{user?.email ?? ''}</Text>
          <View style={[styles.roleBadge, user?.role === 'gestor' ? styles.roleBadgeGestor : styles.roleBadgeMotorista]}>
            <Ionicons
              name={user?.role === 'gestor' ? 'shield-checkmark' : 'car'}
              size={14}
              color={user?.role === 'gestor' ? '#1E40AF' : '#065F46'}
            />
            <Text style={[styles.roleBadgeText, user?.role === 'gestor' ? styles.roleTextGestor : styles.roleTextMotorista]}>
              {user?.role === 'gestor' ? 'Gestor' : 'Motorista'}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Seu nome"
              placeholderTextColor={colors.textSecondary}
              accessibilityLabel="Nome"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>E-mail</Text>
            <View style={[styles.input, styles.readOnly]}>
              <Text style={styles.readOnlyText}>{user?.email ?? '-'}</Text>
            </View>
          </View>

          <GradientButton title="Salvar Perfil" onPress={handleSave} loading={saving} />
        </View>

        <Pressable style={styles.logoutBtn} onPress={handleLogout} disabled={loggingOut}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>{loggingOut ? 'Saindo...' : 'Sair da Conta'}</Text>
        </Pressable>

        <View style={styles.footer}>
          <Image source={require('../../assets/images/cimag-logo.png')} style={styles.footerLogo} resizeMode="contain" />
          <Text style={styles.version}>Versão 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  title: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.lg },
  avatarContainer: { alignItems: 'center', marginBottom: spacing.lg },
  avatarRing: {
    width: 92, height: 92, borderRadius: 46,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: colors.primary },
  avatarName: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  avatarEmail: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  roleBadgeGestor: { backgroundColor: '#DBEAFE', borderWidth: 1, borderColor: '#93C5FD' },
  roleBadgeMotorista: { backgroundColor: '#D1FAE5', borderWidth: 1, borderColor: '#6EE7B7' },
  roleBadgeText: { fontSize: 12, fontWeight: '600' },
  roleTextGestor: { color: '#1E40AF' },
  roleTextMotorista: { color: '#065F46' },
  card: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, ...shadows, marginBottom: spacing.lg },
  inputContainer: { marginBottom: spacing.md },
  label: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.sm, padding: 12, fontSize: 16, color: colors.textPrimary, backgroundColor: colors.background },
  readOnly: { backgroundColor: '#E2E8F0' },
  readOnlyText: { fontSize: 16, color: colors.textSecondary },
  logoutBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: borderRadius.md,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: colors.error },
  footer: { alignItems: 'center' },
  footerLogo: { width: 120, height: 50, marginBottom: spacing.sm },
  version: { fontSize: 12, color: colors.textSecondary },
});
