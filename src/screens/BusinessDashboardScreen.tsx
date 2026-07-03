import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PAGE_BOTTOM_PADDING, PAGE_TOP_PADDING } from '../components/Screen';
import { businessRepository } from '../features/business/businessRepository';
import { reservationRepository } from '../features/reservations/reservationRepository';
import { theme } from '../theme';
import type {
  BusinessPlaceClaim,
  BusinessWithMembership,
  Reservation,
  RestaurantCatalogItem,
} from '../repositories/types';

type PlaceWithMeta = RestaurantCatalogItem & {
  claimStatus: BusinessPlaceClaim['status'] | null;
  todayReservationCount: number;
  pendingReservationCount: number;
};

type DashboardCard = {
  key: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  value: string;
  route: string;
  enabled: boolean;
};

type BusinessDashboardScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

const CLAIM_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Claim Pending', color: '#FFB300' },
  approved: { label: 'Claim Approved', color: '#42D98C' },
  rejected: { label: 'Claim Rejected', color: '#FF6138' },
};

export function BusinessDashboardScreen({ navigation }: BusinessDashboardScreenProps) {
  const [businesses, setBusinesses] = useState<BusinessWithMembership[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessWithMembership | null>(null);
  const [placesWithMeta, setPlacesWithMeta] = useState<PlaceWithMeta[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const myBusinesses = await businessRepository.getMyBusinesses();
      setBusinesses(myBusinesses);

      if (myBusinesses.length === 0) {
        return;
      }

      const first = myBusinesses[0];
      setSelectedBusiness(first);

      // Load places and claims in parallel
      const [places, claims] = await Promise.all([
        businessRepository.getBusinessPlaces(first.id),
        businessRepository.getBusinessClaims(first.id),
      ]);

      // Load reservations for all places (passes places to avoid re-fetching)
      const reservations = await loadReservationsForPlaces(places);

      const meta = buildPlaceMeta(places, claims, reservations);
      setPlacesWithMeta(meta);
    } catch (_err) {
      // RLS or network errors should not crash the dashboard
      setBusinesses([]);
      setPlacesWithMeta([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadDashboardData();
    }, [loadDashboardData])
  );

  const selectBusiness = async (business: BusinessWithMembership) => {
    setSelectedBusiness(business);
    setLoading(true);
    try {
      const [places, claims] = await Promise.all([
        businessRepository.getBusinessPlaces(business.id),
        businessRepository.getBusinessClaims(business.id),
      ]);

      const reservations = await loadReservationsForPlaces(places);
      const meta = buildPlaceMeta(places, claims, reservations);
      setPlacesWithMeta(meta);
    } catch (_err) {
      setPlacesWithMeta([]);
    } finally {
      setLoading(false);
    }
  };

  const buildCards = (place: PlaceWithMeta, isActive: boolean): DashboardCard[] => {
    const pendingLabel = isActive
      ? place.pendingReservationCount > 0
        ? `${place.pendingReservationCount} pending`
        : '0 pending'
      : 'Locked';

    return [
      {
        key: 'restaurant-details',
        title: 'Restaurant Details',
        subtitle: `${place.name} · ${place.city}`,
        icon: 'restaurant-outline',
        iconColor: '#FFB300',
        iconBg: 'rgba(255,179,0,0.16)',
        value: isActive ? 'View' : 'Locked',
        route: 'RestaurantDetails',
        enabled: isActive,
      },
      {
        key: 'reservations',
        title: 'Reservations',
        subtitle: 'View and manage bookings',
        icon: 'calendar-outline',
        iconColor: '#42D98C',
        iconBg: 'rgba(66,217,140,0.16)',
        value: pendingLabel,
        route: 'ReservationsManager',
        enabled: isActive,
      },
      {
        key: 'edit-restaurant',
        title: 'Edit Restaurant',
        subtitle: 'Update info, hours, contacts',
        icon: 'create-outline',
        iconColor: '#5DA7FF',
        iconBg: 'rgba(93,167,255,0.16)',
        value: isActive ? 'Manage' : 'Locked',
        route: 'EditRestaurant',
        enabled: isActive,
      },
      {
        key: 'gallery',
        title: 'Gallery',
        subtitle: 'Manage photos and hero images',
        icon: 'images-outline',
        iconColor: '#D66BFF',
        iconBg: 'rgba(214,107,255,0.16)',
        value: isActive ? 'Manage' : 'Locked',
        route: 'GalleryManager',
        enabled: isActive,
      },
      {
        key: 'menu',
        title: 'Menu',
        subtitle: 'Update menu items and pricing',
        icon: 'book-outline',
        iconColor: '#8F7CFF',
        iconBg: 'rgba(143,124,255,0.16)',
        value: isActive ? 'Manage' : 'Locked',
        route: 'MenuManager',
        enabled: isActive,
      },
      {
        key: 'specials',
        title: 'Daily Specials',
        subtitle: 'Set featured specials',
        icon: 'star-outline',
        iconColor: '#FF5EBE',
        iconBg: 'rgba(255,94,190,0.16)',
        value: isActive ? 'Manage' : 'Locked',
        route: 'SpecialsManager',
        enabled: isActive,
      },
    ];
  };

  const handleCardPress = (card: DashboardCard, place: RestaurantCatalogItem) => {
    if (!card.enabled) return;
    const nav = navigation as NavigationProp<ParamListBase & Record<string, object | undefined>>;
    if (card.route === 'RestaurantDetails') {
      nav.navigate('RestaurantDetails', { restaurantId: place.id });
      return;
    }
    nav.navigate(card.route, { placeId: place.id });
  };

  // ─── Loading State ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // ─── No Business Yet ──────────────────────────────────────────────────────

  if (businesses.length === 0) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <LinearGradient
          colors={['rgba(255,31,61,0.24)', 'rgba(255,179,0,0.08)']}
          style={styles.emptyCard}
        >
          <Ionicons name="business-outline" size={48} color={theme.colors.mutedText} />
          <Text style={styles.emptyTitle}>No Business Yet</Text>
          <Text style={styles.emptyText}>
            Register your restaurant business to manage your places, menus, reservations, and more.
          </Text>
          <Pressable
            style={styles.primaryButton}
            onPress={() => navigation.navigate('BusinessRegistration' as never)}
          >
            <Text style={styles.primaryButtonText}>Register Business</Text>
          </Pressable>
        </LinearGradient>
      </ScrollView>
    );
  }

  // ─── Dashboard ────────────────────────────────────────────────────────────

  const isActive = selectedBusiness?.status === 'active';
  const isOwner = selectedBusiness?.membership?.role === 'owner';
  const statusColor =
    selectedBusiness?.status === 'active'
      ? '#42D98C'
      : selectedBusiness?.status === 'pending'
        ? '#FFB300'
        : selectedBusiness?.status === 'suspended'
          ? '#FF6138'
          : theme.colors.mutedText;

  const statusLabel =
    selectedBusiness?.status === 'active'
      ? 'Active'
      : selectedBusiness?.status === 'pending'
        ? 'Pending Approval'
        : selectedBusiness?.status === 'suspended'
          ? 'Suspended'
          : selectedBusiness?.status ?? 'Unknown';

  // Count places with approved claims
  const approvedPlaces = placesWithMeta.filter((p) => p.claimStatus === 'approved').length;
  const pendingPlaces = placesWithMeta.filter((p) => p.claimStatus === 'pending').length;
  const totalPlaces = placesWithMeta.length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero Card */}
      <LinearGradient
        colors={['rgba(255,31,61,0.24)', 'rgba(255,179,0,0.08)']}
        style={styles.heroCard}
      >
        {/* Business tabs (multiple businesses) */}
        {businesses.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.businessTabs}>
            {businesses.map((b) => (
              <Pressable
                key={b.id}
                style={[
                  styles.businessTab,
                  selectedBusiness?.id === b.id && styles.businessTabActive,
                ]}
                onPress={() => { void selectBusiness(b); }}
              >
                <Text
                  style={[
                    styles.businessTabText,
                    selectedBusiness?.id === b.id && styles.businessTabTextActive,
                  ]}
                >
                  {b.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Business image if available */}
        {selectedBusiness?.logoUrl ? (
          <Image source={{ uri: selectedBusiness.logoUrl }} style={styles.businessLogo} />
        ) : (
          <View style={styles.businessLogoPlaceholder}>
            <Ionicons name="business" size={36} color={theme.colors.mutedText} />
          </View>
        )}

        <Text style={styles.businessName}>{selectedBusiness?.name}</Text>

        {/* Status badge */}
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>

        {selectedBusiness?.description ? (
          <Text style={styles.description}>{selectedBusiness.description}</Text>
        ) : null}

        {/* Role badge */}
        <View style={styles.roleRow}>
          <Ionicons name="shield-checkmark-outline" size={16} color={theme.colors.mutedText} />
          <Text style={styles.roleText}>
            {isOwner ? 'Owner' : selectedBusiness?.membership?.role ?? 'Member'}
          </Text>
        </View>

        {/* Stats row */}
        {totalPlaces > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalPlaces}</Text>
              <Text style={styles.statLabel}>Places</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#42D98C' }]}>{approvedPlaces}</Text>
              <Text style={styles.statLabel}>Approved</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: pendingPlaces > 0 ? '#FFB300' : theme.colors.heading }]}>
                {pendingPlaces}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
        )}
      </LinearGradient>

      {/* Claim Restaurant CTA */}
      {isOwner && isActive && (
        <View style={styles.actionRow}>
          <Pressable
            style={styles.actionButton}
            onPress={() => navigation.navigate('ClaimRestaurant' as never)}
          >
            <Ionicons name="link-outline" size={20} color={theme.colors.surface} />
            <Text style={styles.actionButtonText}>Claim a Restaurant</Text>
          </Pressable>
        </View>
      )}

      {/* Pending approval notice */}
      {selectedBusiness?.status === 'pending' && (
        <View style={styles.pendingNotice}>
          <Ionicons name="time-outline" size={20} color="#FFB300" />
          <Text style={styles.pendingNoticeText}>
            Your business is pending admin approval. Management features will unlock once approved.
          </Text>
        </View>
      )}

      {/* No Places Linked */}
      {placesWithMeta.length === 0 ? (
        <View style={styles.emptyPlacesSection}>
          <Ionicons name="restaurant-outline" size={36} color={theme.colors.mutedText} />
          <Text style={styles.emptyPlacesTitle}>No Restaurants Linked</Text>
          <Text style={styles.emptyPlacesSubtitle}>
            {selectedBusiness?.status === 'pending'
              ? 'Your business must be approved before you can claim restaurants.'
              : 'Claim a restaurant to start managing it from this dashboard.'}
          </Text>
        </View>
      ) : (
        /* Place cards */
        placesWithMeta.map((place) => {
          const claimCfg = place.claimStatus ? CLAIM_STATUS_CONFIG[place.claimStatus] : null;
          const cards = buildCards(place, isActive && place.claimStatus === 'approved');

          return (
            <View key={place.id}>
              {/* Place header */}
              <View style={styles.placeHeader}>
                <View style={styles.placeHeaderLeft}>
                  {place.imageUrl ? (
                    <Image source={{ uri: place.imageUrl }} style={styles.placeThumb} />
                  ) : (
                    <View style={styles.placeThumbPlaceholder}>
                      <Ionicons name="restaurant-outline" size={18} color={theme.colors.mutedText} />
                    </View>
                  )}
                  <View>
                    <Text style={styles.placeName}>{place.name}</Text>
                    <Text style={styles.placeCity}>
                      {place.city}
                      {place.cuisine ? ` · ${place.cuisine}` : ''}
                    </Text>
                  </View>
                </View>

                {/* Claim status badge */}
                {claimCfg && (
                  <View style={[styles.claimBadge, { backgroundColor: `${claimCfg.color}18` }]}>
                    <View style={[styles.claimDot, { backgroundColor: claimCfg.color }]} />
                    <Text style={[styles.claimText, { color: claimCfg.color }]}>{claimCfg.label}</Text>
                  </View>
                )}
              </View>

              {/* Dashboard cards grid */}
              <View style={styles.cardGrid}>
                {cards.map((card) => (
                  <Pressable
                    key={card.key}
                    style={[
                      styles.dashboardCard,
                      !card.enabled && styles.dashboardCardDisabled,
                    ]}
                    onPress={() => handleCardPress(card, place)}
                    disabled={!card.enabled}
                  >
                    <View style={[styles.cardIconWrap, { backgroundColor: card.iconBg }]}>
                      <Ionicons
                        name={card.icon}
                        size={20}
                        color={card.enabled ? card.iconColor : theme.colors.mutedText}
                      />
                    </View>
                    <Text style={styles.cardTitle}>{card.title}</Text>
                    <Text style={styles.cardSubtitle} numberOfLines={2}>
                      {card.subtitle}
                    </Text>
                    <View style={styles.cardFooter}>
                      <Text
                        style={[
                          styles.cardValue,
                          !card.enabled && styles.cardValueDisabled,
                          card.value.includes('today') && styles.cardValueHighlighted,
                        ]}
                      >
                        {card.value}
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={14}
                        color={card.enabled ? theme.colors.mutedText : 'rgba(160,166,196,0.3)'}
                      />
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildPlaceMeta(
  places: RestaurantCatalogItem[],
  claims: BusinessPlaceClaim[],
  reservations: Reservation[],
): PlaceWithMeta[] {
  // Build claim lookup: placeId → most recent claim status
  const claimByPlace = new Map<string, BusinessPlaceClaim['status']>();
  for (const claim of claims) {
    if (!claimByPlace.has(claim.placeId)) {
      claimByPlace.set(claim.placeId, claim.status);
    }
  }

  // Build reservation counts per place
  const today = new Date().toISOString().split('T')[0];
  const todayCountByPlace = new Map<string, number>();
  const pendingCountByPlace = new Map<string, number>();
  for (const r of reservations) {
    if (r.reservationDate === today && r.status !== 'cancelled' && r.status !== 'rejected') {
      todayCountByPlace.set(r.placeId, (todayCountByPlace.get(r.placeId) ?? 0) + 1);
    }
    if (r.status === 'pending') {
      pendingCountByPlace.set(r.placeId, (pendingCountByPlace.get(r.placeId) ?? 0) + 1);
    }
  }

  return places.map((p) => ({
    ...p,
    claimStatus: claimByPlace.get(p.id) ?? null,
    todayReservationCount: todayCountByPlace.get(p.id) ?? 0,
    pendingReservationCount: pendingCountByPlace.get(p.id) ?? 0,
  }));
}

async function loadReservationsForPlaces(places: RestaurantCatalogItem[]): Promise<Reservation[]> {
  if (places.length === 0) return [];

  // Fetch reservations for all places in parallel
  const results = await Promise.all(
    places.map((p) => reservationRepository.getPlaceReservations(p.id).catch(() => [] as Reservation[]))
  );
  return results.flat();
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: PAGE_TOP_PADDING,
    paddingBottom: PAGE_BOTTOM_PADDING,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },

  // ─── Hero Card ─────────────────────────────────────────────────

  heroCard: {
    marginTop: 25,
    padding: 24,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  businessTabs: {
    marginBottom: 16,
    maxHeight: 40,
  },
  businessTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  businessTabActive: {
    backgroundColor: 'rgba(255,31,61,0.3)',
  },
  businessTabText: {
    color: theme.colors.mutedText,
    fontSize: 13,
    fontWeight: '600',
  },
  businessTabTextActive: {
    color: theme.colors.surface,
  },
  businessLogo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 12,
  },
  businessLogoPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  businessName: {
    color: theme.colors.heading,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    marginTop: 12,
    color: '#E2E6F4',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 290,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  roleText: {
    color: theme.colors.mutedText,
    fontSize: 13,
    textTransform: 'capitalize',
  },

  // ─── Stats Row ─────────────────────────────────────────────────

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: theme.colors.heading,
    fontSize: 22,
    fontWeight: '900',
  },
  statLabel: {
    color: theme.colors.mutedText,
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  // ─── Actions ───────────────────────────────────────────────────

  actionRow: {
    marginTop: 16,
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  actionButtonText: {
    color: theme.colors.surface,
    fontSize: 15,
    fontWeight: '700',
  },

  // ─── Pending Notice ────────────────────────────────────────────

  pendingNotice: {
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,179,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,179,0,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pendingNoticeText: {
    color: '#F0C06B',
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },

  // ─── Place Header ──────────────────────────────────────────────

  placeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28,
    marginBottom: 14,
  },
  placeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  placeThumb: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  placeThumbPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeName: {
    color: theme.colors.heading,
    fontSize: 18,
    fontWeight: '800',
  },
  placeCity: {
    color: theme.colors.mutedText,
    fontSize: 12,
    marginTop: 2,
  },
  claimBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  claimDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  claimText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // ─── Dashboard Cards ───────────────────────────────────────────

  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dashboardCard: {
    width: '47%',
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 8,
    minHeight: 140,
  },
  dashboardCardDisabled: {
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.06)',
    opacity: 0.6,
  },
  cardIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: theme.colors.heading,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  cardSubtitle: {
    color: '#A0A6C4',
    fontSize: 11,
    lineHeight: 15,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  cardValue: {
    color: theme.colors.heading,
    fontSize: 13,
    fontWeight: '700',
  },
  cardValueDisabled: {
    color: theme.colors.mutedText,
    fontSize: 12,
  },
  cardValueHighlighted: {
    color: '#42D98C',
    fontSize: 12,
    fontWeight: '800',
  },

  // ─── Empty States ──────────────────────────────────────────────

  emptyPlacesSection: {
    marginTop: 40,
    padding: 30,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    gap: 10,
  },
  emptyPlacesTitle: {
    color: theme.colors.heading,
    fontSize: 20,
    fontWeight: '900',
  },
  emptyPlacesSubtitle: {
    color: theme.colors.mutedText,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  emptyCard: {
    marginTop: 25,
    padding: 40,
    borderRadius: 30,
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  emptyTitle: {
    color: theme.colors.heading,
    fontSize: 24,
    fontWeight: '900',
  },
  emptyText: {
    color: theme.colors.mutedText,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  primaryButton: {
    marginTop: 10,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
  },
  primaryButtonText: {
    color: theme.colors.surface,
    fontSize: 15,
    fontWeight: '800',
  },
});