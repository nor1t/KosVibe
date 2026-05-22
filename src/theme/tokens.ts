import { Platform } from 'react-native';

const fontFamily =
  Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'System',
  }) ?? 'System';

export const colors = {
  background: '#070810',
  surface: '#F8F7FF',
  surfaceMuted: '#11131E',
  surfaceAlt: '#181B29',
  text: '#EEF1FF',
  heading: '#FFFFFF',
  mutedText: '#A7AEC5',
  subtle: '#72788F',
  primary: '#FF1F3D',
  secondary: '#FFB300',
  primarySoft: 'rgba(255, 31, 61, 0.18)',
  accent: '#FF8C00',
  accentSoft: 'rgba(255, 140, 0, 0.18)',
  orange: '#FF8C00',
  orangeSoft: 'rgba(255, 140, 0, 0.18)',
  nature: '#42D98C',
  natureSoft: 'rgba(66, 217, 140, 0.18)',
  party: '#D66BFF',
  partySoft: 'rgba(214, 107, 255, 0.18)',
  culture: '#5DA7FF',
  cultureSoft: 'rgba(93, 167, 255, 0.18)',
  success: '#20C56C',
  successSoft: 'rgba(32, 197, 108, 0.18)',
  gold: '#FFB300',
  goldSoft: 'rgba(255, 179, 0, 0.18)',
  infoSoft: 'rgba(93, 167, 255, 0.18)',
  pinkSoft: 'rgba(255, 86, 163, 0.18)',
  mapSurface: '#0D0D1A',
  border: 'rgba(255, 255, 255, 0.1)',
  overlay: 'rgba(7, 8, 16, 0.72)',
  shadow: '#000000',
  danger: '#FF5A36',
  tabInactive: '#686E84',
};

export const gradients = {
  primary: ['#FF1F3D', '#C8102E'] as const,
  warm: ['#FF1F3D', '#C8102E'] as const,
  gold: ['#FFB300', '#FF8C00'] as const,
  fire: ['#FF6138', '#FF1F3D'] as const,
  violet: ['#4437FF', '#FF5EBE'] as const,
  sunset: ['#FFB300', '#FF1F3D'] as const,
  softPink: ['#1A1E2E', '#101320'] as const,
  disabled: ['#3A3F52', '#2B3042'] as const,
  premium: ['#FFB300', '#C8102E'] as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 22,
  xxxl: 28,
  xxxxl: 34,
};

export const radius = {
  sm: 12,
  md: 18,
  lg: 22,
  xl: 28,
  xxl: 34,
  round: 999,
};

export const typography = {
  fontFamily,
  sizes: {
    hero: 30,
    display: 24,
    title: 20,
    subtitle: 16,
    body: 14,
    label: 13,
    caption: 11,
    eyebrow: 10,
  },
  lineHeights: {
    hero: 34,
    display: 30,
    title: 26,
    subtitle: 22,
    body: 20,
    label: 18,
    caption: 16,
    eyebrow: 14,
  },
};

export const shadow = {
  card: Platform.select({
    ios: {
      shadowColor: colors.shadow,
      shadowOpacity: 0.26,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 14 },
    },
    android: {
      elevation: 12,
    },
    default: {},
  }),
  floating: Platform.select({
    ios: {
      shadowColor: colors.shadow,
      shadowOpacity: 0.32,
      shadowRadius: 26,
      shadowOffset: { width: 0, height: 16 },
    },
    android: {
      elevation: 16,
    },
    default: {},
  }),
  glow: Platform.select({
    ios: {
      shadowColor: colors.gold,
      shadowOpacity: 0.38,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 0 },
    },
    android: {
      elevation: 10,
    },
    default: {},
  }),
};
