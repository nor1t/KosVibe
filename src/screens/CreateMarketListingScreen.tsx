import { Ionicons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { useI18n } from '../i18n/I18nProvider';
import { createListing, fetchCategories } from '../features/ruralMarket/ruralMarketRepository';
import type { RuralMarketCategory } from '../features/ruralMarket/ruralMarketTypes';

const c = {
  bg: '#F6F1E6', bgAlt: '#F0EBDE', card: '#FFFFFF', text: '#3A3328',
  textMuted: '#8A8278', accent: '#6B7C45', accentLight: '#E8EDDE',
  accentGold: '#B8963E', border: 'rgba(58,51,40,0.08)', white: '#FFFFFF',
};

type Props = { navigation: NavigationProp<ParamListBase> };
const TAB_BAR_HEIGHT = 82, TAB_BAR_MARGIN = 10;

export function CreateMarketListingScreen({ navigation }: Props) {
  const { language } = useI18n();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const [categories, setCategories] = useState<RuralMarketCategory[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const bottomOffset = TAB_BAR_HEIGHT + TAB_BAR_MARGIN + Math.min(insets.bottom, 10) + 50;

  useFocusEffect(useCallback(() => { void fetchCategories().then(setCategories).catch(() => {}); }, []));

  const handlePickImages = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission Required', language === 'sq' ? 'Lejoni qasje ne galeri.' : 'Please grant photo library access.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, allowsMultipleSelection: true });
    if (result.canceled || !result.assets) return;
    setImageUris(prev => [...prev, ...result.assets.map(a => a.uri)]);
  };

  const handleRemoveImage = (i: number) => setImageUris(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (!title.trim()) { Alert.alert(language === 'sq' ? 'Titulli i detyrueshem' : 'Title is required'); return; }
    if (!categoryId) { Alert.alert(language === 'sq' ? 'Zgjidh kategorine' : 'Choose a category'); return; }
    setSaving(true);
    try {
      await createListing({ categoryId, title: title.trim(), description: description.trim(), price: price.trim(), contactPhone: phone.trim(), address: address.trim(), city: city.trim(), imageUris });
      navigation.goBack();
    } catch (e) { Alert.alert('Error', e instanceof Error ? e.message : 'Failed to create'); }
    finally { setSaving(false); }
  };

  const t = (en: string, sq: string) => language === 'sq' ? sq : en;

  return (
    <View style={[styles.container, { paddingTop: headerHeight }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: bottomOffset }}>
        <Text style={styles.pageTitle}>{t('Create Listing', 'Krijo Listen')}</Text>

        <Text style={styles.label}>{t('Category', 'Kategoria')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow} contentContainerStyle={{ paddingHorizontal: 0 }}>
          {categories.map(cat => {
            const active = cat.id === categoryId;
            return (
              <Pressable key={cat.id} style={[styles.catChip, active && styles.catChipActive]} onPress={() => setCategoryId(cat.id)}>
                <Ionicons name={cat.iconName as any ?? 'leaf-outline'} size={13} color={active ? c.white : c.accent} />
                <Text style={[styles.catChipText, active && styles.catChipTextActive]}>{language === 'sq' ? cat.labelSq : cat.labelEn}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.label}>{t('Title', 'Titulli')}</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholderTextColor={c.textMuted} maxLength={200} />

        <Text style={styles.label}>{t('Description', 'Pershkrimi')}</Text>
        <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholderTextColor={c.textMuted} multiline maxLength={2000} />

        <Text style={styles.label}>{t('Price', 'Cmimi')}</Text>
        <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="€" placeholderTextColor={c.textMuted} />

        <Text style={styles.label}>{t('Phone', 'Telefoni')}</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+383..." placeholderTextColor={c.textMuted} keyboardType="phone-pad" />

        <Text style={styles.label}>{t('Address', 'Adresa')}</Text>
        <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholderTextColor={c.textMuted} />

        <Text style={styles.label}>{t('City', 'Qyteti')}</Text>
        <TextInput style={styles.input} value={city} onChangeText={setCity} placeholderTextColor={c.textMuted} />

        <Text style={styles.label}>{t('Images', 'Fotot')}</Text>
        <View style={styles.imageGrid}>
          {imageUris.map((uri, i) => (
            <View key={`${i}-${uri}`} style={styles.imageTile}>
              <Image source={{ uri }} style={styles.imageTileImg} />
              <Pressable style={styles.removeBtn} onPress={() => handleRemoveImage(i)}><Ionicons name="close-circle" size={20} color="#FF4444" /></Pressable>
            </View>
          ))}
          <Pressable style={styles.addImageBtn} onPress={handlePickImages}>
            <Ionicons name="add" size={28} color={c.accent} />
            <Text style={styles.addImageText}>{t('Add images', 'Shto foto')}</Text>
          </Pressable>
        </View>

        <Pressable style={[styles.submitBtn, saving && { opacity: 0.6 }]} onPress={handleSubmit} disabled={saving}>
          {saving ? <ActivityIndicator color={c.white} /> : <Text style={styles.submitText}>{t('Publish', 'Publiko')}</Text>}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: c.bg },
  pageTitle: { color: c.text, fontSize: 24, fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }), marginBottom: 20 },
  label: { color: c.textMuted, fontSize: 12, fontWeight: '600', marginTop: 18, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  input: { backgroundColor: c.card, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, color: c.text, fontSize: 15, borderWidth: 1, borderColor: c.border },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  catRow: { marginBottom: 4 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, backgroundColor: c.bgAlt, marginRight: 10 },
  catChipActive: { backgroundColor: c.accent },
  catChipText: { color: c.textMuted, fontSize: 13, fontWeight: '600' },
  catChipTextActive: { color: c.white },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  imageTile: { width: 90, height: 90, borderRadius: 12, overflow: 'hidden' },
  imageTileImg: { width: '100%', height: '100%' },
  removeBtn: { position: 'absolute', top: -2, right: -2, backgroundColor: c.white, borderRadius: 10 },
  addImageBtn: { width: 90, height: 90, borderRadius: 12, borderWidth: 2, borderColor: c.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  addImageText: { color: c.textMuted, fontSize: 10, marginTop: 4 },
  submitBtn: { marginTop: 32, backgroundColor: c.accent, borderRadius: 28, paddingVertical: 16, alignItems: 'center' },
  submitText: { color: c.white, fontSize: 16, fontWeight: '600' },
});