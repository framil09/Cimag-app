import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';

interface Props {
  icon?: string;
  message: string;
  submessage?: string;
}

export function EmptyState({ icon = 'document-text-outline', message, submessage }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon as any} size={64} color={colors.border} />
      <Text style={styles.message}>{message}</Text>
      {submessage ? <Text style={styles.sub}>{submessage}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  message: { fontSize: 18, fontWeight: '600', color: colors.textSecondary, marginTop: spacing.md, textAlign: 'center' },
  sub: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' },
});
