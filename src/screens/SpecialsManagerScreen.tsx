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
import { theme } from '../theme';
import type { SpecialForEditing } from '../repositories/types';

type SpecialsManagerScreenProps = {
  route: { params: { placeId: string } };
};

export function SpecialsManagerScreen({ route }: SpecialsManagerScreenProps) {
  const { placeId } = route.params;
  const [specials, setSpecials] = useState<SpecialForEditing[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    originalPrice: '',
    price: '',
    discountLabel: '',
    availableUntil: '',
  });

  const load = useCallback(async () => {
    const data = await businessRepository.getSpecials(placeId);
    setSpecials(data);
    setLoading(false);
  }, [placeId]);

  const invalidateCache = () => {
    restaurantsRepository.clearPlaceCache(placeId);
  };

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const resetForm = () =>
    setForm({ name: '', description: '', originalPrice: '', price: '', discountLabel: '', availableUntil: '' });

  const handleAdd = async () => {
    if (!form.name.trim() || !form.price.trim()) {
      Alert.alert('Required', 'Name and price are required.');
      return;
    }
    try {
      await businessRepository.createSpecial(placeId, {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        originalPrice: form.originalPrice.trim() || undefined,
        price: form.price.trim(),
        discountLabel: form.discountLabel.trim() || undefined,
        availableUntil: form.availableUntil.trim() || undefined,
      });
      invalidateCache();
      setAdding(false);
      resetForm();
      await load();
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed');
    }
  };

  const handleEdit = async (id: string) => {
    if (!form.name.trim() || !form.price.trim()) {
      Alert.alert('Required', 'Name and price are required.');
      return;
    }
    try {
      await businessRepository.updateSpecial(id, {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        originalPrice: form.originalPrice.trim() || undefined,
        price: form.price.trim(),
        discountLabel: form.discountLabel.trim() || undefined,
        availableUntil: form.availableUntil.trim() || undefined,
      });
      invalidateCache();
      setEditingId(null);
      resetForm();
      await load();
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed');
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      await businessRepository.updateSpecial(id, { isActive: !active });
      invalidateCache();
      await load();
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed');
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Special', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await businessRepository.deleteSpecial(id);
            invalidateCache();
            await load();
          } catch (e: unknown) {
            Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
          }
        },
      },
    ]);
  };

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {!adding && !editingId && (
        <Pressable
          style={styles.addButton}
          onPress={() => { setAdding(true); resetForm(); }}
        >
          <Ionicons name="add" size={20} color={theme.colors.surface} />
          <Text style={styles.addButtonText}>New Special</Text>
        </Pressable>
      )}

      {(adding || editingId) && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>{editingId ? 'Edit Special' : 'New Special'}</Text>
          <TextInput style={styles.input} value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} placeholder="Name *" placeholderTextColor={theme.colors.mutedText} />
          <TextInput style={[styles.input, styles.textArea]} value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} placeholder="Description" placeholderTextColor={theme.colors.mutedText} multiline />
          <View style={styles.priceRow}>
            <TextInput style={[styles.input, styles.halfInput]} value={form.originalPrice} onChangeText={(v) => setForm({ ...form, originalPrice: v })} placeholder="Original price" placeholderTextColor={theme.colors.mutedText} />
            <TextInput style={[styles.input, styles.halfInput]} value={form.price} onChangeText={(v) => setForm({ ...form, price: v })} placeholder="Price *" placeholderTextColor={theme.colors.mutedText} />
          </View>
          <TextInput style={styles.input} value={form.discountLabel} onChangeText={(v) => setForm({ ...form, discountLabel: v })} placeholder="Discount label (e.g. -20%)" placeholderTextColor={theme.colors.mutedText} />
          <TextInput style={styles.input} value={form.availableUntil} onChangeText={(v) => setForm({ ...form, availableUntil: v })} placeholder="Available until (e.g. Today 10PM)" placeholderTextColor={theme.colors.mutedText} />
          <View style={styles.formActions}>
            <Pressable style={styles.cancelButton} onPress={() => { setAdding(false); setEditingId(null); resetForm(); }}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.saveButton} onPress={() => (editingId ? handleEdit(editingId) : handleAdd())}>
              <Ionicons name="checkmark" size={18} color={theme.colors.surface} />
              <Text style={styles.saveText}>{editingId ? 'Save' : 'Create'}</Text>
            </Pressable>
          </View>
        </View>
      )}

      {specials.length === 0 && !adding ? (
        <View style={styles.emptyState}>
          <Ionicons name="star-outline" size={48} color={theme.colors.mutedText} />
          <Text style={styles.emptyText}>No daily specials</Text>
          <Text style={styles.emptySubtext}>Add limited-time offers and featured dishes to attract more customers.</Text>
        </View>
      ) : (
        specials.map((s) => (
          <View key={s.id} style={[styles.specialCard, !s.isActive && styles.inactiveCard]}>
            <View style={styles.specialHeader}>
              <Text style={[styles.specialName, !s.isActive && styles.inactiveText]}>{s.name}</Text>
              <Switch value={s.isActive} onValueChange={() => handleToggle(s.id, s.isActive)} trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(66,217,140,0.4)' }} thumbColor={s.isActive ? '#42D98C' : '#555'} />
            </View>
            {s.description ? <Text style={styles.specialDesc}>{s.description}</Text> : null}
            <View style={styles.specialPrices}>
              {s.originalPrice ? <Text style={styles.originalPrice}>{s.originalPrice}</Text> : null}
              <Text style={styles.price}>{s.price}</Text>
              {s.discountLabel ? <Text style={styles.discount}>{s.discountLabel}</Text> : null}
            </View>
            {s.availableUntil ? <Text style={styles.availableUntil}>Until: {s.availableUntil}</Text> : null}
            <View style={styles.specialActions}>
              <Pressable onPress={() => { setEditingId(s.id); setForm({ name: s.name, description: s.description ?? '', originalPrice: s.originalPrice ?? '', price: s.price, discountLabel: s.discountLabel ?? '', availableUntil: s.availableUntil ?? '' }); setAdding(false); }}>
                <Ionicons name="create-outline" size={18} color={theme.colors.mutedText} />
              </Pressable>
              <Pressable onPress={() => handleDelete(s.id, s.name)}>
                <Ionicons name="trash-outline" size={18} color="#FF3B3B" />
              </Pressable>
            </View>
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
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 25, padding: 14, borderRadius: 16, backgroundColor: theme.colors.primary },
  addButtonText: { color: theme.colors.surface, fontSize: 15, fontWeight: '700' },
  formCard: { marginTop: 25, padding: 20, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', gap: 12 },
  formTitle: { color: theme.colors.heading, fontSize: 20, fontWeight: '900' },
  input: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: theme.colors.heading, fontSize: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  textArea: { minHeight: 60, textAlignVertical: 'top' },
  priceRow: { flexDirection: 'row', gap: 10 },
  halfInput: { flex: 1 },
  formActions: { flexDirection: 'row', gap: 10 },
  cancelButton: { flex: 1, paddingVertical: 12, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center' },
  cancelText: { color: theme.colors.heading, fontSize: 14, fontWeight: '700' },
  saveButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 14, backgroundColor: theme.colors.primary },
  saveText: { color: theme.colors.surface, fontSize: 14, fontWeight: '700' },
  specialCard: { marginTop: 16, padding: 16, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  inactiveCard: { opacity: 0.5 },
  specialHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  specialName: { color: theme.colors.heading, fontSize: 17, fontWeight: '800' },
  specialDesc: { color: '#A0A6C4', fontSize: 13, marginTop: 6 },
  specialPrices: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  originalPrice: { color: theme.colors.mutedText, fontSize: 14, textDecorationLine: 'line-through' },
  price: { color: '#F7D7A2', fontSize: 18, fontWeight: '800' },
  discount: { color: '#FF6138', fontSize: 12, fontWeight: '700', backgroundColor: 'rgba(255,97,56,0.16)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  availableUntil: { color: theme.colors.mutedText, fontSize: 12, marginTop: 6 },
  specialActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 10 },
  inactiveText: { opacity: 0.5 },
  emptyState: { marginTop: 60, alignItems: 'center', gap: 10 },
  emptyText: { color: theme.colors.heading, fontSize: 18, fontWeight: '700' },
  emptySubtext: { color: theme.colors.mutedText, fontSize: 14, textAlign: 'center', maxWidth: 260, lineHeight: 20 },
});