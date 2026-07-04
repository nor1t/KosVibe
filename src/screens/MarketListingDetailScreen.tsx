import { Ionicons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import type { NavigationProp, ParamListBase, RouteProp } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '../i18n/I18nProvider';
import { fetchListingById } from '../features/ruralMarket/ruralMarketRepository';
import type { RuralMarketListing } from '../features/ruralMarket/ruralMarketTypes';

// ─── Local palette ────────────────────────────────────────────
const c = {
  bg: '#F6F1E6',
  bgAlt: '#F0EBDE',
  card: '#FFFFFF',
  text: '#3A3328',
  textMuted: '#8A8278',
  accent: '#6B7C45',
  accentLight: '#E8EDDE',
  accentGold: '#B8963E',
  border: 'rgba(58, 51, 40, 0.08)',
  white: '#FFFFFF',
};

type Props = {
  navigation: NavigationProp<ParamListBase>;
  route: RouteProp<{ MarketListingDetail: { listingId: string } }, 'MarketListingDetail'>;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_SIZE = SCREEN_WIDTH - 40;
const TAB_BAR_HEIGHT = 82;
const TAB_BAR_MARGIN = 10;

export function MarketListingDetailScreen({ navigation, route }: Props) {
  const { listingId } = route.params;
  const { language } = useI18n();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const [listing, setListing] = useState<RuralMarketListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);

  const bottomOffset = TAB_BAR_HEIGHT + TAB_BAR_MARGIN + Math.min(insets.bottom, 10) + 100;

  const load = useCallback(async () => {
    setError(null); setLoading(true);
    try {
      const data = await fetchListingById(listingId);
      setListing(data);
      if (!data) setError('Listing not found');
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to load'); }
    finally { setLoading(false); }
  }, [listingId]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const handleCall = () => { if (listing?.contactPhone) Linking.openURL(`tel:${listing.contactPhone}`); };
  const handleShare = async () => {
    if (!listing) return;
    try { await Share.share({ message: `${listing.title}${listing.price ? ` - ${listing.price}` : ''}\n${listing.description}\n\n${listing.city}, ${listing.address}\n${listing.contactPhone}` }); } catch {}
  };

  if (loading) return (<View style={[styles.container, { paddingTop: headerHeight }]}><View style={styles.center}><ActivityIndicator size="large" color={c.accent} /></View></View>);
  if (error || !listing) return (<View style={[styles.container, { paddingTop: headerHeight }]}><View style={styles.center}><Ionicons name="alert-circle-outline" size={48} color={c.textMuted} /><Text style={styles.errorText}>{error ?? 'Listing not found'}</Text><Pressable style={styles.retryBtn} onPress={load}><Text style={styles.retryText}>Retry</Text></Pressable></View></View>);

  const images = listing.images;
  const currentImage = images.length > 0 ? images[Math.min(imageIndex, images.length - 1)].publicUrl : null;

  return (
    <View style={[styles.container, { paddingTop: headerHeight }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomOffset }}>

        {/* Image Gallery */}
        {currentImage ? (
          <View style={styles.galleryWrap}>
            <Image source={{ uri: currentImage }} style={styles.galleryImage} />
            {images.length > 1 && (<>
              <Pressable style={[styles.galleryArrow, styles.galleryLeft]} onPress={() => setImageIndex(p => p > 0 ? p - 1 : images.length - 1)}><Ionicons name="chevron-back" size={20} color={c.white} /></Pressable>
              <Pressable style={[styles.galleryArrow, styles.galleryRight]} onPress={() => setImageIndex(p => p < images.length - 1 ? p + 1 : 0)}><Ionicons name="chevron-forward" size={20} color={c.white} /></Pressable>
              <View style={styles.dotsWrap}>{images.map((_, i) => <View key={i} style={[styles.dot, i === imageIndex && styles.dotActive]} />)}</View>
            </>)}
          </View>
        ) : (
          <View style={styles.noImageWrap}>
            <Ionicons name="image-outline" size={48} color={c.textMuted} />
            <Text style={styles.noImageText}>{language === 'sq' ? 'Pa foto' : 'No image'}</Text>
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{listing.title}</Text>
          {listing.price ? <Text style={styles.price}>{listing.price}</Text> : null}
          {listing.description ? <Text style={styles.description}>{listing.description}</Text> : null}

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color={c.accent} />
            <Text style={styles.infoText}>{listing.address ? `${listing.address}, ` : ''}{listing.city}</Text>
          </View>
          {listing.contactPhone ? (
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={18} color={c.accent} />
              <Text style={styles.infoText}>{listing.contactPhone}</Text>
            </View>
          ) : null}
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color={c.textMuted} />
            <Text style={styles.infoText}>{new Date(listing.createdAt).toLocaleDateString(language === 'sq' ? 'sq-AL' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Edit fab */}
      <Pressable style={styles.editFab} onPress={() => navigation.navigate('EditMarketListing', { listingId: listing.id })}>
        <Ionicons name="create-outline" size={18} color={c.accent} />
      </Pressable>

      {/* Action bar */}
      <View style={[styles.actionBar, { bottom: TAB_BAR_HEIGHT + TAB_BAR_MARGIN + Math.min(insets.bottom, 10) + 8 }]}>
        {listing.contactPhone ? (
          <Pressable style={styles.callBtn} onPress={handleCall}>
            <Ionicons name="call" size={18} color={c.white} />
            <Text style={styles.actionText}>{language === 'sq' ? 'Telefono' : 'Call Seller'}</Text>
          </Pressable>
        ) : null}
        <Pressable style={styles.shareBtn} onPress={handleShare}>
          <Ionicons name="share-outline" size={18} color={c.accent} />
          <Text style={[styles.actionText, { color: c.accent }]}>{language === 'sq' ? 'Shperndaj' : 'Share'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: c.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  errorText: { color: c.textMuted, fontSize: 14, marginTop: 12, textAlign: 'center' },
  retryBtn: { marginTop: 12, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: c.accent },
  retryText: { color: c.white, fontWeight: '600' },
  galleryWrap: { position: 'relative' },
  galleryImage: { width: IMAGE_SIZE, height: IMAGE_SIZE * 0.65, marginHorizontal: 20, borderRadius: 16, backgroundColor: c.bgAlt },
  galleryArrow: { position: 'absolute', top: '40%', width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  galleryLeft: { left: 28 }, galleryRight: { right: 28 },
  dotsWrap: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.bgAlt },
  dotActive: { backgroundColor: c.accent },
  noImageWrap: { alignItems: 'center', justifyContent: 'center', height: 200, marginHorizontal: 20, borderRadius: 16, backgroundColor: c.bgAlt },
  noImageText: { color: c.textMuted, fontSize: 14, marginTop: 8 },
  content: { padding: 24 },
  title: { color: c.text, fontSize: 26, fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }), lineHeight: 32 },
  price: { color: c.accent, fontSize: 22, fontWeight: '700', marginTop: 8 },
  description: { color: c.textMuted, fontSize: 15, lineHeight: 22, marginTop: 14 },
  divider: { height: 1, backgroundColor: c.border, marginVertical: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  infoText: { color: c.text, fontSize: 14, flex: 1 },
  editFab: { position: 'absolute', top: 8, right: 20, width: 36, height: 36, borderRadius: 18, backgroundColor: c.white, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  actionBar: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', gap: 12, marginHorizontal: 20 },
  callBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: c.accent, paddingVertical: 14, borderRadius: 28 },
  shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: c.white, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 28, borderWidth: 1, borderColor: c.border },
  actionText: { color: c.white, fontSize: 14, fontWeight: '600' },
});