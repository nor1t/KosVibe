import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PAGE_BOTTOM_PADDING } from '../components/Screen';
import { theme } from '../theme';

const categoryData = {
  Government: [
    {
      id: 'unified',
      title: 'Unified Emergency Number',
      subtitle: 'Police, ambulance, fire',
      value: '112',
    },
    {
      id: 'police',
      title: 'Kosovo Police',
      subtitle: 'Direct police line',
      value: '192',
    },
    {
      id: 'firefighters',
      title: 'Firefighters',
      subtitle: 'Fire and rescue',
      value: '193',
    },
    {
      id: 'ambulance',
      title: 'Ambulance',
      subtitle: 'Medical emergency',
      value: '194',
    },
  ],
  Taxi: [
    {
      id: 'hejTaxi',
      title: 'Hej Taxi',
      subtitle: 'Prishtina taxi service',
      value: '044333999',
    },
    {
      id: 'victoryTaxi',
      title: 'Victory Taxi',
      subtitle: 'Prishtina taxi service',
      value: '+38138555333',
    },
    {
      id: 'londonTaxi',
      title: 'London Taxi',
      subtitle: 'Prishtina taxi service',
      value: '+37744300300',
    },
    {
      id: 'bekiTaxi',
      title: 'Beki Taxi',
      subtitle: 'Prishtina taxi service',
      value: '+37744111555',
    },
  ],
  Guides: [
    {
      id: 'myKosovoGuide',
      title: 'My Kosovo Guide',
      subtitle: 'WhatsApp / Viber guide contact',
      value: '+38344157663',
    },
    {
      id: 'kosovoTourGuide1',
      title: 'Kosovo Tour Guide',
      subtitle: 'National/local guide contact',
      value: '+38344561081',
    },
    {
      id: 'kosovoTourGuide2',
      title: 'Kosovo Tour Guide',
      subtitle: 'National/local guide contact',
      value: '+38349205254',
    },
  ],
};

const categories = Object.keys(categoryData) as Array<keyof typeof categoryData>;

const categoryAccent: Record<keyof typeof categoryData, string> = {
  Government: theme.colors.primary,
  Taxi: theme.colors.secondary,
  Guides: theme.colors.nature,
};

export function ImportantNumbersScreen() {
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = React.useState<keyof typeof categoryData>('Government');

  const numbers = categoryData[activeCategory];
  const activeColor = categoryAccent[activeCategory];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Math.max(insets.top + 18, 34), paddingBottom: PAGE_BOTTOM_PADDING },
      ]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.headerBlock}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Important numbers</Text>
          <View style={styles.iconBadge}>
            <Ionicons name="help-circle-outline" size={22} color={theme.colors.surface} />
          </View>
        </View>
        <Text style={styles.subtitle}>Fast contacts for emergencies, taxis, and local guides in Kosovo.</Text>
      </View>

      <View style={styles.categoryTabs}>
        {categories.map((category) => {
          const active = category === activeCategory;
          return (
            <Pressable
              key={category}
              style={[
                styles.categoryTab,
                active && styles.categoryTabActive,
                active && { backgroundColor: categoryAccent[category] + '22' },
              ]}
              onPress={() => setActiveCategory(category)}>
              <Text
                style={[
                  styles.categoryTabText,
                  active && styles.categoryTabTextActive,
                  active && { color: categoryAccent[category] },
                ]}>
                {category}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.list}>
        {numbers.map((item) => (
          <View key={item.id} style={styles.numberCard}>
            <View style={styles.numberInfo}>
              <Text style={styles.numberTitle}>{item.title}</Text>
              <Text style={styles.numberSubtitle}>{item.subtitle}</Text>
            </View>
            <View style={styles.numberActionRow}>
              <Text style={[styles.numberValue, { color: activeColor }]}>{item.value}</Text>
              <Pressable
                style={[styles.callButton, { backgroundColor: activeColor }]}
                onPress={() => void Linking.openURL(`tel:${item.value.replace(/\D/g, '')}`)}>
                <Ionicons name="call-outline" size={18} color={theme.colors.surface} />
                <Text style={styles.callButtonText}>Call</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: 20,
  },
  headerBlock: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    color: theme.colors.heading,
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 36,
    flex: 1,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    marginTop: 12,
    color: theme.colors.mutedText,
    fontSize: 15,
    lineHeight: 22,
  },
  categoryTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
  },
  categoryTabActive: {
    borderColor: 'rgba(255,255,255,0.18)',
  },
  categoryTabText: {
    color: theme.colors.surface,
    fontSize: 13,
    fontWeight: '700',
  },
  categoryTabTextActive: {
    color: theme.colors.background,
  },
  list: {
    gap: 14,
  },
  numberCard: {
    padding: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  numberInfo: {
    marginBottom: 14,
  },
  numberTitle: {
    color: theme.colors.heading,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },
  numberSubtitle: {
    color: theme.colors.mutedText,
    fontSize: 13,
    lineHeight: 18,
  },
  numberActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  numberValue: {
    color: theme.colors.secondary,
    fontSize: 16,
    fontWeight: '900',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.colors.secondary,
  },
  callButtonText: {
    color: theme.colors.background,
    fontSize: 14,
    fontWeight: '700',
  },
});
