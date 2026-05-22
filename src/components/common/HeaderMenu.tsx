import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../theme';

export function HeaderMenu() {
  const navigation = useNavigation();
  const nav = navigation as any;
  const [open, setOpen] = useState(false);

  const items = [
    { key: 'home', label: 'Home', icon: 'home-outline', action: () => nav.navigate('HomeTab') },
    { key: 'restaurants', label: 'Restaurants', icon: 'restaurant-outline', action: () => nav.navigate('Category', { category: 'Restaurants' }) },
    { key: 'icons', label: 'Kosovo Icons', icon: 'business-outline', action: () => nav.navigate('Category', { category: 'Culture' }) },
    { key: 'events', label: 'Events', icon: 'sparkles-outline', action: () => nav.navigate('TavolinaTab') },
    { key: 'map', label: 'Explore Map', icon: 'map-outline', action: () => nav.navigate('MapTab') },
    { key: 'favorites', label: 'Stories', icon: 'book-outline', action: () => nav.navigate('FavoritesTab') },
    { key: 'profile', label: 'Profile', icon: 'person-outline', action: () => nav.navigate('ProfileTab') },
    { key: 'settings', label: 'Settings', icon: 'settings-outline', action: () => nav.navigate('Settings') },
  ];

  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={styles.trigger} accessibilityLabel="Open menu">
        <View style={styles.lines} />
        <View style={styles.lines} />
        <View style={styles.lines} />
      </Pressable>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.menu}>
            {items.map((it) => (
              <Pressable
                key={it.key}
                style={styles.item}
                onPress={() => {
                  setOpen(false);
                  // @ts-ignore
                  it.action();
                }}>
                <Ionicons name={it.icon as any} size={18} color={theme.colors.heading} />
                <Text style={styles.itemText}>{it.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  lines: {
    width: 18,
    height: 2,
    backgroundColor: theme.colors.heading,
    marginVertical: 2,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 56,
    paddingRight: 12,
  },
  menu: {
    width: 220,
    backgroundColor: '#151925',
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    ...theme.shadow.card,
  },
  item: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  itemText: {
    color: theme.colors.heading,
    fontWeight: '600',
    fontSize: theme.typography.sizes.body,
  },
});
