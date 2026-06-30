import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Dimensions, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '@/src/theme';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function useOptionalHeaderHeight() {
  try {
    return useHeaderHeight();
  } catch {
    return 0;
  }
}

export function usePageSpacing() {
  const { width, height } = useWindowDimensions();
  const headerHeight = useOptionalHeaderHeight();

  const isCompactWidth = width < 390;
  const isWideScreen = width >= 430;

  return {
    horizontalPadding: isCompactWidth ? 16 : isWideScreen ? 20 : theme.spacing.lg,
    topPadding:
      headerHeight > 0
        ? headerHeight + (height < 860 ? 18 : 16)
        : clamp(Math.round(height * 0.085), 72, 96),
    bottomPadding: clamp(Math.round(height * 0.1), 105, 133),
  };
}

const { height } = Dimensions.get('window');

export const PAGE_TOP_PADDING = clamp(Math.round(height * 0.13), 116, 140);
export const PAGE_BOTTOM_PADDING = clamp(Math.round(height * 0.1), 105, 133);

type ScreenProps = {
  children: ReactNode;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function Screen({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
}: ScreenProps) {
  const spacing = usePageSpacing();

  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      {scrollable ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            {
              paddingHorizontal: spacing.horizontalPadding,
              paddingTop: spacing.topPadding,
            },
            contentContainerStyle,
          ]}>
          {children}
        </ScrollView>
      ) : (
        <View
          style={[
            styles.content,
            styles.fill,
            {
              paddingHorizontal: spacing.horizontalPadding,
              paddingTop: spacing.topPadding,
            },
            contentContainerStyle,
          ]}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  fill: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});
