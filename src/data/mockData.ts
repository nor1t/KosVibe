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
  category: 'Restaurants' | 'Hiking' | 'Party' | 'Culture';
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

export type MapPin = {
  id: string;
  restaurantId: string;
  x: `${number}%`;
  y: `${number}%`;
  color: string;
};

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

export type TavolinaInvite = {
  id: string;
  restaurantId: string;
  restaurantName: string;
  city: string;
  day: string;
  time: string;
  creator: string;
  creatorAvatar: string;
  description: string;
  tags: string[];
  spotsLabel: string;
  image: string;
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

export type DiscoveryLocation = {
  id: string;
  label: string;
  city: string | null;
  region: MapRegion;
};

const image = (url: string) => `${url}?auto=format&fit=crop&w=1200&q=80`;

const visuals = {
  pishatInterior: image('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'),
  sushiTray: image('https://images.unsplash.com/photo-1579871494447-9811cf80d66c'),
  pizzaTable: image('https://images.unsplash.com/photo-1513104890138-7c749659a591'),
  cafeCup: image('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085'),
  grillCounter: image('https://images.unsplash.com/photo-1529193591184-b1d58069ecdd'),
  grilledDish: image('https://images.unsplash.com/photo-1544025162-d76694265947'),
  pancake: image('https://images.unsplash.com/photo-1488477181946-6428a0291777'),
  drink: image('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b'),
  brunch: image('https://images.unsplash.com/photo-1504674900247-0877df9cc836'),
  tavolinaCreator: image('https://images.unsplash.com/photo-1494790108377-be9c29b29330'),
};

const pishatRestaurant: Restaurant = {
  id: 'pishat',
  name: 'Pishat Restaurant',
  cuisine: 'Traditional Kosovo',
  tagline: 'Traditional Kosovo',
  priceRange: '€€',
  rating: 4.8,
  reviewCount: 324,
  distance: '0.8 km',
  isOpen: true,
  image: visuals.pishatInterior,
  heroImage: visuals.pishatInterior,
  address: 'Rruga Garibaldi 23, Prishtina 10000',
  phone: '+383 44 123 456',
  hours: '11:00 - 23:00',
  city: 'Prishtina',
  coordinates: {
    latitude: 42.6629,
    longitude: 21.1655,
  },
  todaySpecial: {
    name: 'Tave Kosi me Mish Vici',
    description: 'Traditional baked lamb with yogurt',
    originalPrice: '€8.5',
    price: '€6',
    discount: '-30%',
    availableUntil: 'Until 14:00',
    image: visuals.grilledDish,
  },
  promotions: [
    {
      id: 'free-dessert',
      title: 'Free Dessert',
      subtitle: 'With any main course order over €15',
    },
    {
      id: 'weekend-offer',
      title: '20% OFF',
      subtitle: 'Family meals on weekends',
    },
  ],
  menuSections: [
    {
      id: 'appetizers',
      title: 'Appetizers',
      items: [
        {
          id: 'ajvar',
          name: 'Homemade Ajvar',
          description: 'Roasted pepper spread with fresh bread',
          price: '€4.50',
        },
      ],
    },
    {
      id: 'main-courses',
      title: 'Main Courses',
      items: [
        {
          id: 'tave-kosi',
          name: 'Tave Kosi',
          description: 'Lamb casserole baked with yogurt and rice',
          price: '€9.50',
          image: visuals.grilledDish,
        },
      ],
    },
    {
      id: 'desserts',
      title: 'Desserts',
      defaultOpen: true,
      items: [
        {
          id: 'pancake',
          name: 'Traditional layered pancake',
          description: 'Honey glazed pancake with cherry topping',
          price: '€7.00',
          image: visuals.pancake,
        },
      ],
    },
    {
      id: 'drinks',
      title: 'Drinks',
      items: [
        {
          id: 'mountain-tea',
          name: 'Mountain Tea',
          description: 'Warm herbal tea from Rugova',
          price: '€2.50',
          image: visuals.drink,
        },
      ],
    },
  ],
  reviews: [
    {
      id: 'review-1',
      author: 'Agron K.',
      comment: 'Excellent traditional food. Best Tave Kosi in Prishtina.',
      rating: 5,
      timeAgo: '2 days ago',
    },
    {
      id: 'review-2',
      author: 'Mimoza S.',
      comment: 'Great atmosphere and friendly staff. Highly recommended.',
      rating: 5,
      timeAgo: '1 week ago',
    },
    {
      id: 'review-3',
      author: 'Dardan M.',
      comment: 'Good food and reasonable prices. It can get busy on weekends.',
      rating: 4,
      timeAgo: '2 weeks ago',
    },
  ],
};

const sushiRestaurant: Restaurant = {
  id: 'sushi-bar-tokio',
  name: 'Sushi Bar Tokio',
  cuisine: 'Japanese, Sushi',
  tagline: 'Japanese, Sushi',
  priceRange: '€€€',
  rating: 4.9,
  reviewCount: 289,
  distance: '2.1 km',
  isOpen: true,
  image: visuals.sushiTray,
  heroImage: visuals.sushiTray,
  address: 'Rruga B 18, Prishtina 10000',
  phone: '+383 44 555 890',
  hours: '12:00 - 22:30',
  city: 'Prishtina',
  coordinates: {
    latitude: 42.6532,
    longitude: 21.1619,
  },
  todaySpecial: {
    name: 'Salmon Maki Set',
    description: 'Fresh salmon maki with avocado and sesame',
    originalPrice: '€12',
    price: '€9.5',
    discount: '-21%',
    availableUntil: 'Until 15:00',
    image: visuals.sushiTray,
  },
  promotions: [
    {
      id: 'sushi-lunch',
      title: 'Lunch Combo',
      subtitle: 'Free miso soup with every lunch set',
    },
  ],
  menuSections: [
    {
      id: 'rolls',
      title: 'Rolls',
      items: [
        {
          id: 'tokio-roll',
          name: 'Tokio Roll',
          description: 'Salmon, avocado and spicy mayo',
          price: '€10.50',
        },
      ],
    },
  ],
  reviews: [
    {
      id: 'sushi-review-1',
      author: 'Era B.',
      comment: 'Fresh sushi and really kind service.',
      rating: 5,
      timeAgo: '3 days ago',
    },
  ],
};

const pizzaRestaurant: Restaurant = {
  id: 'pizza-napoli',
  name: 'Pizza Napoli',
  cuisine: 'Italian, Pizza',
  tagline: 'Italian, Pizza',
  priceRange: '€€',
  rating: 4.6,
  reviewCount: 512,
  distance: '1.2 km',
  isOpen: true,
  image: visuals.pizzaTable,
  heroImage: visuals.pizzaTable,
  address: 'Sheshi Shadervan 4, Prizren',
  phone: '+383 49 222 333',
  hours: '10:00 - 23:30',
  city: 'Prizren',
  coordinates: {
    latitude: 42.2146,
    longitude: 20.7397,
  },
  todaySpecial: {
    name: 'Pizza Margherita',
    description: 'Classic stone baked pizza with basil',
    originalPrice: '€7',
    price: '€5.5',
    discount: '-21%',
    availableUntil: 'Until 15:00',
    image: visuals.pizzaTable,
  },
  promotions: [
    {
      id: 'pizza-offer',
      title: 'Second Pizza -50%',
      subtitle: 'Every Tuesday after 18:00',
    },
  ],
  menuSections: [
    {
      id: 'pizzas',
      title: 'Pizzas',
      items: [
        {
          id: 'diavola',
          name: 'Diavola',
          description: 'Spicy salami, mozzarella and olives',
          price: '€8.50',
        },
      ],
    },
  ],
  reviews: [
    {
      id: 'pizza-review-1',
      author: 'Lira T.',
      comment: 'Cozy place and a very good crust.',
      rating: 5,
      timeAgo: '5 days ago',
    },
  ],
};

const cafeRestaurant: Restaurant = {
  id: 'cafe-renaissance',
  name: 'Cafe Renaissance',
  cuisine: 'Cafe, Breakfast',
  tagline: 'Cafe, Breakfast',
  priceRange: '€',
  rating: 4.4,
  reviewCount: 198,
  distance: '0.9 km',
  isOpen: true,
  image: visuals.cafeCup,
  heroImage: visuals.cafeCup,
  address: 'Sheshi Haxhi Zeka 7, Peje',
  phone: '+383 44 200 100',
  hours: '07:30 - 20:00',
  city: 'Peje',
  coordinates: {
    latitude: 42.6591,
    longitude: 20.2885,
  },
  todaySpecial: {
    name: 'Brunch Platter',
    description: 'Eggs, croissant, fruits and coffee',
    originalPrice: '€9.5',
    price: '€7.9',
    discount: '-17%',
    image: visuals.brunch,
  },
  promotions: [
    {
      id: 'brunch-special',
      title: 'Weekend Brunch Special',
      subtitle: 'Sat & Sun 10:00 - 14:00',
    },
  ],
  menuSections: [
    {
      id: 'breakfast',
      title: 'Breakfast',
      items: [
        {
          id: 'eggs-benedict',
          name: 'Eggs Benedict',
          description: 'Poached eggs with hollandaise and toast',
          price: '€6.80',
        },
      ],
    },
  ],
  reviews: [
    {
      id: 'cafe-review-1',
      author: 'Alban P.',
      comment: 'Great coffee and a quiet breakfast spot.',
      rating: 4,
      timeAgo: '4 days ago',
    },
  ],
};

const grillHouse: Restaurant = {
  id: 'grill-house',
  name: 'Grill House',
  cuisine: 'Grill',
  tagline: 'Grill House',
  priceRange: '€€',
  rating: 4.5,
  reviewCount: 226,
  distance: '1.5 km',
  isOpen: false,
  image: visuals.grillCounter,
  heroImage: visuals.grillCounter,
  address: 'Rruga Bujar Barjamovic 11, Prishtina',
  phone: '+383 44 700 800',
  hours: '10:00 - 22:00',
  city: 'Prishtina',
  coordinates: {
    latitude: 42.6516,
    longitude: 21.17,
  },
  todaySpecial: {
    name: 'Qebapa + Pita + Sallate',
    description: 'Traditional grilled minced meat plate',
    originalPrice: '€7',
    price: '€5.5',
    discount: '-22%',
    availableUntil: 'Until 15:00',
    image: visuals.grillCounter,
  },
  promotions: [
    {
      id: 'grill-combo',
      title: 'Family Combo',
      subtitle: '4 grill plates for €20 every weekend',
    },
  ],
  menuSections: [
    {
      id: 'grill-main',
      title: 'Grill Plates',
      items: [
        {
          id: 'mixed-grill',
          name: 'Mixed Grill',
          description: 'Qebapa, chicken skewers and grilled veggies',
          price: '€10.00',
        },
      ],
    },
  ],
  reviews: [
    {
      id: 'grill-review-1',
      author: 'Rinor D.',
      comment: 'Very good qebapa and fast service.',
      rating: 4,
      timeAgo: '1 week ago',
    },
  ],
};

const barMetropol: Restaurant = {
  id: 'bar-metropol',
  name: 'Bar Metropol',
  cuisine: 'Cocktails, Lounge',
  tagline: 'Bar, Cocktails',
  priceRange: '€€',
  rating: 4.7,
  reviewCount: 172,
  distance: '1.0 km',
  isOpen: true,
  image: visuals.drink,
  heroImage: visuals.drink,
  address: 'Rruga Rexhep Luci 9, Prishtina',
  phone: '+383 44 111 222',
  hours: '17:00 - 01:00',
  city: 'Prishtina',
  coordinates: {
    latitude: 42.6594,
    longitude: 21.1576,
  },
  todaySpecial: {
    name: 'Happy Hour Drinks',
    description: 'Selected cocktails half price',
    originalPrice: '€8',
    price: '€4',
    discount: '-50%',
    image: visuals.drink,
  },
  promotions: [
    {
      id: 'happy-hour',
      title: 'Happy Hour - 50% OFF Drinks',
      subtitle: '17:00 - 19:00',
    },
  ],
  menuSections: [
    {
      id: 'cocktails',
      title: 'Cocktails',
      items: [
        {
          id: 'berry-spritz',
          name: 'Berry Spritz',
          description: 'Fresh berries, prosecco and soda',
          price: '€5.00',
          image: visuals.drink,
        },
      ],
    },
  ],
  reviews: [
    {
      id: 'bar-review-1',
      author: 'Drita Q.',
      comment: 'Good music and a strong drinks menu.',
      rating: 5,
      timeAgo: '6 days ago',
    },
  ],
};

export const restaurants = [
  pishatRestaurant,
  sushiRestaurant,
  pizzaRestaurant,
  cafeRestaurant,
  grillHouse,
  barMetropol,
];

export const restaurantById = restaurants.reduce<Record<string, Restaurant>>((accumulator, restaurant) => {
  accumulator[restaurant.id] = restaurant;
  return accumulator;
}, {});

export const discoveryLocations: DiscoveryLocation[] = [
  {
    id: 'all',
    label: 'All Kosovo',
    city: null,
    region: {
      latitude: 42.63,
      longitude: 20.92,
      latitudeDelta: 0.78,
      longitudeDelta: 0.78,
    },
  },
  {
    id: 'prishtine',
    label: 'Prishtina, Kosovo',
    city: 'Prishtina',
    region: {
      latitude: 42.6629,
      longitude: 21.1655,
      latitudeDelta: 0.11,
      longitudeDelta: 0.11,
    },
  },
  {
    id: 'prizren',
    label: 'Prizren, Kosovo',
    city: 'Prizren',
    region: {
      latitude: 42.2146,
      longitude: 20.7397,
      latitudeDelta: 0.12,
      longitudeDelta: 0.12,
    },
  },
  {
    id: 'peje',
    label: 'Peje, Kosovo',
    city: 'Peje',
    region: {
      latitude: 42.6591,
      longitude: 20.2885,
      latitudeDelta: 0.12,
      longitudeDelta: 0.12,
    },
  },
];

export const featuredMenuItems: FeaturedMenuItem[] = [
  {
    id: 'featured-pishat',
    restaurantId: pishatRestaurant.id,
    restaurantName: pishatRestaurant.name,
    name: pishatRestaurant.todaySpecial.name,
    originalPrice: pishatRestaurant.todaySpecial.originalPrice,
    price: pishatRestaurant.todaySpecial.price,
    discount: '-29%',
    availableUntil: 'Until 14:00',
    image: pishatRestaurant.todaySpecial.image,
  },
  {
    id: 'featured-grill',
    restaurantId: grillHouse.id,
    restaurantName: grillHouse.name,
    name: grillHouse.todaySpecial.name,
    originalPrice: grillHouse.todaySpecial.originalPrice,
    price: grillHouse.todaySpecial.price,
    discount: '-21%',
    availableUntil: 'Until 15:00',
    image: grillHouse.todaySpecial.image,
  },
  {
    id: 'featured-sushi',
    restaurantId: sushiRestaurant.id,
    restaurantName: sushiRestaurant.name,
    name: sushiRestaurant.todaySpecial.name,
    originalPrice: sushiRestaurant.todaySpecial.originalPrice,
    price: sushiRestaurant.todaySpecial.price,
    discount: sushiRestaurant.todaySpecial.discount,
    availableUntil: 'Until 16:00',
    image: sushiRestaurant.todaySpecial.image,
  },
];

export const activeOffers: ActiveOffer[] = [
  {
    id: 'offer-drinks',
    restaurantId: barMetropol.id,
    title: 'Happy Hour - 50% OFF Drinks',
    venue: 'Bar Metropol',
    schedule: '17:00 - 19:00',
    colors: ['#A43AFF', '#F52698'],
  },
  {
    id: 'offer-brunch',
    restaurantId: cafeRestaurant.id,
    title: 'Weekend Brunch Special',
    venue: 'Cafe Renaissance',
    schedule: 'Sat & Sun 10:00 - 14:00',
    colors: ['#FF7A00', '#FF2F51'],
  },
];

export const eventHighlights: EventFeature[] = [
  {
    id: 'event-party-duplex',
    title: 'Duplex Night Market',
    category: 'Party',
    venue: 'Duplex Bar, Prishtina',
    date: 'Fri • 22:00',
    description: 'A vibrant night with live DJs, local cocktails, and a lively crowd that speaks the city’s energy.',
    colors: ['#A43AFF', '#F52698'],
  },
  {
    id: 'event-hike-rugova',
    title: 'Rugova Canyon Sunrise Hike',
    category: 'Hiking',
    venue: 'Rugova Canyon, Peje',
    date: 'Sat • 06:30',
    description: 'Guided trail through limestone cliffs, waterfalls, and Kosovo’s most dramatic nature views.',
    colors: ['#1FCA65', '#64D98A'],
  },
  {
    id: 'event-culture-prizren',
    title: 'Prizren Heritage Walk',
    category: 'Culture',
    venue: 'Old Stone Bridge, Prizren',
    date: 'Sun • 11:00',
    description: 'A storytelling tour across Ottoman streets, historic mosques, and local artisan markets.',
    colors: ['#316CFF', '#74A8FF'],
  },
  {
    id: 'event-restaurant-tradition',
    title: 'Kosovo Flavors Dinner',
    category: 'Restaurants',
    venue: 'Pishat Restaurant, Prishtina',
    date: 'Wed • 19:00',
    description: 'Enjoy authentic dishes with live traditional music and warm hospitality from Kosovo hosts.',
    colors: ['#FF6A2F', '#FF9A54'],
  },
];

export const kosovoHighlights: KosovoHighlight[] = [
  {
    id: 'kosovo-economy',
    title: 'Economy in Motion',
    description: 'A fast-growing entrepreneurial scene, local tech hubs, and lively markets that welcome tourists and locals alike.',
    accentColor: '#FFC92C',
  },
  {
    id: 'kosovo-nature',
    title: 'Nature & Adventure',
    description: 'Rugged canyons, mountain lakes, and hiking trails make Kosovo a natural playground for active travelers.',
    accentColor: '#1FCA65',
  },
  {
    id: 'kosovo-party',
    title: 'Nightlife & Events',
    description: 'From rooftop lounges to underground parties, Kosovo’s music scene keeps your nights memorable.',
    accentColor: '#A537FF',
  },
  {
    id: 'kosovo-culture',
    title: 'Culture & Heritage',
    description: 'Traditional festivals, historic architecture, and warm hospitality show the heart of Kosovo culture.',
    accentColor: '#316CFF',
  },
  {
    id: 'kosovo-study',
    title: 'Study & Creativity',
    description: 'A young student community, modern campuses, and inspiring events for learning and collaboration.',
    accentColor: '#FF6A2F',
  },
];

export const nearbyRestaurants = [pishatRestaurant, grillHouse, sushiRestaurant, barMetropol];

export const favoriteRestaurants = [pishatRestaurant, sushiRestaurant, pizzaRestaurant, cafeRestaurant];

export const profileStats = [
  { id: 'bookings', icon: 'calendar-outline', value: '24', label: 'Bookings' },
  { id: 'favorites', icon: 'heart-outline', value: '8', label: 'Favorites' },
  { id: 'reviews', icon: 'star-outline', value: '12', label: 'Reviews' },
];

export const profileAchievements: ProfileAchievement[] = [
  {
    id: 'first-booking',
    icon: 'star',
    title: 'First Booking',
    subtitle: 'Made your first reservation',
    status: 'Unlocked!',
    unlocked: true,
  },
  {
    id: 'food-lover',
    icon: 'heart',
    title: 'Food Lover',
    subtitle: '10+ favorites',
    status: 'Unlocked!',
    unlocked: true,
  },
  {
    id: 'reviewer',
    icon: 'create',
    title: 'Reviewer',
    subtitle: '5+ reviews',
    status: 'Unlocked!',
    unlocked: true,
  },
  {
    id: 'vip',
    icon: 'diamond',
    title: 'VIP Member',
    subtitle: '25 bookings',
    status: 'Almost there',
    unlocked: false,
  },
];

export const recentActivity: Activity[] = [
  {
    id: 'activity-pishat',
    icon: 'calendar-outline',
    title: 'Pishat Restaurant',
    subtitle: 'Reservation: Today, 19:00',
    accentColor: '#316CFF',
    backgroundColor: '#E7F0FF',
    status: 'Confirmed',
  },
  {
    id: 'activity-sushi',
    icon: 'star-outline',
    title: 'Sushi Bar Tokio',
    subtitle: 'Left 5-star review • 2 days ago',
    accentColor: '#C99000',
    backgroundColor: '#FFF4B8',
  },
  {
    id: 'activity-pizza',
    icon: 'heart-outline',
    title: 'Pizza Napoli',
    subtitle: 'Added to favorites • 1 week ago',
    accentColor: '#E13E92',
    backgroundColor: '#FFE4F0',
  },
];

export const profileQuickLinks: QuickLink[] = [
  { id: 'favorites', icon: 'heart-outline', label: 'My Favorites' },
  { id: 'reviews', icon: 'star-outline', label: 'My Reviews' },
  { id: 'history', icon: 'calendar-outline', label: 'Reservation History' },
  { id: 'visited', icon: 'location-outline', label: 'Visited Places' },
];

export const settingsLanguages: LanguageOption[] = [
  { id: 'sq', flag: '🇽🇰', label: 'Shqip (Albanian)', selected: true },
  { id: 'en', flag: '🇬🇧', label: 'English', selected: false },
];

export const notificationOptions: NotificationOption[] = [
  {
    id: 'offers',
    title: 'Ofertat & Promocionet',
    subtitle: 'Merr njoftime per ofertat e reja',
    enabled: true,
  },
  {
    id: 'reservations',
    title: 'Rezervimet',
    subtitle: 'Perkujtesa per rezervimet e tua',
    enabled: true,
  },
  {
    id: 'reviews',
    title: 'Vleresimet',
    subtitle: 'Njoftime per vleresimet e reja',
    enabled: false,
  },
];

export const accountLinks: QuickLink[] = [
  { id: 'profile', icon: 'person-outline', label: 'Profili im' },
  { id: 'addresses', icon: 'location-sharp', label: 'Adresat' },
  { id: 'payments', icon: 'card-outline', label: 'Metodat e pageses' },
  { id: 'help', icon: 'help-circle-outline', label: 'Ndihme & Mbeshtejte' },
  { id: 'logout', icon: 'log-out-outline', label: 'Dil nga llogaria', tone: 'danger' },
];

export const bookingDates: BookingDate[] = [
  { id: 'today-22', dayLabel: 'Today', dayNumber: '22', month: 'Apr', isToday: true },
  { id: 'thu-23', dayLabel: 'Thu', dayNumber: '23', month: 'Apr' },
  { id: 'fri-24', dayLabel: 'Fri', dayNumber: '24', month: 'Apr' },
  { id: 'sat-25', dayLabel: 'Sat', dayNumber: '25', month: 'Apr' },
  { id: 'sun-26', dayLabel: 'Sun', dayNumber: '26', month: 'Apr' },
];

export const bookingTimes = [
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
];

export const tavolinaInvites: TavolinaInvite[] = [
  {
    id: 'invite-pishat',
    restaurantId: pishatRestaurant.id,
    restaurantName: 'Pishat Restaurant',
    city: 'Prishtina',
    day: 'Friday',
    time: '20:00',
    creator: 'Arta K.',
    creatorAvatar: visuals.tavolinaCreator,
    description: 'Who wants to join for dinner? I booked a table for 4 people.',
    tags: ['Grill', 'Casual'],
    spotsLabel: '2/4 spots',
    image: visuals.grillCounter,
  },
  {
    id: 'invite-sushi',
    restaurantId: sushiRestaurant.id,
    restaurantName: 'Sushi Bar Tokio',
    city: 'Prishtina',
    day: 'Saturday',
    time: '19:30',
    creator: 'Rina D.',
    creatorAvatar: visuals.tavolinaCreator,
    description: 'Looking for two people for sushi night and good conversation.',
    tags: ['Sushi', 'Friendly'],
    spotsLabel: '1/3 spots',
    image: visuals.sushiTray,
  },
];

export function getRestaurantById(restaurantId: string) {
  return restaurantById[restaurantId];
}

export function getLocationById(locationId: string) {
  return discoveryLocations.find((location) => location.id === locationId) ?? discoveryLocations[0];
}

export function matchesRestaurantToLocation(restaurant: Restaurant, locationId: string) {
  const location = getLocationById(locationId);
  return location.city ? restaurant.city === location.city : true;
}

function normalizeSearch(text: string) {
  return text.trim().toLowerCase();
}

function restaurantSearchText(restaurant: Restaurant) {
  return [
    restaurant.name,
    restaurant.cuisine,
    restaurant.city,
    restaurant.tagline,
    restaurant.todaySpecial.name,
    restaurant.todaySpecial.description,
  ]
    .join(' ')
    .toLowerCase();
}

export function filterRestaurantsByDiscovery(
  restaurantList: Restaurant[],
  locationId: string,
  query: string
) {
  const normalizedQuery = normalizeSearch(query);

  return restaurantList.filter((restaurant) => {
    const matchesLocation = matchesRestaurantToLocation(restaurant, locationId);
    const matchesQuery = normalizedQuery
      ? restaurantSearchText(restaurant).includes(normalizedQuery)
      : true;

    return matchesLocation && matchesQuery;
  });
}

export function filterFeaturedItemsByDiscovery(locationId: string, query: string) {
  const visibleRestaurantIds = new Set(
    filterRestaurantsByDiscovery(restaurants, locationId, query).map((restaurant) => restaurant.id)
  );

  return featuredMenuItems.filter((item) => visibleRestaurantIds.has(item.restaurantId));
}

export function filterOffersByDiscovery(locationId: string, query: string) {
  const visibleRestaurantIds = new Set(
    filterRestaurantsByDiscovery(restaurants, locationId, query).map((restaurant) => restaurant.id)
  );
  const normalizedQuery = normalizeSearch(query);

  return activeOffers.filter((offer) => {
    const matchesRestaurant = visibleRestaurantIds.has(offer.restaurantId);
    const matchesQuery = normalizedQuery
      ? `${offer.title} ${offer.venue}`.toLowerCase().includes(normalizedQuery)
      : true;

    return matchesRestaurant && matchesQuery;
  });
}

export function getMapRegionForRestaurants(restaurantList: Restaurant[]): MapRegion {
  if (restaurantList.length === 0) {
    return discoveryLocations[0].region;
  }

  if (restaurantList.length === 1) {
    return {
      latitude: restaurantList[0].coordinates.latitude,
      longitude: restaurantList[0].coordinates.longitude,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    };
  }

  const latitudes = restaurantList.map((restaurant) => restaurant.coordinates.latitude);
  const longitudes = restaurantList.map((restaurant) => restaurant.coordinates.longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);

  return {
    latitude: (minLatitude + maxLatitude) / 2,
    longitude: (minLongitude + maxLongitude) / 2,
    latitudeDelta: Math.max((maxLatitude - minLatitude) * 1.6, 0.12),
    longitudeDelta: Math.max((maxLongitude - minLongitude) * 1.6, 0.12),
  };
}
