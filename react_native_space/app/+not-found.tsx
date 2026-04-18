import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../src/theme';

export default function NotFound() {
  return (
    <View style={styles.container}>
      <Ionicons name="compass-outline" size={64} color={colors.border} />
      <Text style={styles.title}>Página não encontrada</Text>
      <Text style={styles.subtitle}>O conteúdo que você procura não existe ou foi movido.</Text>
      <Pressable style={styles.button} onPress={() => router.replace('/')}>
        <Ionicons name="home" size={18} color="#FFF" />
        <Text style={styles.buttonText}>Voltar ao início</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: spacing.lg },
  title: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.md, marginBottom: spacing.sm },
  subtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg },
  button: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.md,
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
