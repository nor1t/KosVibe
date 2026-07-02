import type { SupportedLanguage } from './messages';

export const nativeCopy: Record<
  SupportedLanguage,
  {
    tabs: {
      home: string;
      explore: string;
      events: string;
      stories: string;
      profile: string;
    };
    dashboard: {
      settingsLabel: string;
      heroTitle: string;
      heroAccent: string;
      heroSubtitle: string;
      cta: string;
      categories: {
        restaurants: string;
        monuments: string;
        events: string;
        stories: string;
      };
      trending: string;
      topPicks: string;
      away: string;
    };
    stories: {
      eyebrow: string;
      title: string;
      subtitle: string;
      trending: string;
      latest: string;
      ctaTitle: string;
      ctaText: string;
      ctaButton: string;
      featured: string;
      openStory: string;
      createTitle: string;
      creatorEyebrow: string;
      titleLabel: string;
      titlePlaceholder: string;
      subtitleLabel: string;
      subtitlePlaceholder: string;
      locationLabel: string;
      locationPlaceholder: string;
      categoryLabel: string;
      categoryPlaceholder: string;
      bodyLabel: string;
      bodyPlaceholder: string;
      publishButton: string;
      notFound: string;
      likes: string;
      views: string;
      yourStory: string;
      justNow: string;
    };
    profile: {
      title: string;
      fallbackName: string;
      bio: string;
      editButton: string;
      editTitle: string;
      editSubtitle: string;
      fullNameLabel: string;
      bioLabel: string;
      avatarLabel: string;
      avatarHint: string;
      uploadPhoto: string;
      removePhoto: string;
      saveChanges: string;
      savingChanges: string;
      stats: {
        joined: string;
        stories: string;
        events: string;
      };
      section: string;
      actions: string[];
      badgeEyebrow: string;
      badgeTitle: string;
      badgeText: string;
    };
    tavolina: {
      eyebrow: string;
      title: string;
      subtitle: string;
      moods: string[];
      creatorOptions: {
        id: string;
        title: string;
        subtitle: string;
      }[];
      launchTitle: string;
      launchText: string;
      launchButton: string;
      communityDrops: string;
      createEvent: {
        stepType: string;
        stepDetails: string;
        stepPricing: string;
        food: string;
        culture: string;
        nightlife: string;
        other: string;
        eventName: string;
        eventNamePlaceholder: string;
        city: string;
        cityPlaceholder: string;
        day: string;
        dayPlaceholder: string;
        time: string;
        timePlaceholder: string;
        description: string;
        descriptionPlaceholder: string;
        uploadPhoto: string;
        takePhoto: string;
        changePhoto: string;
        isPaid: string;
        isFree: string;
        price: string;
        pricePlaceholder: string;
        maxAttendees: string;
        maxAttendeesPlaceholder: string;
        spots: string;
        next: string;
        back: string;
        publish: string;
        cancel: string;
        hostedBy: string;
        eventDetails: string;
        joinSuccessTitle: string;
        joinSuccessMessage: string;
        join: string;
        joined: string;
        paidLabel: string;
        freeLabel: string;
        capacityLabel: string;
      };
    };
    category: {
      filters: string[];
      cultureTitle: string;
      cultureSubtitle: string;
      restaurantTitle: string;
      restaurantSubtitle: string;
      searchPlaceholder: string;
      restaurants: string;
      communityReviews: string;
    };
    map: {
      title: string;
      categoryEyebrow: string;
      dropdownTitle: string;
      cityEyebrow: string;
      cityDropdownTitle: string;
      allCities: string;
      searchPlaceholder: string;
      searchButton: string;
      spotsLabel: string;
      emptyTitle: string;
      reveal: string;
      options: Record<
        string,
        {
          label: string;
          sheetTitle: string;
          sheetDescription: string;
          emptyDescription: string;
        }
      >;
    };
    booking: {
      title: string;
      fallbackRestaurant: string;
      heroTitle: string;
      heroText: string;
      dates: string;
      timeSlots: string;
      confirm: string;
    };
    restaurantDetails: {
      openNow: string;
      closed: string;
      ratingSuffix: string;
      todaySpecial: string;
      about: string;
      openDailyPrefix: string;
      menuHighlights: string;
      seasonalSelection: string;
      reviews: string;
      bookTable: string;
    };
  }
