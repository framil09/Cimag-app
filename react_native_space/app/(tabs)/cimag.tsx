import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, shadows } from '../../src/theme';

const AREAS_ATUACAO = [
  { icon: 'bulb' as const, title: 'Iluminação Pública', description: 'Gestão e manutenção da iluminação pública dos municípios consorciados.' },
  { icon: 'trash' as const, title: 'Resíduos Sólidos', description: 'Planejamento, fiscalização e gestão de resíduos sólidos na região.' },
  { icon: 'water' as const, title: 'Saneamento Básico', description: 'Ações integradas de saneamento e recursos hídricos.' },
  { icon: 'leaf' as const, title: 'Meio Ambiente', description: 'Fiscalização e regularização ambiental para desenvolvimento sustentável.' },
  { icon: 'home' as const, title: 'Habitação Social', description: 'Projetos de habitação de interesse social para a população.' },
  { icon: 'school' as const, title: 'Educação', description: 'Programas educacionais compartilhados entre os municípios.' },
  { icon: 'nutrition' as const, title: 'Segurança Alimentar', description: 'Iniciativas para garantir segurança alimentar na região.' },
  { icon: 'construct' as const, title: 'Infraestrutura', description: 'Planejamento urbano e infraestrutura compartilhada.' },
];

const MUNICIPIOS = [
  'Alagoa', 'Aiuruoca', 'Baependi', 'Bocaina de Minas',
  'Cambuquira', 'Carmo de Minas', 'Caxambu', 'Conceição do Rio Verde',
  'Cruzília', 'Dom Viçoso', 'Itamonte', 'Itanhandu',
  'Jesuânia', 'Lambari', 'Liberdade', 'Luminárias',
  'Minduri', 'Olímpio Noronha', 'Passa Quatro', 'Passa Vinte',
  'Pouso Alto', 'São Lourenço', 'São Sebastião do Rio Verde',
  'São Thomé das Letras', 'Seritinga', 'Serranos', 'Soledade de Minas',
  'Três Corações', 'Virgínia',
];

