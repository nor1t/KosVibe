/**
 * Sprint 11 — Repository Layer Types
 *
 * All model types defined directly here (no re-exports from mockData.ts).
 * These are the single source of truth for all frontend models.
 */

import type { SupportedLanguage } from '../i18n/messages';

// ─── Core geometry types ────────────────────────────────────────────────────

export type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export type Coordinates = {
  latitude: number;
  longitude: number;
};

// ─── Restaurant types ───────────────────────────────────────────────────────

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: string;
  image?: string;
};

export type MenuSection = {
  id: string;
  title: string;
  items: MenuItem[];
  defaultOpen?: boolean;
};

export type Promotion = {
  id: string;
  title: string;
  subtitle: string;
};

export type Review = {
  id: string;
  author: string;
  comment: string;
  rating: number;
  timeAgo: string;
};

export type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  tagline: string;
  priceRange: string;
  rating: number;
  reviewCount: number;
  distance: string;
  isOpen: boolean;
  image: string;
  heroImage: string;
  address: string;
  phone: string;
  hours: string;
  city: string;
  coordinates: Coordinates;
  todaySpecial: {
    name: string;
    description: string;
    originalPrice: string;
    price: string;
    discount: string;
    availableUntil?: string;
    image: string;
  };
  promotions: Promotion[];
  menuSections: MenuSection[];
  reviews: Review[];
};

export type FeaturedMenuItem = {
  id: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  originalPrice: string;
  price: string;
  discount: string;
  availableUntil: string;
  image: string;
};

// ─── Event types ────────────────────────────────────────────────────────────

export type ActiveOffer = {
  id: string;
  restaurantId: string;
  title: string;
  venue: string;
  schedule: string;
  colors: readonly [string, string];
};

export type EventFeature = {
  id: string;
  title: string;
  category: 'Restaurants' | 'Hiking' | 'Party' | 'Culture' | 'Study';
  venue: string;
  date: string;
  description: string;
  colors: readonly [string, string];
};

export type KosovoHighlight = {
  id: string;
  title: string;
  description: string;
  accentColor: string;
};

export type TavolinaInvite = {
  id: string;
  restaurantId?: string;
  restaurantName: string;
  city: string;
  day: string;
  time: string;
  eventType: 'food' | 'culture' | 'nightlife' | 'other';
  creator: string;
  creatorAvatar: string;
  description: string;
  tags: string[];
  spotsLabel: string;
  image: string;
  isPaid?: boolean;
  price?: string;
  maxAttendees?: number;
  imageUri?: string;
  creatorId?: string | null;
};

// ─── Map types ──────────────────────────────────────────────────────────────

export type MapPin = {
  id: string;
  restaurantId: string;
  x: `${number}%`;
  y: `${number}%`;
  color: string;
};

// ─── Places types ───────────────────────────────────────────────────────────

export type DiscoveryLocation = {
  id: string;
  label: string;
  city: string | null;
  region: MapRegion;
};

export type MonumentSpot = {
  id: string;
  type: 'monument' | 'nature';
  title: string;
  titleSq: string;
  location: string;
  locationSq: string;
  image: string;
  coordinate: Coordinates;
  photoCredit: string;
  detail: string;
  detailSq: string;
};

export type ExploreSpot = {
  id: string;
  category: 'coffee' | 'nightlife' | 'culture' | 'nature' | 'study' | 'icons';
  title: string;
  subtitle: string;
  city: string;
  distance: string;
  coordinate: Coordinates;
  color: string;
  accentLabel: string;
};

export type FunActivity = {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  city: string;
  icon: string;
  accentColor: string;
  backgroundColor: string;
};

// ─── Profile types ──────────────────────────────────────────────────────────

export type Activity = {
  id: string;
  icon: 'calendar-outline' | 'star-outline' | 'heart-outline';
  title: string;
  subtitle: string;
  accentColor: string;
  backgroundColor: string;
  status?: string;
};

export type ProfileAchievement = {
  id: string;
  icon: 'star' | 'heart' | 'create' | 'diamond';
  title: string;
  subtitle: string;
  status: string;
  unlocked: boolean;
};

