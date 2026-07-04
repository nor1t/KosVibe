import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PAGE_BOTTOM_PADDING, PAGE_TOP_PADDING } from '../components/Screen';
import { businessRepository } from '../features/business/businessRepository';
import { reservationRepository } from '../features/reservations/reservationRepository';
import { theme } from '../theme';
import type { BusinessPlaceClaim, BusinessWithMembership, PlaceRequest, Reservation, RestaurantCatalogItem } from '../repositories/types';

// ─── Types ──────────────────────────────────────────────────────────────────

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

type BusinessDashboardScreenProps = { navigation: NavigationProp<ParamListBase> };

// ─── Status configs ────────────────────────────────────────────────────────

const CLAIM_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Claim Pending', color: '#FFB300' },
  approved: { label: 'Claim Approved', color: '#42D98C' },
  rejected: { label: 'Claim Rejected', color: '#FF6138' },
};
const REQUEST_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending Review', color: '#FFB300' },
  approved: { label: 'Approved', color: '#42D98C' },
  rejected: { label: 'Rejected', color: '#FF6138' },
};

// ─── Component ─────────────────────────────────────────────────────────────

export function BusinessDashboardScreen({ navigation }: BusinessDashboardScreenProps) {
  const nav = navigation as NavigationProp<ParamListBase & Record<string, object | undefined>>;

  const [businesses, setBusinesses] = useState<BusinessWithMembership[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessWithMembership | null>(null);
  const [placesWithMeta, setPlacesWithMeta] = useState<PlaceWithMeta[]>([]);
  const [placeRequests, setPlaceRequests] = useState<PlaceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedOnce = useRef(false);

  // ─── Data loading ──────────────────────────────────────────────────────

  const loadDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const myBusinesses = await businessRepository.getMyBusinesses();
      setBusinesses(myBusinesses);

      if (myBusinesses.length > 0) {
        const first = myBusinesses[0];
        setSelectedBusiness(first);

        const [places, claims, reqs] = await Promise.all([
          businessRepository.getBusinessPlaces(first.id),
          businessRepository.getBusinessClaims(first.id),
          businessRepository.getMyPlaceRequests(first.id).catch(() => [] as PlaceRequest[]),
        ]);

        const reservations = await loadReservationsForPlaces(places);
        setPlacesWithMeta(buildPlaceMeta(places, claims, reservations));
        setPlaceRequests(reqs);
      }
    } catch {
      setBusinesses([]);
      setPlacesWithMeta([]);
      setPlaceRequests([]);
    } finally {
      if (!isSilent) setLoading(false);
      hasLoadedOnce.current = true;
    }
  }, []);

  useFocusEffect(useCallback(() => {
    if (hasLoadedOnce.current) {
      void loadDashboardData(true); // silent background refresh
    } else {
      void loadDashboardData(); // show spinner on first load
    }
  }, [loadDashboardData]));

  const selectBusiness = async (business: BusinessWithMembership) => {
    setSelectedBusiness(business);
    setLoading(true);
    try {
      const [places, claims, reqs] = await Promise.all([
        businessRepository.getBusinessPlaces(business.id),
        businessRepository.getBusinessClaims(business.id),
        businessRepository.getMyPlaceRequests(business.id).catch(() => [] as PlaceRequest[]),
      ]);
      const reservations = await loadReservationsForPlaces(places);
      setPlacesWithMeta(buildPlaceMeta(places, claims, reservations));
      setPlaceRequests(reqs);
    } catch {
      setPlacesWithMeta([]);
      setPlaceRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // ─── Derived state ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const hasBusiness = businesses.length > 0;
  const currentBusiness = selectedBusiness;
  const businessId = currentBusiness?.id ?? '';

  // Managed = claim approved OR directly owned (null claim from place_request approval)
  const managedPlaces = placesWithMeta.filter(
    p => p.claimStatus === 'approved' || p.claimStatus === null,
  );
  const hasManagedPlaces = managedPlaces.length > 0;

  // Claims/requests that are in flight
  const pendingClaims = placesWithMeta.filter(
    p => p.claimStatus !== null && p.claimStatus !== 'approved',
  );

  const hasApplications = placeRequests.length > 0 || pendingClaims.length > 0;

  // ─── Render: always one continuous scroll ──────────────────────────────

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ═══ HERO SECTION — always visible ═══ */}
      {hasBusiness ? (
        // ── Logged-in business hero ──
        <LinearGradient
          colors={['rgba(255,31,61,0.24)', 'rgba(255,179,0,0.08)']}
          style={styles.heroCard}
        >
          {businesses.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.businessTabs}
            >
              {businesses.map(b => (
                <Pressable
                  key={b.id}
                  style={[
                    styles.businessTab,
                    currentBusiness?.id === b.id && styles.businessTabActive,
                  ]}
                  onPress={() => { void selectBusiness(b); }}
                >
                  <Text
                    style={[
                      styles.businessTabText,
                      currentBusiness?.id === b.id && styles.businessTabTextActive,
                    ]}
                  >
                    {b.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          {currentBusiness?.logoUrl ? (
            <Image source={{ uri: currentBusiness.logoUrl }} style={styles.businessLogo} />
          ) : (
            <View style={styles.businessLogoPlaceholder}>
              <Ionicons name="business" size={36} color={theme.colors.mutedText} />
            </View>
          )}

          <Text style={styles.businessName}>{currentBusiness?.name}</Text>

          <BusinessStatusBadge business={currentBusiness} />

          {currentBusiness?.description ? (
            <Text style={styles.description}>{currentBusiness.description}</Text>
          ) : null}

          <View style={styles.roleRow}>
            <Ionicons name="shield-checkmark-outline" size={16} color={theme.colors.mutedText} />
            <Text style={styles.roleText}>
              {currentBusiness?.membership?.role === 'owner'
                ? 'Owner'
                : (currentBusiness?.membership?.role ?? 'Member')}
            </Text>
          </View>

          {placesWithMeta.length > 0 && (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{placesWithMeta.length}</Text>
                <Text style={styles.statLabel}>Places</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#42D98C' }]}>
                  {managedPlaces.length}
                </Text>
                <Text style={styles.statLabel}>Approved</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text
                  style={[
                    styles.statValue,
                    { color: pendingClaims.length > 0 ? '#FFB300' : theme.colors.heading },
                  ]}
                >
                  {pendingClaims.length}
                </Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
            </View>
          )}
        </LinearGradient>
      ) : (
        // ── Welcome hero (no business account yet) ──
        <LinearGradient
          colors={['rgba(255,31,61,0.24)', 'rgba(255,179,0,0.08)']}
          style={styles.heroCard}
        >
          <Ionicons name="business-outline" size={56} color={theme.colors.primary} />
          <Text style={styles.welcomeTitle}>Welcome to KosVibe Business</Text>
          <Text style={styles.welcomeSubtitle}>
            Create your business profile to manage places, menus, reservations,
            and connect with customers across Kosovo.
          </Text>
        </LinearGradient>
      )}

      {/* ═══ BUSINESS STATUS NOTICE ═══ */}
      {hasBusiness && currentBusiness?.status === 'pending' && (
        <View style={styles.pendingNotice}>
          <Ionicons name="time-outline" size={20} color="#FFB300" />
          <Text style={styles.pendingNoticeText}>
            Your business account is pending verification. You can still submit
            place claims and requests in the meantime.
          </Text>
        </View>
      )}

      {/* ═══ STAGE 1: Create Business (no account) ═══ */}
      {!hasBusiness && (
        <View style={styles.stageSection}>
          <Text style={styles.stageTitle}>Get Started</Text>
          <Text style={styles.stageSubtitle}>
            Register your business to unlock place management, claims, and more.
          </Text>
          <Pressable
            style={styles.primaryButton}
            onPress={() => nav.navigate('BusinessRegistration')}
          >
            <Ionicons name="add-circle-outline" size={20} color={theme.colors.surface} />
            <Text style={styles.primaryButtonText}>Create Business</Text>
          </Pressable>
        </View>
      )}

      {/* ═══ STAGE 2+3: Add Places (business exists) ═══ */}
      {hasBusiness && (
        <View style={styles.stageSection}>
          <Text style={styles.stageTitle}>
            {hasManagedPlaces ? 'Add Another Place' : 'Add Your First Place'}
          </Text>
          <Text style={styles.stageSubtitle}>
            {hasManagedPlaces
              ? 'Expand your presence by claiming or registering more places.'
              : 'How would you like to add your place?'}
          </Text>

          <Pressable
            style={styles.onboardingCard}
            onPress={() => nav.navigate('ClaimRestaurant')}
          >
            <View style={[styles.onboardingIcon, { backgroundColor: 'rgba(255,179,0,0.16)' }]}>
              <Ionicons name="search-outline" size={24} color="#FFB300" />
            </View>
            <View style={styles.onboardingContent}>
              <Text style={styles.onboardingCardTitle}>Claim Existing Place</Text>
              <Text style={styles.onboardingCardSub}>
                Already listed on KosVibe? Search and request ownership.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.mutedText} />
          </Pressable>

          <Pressable
            style={styles.onboardingCard}
            onPress={() => nav.navigate('NewRestaurant', { businessId })}
          >
            <View style={[styles.onboardingIcon, { backgroundColor: 'rgba(66,217,140,0.16)' }]}>
              <Ionicons name="add-circle-outline" size={24} color="#42D98C" />
            </View>
            <View style={styles.onboardingContent}>
              <Text style={styles.onboardingCardTitle}>Register New Place</Text>
              <Text style={styles.onboardingCardSub}>
                Not listed yet? Submit a new place for review.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.mutedText} />
          </Pressable>
        </View>
      )}

      {/* ═══ APPLICATIONS — always visible when submitted ═══ */}
      {hasBusiness && hasApplications && (
        <View style={styles.applicationsSection}>
          <Text style={styles.sectionHeading}>Applications</Text>

          {placeRequests.map(r => {
            const cfg =
              REQUEST_STATUS_CONFIG[r.status] ?? { label: r.status, color: theme.colors.mutedText };
            return (
              <View key={`req-${r.id}`} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <Text style={styles.requestName}>{r.name}</Text>
                  <View style={[styles.requestBadge, { backgroundColor: `${cfg.color}18` }]}>
                    <View style={[styles.requestDot, { backgroundColor: cfg.color }]} />
                    <Text style={[styles.requestBadgeText, { color: cfg.color }]}>
                      {cfg.label}
                    </Text>
                  </View>
                </View>
                {r.status === 'rejected' && r.adminNotes ? (
                  <Text style={styles.requestNotes}>Reason: {r.adminNotes}</Text>
                ) : null}
                <Text style={styles.requestDate}>
                  Submitted {new Date(r.createdAt).toLocaleDateString()}
                </Text>
                {r.status === 'rejected' && (
                  <Pressable
                    style={styles.resubmitBtn}
                    onPress={() => nav.navigate('NewRestaurant', { businessId })}
                  >
                    <Text style={styles.resubmitBtnText}>Edit & Resubmit</Text>
                  </Pressable>
                )}
              </View>
            );
          })}

          {pendingClaims.map(place => {
            const cfg = CLAIM_STATUS_CONFIG[place.claimStatus!];
            return (
              <View key={`claim-${place.id}`} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <Text style={styles.requestName}>{place.name}</Text>
                  <View style={[styles.requestBadge, { backgroundColor: `${cfg.color}18` }]}>
                    <View style={[styles.requestDot, { backgroundColor: cfg.color }]} />
                    <Text style={[styles.requestBadgeText, { color: cfg.color }]}>
                      {cfg.label}
                    </Text>
                  </View>
                </View>
                <Text style={styles.requestDate}>
                  {place.city}
                  {place.cuisine ? ` · ${place.cuisine}` : ''}
                </Text>
                {place.claimStatus === 'rejected' && (
                  <Pressable
                    style={styles.resubmitBtn}
                    onPress={() => nav.navigate('ClaimRestaurant')}
                  >
                    <Text style={styles.resubmitBtnText}>Resubmit Claim</Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* ═══ MY PLACES — shown when managed places exist ═══ */}
      {hasBusiness && hasManagedPlaces && (
        <View style={styles.placesSection}>
          <Text style={styles.sectionHeading}>My Places</Text>

          {managedPlaces.map(place => {
            const pendingLabel =
              place.pendingReservationCount > 0
                ? `${place.pendingReservationCount} pending`
                : '0 pending';
            const cards: DashboardCard[] = [
              {
                key: 'details',
                title: 'Details',
                subtitle: `${place.name} · ${place.city}`,
                icon: 'eye-outline',
                iconColor: '#FFB300',
                iconBg: 'rgba(255,179,0,0.16)',
                value: 'View',
                route: 'RestaurantDetails',
                enabled: true,
              },
              {
                key: 'reservations',
                title: 'Reservations',
                subtitle: 'Manage bookings',
                icon: 'calendar-outline',
                iconColor: '#42D98C',
                iconBg: 'rgba(66,217,140,0.16)',
                value: pendingLabel,
                route: 'ReservationsManager',
                enabled: true,
              },
              {
                key: 'edit',
                title: 'Edit',
                subtitle: 'Info, hours, contacts',
                icon: 'create-outline',
                iconColor: '#5DA7FF',
                iconBg: 'rgba(93,167,255,0.16)',
                value: 'Manage',
                route: 'EditRestaurant',
                enabled: true,
              },
              {
                key: 'gallery',
                title: 'Gallery',
                subtitle: 'Manage photos',
                icon: 'images-outline',
                iconColor: '#D66BFF',
                iconBg: 'rgba(214,107,255,0.16)',
                value: 'Manage',
                route: 'GalleryManager',
                enabled: true,
              },
              {
                key: 'menu',
                title: 'Menu',
                subtitle: 'Items & pricing',
                icon: 'book-outline',
                iconColor: '#8F7CFF',
                iconBg: 'rgba(143,124,255,0.16)',
                value: 'Manage',
                route: 'MenuManager',
                enabled: true,
              },
              {
                key: 'specials',
                title: 'Specials',
                subtitle: 'Daily specials',
                icon: 'star-outline',
                iconColor: '#FF5EBE',
                iconBg: 'rgba(255,94,190,0.16)',
                value: 'Manage',
                route: 'SpecialsManager',
                enabled: true,
              },
            ];

            return (
              <View key={place.id}>
                <View style={styles.placeHeader}>
                  <View style={styles.placeHeaderLeft}>
                    {place.imageUrl ? (
                      <Image source={{ uri: place.imageUrl }} style={styles.placeThumb} />
                    ) : (
                      <View style={styles.placeThumbPlaceholder}>
                        <Ionicons
                          name="business-outline"
                          size={18}
                          color={theme.colors.mutedText}
                        />
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
                </View>
                <View style={styles.cardGrid}>
                  {cards.map(card => (
                    <Pressable
                      key={card.key}
                      style={styles.dashboardCard}
                      onPress={() =>
                        nav.navigate(
                          card.route,
                          card.route === 'RestaurantDetails'
                            ? { restaurantId: place.id }
                            : { placeId: place.id },
                        )
                      }
                    >
                      <View
                        style={[styles.cardIconWrap, { backgroundColor: card.iconBg }]}
                      >
                        <Ionicons name={card.icon} size={20} color={card.iconColor} />
                      </View>
                      <Text style={styles.cardTitle}>{card.title}</Text>
                      <Text style={styles.cardSubtitle} numberOfLines={2}>
                        {card.subtitle}
                      </Text>
                      <View style={styles.cardFooter}>
                        <Text
                          style={[
                            styles.cardValue,
                            card.value.includes('pending') && styles.cardValueHighlighted,
                          ]}
                        >
                          {card.value}
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={14}
                          color={theme.colors.mutedText}
                        />
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* ═══ SETTINGS ═══ */}
      {hasBusiness && (
        <Pressable
          style={styles.settingsRow}
          onPress={() => nav.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={18} color={theme.colors.mutedText} />
          <Text style={styles.settingsText}>Settings</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.mutedText} />
        </Pressable>
      )}

      {/* ═══ SUPPORT — always visible ═══ */}
      <View style={styles.contactSection}>
        <Text style={styles.contactHeading}>Need Help?</Text>
        <Text style={styles.contactText}>partnerships@kosvibe.com</Text>
        <Text style={styles.contactText}>+383 44 000 000</Text>
      </View>
    </ScrollView>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────

function BusinessStatusBadge({ business }: { business: BusinessWithMembership | null }) {
  if (!business) return null;
  const status = business.status;
  const color =
    status === 'active'
      ? '#42D98C'
      : status === 'pending'
        ? '#FFB300'
        : status === 'inactive' || status === 'suspended'
          ? '#FF6138'
          : theme.colors.mutedText;
  const label =
    status === 'active'
      ? 'Active'
      : status === 'pending'
        ? 'Pending Approval'
        : status === 'inactive'
          ? 'Rejected'
          : status === 'suspended'
            ? 'Suspended'
            : status ?? 'Unknown';

  return (
    <View style={[styles.statusBadge, { backgroundColor: `${color}20` }]}>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <Text style={[styles.statusText, { color }]}>{label}</Text>
    </View>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function buildPlaceMeta(
  places: RestaurantCatalogItem[],
  claims: BusinessPlaceClaim[],
  reservations: Reservation[],
): PlaceWithMeta[] {
  const claimByPlace = new Map<string, BusinessPlaceClaim['status']>();
  for (const c of claims) {
    if (!claimByPlace.has(c.placeId)) claimByPlace.set(c.placeId, c.status);
  }
  const today = new Date().toISOString().split('T')[0]!;
  const tc = new Map<string, number>();
  const pc = new Map<string, number>();
  for (const r of reservations) {
    if (r.reservationDate === today && r.status !== 'cancelled' && r.status !== 'rejected') {
      tc.set(r.placeId, (tc.get(r.placeId) ?? 0) + 1);
    }
    if (r.status === 'pending') {
      pc.set(r.placeId, (pc.get(r.placeId) ?? 0) + 1);
    }
  }
  return places.map(p => ({
    ...p,
    claimStatus: claimByPlace.get(p.id) ?? null,
    todayReservationCount: tc.get(p.id) ?? 0,
    pendingReservationCount: pc.get(p.id) ?? 0,
  }));
}

async function loadReservationsForPlaces(
  places: RestaurantCatalogItem[],
): Promise<Reservation[]> {
  if (!places.length) return [];
  const results = await Promise.all(
    places.map(p =>
      reservationRepository.getPlaceReservations(p.id).catch(() => [] as Reservation[]),
    ),
  );
  return results.flat();
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
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

  // ── Hero ──

  heroCard: {
    marginTop: 25,
    padding: 24,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  welcomeTitle: {
    color: theme.colors.heading,
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 14,
  },
  welcomeSubtitle: {
    color: theme.colors.mutedText,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 300,
    marginTop: 10,
  },
  businessTabs: { marginBottom: 16, maxHeight: 40 },
  businessTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  businessTabActive: { backgroundColor: 'rgba(255,31,61,0.3)' },
  businessTabText: { color: theme.colors.mutedText, fontSize: 13, fontWeight: '600' },
  businessTabTextActive: { color: theme.colors.surface },
  businessLogo: { width: 72, height: 72, borderRadius: 36, marginBottom: 12 },
  businessLogoPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  businessName: { color: theme.colors.heading, fontSize: 28, fontWeight: '900', textAlign: 'center' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
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
  roleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  roleText: { color: theme.colors.mutedText, fontSize: 13, textTransform: 'capitalize' },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    width: '100%',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: theme.colors.heading, fontSize: 22, fontWeight: '900' },
  statLabel: { color: theme.colors.mutedText, fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.08)' },

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
  pendingNoticeText: { color: '#F0C06B', fontSize: 13, lineHeight: 19, flex: 1 },

  // ── Stages ──

  stageSection: { marginTop: 28, gap: 14 },
  stageTitle: { color: theme.colors.heading, fontSize: 22, fontWeight: '900', textAlign: 'center' },
  stageSubtitle: {
    color: theme.colors.mutedText,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 4,
  },

  // ── Primary CTA ──

  primaryButton: {
    marginTop: 6,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryButtonText: { color: theme.colors.surface, fontSize: 16, fontWeight: '800' },

  // ── Onboarding cards ──

  onboardingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  onboardingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onboardingContent: { flex: 1 },
  onboardingCardTitle: { color: theme.colors.heading, fontSize: 15, fontWeight: '800' },
  onboardingCardSub: { color: '#A0A6C4', fontSize: 12, lineHeight: 17, marginTop: 4 },

  // ── Applications ──

  applicationsSection: { marginTop: 28 },
  sectionHeading: {
    color: theme.colors.heading,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 14,
    marginTop: 12,
  },
  requestCard: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginTop: 8,
    gap: 6,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  requestName: { color: theme.colors.heading, fontSize: 15, fontWeight: '700' },
  requestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  requestDot: { width: 6, height: 6, borderRadius: 3 },
  requestBadgeText: { fontSize: 11, fontWeight: '700' },
  requestNotes: { color: '#FFB5A1', fontSize: 12, fontStyle: 'italic' },
  requestDate: { color: theme.colors.mutedText, fontSize: 11 },
  resubmitBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255,31,61,0.2)',
  },
  resubmitBtnText: { color: theme.colors.heading, fontSize: 12, fontWeight: '700' },

  // ── My Places ──

  placesSection: { marginTop: 28 },
  placeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 14,
  },
  placeHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
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
  placeName: { color: theme.colors.heading, fontSize: 18, fontWeight: '800' },
  placeCity: { color: theme.colors.mutedText, fontSize: 12, marginTop: 2 },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
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
  cardIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { color: theme.colors.heading, fontSize: 13, fontWeight: '800', marginTop: 2 },
  cardSubtitle: { color: '#A0A6C4', fontSize: 11, lineHeight: 15, flex: 1 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  cardValue: { color: theme.colors.heading, fontSize: 13, fontWeight: '700' },
  cardValueHighlighted: { color: '#42D98C', fontSize: 12, fontWeight: '800' },

  // ── Settings ──

  settingsRow: {
    marginTop: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  settingsText: {
    color: theme.colors.mutedText,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },

  // ── Support ──

  contactSection: {
    marginTop: 28,
    padding: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    gap: 4,
  },
  contactHeading: {
    color: theme.colors.heading,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  contactText: { color: '#A0A6C4', fontSize: 13 },
});