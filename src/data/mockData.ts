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
  bistroDining: image('https://images.unsplash.com/photo-1555396273-367ea4eb4db5'),
  ramenBowl: image('https://images.unsplash.com/photo-1569718212165-3a8278d5f624'),
  burgerPlate: image('https://images.unsplash.com/photo-1568901346375-23c9450c58cd'),
  steakBoard: image('https://images.unsplash.com/photo-1558030006-450675393462'),
  pastaTable: image('https://images.unsplash.com/photo-1551183053-bf91a1d81141'),
  tacoSpread: image('https://images.unsplash.com/photo-1565299585323-38d6b0865b47'),
  saladBowl: image('https://images.unsplash.com/photo-1512621776951-a57141f2eefd'),
  bakeryCase: image('https://images.unsplash.com/photo-1509440159596-0249088772ff'),
  seafoodPlate: image('https://images.unsplash.com/photo-1559737558-2f5a35f4523b'),
  mezzeTable: image('https://images.unsplash.com/photo-1541518763669-27fef04b14ea'),
  dessertPlate: image('https://images.unsplash.com/photo-1488477304112-4944851de03d'),
  wineDining: image('https://images.unsplash.com/photo-1414235077428-338989a2e8c0'),
  soupBowl: image('https://images.unsplash.com/photo-1547592166-23ac45744acd'),
  breakfastToast: image('https://images.unsplash.com/photo-1525351484163-7529414344d8'),
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

