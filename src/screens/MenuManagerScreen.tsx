import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PAGE_BOTTOM_PADDING, PAGE_TOP_PADDING } from '../components/Screen';
import { businessRepository } from '../features/business/businessRepository';
import { restaurantsRepository } from '../repositories/restaurantsRepository';
import { supabase } from '../lib/supabase';
import { theme } from '../theme';
import type { MenuCategoryForEditing } from '../repositories/types';

type MenuManagerScreenProps = {
  route: { params: { placeId: string } };
};

export function MenuManagerScreen({ route }: MenuManagerScreenProps) {
  const { placeId } = route.params;
  const [categories, setCategories] = useState<MenuCategoryForEditing[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [addingItemToCat, setAddingItemToCat] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editItemName, setEditItemName] = useState('');
  const [editItemPrice, setEditItemPrice] = useState('');
  const [editItemDescription, setEditItemDescription] = useState('');
  const [reordering, setReordering] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await businessRepository.getMenuCategories(placeId);
    setCategories(data);
    setLoading(false);
  }, [placeId]);

  const invalidateCache = () => {
    restaurantsRepository.clearPlaceCache(placeId);
  };

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await businessRepository.createMenuCategory(placeId, newCategoryName.trim());
      invalidateCache();
      setNewCategoryName('');
      await load();
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed');
    }
  };

  const handleEditCategory = async (id: string) => {
    if (!editCatName.trim()) return;
    try {
      await businessRepository.updateMenuCategory(id, { name: editCatName.trim() });
      invalidateCache();
      setEditingCategory(null);
      await load();
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed');
    }
  };

  const handleToggleCategory = async (id: string, isActive: boolean) => {
    try {
      await businessRepository.updateMenuCategory(id, { isActive: !isActive });
      invalidateCache();
      await load();
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed');
    }
  };

  const handleDeleteCategory = (id: string, name: string) => {
    Alert.alert('Delete Category', `Delete "${name}" and all its items?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await businessRepository.deleteMenuCategory(id); invalidateCache(); await load(); }
        catch (e: unknown) { Alert.alert('Error', e instanceof Error ? e.message : 'Failed'); }
      }},
    ]);
  };

  const handleAddItem = async (categoryId: string) => {
    if (!newItemName.trim() || !newItemPrice.trim()) return;
    const price = Number(newItemPrice);
    if (isNaN(price) || price < 0) { Alert.alert('Invalid', 'Enter a valid price.'); return; }
    try {
      await businessRepository.createMenuItem(categoryId, {
        name: newItemName.trim(),
        price,
        description: newItemDescription.trim() || undefined,
      });
      invalidateCache();
      setNewItemName(''); setNewItemPrice(''); setNewItemDescription(''); setAddingItemToCat(null);
      await load();
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed');
    }
  };

  const handleEditItem = async (itemId: string) => {
    if (!editItemName.trim() || !editItemPrice.trim()) return;
    const price = Number(editItemPrice);
    if (isNaN(price) || price < 0) { Alert.alert('Invalid', 'Enter a valid price.'); return; }
    try {
      await businessRepository.updateMenuItem(itemId, {
        name: editItemName.trim(),
        price,
        description: editItemDescription.trim() || undefined,
      });
      invalidateCache();
      setEditingItem(null);
      await load();
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed');
    }
  };

  const handleToggleItem = async (itemId: string, isAvailable: boolean) => {
    try {
      await businessRepository.updateMenuItem(itemId, { isAvailable: !isAvailable });
      invalidateCache();
      await load();
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed');
    }
  };

  const handleDeleteItem = (itemId: string, itemName: string) => {
    Alert.alert('Delete Item', `Delete "${itemName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await businessRepository.deleteMenuItem(itemId); invalidateCache(); await load(); }
        catch (e: unknown) { Alert.alert('Error', e instanceof Error ? e.message : 'Failed'); }
      }},
    ]);
  };

  const handleMoveItem = async (categoryId: string, itemId: string, direction: 'up' | 'down') => {
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return;
    const sorted = [...cat.items].sort((a, b) => a.sortOrder - b.sortOrder);
    const index = sorted.findIndex((i) => i.id === itemId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sorted.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updates = [
      { id: sorted[index].id, sortOrder: sorted[targetIndex].sortOrder },
      { id: sorted[targetIndex].id, sortOrder: sorted[index].sortOrder },
    ];

    setReordering(itemId);
    try {
      for (const u of updates) {
        const { error } = await supabase.from('menu_items').update({ sort_order: u.sortOrder }).eq('id', u.id);
        if (error) throw new Error(error.message);
      }
      invalidateCache();
      await load();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to reorder.');
    } finally {
      setReordering(null);
    }
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Add category */}
      <View style={styles.addRow}>
        <TextInput
          style={styles.addInput}
          value={newCategoryName}
          onChangeText={setNewCategoryName}
          placeholder="New category name"
          placeholderTextColor={theme.colors.mutedText}
          returnKeyType="done"
          onSubmitEditing={handleAddCategory}
        />
        <Pressable style={styles.addButton} onPress={handleAddCategory}>
          <Ionicons name="add" size={20} color={theme.colors.surface} />
        </Pressable>
      </View>

      {categories.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="book-outline" size={48} color={theme.colors.mutedText} />
          <Text style={styles.emptyText}>No menu categories</Text>
          <Text style={styles.emptySubtext}>Add categories like Appetizers, Main Courses, Drinks...</Text>
        </View>
      ) : (
        categories.map((cat) => (
          <View key={cat.id} style={styles.categoryCard}>
            <Pressable style={styles.categoryHeader} onPress={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}>
              {editingCategory === cat.id ? (
                <View style={styles.editRow}>
                  <TextInput style={styles.editInput} value={editCatName} onChangeText={setEditCatName} />
                  <Pressable onPress={() => handleEditCategory(cat.id)}><Ionicons name="checkmark" size={20} color="#42D98C" /></Pressable>
                  <Pressable onPress={() => setEditingCategory(null)}><Ionicons name="close" size={20} color="#FF3B3B" /></Pressable>
                </View>
              ) : (
                <>
                  <View style={styles.catInfo}>
                    <Text style={[styles.catName, !cat.isActive && styles.inactiveText]}>{cat.name}</Text>
                    <Text style={styles.catCount}>{cat.items.length} items</Text>
                  </View>
                  <View style={styles.catActions}>
                    <Switch value={cat.isActive} onValueChange={() => handleToggleCategory(cat.id, cat.isActive)} trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(66,217,140,0.4)' }} thumbColor={cat.isActive ? '#42D98C' : '#555'} />
                    <Pressable onPress={() => { setEditingCategory(cat.id); setEditCatName(cat.name); }}><Ionicons name="create-outline" size={18} color={theme.colors.mutedText} /></Pressable>
                    <Pressable onPress={() => handleDeleteCategory(cat.id, cat.name)}><Ionicons name="trash-outline" size={18} color="#FF3B3B" /></Pressable>
                    <Ionicons name={expandedCategory === cat.id ? 'chevron-up' : 'chevron-down'} size={18} color={theme.colors.mutedText} />
                  </View>
                </>
              )}
            </Pressable>

            {expandedCategory === cat.id && (
              <View style={styles.itemsSection}>
                {cat.items
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((item, idx, arr) => {
                    const isBusy = reordering === item.id;
                    const canMoveUp = idx > 0;
                    const canMoveDown = idx < arr.length - 1;

                    return editingItem === item.id ? (
                      <View key={item.id} style={styles.itemEditCard}>
                        <TextInput style={styles.itemEditInput} value={editItemName} onChangeText={setEditItemName} placeholder="Name" placeholderTextColor={theme.colors.mutedText} />
                        <TextInput style={[styles.itemEditInput, styles.priceInput]} value={editItemPrice} onChangeText={setEditItemPrice} placeholder="€" placeholderTextColor={theme.colors.mutedText} keyboardType="decimal-pad" />
                        <TextInput style={styles.itemEditInput} value={editItemDescription} onChangeText={setEditItemDescription} placeholder="Description (optional)" placeholderTextColor={theme.colors.mutedText} />
                        <View style={styles.itemEditActions}>
                          <Pressable onPress={() => handleEditItem(item.id)}><Ionicons name="checkmark" size={18} color="#42D98C" /></Pressable>
                          <Pressable onPress={() => setEditingItem(null)}><Ionicons name="close" size={18} color="#FF3B3B" /></Pressable>
                        </View>
                      </View>
                    ) : (
                      <View key={item.id} style={styles.itemRow}>
                        <View style={styles.itemReorderCol}>
                          {canMoveUp && (
                            <Pressable style={isBusy ? styles.actionDisabled : undefined} onPress={() => handleMoveItem(cat.id, item.id, 'up')} disabled={isBusy}>
                              <Ionicons name="chevron-up" size={14} color={theme.colors.mutedText} />
                            </Pressable>
                          )}
                          {canMoveDown && (
                            <Pressable style={isBusy ? styles.actionDisabled : undefined} onPress={() => handleMoveItem(cat.id, item.id, 'down')} disabled={isBusy}>
                              <Ionicons name="chevron-down" size={14} color={theme.colors.mutedText} />
                            </Pressable>
                          )}
                        </View>
                        <View style={styles.itemInfo}>
                          <Text style={[styles.itemName, !item.isAvailable && styles.inactiveText]}>{item.name}</Text>
                          {item.description ? (
                            <Text style={styles.itemDesc} numberOfLines={1}>{item.description}</Text>
                          ) : null}
                          <Text style={styles.itemPrice}>€{item.price.toFixed(2)}</Text>
                        </View>
                        <View style={styles.itemActions}>
                          <Switch value={item.isAvailable} onValueChange={() => handleToggleItem(item.id, item.isAvailable)} trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(66,217,140,0.4)' }} thumbColor={item.isAvailable ? '#42D98C' : '#555'} />
                          <Pressable onPress={() => { setEditingItem(item.id); setEditItemName(item.name); setEditItemPrice(String(item.price)); setEditItemDescription(item.description ?? ''); }}>
                            <Ionicons name="create-outline" size={16} color={theme.colors.mutedText} />
                          </Pressable>
                          <Pressable onPress={() => handleDeleteItem(item.id, item.name)}><Ionicons name="trash-outline" size={16} color="#FF3B3B" /></Pressable>
                        </View>
                      </View>
                    );
                  })}

                {addingItemToCat === cat.id ? (
                  <View style={styles.addItemForm}>
                    <TextInput style={styles.itemEditInput} value={newItemName} onChangeText={setNewItemName} placeholder="Item name" placeholderTextColor={theme.colors.mutedText} />
                    <TextInput style={[styles.itemEditInput, styles.priceInput]} value={newItemPrice} onChangeText={setNewItemPrice} placeholder="€" placeholderTextColor={theme.colors.mutedText} keyboardType="decimal-pad" />
                    <TextInput style={styles.itemEditInput} value={newItemDescription} onChangeText={setNewItemDescription} placeholder="Description" placeholderTextColor={theme.colors.mutedText} />
                    <View style={styles.itemEditActions}>
                      <Pressable onPress={() => handleAddItem(cat.id)}><Ionicons name="checkmark" size={20} color="#42D98C" /></Pressable>
                      <Pressable onPress={() => { setAddingItemToCat(null); setNewItemDescription(''); }}><Ionicons name="close" size={20} color="#FF3B3B" /></Pressable>
                    </View>
                  </View>
                ) : (
                  <Pressable style={styles.addItemButton} onPress={() => { setAddingItemToCat(cat.id); setNewItemName(''); setNewItemPrice(''); setNewItemDescription(''); }}>
                    <Ionicons name="add-circle-outline" size={18} color={theme.colors.primary} />
                    <Text style={styles.addItemText}>Add item</Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingHorizontal: 20, paddingTop: PAGE_TOP_PADDING, paddingBottom: PAGE_BOTTOM_PADDING },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background },
  addRow: { flexDirection: 'row', gap: 10, marginTop: 25, alignItems: 'center' },
  addInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, color: theme.colors.heading, fontSize: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  addButton: { width: 46, height: 46, borderRadius: 16, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  categoryCard: { marginTop: 16, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  catInfo: { flex: 1 },
  catName: { color: theme.colors.heading, fontSize: 17, fontWeight: '800' },
  catCount: { color: theme.colors.mutedText, fontSize: 12, marginTop: 2 },
  catActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  inactiveText: { opacity: 0.4 },
  itemsSection: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 16, paddingBottom: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)', gap: 8 },
  itemReorderCol: { width: 20, alignItems: 'center', gap: 2 },
  itemInfo: { flex: 1 },
  itemName: { color: theme.colors.heading, fontSize: 14, fontWeight: '600' },
  itemDesc: { color: '#A0A6C4', fontSize: 11, marginTop: 2 },
  itemPrice: { color: '#F7D7A2', fontSize: 14, fontWeight: '700', marginTop: 2 },
  itemActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  editInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, color: theme.colors.heading, fontSize: 14 },
  itemEditCard: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)', gap: 6 },
  itemEditInput: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, color: theme.colors.heading, fontSize: 13 },
  priceInput: { width: 80 },
  itemEditActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  addItemForm: { paddingVertical: 10, gap: 6 },
  addItemButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, marginTop: 4 },
  addItemText: { color: theme.colors.primary, fontSize: 14, fontWeight: '600' },
  actionDisabled: { opacity: 0.4 },
  emptyState: { marginTop: 60, alignItems: 'center', gap: 10 },
  emptyText: { color: theme.colors.heading, fontSize: 18, fontWeight: '700' },
  emptySubtext: { color: theme.colors.mutedText, fontSize: 14, textAlign: 'center', maxWidth: 260, lineHeight: 20 },
});