import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, Pressable, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, shadows } from '../../src/theme';

const HIGHLIGHTS = [
  {
    icon: 'shield-checkmark' as const,
    title: 'Gestão Pública Transparente',
    description: 'Controle de frotas com transparência e responsabilidade fiscal para os municípios consorciados.',
  },
  {
    icon: 'car' as const,
    title: 'Controle de Frotas',
    description: 'Registro digital de viagens, quilometragem e finalidade — tudo em tempo real.',
  },
  {
    icon: 'people' as const,
    title: 'Municípios Unidos',
    description: 'Força conjunta dos municípios para otimizar recursos e reduzir custos operacionais.',
  },
  {
    icon: 'document-text' as const,
    title: 'Relatórios Automatizados',
    description: 'Geração automática de relatórios de deslocamento para prestação de contas.',
  },
  {
    icon: 'location' as const,
    title: 'Rastreamento GPS',
    description: 'Registro automático de localização no início e fim de cada viagem.',
  },
  {
    icon: 'camera' as const,
    title: 'Registro Fotográfico',
    description: 'Comprovação por foto do hodômetro em cada deslocamento realizado.',
  },
];

export default function CimagScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient
          colors={[colors.primary, '#065F46']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.logoContainer}>
            <Ionicons name="business" size={48} color="#FFF" />
          </View>
          <Text style={styles.heroTitle}>CIMAG</Text>
          <Text style={styles.heroSubtitle}>
            Consórcio Intermunicipal do Médio Araguaia Goiano
          </Text>
          <Text style={styles.heroTagline}>
            Integrando municípios, fortalecendo a gestão pública
          </Text>
        </LinearGradient>

        {/* About */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={22} color={colors.primary} />
            <Text style={styles.sectionTitle}>Sobre o CIMAG</Text>
          </View>
          <Text style={styles.aboutText}>
            O CIMAG — Consórcio Intermunicipal do Médio Araguaia Goiano — é uma associação pública
            formada por municípios da região do Médio Araguaia no estado de Goiás, com o objetivo de
            promover a cooperação intermunicipal para o desenvolvimento regional sustentável.
          </Text>
          <Text style={styles.aboutText}>
            Através da gestão compartilhada de recursos e serviços, o CIMAG busca otimizar a
            administração pública, reduzir custos e ampliar a capacidade de atendimento às
            demandas da população dos municípios consorciados.
          </Text>
        </View>

        {/* App Purpose */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="phone-portrait" size={22} color={colors.primary} />
            <Text style={styles.sectionTitle}>Este Aplicativo</Text>
          </View>
          <Text style={styles.aboutText}>
            O aplicativo CIMAG foi desenvolvido para o controle e registro de deslocamentos
            dos veículos oficiais do consórcio. Cada viagem é documentada com:
          </Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
              <Text style={styles.featureText}>Localização GPS automática (início e fim)</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
              <Text style={styles.featureText}>Foto obrigatória do hodômetro</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
              <Text style={styles.featureText}>Registro da finalidade da viagem</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
              <Text style={styles.featureText}>Cálculo automático de quilometragem</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
              <Text style={styles.featureText}>Identificação do motorista e veículo</Text>
            </View>
          </View>
        </View>

        {/* Highlights Grid */}
        <Text style={styles.gridTitle}>Nossos Diferenciais</Text>
        <View style={styles.grid}>
          {HIGHLIGHTS.map((item, idx) => (
            <View key={idx} style={styles.gridCard}>
              <View style={styles.gridIconWrap}>
                <Ionicons name={item.icon} size={28} color={colors.primary} />
              </View>
              <Text style={styles.gridCardTitle}>{item.title}</Text>
              <Text style={styles.gridCardDesc}>{item.description}</Text>
            </View>
          ))}
        </View>

        {/* Mission */}
        <LinearGradient
          colors={['#F0FDFA', '#D1FAE5']}
          style={styles.missionCard}
        >
          <Ionicons name="flag" size={28} color={colors.primary} />
          <Text style={styles.missionTitle}>Nossa Missão</Text>
          <Text style={styles.missionText}>
            Promover a cooperação entre os municípios do Médio Araguaia Goiano,
            buscando soluções integradas para o desenvolvimento regional,
            a melhoria dos serviços públicos e a qualidade de vida da população.
          </Text>
        </LinearGradient>

        {/* Footer */}
        <View style={styles.footer}>
          <Ionicons name="business-outline" size={24} color={colors.textSecondary} />
          <Text style={styles.footerText}>CIMAG — Consórcio Intermunicipal</Text>
          <Text style={styles.footerText}>do Médio Araguaia Goiano</Text>
          <Text style={styles.footerVersion}>Versão 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxl },
  hero: {
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: spacing.lg,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 2,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  heroTagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    ...shadows,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  aboutText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  featureList: { gap: spacing.sm, marginTop: spacing.xs },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  gridTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  gridCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    width: '48%',
    flexGrow: 1,
    ...shadows,
  },
  gridIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  gridCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  gridCardDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  missionCard: {
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  missionText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    alignItems: 'center',
    padding: spacing.lg,
    gap: 4,
  },
  footerText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  footerVersion: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    opacity: 0.6,
  },
});
