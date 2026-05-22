import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '../../theme';

type GradientHeaderShellProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  bottomRadius?: number;
  colors?: readonly [string, string];
  topPadding?: number;
};

export function GradientHeaderShell({
  children,
  style,
  contentStyle,
  bottomRadius = theme.radius.xxl,
  colors = theme.gradients.primary,
  topPadding = theme.spacing.xl,
}: GradientHeaderShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={colors}
      style={[
        styles.container,
        {
          paddingTop: insets.top + topPadding,
          borderBottomLeftRadius: bottomRadius,
          borderBottomRightRadius: bottomRadius,
        },
        style,
      ]}>
      <View style={[styles.content, contentStyle]}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    ...theme.shadow.card,
  },
  content: {
    paddingHorizontal: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxl,
  },
});
