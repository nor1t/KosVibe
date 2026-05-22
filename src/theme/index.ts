import type { Theme } from '@react-navigation/native';

import { colors, gradients, radius, shadow, spacing, typography } from './tokens';

export const theme = {
  colors,
  gradients,
  spacing,
  radius,
  typography,
  shadow,
};

export const navigationTheme: Theme = {
  dark: true,
  colors: {
    primary: colors.primary,
    background: colors.background,
    card: '#0B0D16',
    text: colors.heading,
    border: colors.border,
    notification: colors.gold,
  },
  fonts: {
    regular: {
      fontFamily: typography.fontFamily,
      fontWeight: '400',
    },
    medium: {
      fontFamily: typography.fontFamily,
      fontWeight: '500',
    },
    bold: {
      fontFamily: typography.fontFamily,
      fontWeight: '700',
    },
    heavy: {
      fontFamily: typography.fontFamily,
      fontWeight: '800',
    },
  },
};

export * from './tokens';
