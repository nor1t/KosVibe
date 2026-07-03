import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { PAGE_BOTTOM_PADDING, PAGE_TOP_PADDING } from '../components/Screen';
import { reservationRepository } from '../features/reservations/reservationRepository';
import { restaurantsRepository } from '../repositories/restaurantsRepository';
import { theme } from '../theme';
import type { Reservation, ReservationStatus } from '../repositories/types';

const STATUS_TABS: { key: ReservationStatus | 'all'; label: string; color: string }[] = [
  { key: 'all', label: 'All', color: theme.colors.heading },
  { key: 'pending', label: 'Pending', color: '#FFB300' },
  { key: 'confirmed', label: 'Confirmed', color: '#42D98C' },
  { key: 'completed', label: 'Completed', color: '#8F7CFF' },
  { key: 'cancelled', label: 'Cancelled', color: '#FF6138' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: '#FFB300',
  confirmed: '#42D98C',
  rejected: '#FF6138',
  cancelled: '#FF6138',
  checked_in: '#5DA7FF',
  completed: '#8F7CFF',
};

type MyReservationsScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

export function MyReservationsScreen({ navigation }: MyReservationsScreenProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [restaurantNames, setRestaurantNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<ReservationStatus | 'all'>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await reservationRepository.getMyReservations();
    setReservations(data);

    const placeIds = [...new Set(data.map((r) => r.placeId))];
    const names: Record<string, string> = {};
    for (const pid of placeIds) {
      const rest = await restaurantsRepository.getCatalogItemById(pid);
      names[pid] = rest?.name ?? 'Restaurant';
    }
    setRestaurantNames(names);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const handleRefresh = () => { setRefreshing(true); void load(); };

  const handleCancel = (id: string, placeName: string) => {
    Alert.alert(
      'Cancel Reservation',
      `Are you sure you want to cancel your reservation at ${placeName}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setCancellingId(id);
            try {
              await reservationRepository.cancelReservation(id);
              setReservations((prev) =>
                prev.map((r) => (r.id === id ? { ...r, status: 'cancelled' as const } : r))
              );
            } catch (err) {
              Alert.alert('Error', err instanceof Error ? err.message : 'Failed to cancel.');
            } finally {
              setCancellingId(null);
            }
          },
        },
      ]
    );
  };

  const filtered =
    activeTab === 'all'
      ? reservations
      : reservations.filter((r) => r.status === activeTab);

  const counts = STATUS_TABS.reduce(
    (acc, t) => {
      acc[t.key] =
        t.key === 'all'
          ? reservations.length
          : reservations.filter((r) => r.status === t.key).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} />}
    >
      <Text style={styles.heading}>My Reservations</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabRow}>
        {STATUS_TABS.map((tab) => (
          <Pressable
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && { borderColor: tab.color, backgroundColor: tab.color + '18' },
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabLabel, activeTab === tab.key && { color: tab.color }]}>
              {tab.label}
            </Text>
            <Text style={[styles.tabCount, activeTab === tab.key && { color: tab.color }]}>
              {(counts[tab.key] ?? 0)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={48} color={theme.colors.mutedText} />
          <Text style={styles.emptyTitle}>
            {activeTab === 'all' ? 'No reservations yet' : `No ${activeTab} reservations`}
          </Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === 'all'
              ? 'Book a table at any restaurant to get started.'
              : 'Reservations with this status will appear here.'}
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {filtered.map((r) => {
            const color = STATUS_COLORS[r.status] ?? theme.colors.mutedText;
            const placeName = restaurantNames[r.placeId] ?? 'Restaurant';
            const canCancel = r.status === 'pending' || r.status === 'confirmed';
            const isCancelling = cancellingId === r.id;

            return (
              <Pressable
                key={r.id}
                style={styles.card}
                onPress={() =>
                  navigation.navigate('RestaurantDetails', { restaurantId: r.placeId })
                }
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.restaurantName}>{placeName}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
                    <View style={[styles.statusDot, { backgroundColor: color }]} />
                    <Text style={[styles.statusText, { color }]}>
                      {r.status.replace('_', ' ')}
                    </Text>
                  </View>
                </View>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={14} color={theme.colors.mutedText} />
                    <Text style={styles.metaText}>{r.reservationDate}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color={theme.colors.mutedText} />
                    <Text style={styles.metaText}>{r.reservationTime}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="people-outline" size={14} color={theme.colors.mutedText} />
                    <Text style={styles.metaText}>{r.partySize}</Text>
                  </View>
                </View>

                {r.specialRequests ? (
                  <View style={styles.notesBox}>
                    <Ionicons name="chatbubble-outline" size={14} color={theme.colors.mutedText} />
                    <Text style={styles.notesText} numberOfLines={2}>
                      {r.specialRequests}
                    </Text>
                  </View>
                ) : null}

                {canCancel && (
                  <View style={styles.cancelRow}>
                    <Pressable
                      style={[styles.cancelButton, isCancelling && styles.cancelButtonDisabled]}
                      onPress={(e) => {
                        e.stopPropagation?.();
                        handleCancel(r.id, placeName);
                      }}
                      disabled={isCancelling}
                    >
                      {isCancelling ? (
                        <ActivityIndicator size="small" color="#FF3B3B" />
                      ) : (
                        <>
                          <Ionicons name="close-circle-outline" size={16} color="#FF3B3B" />
                          <Text style={styles.cancelText}>Cancel Reservation</Text>
                        </>
                      )}
                    </Pressable>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingHorizontal: 20, paddingTop: PAGE_TOP_PADDING, paddingBottom: PAGE_BOTTOM_PADDING },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background },
  heading: { marginTop: 25, color: theme.colors.heading, fontSize: 26, fontWeight: '900' },
  tabRow: { marginTop: 20, maxHeight: 50 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, marginRight: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.04)' },
  tabLabel: { color: theme.colors.mutedText, fontSize: 13, fontWeight: '700' },
  tabCount: { color: theme.colors.mutedText, fontSize: 12, fontWeight: '800' },
  list: { marginTop: 20, gap: 12 },
  card: { padding: 16, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  restaurantName: { color: theme.colors.heading, fontSize: 17, fontWeight: '800', flex: 1 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  metaRow: { flexDirection: 'row', gap: 16, marginTop: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: theme.colors.mutedText, fontSize: 13 },
  notesBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 10, padding: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.04)' },
  notesText: { color: '#A0A6C4', fontSize: 13, flex: 1 },
  cancelRow: { marginTop: 12, alignItems: 'flex-start' },
  cancelButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: 'rgba(255,59,59,0.1)', borderWidth: 1, borderColor: 'rgba(255,59,59,0.2)' },
  cancelButtonDisabled: { opacity: 0.5 },
  cancelText: { color: '#FF3B3B', fontSize: 13, fontWeight: '600' },
  emptyState: { marginTop: 60, alignItems: 'center', gap: 10 },
  emptyTitle: { color: theme.colors.heading, fontSize: 20, fontWeight: '800' },
  emptySubtitle: { color: theme.colors.mutedText, fontSize: 14, textAlign: 'center', lineHeight: 20, maxWidth: 280 },
});