export type QuickLink = {
  id: string;
  icon:
    | 'heart-outline'
    | 'star-outline'
    | 'calendar-outline'
    | 'location-outline'
    | 'person-outline'
    | 'location-sharp'
    | 'card-outline'
    | 'help-circle-outline'
    | 'log-out-outline';
  label: string;
  tone?: 'default' | 'danger';
};

export type LanguageOption = {
  id: string;
  flag: string;
  label: string;
  selected: boolean;
};

export type NotificationOption = {
  id: string;
  title: string;
  subtitle: string;
  enabled: boolean;
};

export type BookingDate = {
  id: string;
  dayLabel: string;
  dayNumber: string;
  month: string;
  isToday?: boolean;
};

// ─── Shared models ──────────────────────────────────────────────────────────

export type RepositoryResult<T> = Promise<{ data: T | null; error: RepositoryError | null }>;

export type RepositoryError = {
  message: string;
  code?: string;
  cause?: unknown;
};

export type ProfileStats = {
  id: string;
  icon: string;
  value: string;
  label: string;
};

export type ProfileData = {
  stats: ProfileStats[];
  achievements: ProfileAchievement[];
  recentActivity: Activity[];
  quickLinks: QuickLink[];
  settingsLanguages: LanguageOption[];
  notificationOptions: NotificationOption[];
  accountLinks: QuickLink[];
  bookingDates: BookingDate[];
  bookingTimes: string[];
};

export type MarketCategoryKey = 'food' | 'craft' | 'clothing';

export type MarketSeller = {
  family: string;
  address: string;
  phone: string;
  image: string;
  description: string;
};

export type MarketCategoryMeta = {
  title: string;
  subtitle: string;
};

export type MarketCollection = {
  icon: string;
  title: string;
  text: string;
};

export type MarketSpot = {
  title: string;
  subtitle: string;
  tone: string;
};

export type MarketplaceData = {
  eyebrow: string;
  title: string;
  subtitle: string;
  categories: { key: MarketCategoryKey; label: string }[];
  marketSpots: MarketSpot[];
  sellersTitle: string;
  sellerCategories: Record<MarketCategoryKey, MarketCategoryMeta>;
  sellers: Record<MarketCategoryKey, MarketSeller[]>;
  collections: MarketCollection[];
};

export type SearchFilters = {
  locationId: string;
  query: string;
  category?: 'Restaurants' | 'Hiking' | 'Party' | 'Culture' | 'Study' | null;
};

export type SearchResult = {
  restaurants: Restaurant[];
  featuredItems: FeaturedMenuItem[];
  offers: ActiveOffer[];
  events: EventFeature[];
};

export type StoryItem = {
  id: string;
  title: string;
  author: string;
  subtitle: string;
  body: string;
  image: string;
  location: string;
  category: string;
  readTime: string;
  postedAt: string;
  likes: number;
  views: number;
  isUserStory?: boolean;
  imageUri?: string;
  createdAtISO?: string;
  userId?: string | null;
};

export type CreateStoryInput = {
  title: string;
  subtitle: string;
  body: string;
  location: string;
  category: string;
  image: string;
  postedAt?: string;
  imageUri?: string;
  authorName?: string;
  authorId?: string;
  language?: string;
};

export type UpdateStoryInput = CreateStoryInput & {
  storyId: string;
};

export type StoriesData = {
  stories: StoryItem[];
  imageTemplates: string[];
};

export type EventsData = {
  eventHighlights: EventFeature[];
  tavolinaInvites: TavolinaInvite[];
  activeOffers: ActiveOffer[];
  kosovoHighlights: KosovoHighlight[];
};

export type RestaurantCatalogItem = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  city: string;
  address: string | null;
  cuisine: string | null;
  priceRange: string | null;
  rating: number;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  website: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
};

// ─── Repository contracts ────────────────────────────────────────────────────

export interface IPlacesRepository {
  getDiscoveryLocations(): DiscoveryLocation[];
  getLocationById(locationId: string): DiscoveryLocation;
  getMonumentSpots(): MonumentSpot[];
  getExploreSpots(): ExploreSpot[];
  getFunActivities(): FunActivity[];
  getMapRegionForRestaurants(restaurants: Restaurant[]): MapRegion;
}