const additionalRestaurants: Restaurant[] = [
  {
    id: 'rena-bistro',
    name: 'Rena Bistro',
    cuisine: 'Modern European',
    tagline: 'Modern European plates with Kosovo produce',
    priceRange: 'EUR EUR',
    rating: 4.7,
    reviewCount: 184,
    distance: '0.6 km',
    isOpen: true,
    image: visuals.bistroDining,
    heroImage: visuals.bistroDining,
    address: 'Rruga Fehmi Agani 12, Prishtina',
    phone: '+383 44 610 210',
    hours: '09:00 - 23:00',
    city: 'Prishtina',
    coordinates: {
      latitude: 42.6638,
      longitude: 21.1607,
    },
    todaySpecial: {
      name: 'Herb Chicken Risotto',
      description: 'Creamy risotto with grilled chicken and local herbs',
      originalPrice: 'EUR 11',
      price: 'EUR 8.5',
      discount: '-23%',
      availableUntil: 'Until 16:00',
      image: visuals.bistroDining,
    },
    promotions: [
      {
        id: 'rena-lunch',
        title: 'Business Lunch',
        subtitle: 'Main course and drink for EUR 10',
      },
    ],
    menuSections: [
      {
        id: 'bistro-mains',
        title: 'Bistro Mains',
        items: [
          {
            id: 'herb-risotto',
            name: 'Herb Chicken Risotto',
            description: 'Slow cooked rice, parmesan and grilled chicken',
            price: 'EUR 8.50',
            image: visuals.bistroDining,
          },
        ],
      },
      {
        id: 'bistro-salads',
        title: 'Fresh Salads',
        items: [
          {
            id: 'garden-salad',
            name: 'Garden Salad',
            description: 'Seasonal greens, feta and citrus dressing',
            price: 'EUR 5.20',
            image: visuals.saladBowl,
          },
        ],
      },
    ],
    reviews: [
      {
        id: 'rena-review-1',
        author: 'Nora H.',
        comment: 'Polished service and a strong lunch menu.',
        rating: 5,
        timeAgo: '1 day ago',
      },
      {
        id: 'rena-review-2',
        author: 'Blend A.',
        comment: 'Great for a quiet dinner in the center.',
        rating: 4,
        timeAgo: '5 days ago',
      },
    ],
  },
  {
    id: 'miso-house',
    name: 'Miso House',
    cuisine: 'Asian, Ramen',
    tagline: 'Ramen bowls and small plates',
    priceRange: 'EUR EUR',
    rating: 4.8,
    reviewCount: 147,
    distance: '1.7 km',
    isOpen: true,
    image: visuals.ramenBowl,
    heroImage: visuals.ramenBowl,
    address: 'Rruga B 41, Prishtina',
    phone: '+383 49 810 122',
    hours: '12:00 - 22:00',
    city: 'Prishtina',
    coordinates: {
      latitude: 42.6524,
      longitude: 21.1646,
    },
    todaySpecial: {
      name: 'Spicy Beef Ramen',
      description: 'Rich broth, noodles, beef and chili oil',
      originalPrice: 'EUR 10.5',
      price: 'EUR 8',
      discount: '-24%',
      availableUntil: 'Until 17:00',
      image: visuals.ramenBowl,
    },
    promotions: [
      {
        id: 'miso-student',
        title: 'Student Bowl',
        subtitle: '10% off ramen with student ID',
      },
    ],
    menuSections: [
      {
        id: 'ramen',
        title: 'Ramen',
        items: [
          {
            id: 'spicy-beef-ramen',
            name: 'Spicy Beef Ramen',
            description: 'Beef, noodles, egg and chili oil',
            price: 'EUR 8.00',
            image: visuals.ramenBowl,
          },
        ],
      },
    ],
    reviews: [
      {
        id: 'miso-review-1',
        author: 'Lea R.',
        comment: 'The broth is rich and the portions are generous.',
        rating: 5,
        timeAgo: '2 days ago',
      },
    ],
  },
  {
    id: 'smash-yard',
    name: 'Smash Yard',
    cuisine: 'Burgers, Street Food',
    tagline: 'Smashed burgers and loaded fries',
    priceRange: 'EUR EUR',
    rating: 4.6,
    reviewCount: 391,
    distance: '1.1 km',
    isOpen: true,
    image: visuals.burgerPlate,
    heroImage: visuals.burgerPlate,
    address: 'Rruga Luan Haradinaj 6, Prishtina',
    phone: '+383 45 300 777',
    hours: '11:00 - 00:00',
    city: 'Prishtina',
    coordinates: {
      latitude: 42.6605,
      longitude: 21.1585,
    },
    todaySpecial: {
      name: 'Double Smash Combo',
      description: 'Double patty burger with fries and house sauce',
      originalPrice: 'EUR 9',
      price: 'EUR 7',
      discount: '-22%',
      availableUntil: 'Until 18:00',
      image: visuals.burgerPlate,
    },
    promotions: [
      {
        id: 'smash-combo',
        title: 'Combo Night',
        subtitle: 'Free fries after 20:00',
      },
    ],
    menuSections: [
      {
        id: 'burgers',
        title: 'Burgers',
        items: [
          {
            id: 'double-smash',
            name: 'Double Smash',
            description: 'Two beef patties, cheddar, pickles and sauce',
            price: 'EUR 7.00',
            image: visuals.burgerPlate,
          },
        ],
      },
    ],
    reviews: [
      {
        id: 'smash-review-1',
        author: 'Arben J.',
        comment: 'Crispy edges, good sauce, quick service.',
        rating: 5,
        timeAgo: '3 days ago',
      },
    ],
  },
  {
    id: 'ember-steakhouse',
    name: 'Ember Steakhouse',
    cuisine: 'Steakhouse, Grill',
    tagline: 'Charcoal steaks and wine',
    priceRange: 'EUR EUR EUR',
    rating: 4.9,
    reviewCount: 208,
    distance: '2.4 km',
    isOpen: true,
    image: visuals.steakBoard,
    heroImage: visuals.steakBoard,
    address: 'Rruga Muharrem Fejza 28, Prishtina',
    phone: '+383 44 880 441',
    hours: '13:00 - 23:30',
    city: 'Prishtina',
    coordinates: {
      latitude: 42.6459,
      longitude: 21.1698,
    },
    todaySpecial: {
      name: 'Ribeye Board',
      description: 'Grilled ribeye with potatoes and pepper sauce',
      originalPrice: 'EUR 24',
      price: 'EUR 19',
      discount: '-21%',
      availableUntil: 'Until 21:00',
      image: visuals.steakBoard,
    },
    promotions: [
      {
        id: 'ember-wine',
        title: 'Wine Pairing',
        subtitle: 'House red included with selected steaks',
      },
    ],
    menuSections: [
      {
        id: 'steaks',
        title: 'Steaks',
        items: [
          {
            id: 'ribeye-board',
            name: 'Ribeye Board',
            description: 'Ribeye, roasted potatoes and pepper sauce',
            price: 'EUR 19.00',
            image: visuals.steakBoard,
          },
        ],
      },
    ],
    reviews: [
      {
        id: 'ember-review-1',
        author: 'Valon S.',
        comment: 'Best steak night I have had in Prishtina.',
        rating: 5,
        timeAgo: '1 week ago',
      },
    ],
  },
  {
    id: 'shadervan-pasta',
    name: 'Shadervan Pasta',
    cuisine: 'Italian, Pasta',
    tagline: 'Fresh pasta near the old bridge',
    priceRange: 'EUR EUR',
    rating: 4.5,
    reviewCount: 132,
    distance: '0.4 km',
    isOpen: true,
    image: visuals.pastaTable,
    heroImage: visuals.pastaTable,
    address: 'Sheshi Shadervan 12, Prizren',
    phone: '+383 49 440 118',
    hours: '11:00 - 23:00',
    city: 'Prizren',
    coordinates: {
      latitude: 42.2098,
      longitude: 20.7401,
    },
    todaySpecial: {
      name: 'Tagliatelle Alfredo',
      description: 'Fresh pasta with cream, parmesan and mushrooms',
      originalPrice: 'EUR 8.5',
      price: 'EUR 6.8',
      discount: '-20%',
      availableUntil: 'Until 16:00',
      image: visuals.pastaTable,
    },
    promotions: [
      {
        id: 'pasta-date',
        title: 'Pasta for Two',
        subtitle: 'Two pastas and lemonade for EUR 15',
      },
    ],
    menuSections: [
      {
        id: 'fresh-pasta',
        title: 'Fresh Pasta',
        items: [
          {
            id: 'tagliatelle-alfredo',
            name: 'Tagliatelle Alfredo',
            description: 'Cream sauce, mushrooms and parmesan',
            price: 'EUR 6.80',
            image: visuals.pastaTable,
          },
        ],
      },
    ],
    reviews: [
      {
        id: 'pasta-review-1',
        author: 'Elira N.',
        comment: 'Lovely view and very comforting pasta.',
        rating: 4,
        timeAgo: '4 days ago',
      },
    ],
  },
  {
    id: 'taco-luma',
    name: 'Taco Luma',
    cuisine: 'Mexican, Street Food',
    tagline: 'Tacos, lime and spicy salsa',
    priceRange: 'EUR',
    rating: 4.4,
    reviewCount: 98,
    distance: '0.7 km',
    isOpen: true,
    image: visuals.tacoSpread,
    heroImage: visuals.tacoSpread,
    address: 'Rruga Marin Barleti 8, Prizren',
    phone: '+383 45 990 330',
    hours: '12:00 - 23:00',
    city: 'Prizren',
    coordinates: {
      latitude: 42.2115,
      longitude: 20.7379,
    },
    todaySpecial: {
      name: 'Three Taco Plate',
      description: 'Chicken, beef and veggie tacos with salsa',
      originalPrice: 'EUR 7.5',
      price: 'EUR 6',
      discount: '-20%',
      availableUntil: 'Until 19:00',
      image: visuals.tacoSpread,
    },
    promotions: [
      {
        id: 'taco-tuesday',
        title: 'Taco Tuesday',
        subtitle: 'Second taco plate half price',
      },
    ],
    menuSections: [
      {
        id: 'tacos',
        title: 'Tacos',
        items: [
          {
            id: 'three-taco-plate',
            name: 'Three Taco Plate',
            description: 'Three tacos with salsa and lime',
            price: 'EUR 6.00',
            image: visuals.tacoSpread,
          },
        ],
      },
    ],
    reviews: [
      {
        id: 'taco-review-1',
        author: 'Besa M.',
        comment: 'Fun flavors and a bright little place.',
        rating: 4,
        timeAgo: '1 week ago',
      },
    ],
  },
  {
    id: 'green-table',
    name: 'Green Table',
    cuisine: 'Healthy, Vegetarian',
    tagline: 'Fresh bowls and plant-forward plates',
    priceRange: 'EUR EUR',
    rating: 4.6,
    reviewCount: 156,
    distance: '1.9 km',
    isOpen: true,
    image: visuals.saladBowl,
    heroImage: visuals.saladBowl,
    address: 'Rruga Bill Clinton 24, Prishtina',
    phone: '+383 44 506 606',
    hours: '08:00 - 21:00',
    city: 'Prishtina',
    coordinates: {
      latitude: 42.6551,
      longitude: 21.1492,
    },
    todaySpecial: {
      name: 'Power Bowl',
      description: 'Quinoa, roasted vegetables, chickpeas and tahini',
      originalPrice: 'EUR 8',
      price: 'EUR 6.5',
      discount: '-19%',
      availableUntil: 'Until 15:00',
      image: visuals.saladBowl,
    },
    promotions: [
      {
        id: 'green-smoothie',
        title: 'Smoothie Add-on',
        subtitle: 'Add a smoothie for EUR 2 with any bowl',
      },
    ],
    menuSections: [
      {
        id: 'bowls',
        title: 'Bowls',
        items: [
          {
            id: 'power-bowl',
            name: 'Power Bowl',
            description: 'Quinoa, vegetables, chickpeas and tahini',
            price: 'EUR 6.50',
            image: visuals.saladBowl,
          },
        ],
      },
    ],
    reviews: [
      {
        id: 'green-review-1',
        author: 'Diellza K.',
        comment: 'Fresh ingredients and really good sauces.',
        rating: 5,
        timeAgo: '2 days ago',
      },
    ],
  },
  {
    id: 'peja-bakery',
    name: 'Peja Bakery',
    cuisine: 'Bakery, Breakfast',
    tagline: 'Warm bread, pastries and coffee',
    priceRange: 'EUR',
    rating: 4.7,
    reviewCount: 244,
    distance: '0.5 km',
    isOpen: true,
    image: visuals.bakeryCase,
    heroImage: visuals.bakeryCase,
    address: 'Rruga Mbreteresha Teute 5, Peje',
    phone: '+383 49 210 900',
    hours: '06:30 - 19:00',
    city: 'Peje',
    coordinates: {
      latitude: 42.6608,
      longitude: 20.2911,
    },
    todaySpecial: {
      name: 'Croissant Breakfast',
      description: 'Butter croissant, jam and espresso',
      originalPrice: 'EUR 4.8',
      price: 'EUR 3.8',
      discount: '-21%',
      availableUntil: 'Until 11:00',
      image: visuals.bakeryCase,
    },
    promotions: [
      {
        id: 'bakery-morning',
        title: 'Morning Box',
        subtitle: 'Six pastries for EUR 7 before 10:00',
      },
    ],
    menuSections: [
      {
        id: 'pastries',
        title: 'Pastries',
        items: [
          {
            id: 'butter-croissant',
            name: 'Butter Croissant',
            description: 'Fresh baked croissant with jam',
            price: 'EUR 2.20',
            image: visuals.bakeryCase,
          },
        ],
      },
    ],
    reviews: [
      {
        id: 'bakery-review-1',
        author: 'Ariana V.',
        comment: 'The smell alone is worth stopping for.',
        rating: 5,
        timeAgo: 'today',
      },
    ],
  },
  {
    id: 'drini-seafood',
    name: 'Drini Seafood',
    cuisine: 'Seafood, Mediterranean',
    tagline: 'Fresh fish and Mediterranean sides',
    priceRange: 'EUR EUR EUR',
    rating: 4.5,
    reviewCount: 119,
    distance: '1.4 km',
    isOpen: false,
    image: visuals.seafoodPlate,
    heroImage: visuals.seafoodPlate,
    address: 'Rruga UCK 32, Prizren',
    phone: '+383 44 760 555',
    hours: '12:00 - 22:30',
    city: 'Prizren',
    coordinates: {
      latitude: 42.2158,
      longitude: 20.7426,
    },
    todaySpecial: {
      name: 'Grilled Sea Bass',
      description: 'Sea bass with lemon potatoes and herbs',
      originalPrice: 'EUR 18',
      price: 'EUR 14',
      discount: '-22%',
      availableUntil: 'Until 20:00',
      image: visuals.seafoodPlate,
    },
    promotions: [
      {
        id: 'drini-family',
        title: 'Family Fish Platter',
        subtitle: 'Shared platter for four every Sunday',
      },
    ],
    menuSections: [
      {
        id: 'fish',
        title: 'Fresh Fish',
        items: [
          {
            id: 'grilled-sea-bass',
            name: 'Grilled Sea Bass',
            description: 'Lemon potatoes, herbs and olive oil',
            price: 'EUR 14.00',
            image: visuals.seafoodPlate,
          },
        ],
      },
    ],
    reviews: [
      {
        id: 'drini-review-1',
        author: 'Besart G.',
        comment: 'Clean flavors and a nice break from heavy food.',
        rating: 4,
        timeAgo: '2 weeks ago',
      },
    ],
  },
  {
    id: 'mezze-sofra',
    name: 'Mezze Sofra',
    cuisine: 'Mediterranean, Mezze',
    tagline: 'Small plates for sharing',
    priceRange: 'EUR EUR',
    rating: 4.8,
    reviewCount: 203,
    distance: '0.9 km',
    isOpen: true,
    image: visuals.mezzeTable,
    heroImage: visuals.mezzeTable,
    address: 'Rruga Edit Durham 10, Prishtina',
    phone: '+383 45 770 118',
    hours: '11:30 - 23:00',
    city: 'Prishtina',
    coordinates: {
      latitude: 42.6669,
      longitude: 21.1589,
    },
    todaySpecial: {
      name: 'Mezze Mix',
      description: 'Hummus, olives, grilled vegetables and warm bread',
      originalPrice: 'EUR 12',
      price: 'EUR 9',
      discount: '-25%',
      availableUntil: 'Until 18:00',
      image: visuals.mezzeTable,
    },
    promotions: [
      {
        id: 'mezze-share',
        title: 'Share Table',
        subtitle: 'Free bread refill with every mezze board',
      },
    ],
    menuSections: [
      {
        id: 'mezze',
        title: 'Mezze',
        items: [
          {
            id: 'mezze-mix',
            name: 'Mezze Mix',
            description: 'Hummus, olives, vegetables and bread',
            price: 'EUR 9.00',
            image: visuals.mezzeTable,
          },
        ],
      },
    ],
    reviews: [
      {
        id: 'mezze-review-1',
        author: 'Dion B.',
        comment: 'Perfect place to share plates with friends.',
        rating: 5,
        timeAgo: '6 days ago',
      },
    ],
  },
  {
    id: 'sweet-corner',
    name: 'Sweet Corner',
    cuisine: 'Desserts, Cafe',
    tagline: 'Cakes, coffee and late sweets',
    priceRange: 'EUR',
    rating: 4.6,
    reviewCount: 174,
    distance: '0.8 km',
    isOpen: true,
    image: visuals.dessertPlate,
    heroImage: visuals.dessertPlate,
    address: 'Rruga William Walker 3, Prizren',
    phone: '+383 49 500 404',
    hours: '09:00 - 22:00',
    city: 'Prizren',
    coordinates: {
      latitude: 42.2131,
      longitude: 20.7354,
    },
    todaySpecial: {
      name: 'Chocolate Berry Cake',
      description: 'Layered chocolate cake with berry cream',
      originalPrice: 'EUR 4.5',
      price: 'EUR 3.5',
      discount: '-22%',
      availableUntil: 'Until 18:00',
      image: visuals.dessertPlate,
    },
    promotions: [
      {
        id: 'sweet-coffee',
        title: 'Cake + Coffee',
        subtitle: 'Any cake slice with espresso for EUR 5',
      },
    ],
    menuSections: [
      {
        id: 'cakes',
        title: 'Cakes',
        items: [
          {
            id: 'chocolate-berry-cake',
            name: 'Chocolate Berry Cake',
            description: 'Chocolate layers and berry cream',
            price: 'EUR 3.50',
            image: visuals.dessertPlate,
          },
        ],
      },
    ],
    reviews: [
      {
        id: 'sweet-review-1',
        author: 'Sara P.',
        comment: 'Small, cute and great for dessert after dinner.',
        rating: 5,
        timeAgo: '3 days ago',
      },
    ],
  },
  {
    id: 'veranda-peje',
    name: 'Veranda Peje',
    cuisine: 'Fine Dining, Kosovo',
    tagline: 'Elevated Kosovo dining with mountain mood',
    priceRange: 'EUR EUR EUR',
    rating: 4.8,
    reviewCount: 137,
    distance: '1.1 km',
    isOpen: true,
    image: visuals.wineDining,
    heroImage: visuals.wineDining,
    address: 'Rruga Adem Jashari 19, Peje',
    phone: '+383 44 230 303',
    hours: '12:00 - 23:00',
    city: 'Peje',
    coordinates: {
      latitude: 42.6584,
      longitude: 20.2868,
    },
    todaySpecial: {
      name: 'Slow Beef Plate',
      description: 'Braised beef, root vegetables and red wine sauce',
      originalPrice: 'EUR 17',
      price: 'EUR 13.5',
      discount: '-21%',
      availableUntil: 'Until 20:00',
      image: visuals.wineDining,
    },
    promotions: [
      {
        id: 'veranda-tasting',
        title: 'Chef Tasting',
        subtitle: 'Three-course menu every Friday',
      },
    ],
    menuSections: [
      {
        id: 'signature',
        title: 'Signature Plates',
        items: [
          {
            id: 'slow-beef-plate',
            name: 'Slow Beef Plate',
            description: 'Braised beef and root vegetables',
            price: 'EUR 13.50',
            image: visuals.wineDining,
          },
        ],
      },
    ],
    reviews: [
      {
        id: 'veranda-review-1',
        author: 'Ilir C.',
        comment: 'A calm dinner spot with excellent service.',
        rating: 5,
        timeAgo: '1 week ago',
      },
    ],
  },
  {
    id: 'rugova-soup-bar',
    name: 'Rugova Soup Bar',
    cuisine: 'Soups, Comfort Food',
    tagline: 'Warm bowls inspired by the mountains',
    priceRange: 'EUR',
    rating: 4.5,
    reviewCount: 88,
    distance: '2.0 km',
    isOpen: true,
    image: visuals.soupBowl,
    heroImage: visuals.soupBowl,
    address: 'Rruga Rugova 14, Peje',
    phone: '+383 49 340 222',
    hours: '10:00 - 20:00',
    city: 'Peje',
    coordinates: {
      latitude: 42.6636,
      longitude: 20.2825,
    },
    todaySpecial: {
      name: 'Mountain Bean Soup',
      description: 'Slow cooked beans with smoked paprika and bread',
      originalPrice: 'EUR 5.5',
      price: 'EUR 4.2',
      discount: '-24%',
      availableUntil: 'Until 15:00',
      image: visuals.soupBowl,
    },
    promotions: [
      {
        id: 'soup-bread',
        title: 'Soup + Bread',
        subtitle: 'Fresh bread included with every soup bowl',
      },
    ],
    menuSections: [
      {
        id: 'soups',
        title: 'Soups',
        items: [
          {
            id: 'mountain-bean-soup',
            name: 'Mountain Bean Soup',
            description: 'Beans, smoked paprika and fresh bread',
            price: 'EUR 4.20',
            image: visuals.soupBowl,
          },
        ],
      },
    ],
    reviews: [
      {
        id: 'soup-review-1',
        author: 'Flaka E.',
        comment: 'Simple, warm and perfect after a cold walk.',
        rating: 4,
        timeAgo: '5 days ago',
      },
    ],
  },
  {
    id: 'sunrise-toast',
    name: 'Sunrise Toast',
    cuisine: 'Breakfast, Brunch',
    tagline: 'Toast plates, eggs and fresh juice',
    priceRange: 'EUR',
    rating: 4.4,
    reviewCount: 126,
    distance: '1.3 km',
    isOpen: true,
    image: visuals.breakfastToast,
    heroImage: visuals.breakfastToast,
    address: 'Rruga Tringe Smajli 15, Prishtina',
    phone: '+383 44 420 515',
    hours: '07:00 - 15:00',
    city: 'Prishtina',
    coordinates: {
      latitude: 42.6574,
      longitude: 21.1552,
    },
    todaySpecial: {
      name: 'Avocado Egg Toast',
      description: 'Sourdough toast, avocado, egg and chili flakes',
      originalPrice: 'EUR 6',
      price: 'EUR 4.8',
      discount: '-20%',
      availableUntil: 'Until 12:00',
      image: visuals.breakfastToast,
    },
    promotions: [
      {
        id: 'sunrise-juice',
        title: 'Fresh Juice Morning',
        subtitle: 'Free orange juice with brunch plates before 10:00',
      },
    ],
    menuSections: [
      {
        id: 'toasts',
        title: 'Toasts',
        items: [
          {
            id: 'avocado-egg-toast',
            name: 'Avocado Egg Toast',
            description: 'Sourdough, avocado, egg and chili flakes',
            price: 'EUR 4.80',
            image: visuals.breakfastToast,
          },
        ],
      },
    ],
    reviews: [
      {
        id: 'toast-review-1',
        author: 'Rita Z.',
        comment: 'Bright morning spot with fast service.',
        rating: 4,
        timeAgo: '2 days ago',
      },
    ],
  },
  {
    id: 'old-town-qebaptore',
    name: 'Old Town Qebaptore',
    cuisine: 'Traditional, Grill',
    tagline: 'Classic qebapa near the old town',
    priceRange: 'EUR',
    rating: 4.7,
    reviewCount: 318,
    distance: '0.3 km',
    isOpen: true,
    image: visuals.grilledDish,
    heroImage: visuals.grilledDish,
    address: 'Rruga Saracet 2, Prizren',
    phone: '+383 44 220 909',
    hours: '09:00 - 22:30',
    city: 'Prizren',
    coordinates: {
      latitude: 42.2107,
      longitude: 20.7418,
    },
    todaySpecial: {
      name: 'Ten Qebapa Plate',
      description: 'Qebapa with pita, onions and yogurt',
      originalPrice: 'EUR 6.5',
      price: 'EUR 5',
      discount: '-23%',
      availableUntil: 'Until 16:00',
      image: visuals.grilledDish,
    },
    promotions: [
      {
        id: 'qebapa-lunch',
        title: 'Lunch Plate',
        subtitle: 'Qebapa, salad and drink for EUR 7',
      },
    ],
    menuSections: [
      {
        id: 'qebapa',
        title: 'Qebapa',
        items: [
          {
            id: 'ten-qebapa',
            name: 'Ten Qebapa Plate',
            description: 'Qebapa, pita, onions and yogurt',
            price: 'EUR 5.00',
            image: visuals.grilledDish,
          },
        ],
      },
    ],
    reviews: [
      {
        id: 'qebapa-review-1',
        author: 'Mentor H.',
        comment: 'Fast, classic and exactly what you want in old town.',
        rating: 5,
        timeAgo: '4 days ago',
      },
    ],
  },
];

