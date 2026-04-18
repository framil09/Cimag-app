import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { colors, spacing, borderRadius } from '../theme';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Erro inesperado</Text>
          <Text style={styles.message}>Algo deu errado. Tente novamente.</Text>
          <ScrollView style={styles.errorBox}>
            <Text style={styles.errorText}>{this.state.error?.message ?? 'Erro desconhecido'}</Text>
          </ScrollView>
          <Pressable
            style={styles.button}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.buttonText}>Tentar Novamente</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg, backgroundColor: colors.background },
  title: { fontSize: 22, fontWeight: '700', color: colors.error, marginBottom: spacing.sm },
  message: { fontSize: 16, color: colors.textSecondary, marginBottom: spacing.md, textAlign: 'center' },
  errorBox: { maxHeight: 120, marginBottom: spacing.md, padding: spacing.sm, backgroundColor: '#FEF2F2', borderRadius: borderRadius.sm },
  errorText: { fontSize: 13, color: colors.error },
  button: { backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm + 4, borderRadius: borderRadius.md },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