> = {
  en: {
    tabs: {
      home: 'Home',
      explore: 'Explore',
      events: 'Events',
      stories: 'Stories',
      profile: 'Profile',
    },
    dashboard: {
      settingsLabel: 'Open settings',
      heroTitle: 'Discover Kosovo',
      heroAccent: '',
      heroSubtitle: 'Your ultimate guide to hidden gems, culture and unforgettable experiences.',
      cta: 'Explore Now',
      categories: {
        restaurants: 'Restaurants',
        monuments: 'Monuments & Nature',
        events: 'Events',
        stories: 'Rural Market',
      },
      trending: 'Trending in Kosovo',
      topPicks: 'Top Picks Near You',
      away: 'away',
    },
    stories: {
      eyebrow: 'Community Stories',
      title: 'What Kosovo feels like right now.',
      subtitle:
        'Swipe through creator-led travel notes, restaurant drops, and local stories from the community.',
      trending: 'Trending Story',
      latest: 'Latest Drops',
      ctaTitle: 'Share your own vibe',
      ctaText:
        'Post a story from your favorite restaurant, event, or hidden Kosovo corner and inspire the next route.',
      ctaButton: 'Create a Story',
      featured: 'Featured',
      openStory: 'Open story',
      createTitle: 'Create a story',
      creatorEyebrow: 'Story Studio',
      titleLabel: 'Title',
      titlePlaceholder: 'Give your story a strong title',
      subtitleLabel: 'Short description',
      subtitlePlaceholder: 'What should people expect?',
      locationLabel: 'Location',
      locationPlaceholder: 'Prishtina',
      categoryLabel: 'Category',
      categoryPlaceholder: 'Food, culture...',
      bodyLabel: 'Story',
      bodyPlaceholder: 'Write the route, mood, people, food, and little details that made it worth sharing.',
      publishButton: 'Publish Story',
      notFound: 'Story not found',
      likes: 'likes',
      views: 'views',
      yourStory: 'You',
      justNow: 'Just now',
    },
    profile: {
      title: 'Profile',
      fallbackName: 'KosVibe Member',
      bio: 'Curating restaurants, monuments, and city stories with a modern Kosovo state of mind.',
      editButton: 'Edit Profile',
      editTitle: 'Edit your profile',
      editSubtitle:
        'Update your name, bio, and avatar now so the profile can plug into your database later.',
      fullNameLabel: 'Full name',
      bioLabel: 'Bio',
      avatarLabel: 'Profile photo',
      avatarHint:
        'Upload a photo or paste an avatar URL. We will store the data in auth metadata for now.',
      uploadPhoto: 'Upload photo',
      removePhoto: 'Remove photo',
      saveChanges: 'Save changes',
      savingChanges: 'Saving...',
      stats: {
        joined: 'Joined events',
        stories: 'Stories',
        events: 'Events hosted',
      },
      section: 'Your vibe',
      actions: ['Favorite restaurants', 'Monument trail', 'Settings'],
      badgeEyebrow: 'KosVibe Badge',
      badgeTitle: 'Gold city curator',
      badgeText:
        'You are one of the most active members in your circle this month. Keep posting and exploring.',
    },
    tavolina: {
      eyebrow: 'KosVibe Events',
      title: 'Create the next vibe.',
      subtitle: 'Start a culture night, dinner, or city meetup and invite the community.',
      moods: ['All', 'Food', 'Culture', 'Nightlife', 'Other'],
      creatorOptions: [
        {
          id: 'host-dinner',
          title: 'Host a dinner',
          subtitle: 'Invite people to a local food night with great energy.',
        },
        {
          id: 'drop-event',
          title: 'Drop an event',
          subtitle: 'Create a vibe around music, culture, or a spontaneous meetup.',
        },
      ],
      launchTitle: 'Launch a new event',
      launchText:
        'Pick a restaurant, set the mood, and share it with the community in seconds.',
      launchButton: 'Create Event',
      communityDrops: 'Community events',
      createEvent: {
        stepType: 'What kind of event?',
        stepDetails: 'Event details',
        stepPricing: 'Pricing & capacity',
        food: 'Food',
        culture: 'Culture',
        nightlife: 'Nightlife',
        other: 'Other',
        eventName: 'Event name',
        eventNamePlaceholder: 'Sunset food meetup',
        city: 'City',
        cityPlaceholder: 'Prishtina',
        day: 'Day',
        dayPlaceholder: 'Friday',
        time: 'Time',
        timePlaceholder: '20:00',
        description: 'Description',
        descriptionPlaceholder: 'Tell people what the vibe is and who should join.',
        uploadPhoto: 'Upload photo',
        takePhoto: 'Take photo',
        changePhoto: 'Change photo',
        isPaid: 'Paid event',
        isFree: 'Free event',
        price: 'Price per person',
        pricePlaceholder: '€5.00',
        maxAttendees: 'Max attendees',
        maxAttendeesPlaceholder: '30',
        spots: 'Open spots',
        next: 'Next',
        back: 'Back',
        publish: 'Publish',
        cancel: 'Cancel',
        hostedBy: 'Hosted by',
        eventDetails: 'Event details',
        joinSuccessTitle: 'You joined the event',
        joinSuccessMessage: 'Your spot is saved in this community event.',
        join: 'Join event',
        joined: 'Joined',
        paidLabel: 'Paid',
        freeLabel: 'Free',
        capacityLabel: 'Capacity',
      },
    },
    category: {
      filters: ['All', 'Traditional', 'Cafe', 'Street Food', 'Fine Dining'],
      cultureTitle: 'Monuments & Nature',
      cultureSubtitle: 'Historic landmarks and wild escapes',
      restaurantTitle: 'Find your next favorite spot.',
      restaurantSubtitle: 'Search restaurants, cuisines, vibes and community-approved places.',
      searchPlaceholder: 'Search restaurants, cuisines, vibes...',
      restaurants: 'Restaurants',
      communityReviews: 'Community Reviews',
    },
    map: {
      title: 'Explore Kosovo',
      categoryEyebrow: 'Category',
      dropdownTitle: 'Choose the vibe you want on the map',
      cityEyebrow: 'City',
      cityDropdownTitle: 'Choose a city',
      allCities: 'All Kosovo',
      searchPlaceholder: 'Search places, vibes, cities...',
      searchButton: 'Search',
      spotsLabel: 'spots',
      emptyTitle: 'Nothing pinned here yet',
      reveal: 'Show',
      options: {
        eat: {
          label: 'Eat',
          sheetTitle: 'Nearby Vibes',
          sheetDescription: 'Curated places close to your current map area.',
          emptyDescription: 'No food spots match this location yet.',
        },
        coffee: {
          label: 'Coffee',
          sheetTitle: 'Coffee Corners',
          sheetDescription: 'Comfortable cafes for meetings, catchups, and slow mornings.',
          emptyDescription: 'No coffee spots are pinned for this city yet.',
        },
        nightlife: {
          label: 'Nightlife',
          sheetTitle: 'After Dark',
          sheetDescription: 'Late-night energy, rooftop views, and music-forward stops.',
          emptyDescription: 'No nightlife spots are pinned for this city yet.',
        },
        culture: {
          label: 'Culture',
          sheetTitle: 'Culture Trail',
          sheetDescription: 'Creative venues and heritage stops worth saving.',
          emptyDescription: 'No culture stops are pinned for this city yet.',
        },
        nature: {
          label: 'Nature',
          sheetTitle: 'Outdoor Escapes',
          sheetDescription: 'Fresh-air routes, viewpoints, and scenic resets.',
          emptyDescription: 'No outdoor spots are pinned for this city yet.',
        },
        study: {
          label: 'Study',
          sheetTitle: 'Study Mode',
          sheetDescription: 'Quiet corners and productive spots with good coffee nearby.',
          emptyDescription: 'No study-friendly spots are pinned for this city yet.',
        },
        icons: {
          label: 'Icons',
          sheetTitle: 'Kosovo Icons',
          sheetDescription: 'Signature landmarks for first-timers and quick detours.',
          emptyDescription: 'No landmark pins are available for this city yet.',
        },
      },
    },
    booking: {
      title: 'Reserve a table',
      fallbackRestaurant: 'KosVibe pick',
      heroTitle: 'Choose your date',
      heroText: 'Lock in the best hour for a night out, a slow lunch, or a last-minute cultural dinner.',
      dates: 'Dates',
      timeSlots: 'Time slots',
      confirm: 'Confirm Booking',
    },
    restaurantDetails: {
      openNow: 'Open Now',
      closed: 'Closed',
      ratingSuffix: 'rating',
      todaySpecial: "Today's Special",
      about: 'About',
      openDailyPrefix: 'Open daily',
      menuHighlights: 'Menu highlights',
      seasonalSelection: 'Seasonal selection',
      reviews: 'Reviews',
      bookTable: 'Book a Table',
    },
  },
  sq: {
    tabs: {
      home: 'Ballina',
      explore: 'Eksploro',
      events: 'Evente',
      stories: 'Storje',
      profile: 'Profili',
    },
    dashboard: {
      settingsLabel: 'Hap cilesimet',
      heroTitle: 'Zbulo Kosoven',
      heroAccent: 'XK',
      heroSubtitle:
        'Udhezuesi yt per vende te fshehura, kulture dhe pervoja te paharrueshme.',
      cta: 'Eksploro Tani',
      categories: {
        restaurants: 'Restorante',
        monuments: 'Monumente & Natyre',
        events: 'Evente',
        stories: 'Tregu Rural',
      },
      trending: 'Ne trend ne Kosove',
      topPicks: 'Zgjedhje prane teje',
      away: 'larg',
    },
    stories: {
      eyebrow: 'Storje te komunitetit',
      title: 'Si ndihet Kosova tani.',
      subtitle:
        'Shfleto shenime udhetimi, vende ushqimi dhe storje lokale nga komuniteti.',
      trending: 'Storje ne trend',
      latest: 'Me te fundit',
      ctaTitle: 'Ndaje viben tende',
      ctaText:
        'Posto nje storje nga restoranti, eventi ose cepi yt i preferuar ne Kosove.',
      ctaButton: 'Krijo storje',
      featured: 'E vecuar',
      openStory: 'Hap storjen',
      createTitle: 'Krijo storje',
      creatorEyebrow: 'Studio storjesh',
      titleLabel: 'Titulli',
      titlePlaceholder: 'Jepi storjes nje titull te forte',
      subtitleLabel: 'Pershkrim i shkurter',
      subtitlePlaceholder: 'Cfare duhet te presin njerezit?',
      locationLabel: 'Lokacioni',
      locationPlaceholder: 'Prishtine',
      categoryLabel: 'Kategoria',
      categoryPlaceholder: 'Ushqim, kulture...',
      bodyLabel: 'Storja',
      bodyPlaceholder: 'Shkruaj rrugen, atmosferen, njerezit, ushqimin dhe detajet qe ia vlejne te ndahen.',
      publishButton: 'Publiko storjen',
      notFound: 'Storja nuk u gjet',
      likes: 'pelqime',
      views: 'shikime',
      yourStory: 'Ti',
      justNow: 'Tani',
    },
    profile: {
      title: 'Profili',
      fallbackName: 'Anetar i KosVibe',
      bio: 'Kuron restorante, monumente dhe storje qyteti me fryme moderne te Kosoves.',
      editButton: 'Ndrysho profilin',
      editTitle: 'Ndrysho profilin tend',
      editSubtitle:
        'Perditeso emrin, biografin dhe avataren tani qe profili te lidhet me databazen me vone.',
      fullNameLabel: 'Emri i plote',
      bioLabel: 'Biografia',
      avatarLabel: 'Foto e profilit',
      avatarHint:
        'Ngarko nje foto ose vendos nje URL avatari. Per momentin i ruajme ne metadata te auth.',
      uploadPhoto: 'Ngarko foto',
      removePhoto: 'Hiq foton',
      saveChanges: 'Ruaj ndryshimet',
      savingChanges: 'Duke ruajtur...',
      stats: {
        joined: 'Evente te bashkuara',
        stories: 'Storje',
        events: 'Evente te mbajtura',
      },
      section: 'Vibi yt',
      actions: ['Restorantet favorite', 'Shtegu i monumenteve', 'Cilesimet'],
      badgeEyebrow: 'Distinktivi KosVibe',
      badgeTitle: 'Kurator i arte i qytetit',
      badgeText:
        'Je nje nga anetaret me aktiv kete muaj. Vazhdo te postosh dhe te eksplorosh.',
    },
    tavolina: {
      eyebrow: 'Evente KosVibe',
      title: 'Krijo viben e radhes.',
      subtitle: 'Fillo nje nate kulture, darke ose takim qyteti dhe fto komunitetin.',
      moods: ['Te gjitha', 'Ushqim', 'Kulture', 'Nate', 'Tjeter'],
      creatorOptions: [
        {
          id: 'host-dinner',
          title: 'Organizo darke',
          subtitle: 'Fto shoqerine per nje nate lokale plot energji.',
        },
        {
          id: 'drop-event',
          title: 'Krijo event',
          subtitle: 'Krijo vibe rreth muzikes, kultures ose nje takimi spontan.',
        },
      ],
      launchTitle: 'Fillo nje event te ri',
      launchText:
        'Zgjidh restorantin, vendos atmosferen dhe ndaje me komunitetin ne pak sekonda.',
      launchButton: 'Krijo Event',
      communityDrops: 'Evente nga komuniteti',
      createEvent: {
        stepType: 'Cfare lloj eventi?',
        stepDetails: 'Detajet e eventit',
        stepPricing: 'Cmimi & kapaciteti',
        food: 'Ushqim',
        culture: 'Kulture',
        nightlife: 'Nate',
        other: 'Tjeter',
        eventName: 'Emri i eventit',
        eventNamePlaceholder: 'Takim ushqimi ne perendim',
        city: 'Qyteti',
        cityPlaceholder: 'Prishtine',
        day: 'Dita',
        dayPlaceholder: 'E premte',
        time: 'Ora',
        timePlaceholder: '20:00',
        description: 'Pershkrimi',
        descriptionPlaceholder: 'Trego cfare vibe ka eventi dhe kush mund te bashkohet.',
        uploadPhoto: 'Ngarko foto',
        takePhoto: 'Foto me kamere',
        changePhoto: 'Ndrysho foton',
        isPaid: 'Event me pagese',
        isFree: 'Event falas',
        price: 'Cmimi per person',
        pricePlaceholder: '€5.00',
        maxAttendees: 'Maksimum pjesemarresish',
        maxAttendeesPlaceholder: '30',
        spots: 'Vende te lira',
        next: 'Tjetra',
        back: 'Pas',
        publish: 'Publiko',
        cancel: 'Anulo',
        hostedBy: 'Organizuar nga',
        eventDetails: 'Detajet e eventit',
        joinSuccessTitle: 'U bashkove ne event',
        joinSuccessMessage: 'Vendi yt u ruajt ne kete event te komunitetit.',
        join: 'Bashkohu',
        joined: 'Je bashkuar',
        paidLabel: 'Me pagese',
        freeLabel: 'Falas',
        capacityLabel: 'Kapaciteti',
      },
    },
    category: {
      filters: ['Te gjitha', 'Tradicionale', 'Kafene', 'Ushqim rruge', 'Fine Dining'],
      cultureTitle: 'Monumente & Natyre',
      cultureSubtitle: 'Monumente historike dhe arratisje ne natyre',
      restaurantTitle: 'Gjej vendin tend te preferuar.',
      restaurantSubtitle: 'Kerko restorante, kuzhina, vibe dhe vende te pelqyera nga komuniteti.',
      searchPlaceholder: 'Kerko restorante, kuzhina, vibe...',
      restaurants: 'Restorante',
      communityReviews: 'Vleresime nga komuniteti',
    },
    map: {
      title: 'Eksploro Kosoven',
      categoryEyebrow: 'Kategori',
      dropdownTitle: 'Zgjidh viben qe do ne harte',
      cityEyebrow: 'Qyteti',
      cityDropdownTitle: 'Zgjidh qytetin',
      allCities: 'Gjithe Kosova',
      searchPlaceholder: 'Kerko vende, vibe, qytete...',
      searchButton: 'Kerko',
      spotsLabel: 'vende',
      emptyTitle: 'Ende nuk ka vende ketu',
      reveal: 'Shfaq',
      options: {
        eat: {
          label: 'Ushqim',
          sheetTitle: 'Vibe prane teje',
          sheetDescription: 'Vende te kuruara afer zones aktuale te hartes.',
          emptyDescription: 'Nuk ka ende vende ushqimi per kete lokacion.',
        },
        coffee: {
          label: 'Kafe',
          sheetTitle: 'Kende kafeje',
          sheetDescription: 'Kafene te rehatshme per takime dhe mengjese te qeta.',
          emptyDescription: 'Nuk ka ende kafene te vendosura per kete qytet.',
        },
        nightlife: {
          label: 'Nate',
          sheetTitle: 'Pas erresires',
          sheetDescription: 'Energji nate, pamje nga lart dhe ndalesa me muzike.',
          emptyDescription: 'Nuk ka ende vende nate per kete qytet.',
        },
        culture: {
          label: 'Kulture',
          sheetTitle: 'Shteg kulture',
          sheetDescription: 'Vende kreative dhe pika trashegimie qe ia vlejne.',
          emptyDescription: 'Nuk ka ende ndalesa kulture per kete qytet.',
        },
        nature: {
          label: 'Natyre',
          sheetTitle: 'Arratisje ne natyre',
          sheetDescription: 'Rruge ne ajer te paster, pamje dhe pushime skenike.',
          emptyDescription: 'Nuk ka ende vende natyrore per kete qytet.',
        },
        study: {
          label: 'Studim',
          sheetTitle: 'Modalitet studimi',
          sheetDescription: 'Kende te qeta dhe vende produktive me kafe afer.',
          emptyDescription: 'Nuk ka ende vende per studim ne kete qytet.',
        },
        icons: {
          label: 'Ikona',
          sheetTitle: 'Ikonat e Kosoves',
          sheetDescription: 'Monumente kryesore per vizitore dhe ndalesa te shpejta.',
          emptyDescription: 'Nuk ka ende monumente te vendosura per kete qytet.',
        },
      },
    },
    booking: {
      title: 'Rezervo tavoline',
      fallbackRestaurant: 'Zgjedhje KosVibe',
      heroTitle: 'Zgjidh daten',
      heroText: 'Siguro oren me te mire per nje nate jashte, dreke te qete ose darke kulturore.',
      dates: 'Datat',
      timeSlots: 'Oret',
      confirm: 'Konfirmo rezervimin',
    },
    restaurantDetails: {
      openNow: 'Hapur tani',
      closed: 'Mbyllur',
      ratingSuffix: 'vleresim',
      todaySpecial: 'Specialja e dites',
      about: 'Rreth vendit',
      openDailyPrefix: 'Hapur cdo dite',
      menuHighlights: 'Pikat kryesore te menus',
      seasonalSelection: 'Zgjedhje sezonale',
      reviews: 'Vleresime',
      bookTable: 'Rezervo tavoline',
    },
  },
};
