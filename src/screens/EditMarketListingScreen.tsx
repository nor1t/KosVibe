import { Ionicons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import type { NavigationProp, ParamListBase, RouteProp } from '@react-navigation/native';
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
import { fetchCategories, fetchListingById, updateListing, deleteListing, markListingSold } from '../features/ruralMarket/ruralMarketRepository';
import type { RuralMarketCategory, RuralMarketImage } from '../features/ruralMarket/ruralMarketTypes';

const c = {
  bg: '#F6F1E6', bgAlt: '#F0EBDE', card: '#FFFFFF', text: '#3A3328',
  textMuted: '#8A8278', accent: '#6B7C45', accentLight: '#E8EDDE',
  accentGold: '#B8963E', border: 'rgba(58,51,40,0.08)', white: '#FFFFFF',
  danger: '#D44B3A',
};

type Props = { navigation: NavigationProp<ParamListBase>; route: RouteProp<{ EditMarketListing: { listingId: string } }, 'EditMarketListing'> };
const TAB_BAR_HEIGHT = 82, TAB_BAR_MARGIN = 10;

export function EditMarketListingScreen({ navigation, route }: Props) {
  const { listingId } = route.params;
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
  const [existingImages, setExistingImages] = useState<RuralMarketImage[]>([]);
  const [keepImageIds, setKeepImageIds] = useState<string[]>([]);
  const [newImageUris, setNewImageUris] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const bottomOffset = TAB_BAR_HEIGHT + TAB_BAR_MARGIN + Math.min(insets.bottom, 10) + 50;

  useFocusEffect(useCallback(() => {
    void (async () => {
      setLoading(true);
      try {
        const [cats, listing] = await Promise.all([fetchCategories(), fetchListingById(listingId)]);
        setCategories(cats);
        if (listing) { setCategoryId(listing.categoryId); setTitle(listing.title); setDescription(listing.description); setPrice(listing.price); setPhone(listing.contactPhone); setAddress(listing.address); setCity(listing.city); setExistingImages(listing.images); setKeepImageIds(listing.images.map(img => img.id)); }
      } catch {} finally { setLoading(false); }
    })();
  }, [listingId]));

  const handlePickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, allowsMultipleSelection: true });
    if (result.canceled || !result.assets) return;
    setNewImageUris(prev => [...prev, ...result.assets.map(a => a.uri)]);
  };
  const handleRemoveExisting = (id: string) => { setExistingImages(p => p.filter(img => img.id !== id)); setKeepImageIds(p => p.filter(kid => kid !== id)); };
  const handleRemoveNew = (i: number) => setNewImageUris(p => p.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!title.trim()) { Alert.alert('Title required'); return; }
    setSaving(true);
    try {
      await updateListing(listingId, { categoryId, title: title.trim(), description: description.trim(), price: price.trim(), contactPhone: phone.trim(), address: address.trim(), city: city.trim(), keepImageIds, newImageUris: newImageUris.length > 0 ? newImageUris : undefined });
      navigation.goBack();
    } catch (e) { Alert.alert('Error', e instanceof Error ? e.message : 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = () => Alert.alert(language === 'sq' ? 'Fshi Listen' : 'Delete Listing', language === 'sq' ? 'Jeni te sigurt?' : 'Are you sure?', [{ text: language === 'sq' ? 'Anulo' : 'Cancel', style: 'cancel' }, { text: language === 'sq' ? 'Fshij' : 'Delete', style: 'destructive', onPress: async () => { try { await deleteListing(listingId); navigation.goBack(); navigation.goBack(); } catch (e) { Alert.alert('Error', e instanceof Error ? e.message : 'Failed'); } } }]);

  const handleMarkSold = async () => { try { await markListingSold(listingId); navigation.goBack(); } catch (e) { Alert.alert('Error', e instanceof Error ? e.message : 'Failed'); } };

  const t = (en: string, sq: string) => language === 'sq' ? sq : en;

  if (loading) return (<View style={[styles.container, { paddingTop: headerHeight }]}><View style={styles.center}><ActivityIndicator size="large" color={c.accent} /></View></View>);

  return (
    <View style={[styles.container, { paddingTop: headerHeight }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: bottomOffset }}>
        <Text style={styles.pageTitle}>{t('Edit Listing', 'Ndrysho Listen')}</Text>

        <Text style={styles.label}>{t('Category', 'Kategoria')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 0 }}>
          {categories.map(cat => {
            const active = cat.id === categoryId;
            return (<Pressable key={cat.id} style={[styles.catChip, active && styles.catChipActive]} onPress={() => setCategoryId(cat.id)}><Ionicons name={cat.iconName as any ?? 'leaf-outline'} size={13} color={active ? c.white : c.accent} /><Text style={[styles.catChipText, active && styles.catChipTextActive]}>{language === 'sq' ? cat.labelSq : cat.labelEn}</Text></Pressable>);
          })}
        </ScrollView>

        <Text style={styles.label}>{t('Title', 'Titulli')}</Text><TextInput style={styles.input} value={title} onChangeText={setTitle} maxLength={200} />
        <Text style={styles.label}>{t('Description', 'Pershkrimi')}</Text><TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} multiline maxLength={2000} />
        <Text style={styles.label}>{t('Price', 'Cmimi')}</Text><TextInput style={styles.input} value={price} onChangeText={setPrice} />
        <Text style={styles.label}>{t('Phone', 'Telefoni')}</Text><TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Text style={styles.label}>{t('Address', 'Adresa')}</Text><TextInput style={styles.input} value={address} onChangeText={setAddress} />
        <Text style={styles.label}>{t('City', 'Qyteti')}</Text><TextInput style={styles.input} value={city} onChangeText={setCity} />

        {existingImages.length > 0 && (<>
          <Text style={styles.label}>{t('Current Images', 'Fotot Ekzistuese')}</Text>
          <View style={styles.imageGrid}>{existingImages.map(img => (<View key={img.id} style={styles.imageTile}><Image source={{ uri: img.publicUrl }} style={styles.imageTileImg} /><Pressable style={styles.removeBtn} onPress={() => handleRemoveExisting(img.id)}><Ionicons name="close-circle" size={20} color={c.danger} /></Pressable></View>))}</View>
        </>)}

        <Text style={styles.label}>{t('New Images', 'Foto te Reja')}</Text>
        <View style={styles.imageGrid}>
          {newImageUris.map((uri, i) => (<View key={`new-${i}`} style={styles.imageTile}><Image source={{ uri }} style={styles.imageTileImg} /><Pressable style={styles.removeBtn} onPress={() => handleRemoveNew(i)}><Ionicons name="close-circle" size={20} color={c.danger} /></Pressable></View>))}
          <Pressable style={styles.addImageBtn} onPress={handlePickImages}><Ionicons name="add" size={28} color={c.accent} /></Pressable>
        </View>

        <Pressable style={[styles.submitBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>{saving ? <ActivityIndicator color={c.white} /> : <Text style={styles.submitText}>{t('Save Changes', 'Ruaj Ndryshimet')}</Text>}</Pressable>

        <Pressable style={styles.soldBtn} onPress={handleMarkSold}><Ionicons name="checkmark-circle-outline" size={18} color={c.accent} /><Text style={styles.soldText}>{t('Mark as Sold', 'Sheno si e Shitur')}</Text></Pressable>

        <Pressable style={styles.deleteBtn} onPress={handleDelete}><Ionicons name="trash-outline" size={18} color={c.danger} /><Text style={styles.deleteText}>{t('Delete Listing', 'Fshi Listen')}</Text></Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: c.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pageTitle: { color: c.text, fontSize: 24, fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }), marginBottom: 20 },
  label: { color: c.textMuted, fontSize: 12, fontWeight: '600', marginTop: 18, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  input: { backgroundColor: c.card, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, color: c.text, fontSize: 15, borderWidth: 1, borderColor: c.border },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, backgroundColor: c.bgAlt, marginRight: 10 },
  catChipActive: { backgroundColor: c.accent },
  catChipText: { color: c.textMuted, fontSize: 13, fontWeight: '600' },
  catChipTextActive: { color: c.white },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  imageTile: { width: 90, height: 90, borderRadius: 12, overflow: 'hidden' },
  imageTileImg: { width: '100%', height: '100%' },
  removeBtn: { position: 'absolute', top: -2, right: -2, backgroundColor: c.white, borderRadius: 10 },
  addImageBtn: { width: 90, height: 90, borderRadius: 12, borderWidth: 2, borderColor: c.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  submitBtn: { marginTop: 32, backgroundColor: c.accent, borderRadius: 28, paddingVertical: 16, alignItems: 'center' },
  submitText: { color: c.white, fontSize: 16, fontWeight: '600' },
  soldBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 18, paddingVertical: 14, borderRadius: 28, borderWidth: 1, borderColor: c.accent },
  soldText: { color: c.accent, fontSize: 14, fontWeight: '600' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12, paddingVertical: 12 },
  deleteText: { color: c.danger, fontSize: 14, fontWeight: '600' },
});