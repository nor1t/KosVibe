import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../theme';

type ScreenProps = {
  children: ReactNode;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  variant?: 'default' | 'semafori';
};

export function Screen({
  children,
  scrollable = true,
  style,
  contentContainerStyle,
  variant = 'default',
}: ScreenProps) {
  if (!scrollable) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, style]}>
        {children}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, style]}>
      {variant === 'semafori' ? (
        <LinearGradient colors={['#05060D', '#0D0D1A', '#121726']} style={styles.gradient}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.content, contentContainerStyle]}
            keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </LinearGradient>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, contentContainerStyle]}
          keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingBottom: theme.spacing.xxxxl,
  },
  gradient: {
    flex: 1,
  },
});
