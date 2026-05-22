import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Pressable, StyleSheet } from 'react-native';

import { theme } from '../../theme';

type IconCircleButtonProps = {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: 'light' | 'soft';
};

export function IconCircleButton({
  children,
  onPress,
  style,
  variant = 'soft',
}: IconCircleButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'light' ? styles.light : styles.soft,
        pressed && styles.pressed,
        style,
      ]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soft: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  light: {
    backgroundColor: 'rgba(248,247,255,0.94)',
    ...theme.shadow.card,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
});
