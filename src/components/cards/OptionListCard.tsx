import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { QuickLink } from '../../data/mockData';
import { theme } from '../../theme';

type OptionListCardProps = {
  items: QuickLink[];
  onItemPress?: (item: QuickLink) => void;
};

export function OptionListCard({ items, onItemPress }: OptionListCardProps) {
  return (
    <View style={styles.card}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <Pressable
            key={item.id}
            onPress={() => onItemPress?.(item)}
            style={[styles.row, !isLast && styles.rowBorder]}>
            <View style={styles.rowLeft}>
              <Ionicons
                name={item.icon}
                size={22}
                color={item.tone === 'danger' ? theme.colors.danger : theme.colors.mutedText}
              />
              <Text style={[styles.label, item.tone === 'danger' && styles.dangerLabel]}>{item.label}</Text>
            </View>
            {item.tone === 'danger' ? null : (
              <Ionicons name="chevron-forward-outline" size={24} color={theme.colors.subtle} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    ...theme.shadow.card,
  },
  row: {
    minHeight: 68,
    paddingHorizontal: theme.spacing.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  label: {
    fontSize: 17,
    lineHeight: 22,
    color: theme.colors.heading,
    fontWeight: '500',
  },
  dangerLabel: {
    color: theme.colors.danger,
  },
});
