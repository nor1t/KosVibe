import { Platform } from 'react-native';

const fontFamily =
  Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'System',
  }) ?? 'System';

export const colors = {
  background: '#F7F8FC',
  surface: '#FFFFFF',
  surfaceMuted: '#FFF5F2',
  surfaceAlt: '#FFF8F6',
  text: '#20263A',
  heading: '#1E2438',
  mutedText: '#7E8598',
  subtle: '#AAB0C0',
  primary: '#FF4C49',
  secondary: '#FF6A2F',
  primarySoft: '#FFE8E4',
  accent: '#AE39FF',
  accentSoft: '#F3EAFF',
  orange: '#FF6A2F',
  orangeSoft: '#FFF2E6',
  nature: '#1FCA65',
  natureSoft: '#DCF6E6',
  party: '#A537FF',
  partySoft: '#F3EAFF',
  culture: '#316CFF',
  cultureSoft: '#E5EEFF',
  success: '#1FCA65',
  successSoft: '#DCF6E6',
  gold: '#FFC92C',
  goldSoft: '#FFF4C4',
  infoSoft: '#E5EEFF',
  pinkSoft: '#FFE6EF',
  mapSurface: '#F1F3F8',
  border: '#E7EAF2',
  overlay: 'rgba(17, 24, 39, 0.34)',
  shadow: '#111827',
  danger: '#DE4250',
  tabInactive: '#A2A9BC',
};

export const gradients = {
  primary: ['#FF4346', '#FF7031'] as const,
  warm: ['#FF4D4B', '#FF6E32'] as const,
  violet: ['#A537FF', '#F7269D'] as const,
  sunset: ['#FF7A00', '#FF2F51'] as const,
  softPink: ['#F6ECFF', '#FFF0F6'] as const,
  disabled: ['#D5D8E3', '#C8CDD8'] as const,
  premium: ['#8C30FF', '#F42CA2'] as const,
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
      shadowOpacity: 0.09,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
    },
    android: {
      elevation: 6,
    },
    default: {},
  }),
  floating: Platform.select({
    ios: {
      shadowColor: colors.shadow,
      shadowOpacity: 0.16,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
    },
    android: {
      elevation: 10,
    },
    default: {},
  }),
};
