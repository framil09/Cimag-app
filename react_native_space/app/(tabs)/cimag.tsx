import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Linking, ActivityIndicator,
  Animated, useWindowDimensions, Platform, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, shadows } from '../../src/theme';
import { getNews, NewsItem } from '../../src/services/news';

const cimagLogo = require('../../assets/images/cimag-logo.png');

/* ───────── Data ───────── */

const AREAS_ATUACAO = [
  { icon: 'bulb-outline' as const, title: 'Iluminação Pública', desc: 'Gestão e manutenção da iluminação pública municipal.' },
  { icon: 'trash-outline' as const, title: 'Resíduos Sólidos', desc: 'Planejamento e gestão de resíduos sólidos.' },
  { icon: 'water-outline' as const, title: 'Saneamento Básico', desc: 'Ações integradas de saneamento e recursos hídricos.' },
  { icon: 'leaf-outline' as const, title: 'Meio Ambiente', desc: 'Fiscalização e regularização ambiental.' },
  { icon: 'home-outline' as const, title: 'Habitação Social', desc: 'Projetos de habitação de interesse social.' },
  { icon: 'school-outline' as const, title: 'Educação', desc: 'Programas educacionais compartilhados.' },
  { icon: 'nutrition-outline' as const, title: 'Segurança Alimentar', desc: 'Iniciativas de segurança alimentar regional.' },
  { icon: 'construct-outline' as const, title: 'Infraestrutura', desc: 'Planejamento urbano e obras compartilhadas.' },
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

const DIRETORIA = [
  { cargo: 'Presidente', nome: 'Leonardo Framil Lobo Santos', cidade: 'Lambari', icon: 'ribbon' as const, color: '#F59E0B' },
  { cargo: 'Vice-Presidente', nome: 'João Pedro Fonseca', cidade: 'Itamonte', icon: 'ribbon-outline' as const, color: colors.primary },
  { cargo: '2º Vice-Presidente', nome: 'José Bento J. de Andrade Neto', cidade: 'Minduri', icon: 'ribbon-outline' as const, color: colors.primary },
];

const QUICK_LINKS = [
  { icon: 'globe-outline' as const, label: 'Site Oficial', url: 'https://cimag.org.br' },
  { icon: 'eye-outline' as const, label: 'Transparência', url: 'https://cimag.org.br/portal-da-transparencia' },
  { icon: 'document-text-outline' as const, label: 'Editais', url: 'https://cimag.org.br/editais' },
  { icon: 'receipt-outline' as const, label: 'Prestação de Contas', url: 'https://cimag.org.br/prestacao-contas' },
];

const FALLBACK_NEWS: NewsItem[] = [
  { id: '1', date: '31 Mar 2026', title: 'Assembleia Geral reforça compromisso com o desenvolvimento em Pouso Alto', summary: 'A Assembleia Geral da AMAG-CIMAG reuniu prefeitos e representantes dos municípios consorciados para debater pautas estratégicas.', imageUrl: null, link: 'https://cimag.org.br' },
  { id: '2', date: '25 Fev 2026', title: 'Prefeitos discutem saúde especializada no Ministério da Saúde', summary: 'Os prefeitos da AMAG-CIMAG participaram de reunião no Ministério da Saúde, em Brasília.', imageUrl: null, link: 'https://cimag.org.br' },
  { id: '3', date: '25 Fev 2026', title: 'Projeto de Mini Fazenda Solar apresentado ao Ministro de Minas e Energia', summary: 'Prefeitos apresentaram ao Ministro Alexandre Silveira o projeto de Mini Fazenda Solar.', imageUrl: null, link: 'https://cimag.org.br' },
  { id: '4', date: '16 Jan 2026', title: 'AMAG e CIMAG iniciam 2026 com Assembleia Geral em Itanhandu', summary: 'Realizada a 263ª Assembleia Geral da AMAG e a 71ª do CIMAG.', imageUrl: null, link: 'https://cimag.org.br' },
];

/* ───────── Animated Card ───────── */

function FadeInCard({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: any }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, delay, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(translateY, { toValue: 0, duration: 500, delay, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, []);
  return <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>{children}</Animated.View>;
}

/* ───────── Stat Pill ───────── */

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <View style={s.statPill}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

/* ───────── Section Header ───────── */

function SectionHeader({ icon, title, trailing }: { icon: string; title: string; trailing?: React.ReactNode }) {
  return (
    <View style={s.sectionHeader}>
      <View style={s.sectionIconWrap}>
        <Ionicons name={icon as any} size={18} color="#FFF" />
      </View>
      <Text style={s.sectionTitle}>{title}</Text>
      {trailing}
    </View>
  );
}

/* ───────── Main Component ───────── */

export default function CimagScreen() {
  const [news, setNews] = useState<NewsItem[]>(FALLBACK_NEWS);
  const [loadingNews, setLoadingNews] = useState(true);
  const [showAllMunicipios, setShowAllMunicipios] = useState(false);
  const { width } = useWindowDimensions();
  const isWide = width > 600;

  useEffect(() => {
    let cancelled = false;
    getNews()
      .then((data) => { if (!cancelled && data.length > 0) setNews(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingNews(false); });
    return () => { cancelled = true; };
  }, []);

  const visibleMunicipios = showAllMunicipios ? MUNICIPIOS : MUNICIPIOS.slice(0, 12);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ════ Hero ════ */}
        <LinearGradient
          colors={['#134E4A', '#0D3D38', '#0A2F2C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          {/* Decorative mountain silhouettes */}
          <View style={s.heroMountainLeft} />
          <View style={s.heroMountainRight} />
          {/* Subtle water ripple */}
          <View style={s.heroWaterRipple} />
          <View style={s.heroWaterRipple2} />

          <View style={s.heroLogoContainer}>
            <Image source={cimagLogo} style={s.heroLogo} resizeMode="contain" />
          </View>

          <View style={s.heroDivider} />
          <Text style={s.heroSubtitle}>
            Consórcio Intermunicipal Multifinalitário{'\n'}da Microrregião do Circuito das Águas
          </Text>
          <View style={s.heroChips}>
            <View style={s.heroChip}>
              <Ionicons name="location-sharp" size={12} color="rgba(255,255,255,0.9)" />
              <Text style={s.heroChipText}>Caxambu — MG</Text>
            </View>
            <View style={s.heroChip}>
              <Ionicons name="calendar-sharp" size={12} color="rgba(255,255,255,0.9)" />
              <Text style={s.heroChipText}>Desde 2014</Text>
            </View>
            <View style={s.heroChip}>
              <Ionicons name="people-sharp" size={12} color="rgba(255,255,255,0.9)" />
              <Text style={s.heroChipText}>29 Municípios</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ════ Stats Strip ══════ */}
        <FadeInCard delay={100} style={s.statsStrip}>
          <StatPill value="29" label="Municípios" />
          <View style={s.statDivider} />
          <StatPill value="71+" label="Assembleias" />
          <View style={s.statDivider} />
          <StatPill value="12" label="Anos" />
          <View style={s.statDivider} />
          <StatPill value="8" label="Áreas" />
        </FadeInCard>

        {/* ══════ Quick Links ══════ */}
        <FadeInCard delay={150}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.quickLinksScroll}>
            {QUICK_LINKS.map((link, i) => (
              <Pressable key={i} style={s.quickLink} onPress={() => Linking.openURL(link.url)}>
                <View style={s.quickLinkIcon}>
                  <Ionicons name={link.icon as any} size={22} color={colors.primary} />
                </View>
                <Text style={s.quickLinkLabel}>{link.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </FadeInCard>

        {/* ══════ História ══════ */}
        <FadeInCard delay={200} style={s.card}>
          <SectionHeader icon="time-outline" title="Nossa História" />
          <Text style={s.bodyText}>
            O CIMAG foi fundado em <Text style={s.bold}>29 de agosto de 2014</Text> na cidade de
            Caxambu/MG, com a finalidade de realizar gestão associada aos municípios da região.
          </Text>
          <Text style={s.bodyText}>
            O consórcio busca oferecer agilidade na elaboração e execução de serviços essenciais como
            iluminação pública, saneamento, meio ambiente, educação, habitação e infraestrutura,
            visando a melhoria na qualidade de vida da população e o desenvolvimento econômico
            sustentável do <Text style={s.bold}>Circuito das Águas</Text>.
          </Text>
        </FadeInCard>

        {/* ══════ Diretoria ══════ */}
        <FadeInCard delay={250} style={s.card}>
          <SectionHeader icon="people-circle-outline" title="Diretoria 2026" />
          {DIRETORIA.map((d, i) => (
            <View key={i} style={[s.diretoriaRow, i === DIRETORIA.length - 1 && { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 }]}>
              <View style={[s.diretoriaAvatar, { backgroundColor: d.color + '18' }]}>
                <Ionicons name={d.icon} size={20} color={d.color} />
              </View>
              <View style={s.diretoriaInfo}>
                <Text style={s.diretoriaCargo}>{d.cargo}</Text>
                <Text style={s.diretoriaNome}>{d.nome}</Text>
                <View style={s.diretoriaCidade}>
                  <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
                  <Text style={s.diretoriaCidadeText}>{d.cidade}</Text>
                </View>
              </View>
            </View>
          ))}
        </FadeInCard>

        {/* ══════ Áreas de Atuação ══════ */}
        <FadeInCard delay={300}>
          <View style={s.sectionTitleRow}>
            <SectionHeader icon="grid-outline" title="Áreas de Atuação" />
          </View>
          <View style={[s.areasGrid, isWide && { paddingHorizontal: spacing.lg }]}>
            {AREAS_ATUACAO.map((item, idx) => (
              <View key={idx} style={[s.areaCard, isWide && { width: '23%' }]}>
                <LinearGradient
                  colors={['#F0FDFA', '#CCFBF1']}
                  style={s.areaIconCircle}
                >
                  <Ionicons name={item.icon as any} size={24} color={colors.primary} />
                </LinearGradient>
                <Text style={s.areaTitle}>{item.title}</Text>
                <Text style={s.areaDesc}>{item.desc}</Text>
              </View>
            ))}
          </View>
        </FadeInCard>

        {/* ══════ Notícias ══════ */}
        <FadeInCard delay={350} style={s.newsBlock}>
          <SectionHeader
            icon="newspaper-outline"
            title="Notícias"
            trailing={loadingNews ? <ActivityIndicator size="small" color={colors.primary} /> : undefined}
          />
          {news.map((item, i) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [s.newsCard, pressed && s.newsCardPressed]}
              onPress={() => item.link && Linking.openURL(item.link)}
            >
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={s.newsThumb} />
              ) : (
                <View style={s.newsIconPlaceholder}>
                  <Ionicons name="newspaper-outline" size={22} color={colors.primary} />
                </View>
              )}
              <View style={s.newsBody}>
                <Text style={s.newsTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={s.newsSummary} numberOfLines={2}>{item.summary}</Text>
                {item.date ? (
                  <View style={s.newsDateRow}>
                    <Ionicons name="calendar-outline" size={11} color={colors.textSecondary} />
                    <Text style={s.newsDateInline}>{item.date}</Text>
                  </View>
                ) : null}
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.border} style={{ alignSelf: 'center' }} />
            </Pressable>
          ))}
          <Pressable style={s.seeAllBtn} onPress={() => Linking.openURL('https://cimag.org.br/mostra-noticias')}>
            <Text style={s.seeAllText}>Ver todas as notícias</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          </Pressable>
        </FadeInCard>

        {/* ══════ App Purpose ══════ */}
        <FadeInCard delay={400} style={s.card}>
          <SectionHeader icon="phone-portrait-outline" title="Este Aplicativo" />
          <Text style={s.bodyText}>
            Desenvolvido para controle e registro de deslocamentos dos veículos oficiais do consórcio.
          </Text>
          {[
            { icon: 'navigate-circle-outline', text: 'Localização GPS automática' },
            { icon: 'camera-outline', text: 'Foto obrigatória do hodômetro' },
            { icon: 'clipboard-outline', text: 'Registro da finalidade da viagem' },
            { icon: 'speedometer-outline', text: 'Cálculo automático de km' },
            { icon: 'person-circle-outline', text: 'Identificação do motorista e veículo' },
          ].map((f, i) => (
            <View key={i} style={s.featureRow}>
              <View style={s.featureDot}>
                <Ionicons name={f.icon as any} size={18} color={colors.primary} />
              </View>
              <Text style={s.featureText}>{f.text}</Text>
            </View>
          ))}
        </FadeInCard>

        {/* ══════ Municípios ══════ */}
        <FadeInCard delay={450} style={s.card}>
          <SectionHeader icon="map-outline" title="Municípios Consorciados" />
          <View style={s.chipGrid}>
            {visibleMunicipios.map((m, i) => (
              <View key={i} style={s.chip}>
                <Ionicons name="location-sharp" size={10} color={colors.primary} />
                <Text style={s.chipText}>{m}</Text>
              </View>
            ))}
          </View>
          {!showAllMunicipios && (
            <Pressable style={s.showMoreBtn} onPress={() => setShowAllMunicipios(true)}>
              <Text style={s.showMoreText}>Mostrar todos os 29 municípios</Text>
              <Ionicons name="chevron-down" size={16} color={colors.primary} />
            </Pressable>
          )}
        </FadeInCard>

        {/* ══════ Missão ══════ */}
        <FadeInCard delay={500}>
          <LinearGradient colors={['#134E4A', '#0D3D38']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.missionBanner}>
            <Ionicons name="flag" size={32} color="rgba(255,255,255,0.3)" />
            <Text style={s.missionLabel}>NOSSA MISSÃO</Text>
            <Text style={s.missionText}>
              Promover a cooperação entre os municípios da Microrregião do Circuito das Águas,
              buscando soluções integradas para o desenvolvimento regional sustentável,
              a melhoria dos serviços públicos e a qualidade de vida da população.
            </Text>
          </LinearGradient>
        </FadeInCard>

        {/* ══════ Contato ══════ */}
        <FadeInCard delay={550} style={s.card}>
          <SectionHeader icon="call-outline" title="Contato" />
          {[
            { icon: 'location-outline' as const, text: 'Av. Camilo Soares, 100 — Caxambu/MG', sub: 'CEP 37440-000' },
            { icon: 'call-outline' as const, text: '0800 000 4488', sub: 'Ligação gratuita' },
            { icon: 'mail-outline' as const, text: 'secretaria@cimag.org.br', sub: '' },
            { icon: 'time-outline' as const, text: 'Seg à Sex — 8h às 17h', sub: '' },
          ].map((c, i) => (
            <View key={i} style={s.contactRow}>
              <View style={s.contactIconWrap}>
                <Ionicons name={c.icon} size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={s.contactText}>{c.text}</Text>
                {c.sub ? <Text style={s.contactSub}>{c.sub}</Text> : null}
              </View>
            </View>
          ))}
          <Pressable style={s.ctaButton} onPress={() => Linking.openURL('https://cimag.org.br')}>
            <Ionicons name="globe-outline" size={18} color="#FFF" />
            <Text style={s.ctaText}>Acessar site oficial</Text>
          </Pressable>
        </FadeInCard>

        {/* ══════ Footer ══════ */}
        <View style={s.footer}>
          <View style={s.footerLine} />
          <Image source={cimagLogo} style={s.footerLogo} resizeMode="contain" />
          <Text style={s.footerSub}>Consórcio Intermunicipal Multifinalitário</Text>
          <Text style={s.footerSub}>da Microrregião do Circuito das Águas</Text>
          <Text style={s.footerVersion}>v1.0.0</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

/* ───────── Styles ───────── */

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 40 },

  /* Hero */
  hero: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  heroMountainLeft: {
    position: 'absolute',
    bottom: -20,
    left: -30,
    width: 0,
    height: 0,
    borderLeftWidth: 120,
    borderRightWidth: 120,
    borderBottomWidth: 100,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(255,255,255,0.03)',
    transform: [{ rotate: '180deg' }],
  },
  heroMountainRight: {
    position: 'absolute',
    bottom: -10,
    right: -20,
    width: 0,
    height: 0,
    borderLeftWidth: 100,
    borderRightWidth: 100,
    borderBottomWidth: 80,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(255,255,255,0.025)',
    transform: [{ rotate: '180deg' }],
  },
  heroWaterRipple: {
    position: 'absolute',
    bottom: 10,
    width: '120%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroWaterRipple2: {
    position: 'absolute',
    bottom: 18,
    width: '80%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  heroLogoContainer: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  heroLogo: {
    width: 150,
    height: 150,
  },
  heroDivider: {
    width: 40,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 2,
    marginVertical: 12,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 21,
  },
  heroChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  heroChipText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },

  /* Stats Strip */
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginTop: -24,
    borderRadius: borderRadius.lg,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginBottom: spacing.md,
    ...shadows,
  },
  statPill: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: 10, color: colors.textSecondary, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600' },
  statDivider: { width: 1, height: 28, backgroundColor: colors.border },

  /* Quick Links */
  quickLinksScroll: {
    paddingHorizontal: spacing.md,
    gap: 10,
    marginBottom: spacing.md,
  },
  quickLink: {
    alignItems: 'center',
    width: 80,
  },
  quickLinkIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  quickLinkLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },

  /* Section Header */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: spacing.md,
  },
  sectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  sectionTitleRow: {
    paddingHorizontal: spacing.md,
  },

  /* Card */
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    ...shadows,
  },

  /* Body text */
  bodyText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  bold: {
    fontWeight: '700',
    color: colors.textPrimary,
  },

  /* Diretoria */
  diretoriaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  diretoriaAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diretoriaInfo: { flex: 1 },
  diretoriaCargo: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  diretoriaNome: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 2,
  },
  diretoriaCidade: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },
  diretoriaCidadeText: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  /* Areas Grid */
  areasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: 10,
    marginBottom: spacing.lg,
  },
  areaCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 14,
    width: '47%',
    flexGrow: 1,
    ...shadows,
  },
  areaIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  areaTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  areaDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },

  /* News */
  newsBlock: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  newsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    ...shadows,
  },
  newsCardPressed: {
    borderColor: colors.primary,
    backgroundColor: '#F0FDFA',
  },
  newsThumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#F0FDFA',
  },
  newsIconPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  newsBody: { flex: 1 },
  newsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
    lineHeight: 20,
  },
  newsSummary: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  newsDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  newsDateInline: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    marginTop: 4,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },

  /* Features */
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  featureDot: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
    fontWeight: '500',
  },

  /* Chips / Municípios */
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  chipText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  showMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 12,
    paddingVertical: 8,
  },
  showMoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },

  /* Mission Banner */
  missionBanner: {
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  missionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 3,
    marginTop: 8,
    marginBottom: 8,
  },
  missionText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },

  /* Contact */
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  contactIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  contactSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    marginTop: 8,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },

  /* Footer */
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  footerLine: {
    width: 32,
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: 16,
  },
  footerLogo: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  footerSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  footerVersion: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 8,
    opacity: 0.5,
  },
});
