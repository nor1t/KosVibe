import { Ionicons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '../i18n/I18nProvider';
import {
  fetchActiveListings,
  fetchCategories,
  subscribeToMarketChanges,
} from '../features/ruralMarket/ruralMarketRepository';
import type { RuralMarketCategory, RuralMarketListing } from '../features/ruralMarket/ruralMarketTypes';
import { theme } from '../theme';

// ─── Local design tokens (premium tourism palette) ────────────────────────
const colors = {
  bg: '#F6F1E6',
  bgAlt: '#F0EBDE',
  card: '#FFFFFF',
  text: '#3A3328',
  textMuted: '#8A8278',
  accent: '#6B7C45',      // olive green
  accentLight: '#E8EDDE', // sage tint
  accentGold: '#B8963E',  // muted gold
  border: 'rgba(58, 51, 40, 0.08)',
  white: '#FFFFFF',
};

type Props = { navigation: NavigationProp<ParamListBase> };

const TAB_BAR_HEIGHT = 82;
const TAB_BAR_MARGIN = 10;
const FAB_SIZE = 52;
const FAB_MARGIN = 16;

export function MarketScreen({ navigation }: Props) {
  const { language } = useI18n();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const [listings, setListings] = useState<RuralMarketListing[]>([]);
  const [categories, setCategories] = useState<RuralMarketCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [cats, list] = await Promise.all([
        fetchCategories(),
        fetchActiveListings({
          categoryId: selectedCategoryId ?? undefined,
          search: search.trim() || undefined,
        }),
      ]);
      setCategories(cats);
      setListings(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryId, search]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  useEffect(() => {
    const cleanup = subscribeToMarketChanges(() => { void load(); });
    return cleanup;
  }, [load]);

  const handleSelectCategory = (id: string | null) =>
    setSelectedCategoryId(id === selectedCategoryId ? null : id);

  const bottomOffset = TAB_BAR_HEIGHT + TAB_BAR_MARGIN + Math.min(insets.bottom, 10) + 8;

  const renderListing = ({ item }: { item: RuralMarketListing }) => (
    <Pressable
      style={styles.card}
      onPress={() => navigation.navigate('MarketListingDetail', { listingId: item.id })}>
      <Image
        source={{ uri: item.thumbnailUrl ?? 'https://via.placeholder.com/400x300.png?text=No+Image' }}
        style={styles.cardImage}
      />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        {item.city ? <Text style={styles.cardCity}>{item.city}</Text> : null}
        {item.price ? <Text style={styles.cardPrice}>{item.price}</Text> : null}
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, { paddingTop: headerHeight }]}>
      {/* HERO */}
      <View style={styles.hero}>
        {/* Decorative botanical icons */}
        <View style={styles.botanicalRow}>
          <View style={styles.botanicalIcon}><Ionicons name="leaf" size={18} color={colors.accentLight} /></View>
          <View style={styles.botanicalIcon}><Ionicons name="flower" size={16} color={colors.accentGold} /></View>
          <View style={styles.botanicalIcon}><Ionicons name="leaf" size={18} color={colors.accentLight} /></View>
        </View>

        <Text style={styles.heroTitle}>
          {language === 'sq'
            ? 'Gjej gjerat lokale qe turistet duan vertet t i marrin me vete'
            : 'Find the local things tourists actually want to take home'}
        </Text>
        <Text style={styles.heroSub}>
          {language === 'sq'
            ? 'Nje treg i kuruar i tradites Kosovare'
            : 'A curated market of Kosovar tradition'}
        </Text>

        <View style={styles.botanicalDivider}>
          <View style={styles.botanicalDot} />
          <Ionicons name="leaf" size={12} color={colors.accentGold} />
          <View style={styles.botanicalDot} />
        </View>
      </View>

      {/* SEARCH */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder={language === 'sq' ? 'Kerko nga tregu rural...' : 'Search the rural market...'}
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* CATEGORIES */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(c) => c.id}
        style={styles.catListOuter}
        contentContainerStyle={styles.catListInner}
        renderItem={({ item: cat }) => {
          const active = cat.id === selectedCategoryId;
          return (
            <Pressable
              style={[styles.catPill, active && styles.catPillActive]}
              onPress={() => handleSelectCategory(cat.id)}>
              <Ionicons
                name={(cat.iconName as any) ?? 'leaf-outline'}
                size={13}
                color={active ? colors.white : colors.accent}
              />
              <Text style={[styles.catText, active && styles.catTextActive]}>
                {language === 'sq' ? cat.labelSq : cat.labelEn}
              </Text>
            </Pressable>
          );
        }}
      />

      {/* SECTION TITLE */}
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>
          {language === 'sq' ? 'Shites lokal' : 'Local Sellers'}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
      </View>

      {/* LISTINGS */}
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          renderItem={renderListing}
          contentContainerStyle={[styles.listContent, { paddingBottom: bottomOffset + FAB_SIZE + FAB_MARGIN }]}
          numColumns={2}
          columnWrapperStyle={styles.columnWrap}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="basket-outline" size={40} color={colors.accentLight} />
              </View>
              <Text style={styles.emptyTitle}>
                {language === 'sq' ? 'Ende pa liste' : 'Nothing listed yet'}
              </Text>
              <Text style={styles.emptySub}>
                {language === 'sq'
                  ? 'Behu i pari qe ndan nje produkt lokal'
                  : 'Be the first to share a local product'}
              </Text>
              <Pressable style={styles.emptyBtn} onPress={() => navigation.navigate('CreateMarketListing')}>
                <Text style={styles.emptyBtnText}>
                  {language === 'sq' ? 'Krijo Listen e Pare' : 'Create First Listing'}
                </Text>
              </Pressable>
            </View>
          }
        />
      )}

      {/* FLOATING BUTTONS */}
      <View style={[styles.floatingRow, { bottom: bottomOffset }]}>
        <Pressable style={styles.myListingsBtn} onPress={() => navigation.navigate('MyMarketListings')}>
          <Ionicons name="person-outline" size={18} color={colors.accent} />
          <Text style={styles.myListingsText}>
            {language === 'sq' ? 'Listimet e Mia' : 'My Listings'}
          </Text>
        </Pressable>
        <Pressable style={styles.fab} onPress={() => navigation.navigate('CreateMarketListing')}>
          <Ionicons name="add" size={22} color={colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  // ─── Hero ────────────────────────────────────────────────────
  hero: {
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 28,
    alignItems: 'center',
  },
  botanicalRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 18, marginBottom: 18,
  },
  botanicalIcon: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.bgAlt,
    alignItems: 'center', justifyContent: 'center',
  },
  heroTitle: {
    color: colors.text, fontSize: 24, fontWeight: '300',
    textAlign: 'center', lineHeight: 32,
    fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
    paddingHorizontal: 8,
  },
  heroSub: {
    color: colors.textMuted, fontSize: 13, marginTop: 10,
    letterSpacing: 2, textTransform: 'uppercase',
  },
  botanicalDivider: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20,
  },
  botanicalDot: {
    width: 4, height: 4, borderRadius: 2, backgroundColor: colors.border,
  },

  // ─── Search ──────────────────────────────────────────────────
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20,
    backgroundColor: colors.white,
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: Platform.OS === 'ios' ? 13 : 10,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 14 },

  // ─── Category Pills ──────────────────────────────────────────
  catListOuter: { maxHeight: 44, marginTop: 16 },
  catListInner: { paddingHorizontal: 20 },
  catPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20,
    backgroundColor: colors.bgAlt, marginRight: 10,
  },
  catPillActive: { backgroundColor: colors.accent },
  catText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  catTextActive: { color: colors.white },

  // ─── Section Title ───────────────────────────────────────────
  sectionTitleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, marginTop: 24, marginBottom: 10,
  },
  sectionTitle: {
    color: colors.text, fontSize: 20, fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
  },

  // ─── Listings Grid ───────────────────────────────────────────
  listContent: { paddingHorizontal: 20 },
  columnWrap: { gap: 12, marginBottom: 12 },
  card: {
    flex: 1, backgroundColor: colors.card, borderRadius: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  cardImage: { width: '100%', height: 140, backgroundColor: colors.bgAlt },
  cardBody: { padding: 10 },
  cardTitle: { color: colors.text, fontSize: 14, fontWeight: '600' },
  cardCity: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  cardPrice: { color: colors.accent, fontSize: 13, fontWeight: '700', marginTop: 3 },

  // ─── Empty State ─────────────────────────────────────────────
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyWrap: { alignItems: 'center', paddingVertical: 60 },
  emptyIconWrap: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: colors.bgAlt,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  emptyTitle: {
    color: colors.text, fontSize: 20,
    fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
  },
  emptySub: { color: colors.textMuted, fontSize: 14, marginTop: 6, textAlign: 'center' },
  emptyBtn: {
    marginTop: 20, backgroundColor: colors.accent, borderRadius: 24,
    paddingHorizontal: 28, paddingVertical: 12,
  },
  emptyBtnText: { color: colors.white, fontSize: 14, fontWeight: '600' },

  // ─── Misc ────────────────────────────────────────────────────
  errorText: { color: colors.textMuted, fontSize: 14, textAlign: 'center' },
  retryBtn: { marginTop: 12, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.accent },
  retryText: { color: colors.white, fontWeight: '600' },

  // ─── Floating ────────────────────────────────────────────────
  floatingRow: {
    position: 'absolute', left: 20, right: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  fab: {
    width: FAB_SIZE, height: FAB_SIZE, borderRadius: FAB_SIZE / 2,
    backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  myListingsBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.white, paddingHorizontal: 16, paddingVertical: 11,
    borderRadius: 28, shadowColor: '#000', shadowOpacity: 0.04,
    shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  myListingsText: { color: colors.accent, fontSize: 13, fontWeight: '600' },
});