export interface IRestaurantsRepository {
  getAll(): Restaurant[];
  getById(restaurantId: string): Restaurant | undefined;
  getByIdAsync(restaurantId: string): Promise<Restaurant | undefined>;
  getNearbyVibes(): Restaurant[];
  getFeaturedMenuItems(): FeaturedMenuItem[];
  getCatalogItems(): Promise<RestaurantCatalogItem[]>;
  getCatalogItemById(restaurantId: string): Promise<Restaurant | undefined>;
  clearPlaceCache(placeId: string): void;
}

export interface IEventsRepository {
  getEventHighlights(): EventFeature[];
  getTavolinaInvites(): TavolinaInvite[];
  getActiveOffers(): ActiveOffer[];
  getKosovoHighlights(): KosovoHighlight[];
}

export interface IStoriesRepository {
  getStories(language: SupportedLanguage): StoryItem[];
  getStoryById(storyId: string, language: SupportedLanguage): StoryItem | undefined;
  createStory(input: CreateStoryInput): Promise<StoryItem>;
  updateStory(input: UpdateStoryInput): Promise<StoryItem>;
  getImageTemplates(): string[];
}

export interface IMarketplaceRepository {
  getMarketplaceData(language: SupportedLanguage): MarketplaceData;
}

export interface IFavoritesRepository {
  getFavoriteRestaurants(): Restaurant[];
  getFavoriteStories(language: SupportedLanguage): StoryItem[];
}

export interface IProfileRepository {
  getProfileData(): ProfileData;
}

export interface ISearchRepository {
  search(filters: SearchFilters): SearchResult;
  searchRestaurants(locationId: string, query: string): Restaurant[];
  searchFeaturedItems(locationId: string, query: string): FeaturedMenuItem[];
  searchOffers(locationId: string, query: string): ActiveOffer[];
}

// ─── Business types ──────────────────────────────────────────────────────────

export type BusinessAccount = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  businessType: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  logoUrl: string | null;
  status: 'pending' | 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
};

export type BusinessMembership = {
  id: string;
  businessAccountId: string;
  userId: string;
  role: 'owner' | 'manager' | 'staff';
  status: 'active' | 'invited' | 'removed';
  createdAt: string;
};

export type BusinessPlaceClaim = {
  id: string;
  businessAccountId: string;
  placeId: string;
  userId: string;
  claimMessage: string | null;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BusinessWithMembership = BusinessAccount & {
  membership: BusinessMembership | null;
};

export type PlaceWithClaimStatus = RestaurantCatalogItem & {
  hasPendingClaim: boolean;
  isLinkedToBusiness: boolean;
};

export type PlaceImage = {
  id: string;
  placeId: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
};

export type PlaceHour = {
  dayOfWeek: string;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
};

export type PlaceForEditing = {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  cuisine: string | null;
  tagline: string | null;
  priceRange: string | null;
  hours: PlaceHour[];
};

export type CreateBusinessInput = {
  name: string;
  description?: string;
  businessType?: string;
  email?: string;
  phone?: string;
  website?: string;
};

export type UpdateBusinessInput = {
  name?: string;
  description?: string;
  businessType?: string;
  email?: string;
  phone?: string;
  website?: string;
};

export type UpdatePlaceInput = {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  cuisine?: string;
  tagline?: string;
  priceRange?: string;
  hours?: PlaceHour[];
};

export type CreatePlaceClaimInput = {
  businessAccountId: string;
  placeId: string;
  claimMessage?: string;
};

// ─── Menu Management types ──────────────────────────────────────────────────

export type MenuItemForEditing = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  sortOrder: number;
  isAvailable: boolean;
};

export type MenuCategoryForEditing = {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  items: MenuItemForEditing[];
};

// ─── Specials Management types ───────────────────────────────────────────────

export type SpecialForEditing = {
  id: string;
  name: string;
  description: string | null;
  originalPrice: string | null;
  price: string;
  discountLabel: string | null;
  availableUntil: string | null;
  isActive: boolean;
  sortOrder: number;
};

export type CreateSpecialInput = {
  name: string;
  description?: string;
  originalPrice?: string;
  price: string;
  discountLabel?: string;
  availableUntil?: string;
};