export const restaurants = [
  pishatRestaurant,
  sushiRestaurant,
  pizzaRestaurant,
  cafeRestaurant,
  grillHouse,
  barMetropol,
  ...additionalRestaurants,
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
  {
    id: 'event-study-spotlight',
    title: 'Campus Study Circle',
    category: 'Study',
    venue: 'Innovation Hub, Prishtina',
    date: 'Thu • 17:00',
    description: 'Meet students, attend quick workshops, and discover Kosovo’s study culture.',
    colors: ['#FFC92C', '#FFB54A'],
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

export const nearbyRestaurants = restaurants
  .filter((restaurant) => restaurant.city === 'Prishtina')
  .slice(0, 8);

export const favoriteRestaurants = restaurants.slice(0, 8);

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
  { id: 'en', flag: '🇬🇧', label: 'English', selected: true },
  { id: 'sq', flag: '🇽🇰', label: 'Albanian', selected: false },
];

export const notificationOptions: NotificationOption[] = [
  {
    id: 'offers',
    title: 'Offers & Promotions',
    subtitle: 'Get notifications about new offers',
    enabled: true,
  },
  {
    id: 'reservations',
    title: 'Reservations',
    subtitle: 'Reminders for your reservations',
    enabled: true,
  },
  {
    id: 'reviews',
    title: 'Reviews',
    subtitle: 'Notifications about new reviews',
    enabled: false,
  },
];

export const accountLinks: QuickLink[] = [
  { id: 'profile', icon: 'person-outline', label: 'My Profile' },
  { id: 'addresses', icon: 'location-sharp', label: 'Addresses' },
  { id: 'payments', icon: 'card-outline', label: 'Payment Methods' },
  { id: 'help', icon: 'help-circle-outline', label: 'Help & Support' },
  { id: 'logout', icon: 'log-out-outline', label: 'Sign Out', tone: 'danger' },
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
