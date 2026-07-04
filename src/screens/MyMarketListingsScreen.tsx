import { Ionicons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '../i18n/I18nProvider';
import {
  fetchMyListings,
  fetchMyListingsStats,
  archiveListing,
  restoreListing,
  markListingSold,
  deleteListing,
  subscribeToMarketChanges,
} from '../features/ruralMarket/ruralMarketRepository';
import type { MyListingsStats, RuralMarketListing } from '../features/ruralMarket/ruralMarketTypes';

// ─── Local palette ────────────────────────────────────────────
const c = {
  bg: '#F6F1E6', bgAlt: '#F0EBDE', card: '#FFFFFF', text: '#3A3328',
  textMuted: '#8A8278', accent: '#6B7C45', accentLight: '#E8EDDE',
  accentGold: '#B8963E', border: 'rgba(58,51,40,0.08)', white: '#FFFFFF',
  danger: '#D44B3A',
};

type Props = { navigation: NavigationProp<ParamListBase> };

const TAB_BAR_HEIGHT = 82;
const TAB_BAR_MARGIN = 10;
const FAB_SIZE = 52;
const FAB_MARGIN = 16;

export function MyMarketListingsScreen({ navigation }: Props) {
  const { language } = useI18n();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const [listings, setListings] = useState<RuralMarketListing[]>([]);
  const [stats, setStats] = useState<MyListingsStats>({ total: 0, active: 0, sold: 0, archived: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bottomOffset = TAB_BAR_HEIGHT + TAB_BAR_MARGIN + Math.min(insets.bottom, 10) + 8;
  const listPaddingBottom = bottomOffset + FAB_SIZE + FAB_MARGIN + 20;

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [list, stat] = await Promise.all([fetchMyListings(), fetchMyListingsStats()]);
      setListings(list);
      setStats(stat);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  useEffect(() => {
    const cleanup = subscribeToMarketChanges(() => { void load(); });
    return cleanup;
  }, [load]);

  const handleArchive = (id: string) => archiveListing(id).then(load);
  const handleRestore = (id: string) => restoreListing(id).then(load);
  const handleSold = (id: string) => markListingSold(id).then(load);
  const handleDelete = (id: string) => {
    Alert.alert(language === 'sq' ? 'Fshi Listen' : 'Delete Listing', language === 'sq' ? 'Jeni te sigurt?' : 'Are you sure?', [
      { text: language === 'sq' ? 'Anulo' : 'Cancel', style: 'cancel' },
      { text: language === 'sq' ? 'Fshij' : 'Delete', style: 'destructive', onPress: () => deleteListing(id).then(load) },
    ]);
  };

  const statusColors: Record<string, string> = { active: '#6B7C45', sold: '#B8963E', archived: '#8A8278' };
  const t = (en: string, sq: string) => language === 'sq' ? sq : en;

  const renderItem = ({ item }: { item: RuralMarketListing }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image source={{ uri: item.thumbnailUrl ?? 'https://via.placeholder.com/100x100.png' }} style={styles.thumb} />
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          {item.price ? <Text style={styles.cardPrice}>{item.price}</Text> : null}
          <View style={styles.cardBadgeRow}>
            <View style={[styles.statusBadge, { backgroundColor: (statusColors[item.status] ?? c.textMuted) + '18' }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColors[item.status] ?? c.textMuted }]} />
              <Text style={[styles.statusText, { color: statusColors[item.status] ?? c.textMuted }]}>{item.status.toUpperCase()}</Text>
            </View>
            <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString(language === 'sq' ? 'sq-AL' : 'en-US')}</Text>
          </View>
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.actionBtn} onPress={() => navigation.navigate('EditMarketListing', { listingId: item.id })}>
          <Ionicons name="create-outline" size={15} color={c.accent} />
          <Text style={[styles.actionText, { color: c.accent }]}>{t('Edit', 'Ndrysho')}</Text>
        </Pressable>
        {item.status === 'active' && (<>
          <Pressable style={styles.actionBtn} onPress={() => handleSold(item.id)}>
            <Ionicons name="checkmark-circle-outline" size={15} color={c.accentGold} />
            <Text style={[styles.actionText, { color: c.accentGold }]}>{t('Sold', 'E Shitur')}</Text>
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={() => handleArchive(item.id)}>
            <Ionicons name="archive-outline" size={15} color={c.textMuted} />
            <Text style={styles.actionText}>{t('Archive', 'Arkivo')}</Text>
          </Pressable>
        </>)}
        {item.status === 'archived' && (
          <Pressable style={styles.actionBtn} onPress={() => handleRestore(item.id)}>
            <Ionicons name="refresh-outline" size={15} color={c.accent} />
            <Text style={[styles.actionText, { color: c.accent }]}>{t('Restore', 'Rikthe')}</Text>
          </Pressable>
        )}
        <Pressable style={styles.actionBtn} onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash-outline" size={15} color={c.danger} />
          <Text style={[styles.actionText, { color: c.danger }]}>{t('Delete', 'Fshij')}</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: headerHeight }]}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>{t('My Listings', 'Listimet e Mia')}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { value: stats.total, label: t('Total', 'Gjithsej'), color: c.text },
          { value: stats.active, label: t('Active', 'Aktive'), color: c.accent },
          { value: stats.sold, label: t('Sold', 'Te Shitura'), color: c.accentGold },
          { value: stats.archived, label: t('Archived', 'Arkivuar'), color: c.textMuted },
        ].map((s, i) => (
          <View key={i} style={styles.statCard}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={c.accent} /></View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={load}><Text style={styles.retryText}>Retry</Text></Pressable>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: listPaddingBottom }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="basket-outline" size={40} color={c.accentLight} />
              </View>
              <Text style={styles.emptyTitle}>{t('No listings yet', 'Nuk ke asnje listen')}</Text>
              <Text style={styles.emptySub}>{t('Share your first local product', 'Ndaj produktin tend te pare lokal')}</Text>
              <Pressable style={styles.emptyBtn} onPress={() => navigation.navigate('CreateMarketListing')}>
                <Text style={styles.emptyBtnText}>{t('Create Listing', 'Krijo Listen')}</Text>
              </Pressable>
            </View>
          }
        />
      )}

      <Pressable style={[styles.fab, { bottom: bottomOffset }]} onPress={() => navigation.navigate('CreateMarketListing')}>
        <Ionicons name="add" size={22} color={c.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: c.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  errorText: { color: c.textMuted, fontSize: 14, marginTop: 12 },
  retryBtn: { marginTop: 12, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: c.accent },
  retryText: { color: c.white, fontWeight: '600' },
  header: { paddingHorizontal: 24, paddingTop: 16, marginBottom: 12 },
  pageTitle: { color: c.text, fontSize: 26, fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }) },
  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: c.card, borderRadius: 14, padding: 14, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  statValue: { fontSize: 24, fontWeight: '700', fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }) },
  statLabel: { color: c.textMuted, fontSize: 10, marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 },
  card: { backgroundColor: c.card, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  cardHeader: { flexDirection: 'row', gap: 14 },
  thumb: { width: 60, height: 60, borderRadius: 12, backgroundColor: c.bgAlt },
  cardInfo: { flex: 1 },
  cardTitle: { color: c.text, fontSize: 16, fontWeight: '600' },
  cardPrice: { color: c.accent, fontSize: 14, fontWeight: '700', marginTop: 2 },
  cardBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '700' },
  dateText: { color: c.textMuted, fontSize: 11 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: c.border },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: c.bgAlt },
  actionText: { color: c.textMuted, fontSize: 11, fontWeight: '600' },
  emptyWrap: { alignItems: 'center', paddingVertical: 60 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: c.bgAlt, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { color: c.text, fontSize: 20, fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }) },
  emptySub: { color: c.textMuted, fontSize: 14, marginTop: 6, textAlign: 'center' },
  emptyBtn: { marginTop: 20, backgroundColor: c.accent, borderRadius: 24, paddingHorizontal: 28, paddingVertical: 12 },
  emptyBtnText: { color: c.white, fontSize: 14, fontWeight: '600' },
  fab: {
    position: 'absolute', right: 24,
    width: FAB_SIZE, height: FAB_SIZE, borderRadius: FAB_SIZE / 2,
    backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
});