export type UpdateSpecialInput = {
  name?: string;
  description?: string;
  originalPrice?: string;
  price?: string;
  discountLabel?: string;
  availableUntil?: string;
  isActive?: boolean;
};

// ─── Reservation types ──────────────────────────────────────────────────────

export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'rejected'
  | 'cancelled'
  | 'checked_in'
  | 'completed';

export type Reservation = {
  id: string;
  placeId: string;
  userId: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  partySize: number;
  reservationDate: string;
  reservationTime: string;
  specialRequests: string | null;
  status: ReservationStatus;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateReservationInput = {
  placeId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  partySize: number;
  reservationDate: string;
  reservationTime: string;
  specialRequests?: string;
};

export type UpdateReservationInput = {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  partySize?: number;
  reservationDate?: string;
  reservationTime?: string;
  specialRequests?: string;
  status?: ReservationStatus;
  adminNotes?: string;
};

// ─── Repository interfaces ───────────────────────────────────────────────────

export interface IBusinessRepository {
  getMyBusinesses(): Promise<BusinessWithMembership[]>;
  getBusinessById(businessId: string): Promise<BusinessAccount | null>;
  createBusiness(input: CreateBusinessInput): Promise<BusinessAccount>;
  updateBusiness(businessId: string, input: UpdateBusinessInput): Promise<BusinessAccount>;
  getBusinessPlaces(businessId: string): Promise<RestaurantCatalogItem[]>;
  getBusinessClaims(businessId: string): Promise<BusinessPlaceClaim[]>;
  getMyClaims(): Promise<BusinessPlaceClaim[]>;
  createPlaceClaim(input: CreatePlaceClaimInput): Promise<BusinessPlaceClaim>;
  getAdminPendingClaims(): Promise<BusinessPlaceClaim[]>;
  getAdminPendingBusinesses(): Promise<BusinessAccount[]>;
  approveClaim(claimId: string, notes?: string): Promise<BusinessPlaceClaim>;
  rejectClaim(claimId: string, notes: string): Promise<BusinessPlaceClaim>;
  approveBusiness(businessId: string): Promise<BusinessAccount>;
  isAdmin(): Promise<boolean>;
  getPlaceForEditing(placeId: string): Promise<PlaceForEditing | null>;
  updatePlaceDetails(placeId: string, input: UpdatePlaceInput): Promise<void>;
  getPlaceImages(placeId: string): Promise<PlaceImage[]>;
  uploadPlaceImage(placeId: string, uri: string, fileName: string): Promise<PlaceImage>;
  deletePlaceImage(imageId: string): Promise<void>;
  setPrimaryImage(imageId: string, placeId: string): Promise<void>;
  reorderImages(images: { id: string; sortOrder: number }[]): Promise<void>;
  getMenuCategories(placeId: string): Promise<MenuCategoryForEditing[]>;
  createMenuCategory(placeId: string, name: string): Promise<MenuCategoryForEditing>;
  updateMenuCategory(categoryId: string, input: { name?: string; description?: string; isActive?: boolean }): Promise<void>;
  deleteMenuCategory(categoryId: string): Promise<void>;
  createMenuItem(categoryId: string, input: { name: string; description?: string; price: number }): Promise<MenuItemForEditing>;
  updateMenuItem(itemId: string, input: { name?: string; description?: string; price?: number; isAvailable?: boolean }): Promise<void>;
  deleteMenuItem(itemId: string): Promise<void>;
  getSpecials(placeId: string): Promise<SpecialForEditing[]>;
  createSpecial(placeId: string, input: CreateSpecialInput): Promise<SpecialForEditing>;
  updateSpecial(specialId: string, input: UpdateSpecialInput): Promise<void>;
  deleteSpecial(specialId: string): Promise<void>;
}

export interface IReservationRepository {
  getMyReservations(): Promise<Reservation[]>;
  getPlaceReservations(placeId: string): Promise<Reservation[]>;
  getReservationById(reservationId: string): Promise<Reservation | null>;
  createReservation(input: CreateReservationInput): Promise<Reservation>;
  updateReservation(reservationId: string, input: UpdateReservationInput): Promise<Reservation>;
  cancelReservation(reservationId: string): Promise<void>;
}