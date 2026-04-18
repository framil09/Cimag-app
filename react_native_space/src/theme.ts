import { Platform } from 'react-native';

export const colors = {
  primary: '#0D9488',
  accent: '#1E5F8C',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceDark: '#1A2332',
  textPrimary: '#1A2332',
  textSecondary: '#64748B',
  textOnDark: '#F1F5F9',
  border: '#E2E8F0',
  gradient: ['#0D9488', '#1E5F8C'] as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const fonts = {
  heading: Platform.select({ ios: 'System', android: 'Roboto', default: 'Arial, sans-serif' }) ?? 'System',
  body: Platform.select({ ios: 'System', android: 'Roboto', default: 'Arial, sans-serif' }) ?? 'System',
};

export const typography = {
  display: { fontSize: 32, fontWeight: '700' as const },
  heading: { fontSize: 22, fontWeight: '700' as const },
  subheading: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
};

export const shadows = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  android: {
    elevation: 2,
  },
  web: {
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  default: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
}) ?? {};