const NEWS = [
  {
    id: '1',
    date: '31 Mar 2026',
    title: 'Assembleia Geral reforça compromisso com o desenvolvimento em Pouso Alto',
    summary:
      'A Assembleia Geral da AMAG-CIMAG reuniu prefeitos e representantes dos municípios consorciados para debater pautas estratégicas voltadas ao desenvolvimento regional, avaliando serviços prestados e promovendo soluções integradas.',
    icon: 'people' as const,
  },
  {
    id: '2',
    date: '25 Fev 2026',
    title: 'Prefeitos discutem saúde especializada no Ministério da Saúde',
    summary:
      'Os prefeitos da AMAG-CIMAG participaram de reunião no Ministério da Saúde, em Brasília, para discutir o fortalecimento da saúde especializada nos municípios da microrregião do Circuito das Águas.',
    icon: 'medkit' as const,
  },
  {
    id: '3',
    date: '25 Fev 2026',
    title: 'Projeto de Mini Fazenda Solar apresentado ao Ministro de Minas e Energia',
    summary:
      'Em Brasília, prefeitos da AMAG-CIMAG apresentaram ao Ministro Alexandre Silveira o projeto de Mini Fazenda Solar, visando fortalecer o desenvolvimento regional com energia sustentável.',
    icon: 'sunny' as const,
  },
  {
    id: '4',
    date: '12 Fev 2026',
    title: 'Reunião Extraordinária da AMAG-CIMAG em Caxambu',
    summary:
      'Reunião extraordinária realizada na sede da Associação, em Caxambu, com a presença dos prefeitos dos municípios consorciados para deliberar sobre pautas urgentes.',
    icon: 'chatbubbles' as const,
  },
  {
    id: '5',
    date: '16 Jan 2026',
    title: 'AMAG e CIMAG iniciam 2026 com Assembleia Geral em Itanhandu',
    summary:
      'Realizada em Itanhandu a 263ª Assembleia Geral da AMAG e a 71ª Assembleia Geral do CIMAG, marcando oficialmente o início dos trabalhos do ano de 2026.',
    icon: 'calendar' as const,
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
            Consórcio Intermunicipal Multifinalitário{'\n'}da Microrregião do Circuito das Águas
          </Text>
          <Text style={styles.heroTagline}>
            Integrando municípios, fortalecendo a gestão pública
          </Text>
          <View style={styles.heroBadge}>
            <Ionicons name="location" size={14} color="#FFF" />
            <Text style={styles.heroBadgeText}>Sede: Caxambu — MG</Text>
          </View>
        </LinearGradient>

        {/* About / História */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time" size={22} color={colors.primary} />
            <Text style={styles.sectionTitle}>Nossa História</Text>
          </View>
          <Text style={styles.aboutText}>
            O CIMAG — Consórcio Intermunicipal Multifinalitário da Microrregião do Circuito das
            Águas — foi fundado em 29 de agosto de 2014 na cidade de Caxambu/MG, onde mantém
            sua sede até hoje.
          </Text>
          <Text style={styles.aboutText}>
            Com a finalidade de realizar uma gestão associada aos 29 municípios consorciados,
            o CIMAG busca oferecer agilidade na elaboração e execução de serviços essenciais,
            promovendo o desenvolvimento econômico sustentável da região do Circuito das Águas.
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>29</Text>
              <Text style={styles.statLabel}>Municípios</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>2014</Text>
              <Text style={styles.statLabel}>Fundação</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>71+</Text>
              <Text style={styles.statLabel}>Assembleias</Text>
            </View>
          </View>
        </View>

        {/* Diretoria */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people-circle" size={22} color={colors.primary} />
            <Text style={styles.sectionTitle}>Diretoria 2026</Text>
          </View>
          <View style={styles.diretoriaItem}>
            <Ionicons name="star" size={18} color={colors.warning} />
            <View style={styles.diretoriaInfo}>
              <Text style={styles.diretoriaCargo}>Presidente</Text>
              <Text style={styles.diretoriaNome}>Leonardo Framil Lobo Santos — Lambari</Text>
            </View>
          </View>
          <View style={styles.diretoriaItem}>
            <Ionicons name="star-half" size={18} color={colors.primary} />
            <View style={styles.diretoriaInfo}>
              <Text style={styles.diretoriaCargo}>Vice-Presidente</Text>
              <Text style={styles.diretoriaNome}>João Pedro Fonseca — Itamonte</Text>
            </View>
          </View>
          <View style={styles.diretoriaItem}>
            <Ionicons name="star-half" size={18} color={colors.primary} />
            <View style={styles.diretoriaInfo}>
              <Text style={styles.diretoriaCargo}>2º Vice-Presidente</Text>
              <Text style={styles.diretoriaNome}>José Bento Junqueira de Andrade Neto — Minduri</Text>
            </View>
          </View>
        </View>

        {/* Áreas de Atuação */}
        <Text style={styles.gridTitle}>Áreas de Atuação</Text>
        <View style={styles.grid}>
          {AREAS_ATUACAO.map((item, idx) => (
            <View key={idx} style={styles.gridCard}>
              <View style={styles.gridIconWrap}>
                <Ionicons name={item.icon} size={28} color={colors.primary} />
              </View>
              <Text style={styles.gridCardTitle}>{item.title}</Text>
              <Text style={styles.gridCardDesc}>{item.description}</Text>
            </View>
          ))}
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
            {[
              'Localização GPS automática (início e fim)',
              'Foto obrigatória do hodômetro',
              'Registro da finalidade da viagem',
              'Cálculo automático de quilometragem',
              'Identificação do motorista e veículo',
            ].map((text, i) => (
              <View key={i} style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                <Text style={styles.featureText}>{text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* News / Notícias */}
        <View style={styles.newsSection}>
          <View style={styles.newsSectionHeader}>
            <Ionicons name="newspaper" size={22} color={colors.primary} />
            <Text style={styles.sectionTitle}>Notícias do Consórcio</Text>
          </View>
          {NEWS.map((item) => (
            <View key={item.id} style={styles.newsCard}>
              <View style={styles.newsIconWrap}>
                <Ionicons name={item.icon} size={24} color={colors.primary} />
              </View>
              <View style={styles.newsContent}>
                <Text style={styles.newsDate}>{item.date}</Text>
                <Text style={styles.newsTitle}>{item.title}</Text>
                <Text style={styles.newsSummary}>{item.summary}</Text>
              </View>
            </View>
          ))}
          <Pressable
            style={styles.linkButton}
            onPress={() => Linking.openURL('https://cimag.org.br/mostra-noticias')}
          >
            <Text style={styles.linkButtonText}>Ver todas as notícias</Text>
            <Ionicons name="open-outline" size={16} color={colors.primary} />
          </Pressable>
        </View>

        {/* Municípios */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="map" size={22} color={colors.primary} />
            <Text style={styles.sectionTitle}>29 Municípios Consorciados</Text>
          </View>
          <View style={styles.municipiosGrid}>
            {MUNICIPIOS.map((m, i) => (
              <View key={i} style={styles.municipioChip}>
                <Text style={styles.municipioText}>{m}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Mission */}
        <LinearGradient
          colors={['#F0FDFA', '#D1FAE5']}
          style={styles.missionCard}
        >
          <Ionicons name="flag" size={28} color={colors.primary} />
          <Text style={styles.missionTitle}>Nossa Missão</Text>
          <Text style={styles.missionText}>
            Promover a cooperação entre os municípios da Microrregião do Circuito das Águas,
            buscando soluções integradas para o desenvolvimento regional sustentável,
            a melhoria dos serviços públicos e a qualidade de vida da população.
          </Text>
        </LinearGradient>

        {/* Contact */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="call" size={22} color={colors.primary} />
            <Text style={styles.sectionTitle}>Contato</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.contactText}>Av. Camilo Soares, 100 — Caxambu/MG, 37440-000</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="call-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.contactText}>0800 000 4488</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.contactText}>secretaria@cimag.org.br</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.contactText}>Seg à Sex — 8h às 17h</Text>
          </View>
          <Pressable
            style={[styles.linkButton, { marginTop: spacing.md }]}
            onPress={() => Linking.openURL('https://cimag.org.br')}
          >
            <Ionicons name="globe-outline" size={16} color={colors.primary} />
            <Text style={styles.linkButtonText}>Acessar site oficial</Text>
            <Ionicons name="open-outline" size={14} color={colors.primary} />
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Ionicons name="business-outline" size={24} color={colors.textSecondary} />
          <Text style={styles.footerText}>CIMAG — Consórcio Intermunicipal Multifinalitário</Text>
          <Text style={styles.footerText}>da Microrregião do Circuito das Águas</Text>
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
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: spacing.md,
  },
  heroBadgeText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  diretoriaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  diretoriaInfo: {
    flex: 1,
  },
  diretoriaCargo: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  diretoriaNome: {
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: 2,
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
  newsSection: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  newsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  newsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    gap: spacing.md,
    ...shadows,
  },
  newsIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  newsContent: {
    flex: 1,
  },
  newsDate: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  newsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  newsSummary: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  linkButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  municipiosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  municipioChip: {
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  municipioText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  contactText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
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
