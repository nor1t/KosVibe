import type { PressableProps, StyleProp, ViewStyle } from 'react-native';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AppText } from '@/src/components/AppText';
import { theme } from '@/src/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type AppButtonProps = PressableProps & {
  label: string;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  isLoading?: boolean;
  style?: StyleProp<ViewStyle>;
};

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: {
    borderColor: 'rgba(255, 179, 0, 0.16)',
  },
  secondary: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: theme.colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    paddingHorizontal: 0,
  },
};

const textColors: Record<ButtonVariant, string> = {
  primary: theme.colors.surface,
  secondary: theme.colors.heading,
  ghost: theme.colors.gold,
};

export function AppButton({
  label,
  variant = 'primary',
  fullWidth = true,
  isLoading = false,
  style,
  disabled,
  ...props
}: AppButtonProps) {
  const textColor = textColors[variant];

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        !fullWidth ? styles.autoWidth : undefined,
        disabled || isLoading ? styles.disabled : undefined,
        pressed ? styles.pressed : undefined,
        style,
      ]}
      disabled={disabled || isLoading}
      {...props}>
      {variant === 'primary' ? (
        <LinearGradient colors={theme.gradients.primary} style={styles.primaryFill}>
          <View style={styles.content}>
            {isLoading ? <ActivityIndicator size="small" color={textColor} /> : null}
            <AppText variant="label" color={textColor}>
              {label}
            </AppText>
          </View>
        </LinearGradient>
      ) : (
        <View style={styles.content}>
          {isLoading ? <ActivityIndicator size="small" color={textColor} /> : null}
          <AppText variant="label" color={textColor}>
            {label}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: theme.radius.round,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  autoWidth: {
    alignSelf: 'flex-start',
  },
  primaryFill: {
    minHeight: 52,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});
