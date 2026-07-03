import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { PAGE_BOTTOM_PADDING, PAGE_TOP_PADDING } from '../components/Screen';
import { reservationRepository } from '../features/reservations/reservationRepository';
import { theme } from '../theme';
import type { Reservation, ReservationStatus } from '../repositories/types';

const STATUS_TABS: { key: ReservationStatus; label: string; color: string }[] = [
  { key: 'pending', label: 'Pending', color: '#FFB300' },
  { key: 'confirmed', label: 'Confirmed', color: '#42D98C' },
  { key: 'checked_in', label: 'Checked In', color: '#5DA7FF' },
  { key: 'completed', label: 'Completed', color: '#8F7CFF' },
  { key: 'cancelled', label: 'Cancelled', color: '#FF6138' },
];

type ReservationsManagerProps = {
  navigation: NavigationProp<ParamListBase>;
  route: { params: { placeId: string } };
};

function statusColor(status: ReservationStatus): string {
  return STATUS_TABS.find((t) => t.key === status)?.color ?? theme.colors.mutedText;
}

const VALID_TRANSITIONS: Record<ReservationStatus, ReservationStatus[]> = {
  pending: ['confirmed', 'rejected'],
  confirmed: ['checked_in', 'cancelled'],
  rejected: [],
  cancelled: [],
  checked_in: ['completed'],
  completed: [],
};

const TRANSITION_LABELS: Record<string, string> = {
  confirmed: 'Confirm',
  rejected: 'Reject',
  checked_in: 'Check In',
  cancelled: 'Cancel',
  completed: 'Complete',
};

export function ReservationsManager({ navigation, route }: ReservationsManagerProps) {
  const { placeId } = route.params;
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ReservationStatus>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await reservationRepository.getPlaceReservations(placeId);
    setReservations(data);
    setLoading(false);
  }, [placeId]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const handleAction = async (reservationId: string, newStatus: ReservationStatus) => {
    setActionLoading(reservationId);
    try {
      await reservationRepository.updateReservation(reservationId, { status: newStatus });
      await load();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = reservations.filter((r) => r.status === activeTab);
  const counts = STATUS_TABS.reduce(
    (acc, t) => {
      acc[t.key] = reservations.filter((r) => r.status === t.key).length;
      return acc;
    },
    {} as Record<ReservationStatus, number>,
  );

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Reservations</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabRow}>
        {STATUS_TABS.map((tab) => (
          <Pressable
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && { borderColor: tab.color, backgroundColor: tab.color + '18' }]}
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
          <Text style={styles.emptyText}>No {STATUS_TABS.find((t) => t.key === activeTab)?.label} reservations</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {filtered.map((r) => {
            const transitions = VALID_TRANSITIONS[r.status] ?? [];
            const color = statusColor(r.status);
            return (
              <View key={r.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.nameRow}>
                    <Ionicons name="person-outline" size={18} color={theme.colors.mutedText} />
                    <Text style={styles.customerName}>{r.customerName}</Text>
                  </View>
                  <Text style={styles.partySize}>{r.partySize} {r.partySize === 1 ? 'guest' : 'guests'}</Text>
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
                </View>

                {r.customerEmail ? (
                  <View style={styles.metaItem}>
                    <Ionicons name="mail-outline" size={14} color={theme.colors.mutedText} />
                    <Text style={styles.metaText}>{r.customerEmail}</Text>
                  </View>
                ) : null}

                {r.specialRequests ? (
                  <View style={styles.notesBox}>
                    <Ionicons name="chatbubble-outline" size={14} color={theme.colors.mutedText} />
                    <Text style={styles.notesText}>{r.specialRequests}</Text>
                  </View>
                ) : null}

                <View style={styles.cardFooter}>
                  <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
                    <View style={[styles.statusDot, { backgroundColor: color }]} />
                    <Text style={[styles.statusText, { color }]}>{r.status.replace('_', ' ')}</Text>
                  </View>

                  {transitions.length > 0 && (
                    <View style={styles.actionsRow}>
                      {transitions.map((next) => {
                        const busy = actionLoading === r.id;
                        const isDestructive = next === 'rejected' || next === 'cancelled';
                        return (
                          <Pressable
                            key={next}
                            style={[
                              styles.actionBtn,
                              isDestructive && styles.actionBtnDestructive,
                              busy && styles.actionBtnDisabled,
                            ]}
                            onPress={() => {
                              if (isDestructive) {
                                Alert.alert(
                                  TRANSITION_LABELS[next] ?? next,
                                  `Are you sure you want to ${TRANSITION_LABELS[next]?.toLowerCase()} this reservation?`,
                                  [
                                    { text: 'Cancel', style: 'cancel' },
                                    { text: TRANSITION_LABELS[next], style: 'destructive', onPress: () => handleAction(r.id, next) },
                                  ],
                                );
                              } else {
                                handleAction(r.id, next);
                              }
                            }}
                            disabled={busy}
                          >
                            {busy ? (
                              <ActivityIndicator size="small" color={isDestructive ? '#FF3B3B' : theme.colors.surface} />
                            ) : (
                              <Text style={[styles.actionBtnText, isDestructive && styles.actionBtnTextDestructive]}>
                                {TRANSITION_LABELS[next] ?? next}
                              </Text>
                            )}
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                </View>
              </View>
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
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  customerName: { color: theme.colors.heading, fontSize: 16, fontWeight: '700' },
  partySize: { color: '#F7D7A2', fontSize: 13, fontWeight: '600' },
  metaRow: { flexDirection: 'row', gap: 16, marginTop: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  metaText: { color: theme.colors.mutedText, fontSize: 13 },
  notesBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 10, padding: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.04)' },
  notesText: { color: '#A0A6C4', fontSize: 13, flex: 1, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  actionsRow: { flexDirection: 'row', gap: 6 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(66,217,140,0.2)' },
  actionBtnDestructive: { backgroundColor: 'rgba(255,59,59,0.15)' },
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnText: { color: '#42D98C', fontSize: 12, fontWeight: '700' },
  actionBtnTextDestructive: { color: '#FF3B3B' },
  emptyState: { marginTop: 60, alignItems: 'center', gap: 10 },
  emptyText: { color: theme.colors.mutedText, fontSize: 15, textAlign: 'center' },
});