import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, Pressable, Image,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { GradientButton } from '../../src/components/GradientButton';
import { colors, spacing, borderRadius, shadows } from '../../src/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignupScreen() {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!name?.trim() || !email?.trim() || !password || !confirmPassword) {
      setError('Preencha todos os campos.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }
    if ((password?.length ?? 0) < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signup(name.trim(), email.trim(), password);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? 'Erro ao criar conta.';
      setError(typeof msg === 'string' ? msg : 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Image source={require('../../assets/images/cimag-logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Criar Conta</Text>

          <View style={styles.form}>
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nome Completo</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Seu nome" placeholderTextColor={colors.textSecondary} accessibilityLabel="Nome Completo" />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="seu@email.com" placeholderTextColor={colors.textSecondary} keyboardType="email-address" autoCapitalize="none" accessibilityLabel="E-mail" />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Senha</Text>
              <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Mínimo 6 caracteres" placeholderTextColor={colors.textSecondary} secureTextEntry accessibilityLabel="Senha" />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmar Senha</Text>
              <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Repita a senha" placeholderTextColor={colors.textSecondary} secureTextEntry accessibilityLabel="Confirmar Senha" />
            </View>

            <GradientButton title="Cadastrar" onPress={handleSignup} loading={loading} style={styles.button} />

            <Pressable onPress={() => router.back()} style={styles.linkBtn}>
              <Text style={styles.linkText}>Já tem conta? <Text style={styles.linkBold}>Faça login</Text></Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  logo: { width: 140, height: 60, alignSelf: 'center', marginBottom: spacing.md },
  title: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.lg },
  form: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: borderRadius.lg, ...shadows },
  error: { color: colors.error, fontSize: 14, textAlign: 'center', marginBottom: spacing.md, backgroundColor: '#FEF2F2', padding: spacing.sm, borderRadius: borderRadius.sm },
  inputContainer: { marginBottom: spacing.md },
  label: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.sm, padding: 12, fontSize: 16, color: colors.textPrimary, backgroundColor: colors.background },
  button: { marginTop: spacing.md },
  linkBtn: { marginTop: spacing.md, alignItems: 'center' },
  linkText: { fontSize: 14, color: colors.textSecondary },
  linkBold: { color: colors.primary, fontWeight: '600' },
});
