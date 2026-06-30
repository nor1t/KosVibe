import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase, RouteProp } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  GestureResponderEvent,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { nearbyVibesRestaurants } from '../data/nearbyVibesRestaurants';
import { useI18n } from '../i18n/I18nProvider';
import { nativeCopy } from '../i18n/nativeCopy';
import { useDiscovery } from '../lib/discovery-state';
import { useRestaurantCatalog } from '../lib/restaurant-catalog';
import { openDirectionsToPlace } from '../lib/maps';
import { RestaurantShowcaseCard } from '../components/common/RestaurantShowcaseCard';
import { RestaurantListCard } from '../components/common/RestaurantListCard';
import { PAGE_BOTTOM_PADDING, PAGE_TOP_PADDING } from '../components/Screen';
import type { HomeStackParamList } from '../navigation/types';
import { theme } from '../theme';

type CategoryScreenProps = {
  navigation: NavigationProp<ParamListBase>;
  route: RouteProp<HomeStackParamList, 'Category'>;
};

const monumentSpots = [
  {
    id: 'prizren-bridge',
    type: 'monument',
    title: 'Stone Bridge',
    titleSq: 'Ura e Gurit',
    location: 'Prizren',
    locationSq: 'Prizren',
    image: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/PrizrenStoneBridge.jpg',
    coordinate: { latitude: 42.20965, longitude: 20.74034 },
    photoCredit: 'Wikimedia Commons',
    detail:
      'Built during the Ottoman period and rebuilt after the 1979 flood, the Stone Bridge is one of Prizren city symbols. For locals it is more than a crossing: it is the meeting point between the old bazaar, the river, and everyday city memory.',
    detailSq:
      'E ndertuar ne periudhen osmane dhe e rindertuar pas vershimit te vitit 1979, Ura e Gurit eshte nje nga simbolet e Prizrenit. Per vendasit eshte me shume se nje kalim: eshte pika ku takohen pazari i vjeter, lumi dhe kujtesa e perditshme e qytetit.',
  },
  {
    id: 'prizren-fortress',
    type: 'monument',
    title: 'Prizren Fortress',
    titleSq: 'Kalaja e Prizrenit',
    location: 'Prizren',
    locationSq: 'Prizren',
    image: 'https://upload.wikimedia.org/wikipedia/commons/2/29/The_Prizren_Fortress_09.jpg',
    coordinate: { latitude: 42.2069, longitude: 20.7465 },
    photoCredit: 'Wikimedia Commons',
    detail:
      'Kalaja rises above Prizren on layers of medieval and Ottoman history. Locals value it as the city balcony: a proud viewpoint where the whole old town, mosques, churches, rooftops, and Sharr mountains come into one frame.',
    detailSq:
      'Kalaja ngrihet mbi Prizren mbi shtresa historie mesjetare dhe osmane. Vendasit e shohin si ballkonin e qytetit: nje pike krenare ku qyteti i vjeter, xhamite, kishat, kulmet dhe malet e Sharrit duken ne nje pamje.',
  },
  {
    id: 'league-prizren',
    type: 'monument',
    title: 'League of Prizren',
    titleSq: 'Lidhja e Prizrenit',
    location: 'Prizren',
    locationSq: 'Prizren',
    image: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/2011_Prizren%2C_Budynek_Ligi_Prizre%C5%84skiej_01.jpg',
    coordinate: { latitude: 42.211467, longitude: 20.743825 },
    photoCredit: 'Wikimedia Commons',
    detail:
      'This memorial complex marks the Albanian League of Prizren, founded in 1878. To many locals it represents political awakening, cultural identity, and the long effort to protect Albanian lands, language, and self-rule.',
    detailSq:
      'Ky kompleks memorial lidhet me Lidhjen Shqiptare te Prizrenit, te themeluar ne vitin 1878. Per shume vendas perfaqeson zgjimin politik, identitetin kulturor dhe perpjekjen e gjate per te mbrojtur trojet, gjuhen dhe veteqeverisjen shqiptare.',
  },
  {
    id: 'newborn',
    type: 'monument',
    title: 'Newborn Monument',
    titleSq: 'Monumenti Newborn',
    location: 'Prishtina',
    locationSq: 'Prishtine',
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Kosovo_Feb_2020_22_04_58_224000.jpeg',
    coordinate: { latitude: 42.6607, longitude: 21.1583 },
    photoCredit: 'Wikimedia Commons',
    detail:
      'Unveiled on 17 February 2008, Newborn celebrates Kosovo declaration of independence. Its repainting over the years keeps it alive for locals as a public message board of pride, protest, remembrance, and hope.',
    detailSq:
      'I zbuluar me 17 shkurt 2008, Newborn shenon shpalljen e pavaresise se Kosoves. Ngjyrosjet e tij nder vite e mbajne te gjalle per vendasit si nje hapesire publike krenarie, proteste, kujtese dhe shprese.',
  },
  {
    id: 'national-library',
    type: 'monument',
    title: 'National Library',
    titleSq: 'Biblioteka Kombetare',
    location: 'Prishtina',
    locationSq: 'Prishtine',
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/42/National_Library_of_Kosovo.jpg',
    coordinate: { latitude: 42.6575, longitude: 21.162297 },
    photoCredit: 'Wikimedia Commons',
    detail:
      'The National Library of Kosovo is one of Prishtina most recognizable buildings, known for its domes and metal lattice skin. Locals often see it as bold, unusual, and unmistakably theirs: a landmark of learning and debate.',
    detailSq:
      'Biblioteka Kombetare e Kosoves eshte nje nga ndertesat me te dallueshme te Prishtines, e njohur per kupolat dhe rrjeten metalike. Vendasit shpesh e shohin si te guximshme, te vecante dhe krejtesisht te tyren: nje shenje e dijes dhe debatit.',
  },
  {
    id: 'ulpiana',
    type: 'monument',
    title: 'Ulpiana',
    titleSq: 'Ulpiana',
    location: 'Near Gracanica',
    locationSq: 'Afer Gracanices',
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Ulpiana_%28lokaliteti_arkeologjik%29_nga_ajri.jpg',
    coordinate: { latitude: 42.596892, longitude: 21.174387 },
    photoCredit: 'Wikimedia Commons',
    detail:
      'Ulpiana was an important Roman and early Byzantine city in ancient Dardania. For locals it connects modern Kosovo with a much older story, showing that the land has held roads, trade, faith, and urban life for centuries.',
    detailSq:
      'Ulpiana ishte qytet i rendesishem romak dhe i hershem bizantin ne Dardanine antike. Per vendasit e lidh Kosoven moderne me nje histori shume me te vjeter, duke treguar se kjo toke ka pasur rruge, tregti, besim dhe jete urbane per shekuj.',
  },
  {
    id: 'gadime-cave',
    type: 'nature',
    title: 'Gadime Cave',
    titleSq: 'Shpella e Gadimes',
    location: 'Lipjan',
    locationSq: 'Lipjan',
    image: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Crystals_from_inside_the_Marble_Cave_in_Kosovo_13.JPG',
    coordinate: { latitude: 42.47809, longitude: 21.20757 },
    photoCredit: 'Wikimedia Commons',
    detail:
      'Gadime Cave feels hidden and crystalline, with marble passages, mineral shapes, and cool underground light. Its beauty is quiet and otherworldly, a place where Kosovo landscape turns from mountain air into stone, shimmer, and silence.',
    detailSq:
      'Shpella e Gadimes ndihet e fshehur dhe kristalore, me korridore mermeri, forma minerale dhe drite te ftohte nentokesore. Bukuria e saj eshte e qete dhe e pazakonte, aty ku peizazhi i Kosoves kthehet ne gur, shkelqim dhe heshtje.',
  },
  {
    id: 'rugova',
    type: 'nature',
    title: 'Rugova Canyon',
    titleSq: 'Gryka e Rugoves',
    location: 'Peja',
    locationSq: 'Peje',
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Rugova_Canyon_Kosovo.jpg',
    coordinate: { latitude: 42.692222, longitude: 20.168611 },
    photoCredit: 'Wikimedia Commons',
    detail:
      'Rugova Canyon is dramatic Kosovo nature at full volume: steep limestone walls, mountain roads, cold water, and clean alpine air. The beauty is in the scale, where every turn feels carved by time.',
    detailSq:
      'Gryka e Rugoves eshte natyre dramatike e Kosoves ne forme te plote: mure te thepisura gelqerore, rruge malore, uje i ftohte dhe ajer i paster alpin. Bukuria qendron te madhesia, ku cdo kthese duket e gdhendur nga koha.',
  },
  {
    id: 'mirusha',
    type: 'nature',
    title: 'Mirusha Waterfalls',
    titleSq: 'Ujevarat e Mirushes',
    location: 'Kline / Malisheve',
    locationSq: 'Kline / Malisheve',
    image: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Waterfall_Mirusha.jpg',
    coordinate: { latitude: 42.523889, longitude: 20.583056 },
    photoCredit: 'Wikimedia Commons',
    detail:
      'Mirusha is a chain of waterfalls, pools, and pale rock walls. Its beauty is fresh and cinematic: green water, sunlit cliffs, narrow paths, and the sound of falls echoing through the canyon.',
    detailSq:
      'Mirusha eshte nje varg ujevaresh, pishinash natyrore dhe shkembinjsh te hapur. Bukuria e saj eshte e fresket dhe filmike: uje i gjelber, shkembinj me diell, shtigje te ngushta dhe zhurma e ujit qe jehon ne gryke.',
  },
  {
    id: 'white-drin',
    type: 'nature',
    title: 'White Drin Waterfall',
    titleSq: 'Ujevara e Drinit te Bardhe',
    location: 'Peje',
    locationSq: 'Peje',
    image: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/White_Drin_Waterfall_in_June.jpg',
    coordinate: { latitude: 42.738056, longitude: 20.305833 },
    photoCredit: 'Wikimedia Commons',
    detail:
      'The White Drin Waterfall near Radavc is bright, cold, and green around the edges. Its beauty comes from the rush of white water, forest shade, and the way the river seems to appear from stone.',
    detailSq:
      'Ujevara e Drinit te Bardhe prane Radavcit eshte e ndritshme, e ftohte dhe e rrethuar me gjelberim. Bukuria e saj vjen nga vrulli i ujit te bardhe, hija e pyllit dhe menyra si lumi duket sikur del nga guri.',
  },
  {
    id: 'germia',
    type: 'nature',
    title: 'Germia Park',
    titleSq: 'Parku i Germise',
    location: 'Prishtina',
    locationSq: 'Prishtine',
    image: 'https://upload.wikimedia.org/wikipedia/commons/c/c0/Germia_Park_during_Spring_Season_in_Prishtina%2C_Kosovo.jpg',
    coordinate: { latitude: 42.66887, longitude: 21.15345 },
    photoCredit: 'Wikimedia Commons',
    detail:
      'Germia is Prishtina green escape, with wooded trails, rolling paths, and soft seasonal colors. Its beauty is close and easy: fresh air, quiet trees, and a reset just outside the busy city.',
    detailSq:
      'Germia eshte arratisja e gjelber e Prishtines, me shtigje pyjore, rruge te buta dhe ngjyra te qeta sezonale. Bukuria e saj eshte afer dhe e lehte: ajer i fresket, peme te qeta dhe pushim pak jashte qytetit.',
  },
  {
    id: 'sharr',
    type: 'nature',
    title: 'Sharr Mountains',
    titleSq: 'Malet e Sharrit',
    location: 'South Kosovo',
    locationSq: 'Jugu i Kosoves',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80',
    coordinate: { latitude: 42.1744, longitude: 20.9614 },
    photoCredit: 'Wikimedia Commons',
    detail:
      'The Sharr Mountains stretch across southern Kosovo with high pastures, ridgelines, and wide-open sky. Their beauty is pastoral and powerful, mixing snow, grass, villages, and long mountain horizons.',
    detailSq:
      'Malet e Sharrit shtrihen ne jug te Kosoves me kullosa te larta, kreshta dhe qiell te hapur. Bukuria e tyre eshte baritore dhe e fuqishme, me bore, bar, fshatra dhe horizonte te gjata malore.',
  },
];

const storyReviews = [
  {
    id: 'rev-1',
    author: 'Peter Comments',
    summary: 'Absolutely fire. Best traditional pasta spot after sunset.',
  },
  {
    id: 'rev-2',
    author: 'Soulmaal Review',
    summary: 'The late-night energy and plating both feel editorial and alive.',
  },
];

export function CategoryScreen({ navigation, route }: CategoryScreenProps) {
  const insets = useSafeAreaInsets();
  const { language } = useI18n();
  const copy = nativeCopy[language].category;
  const { category } = route.params;
  const { searchQuery, setSearchQuery } = useDiscovery();
  const { restaurants: catalogRestaurants, loading: restaurantsLoading, error: restaurantsError } = useRestaurantCatalog();
  const [selectedFilter, setSelectedFilter] = useState(copy.filters[0]);
  const [expandedSpotId, setExpandedSpotId] = useState<string | null>(monumentSpots[0].id);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraTargetSpot, setCameraTargetSpot] = useState<(typeof monumentSpots)[number] | null>(null);
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const [cameraAnalysisSpot, setCameraAnalysisSpot] = useState<(typeof monumentSpots)[number] | null>(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [showCameraHint, setShowCameraHint] = useState(false);
  const cameraHintAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setSelectedFilter(copy.filters[0]);
  }, [copy.filters]);

  useEffect(() => {
    if (category !== 'Culture') {
      return;
    }

    setShowCameraHint(true);
    const timer = setTimeout(() => setShowCameraHint(false), 3000);
    return () => clearTimeout(timer);
  }, [category]);

  useEffect(() => {
    Animated.timing(cameraHintAnim, {
      toValue: showCameraHint ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [cameraHintAnim, showCameraHint]);

  const visibleRestaurants = useMemo(() => {
    const selectedFilterValue = selectedFilter.toLowerCase();
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return catalogRestaurants
      .filter((restaurant) => {
        const searchBlob = [restaurant.name, restaurant.cuisine ?? '', restaurant.city, restaurant.description ?? '']
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (normalizedQuery && !searchBlob.includes(normalizedQuery)) {
          return false;
        }

        if (selectedFilterValue === 'all') {
          return true;
        }

        const cuisineText = (restaurant.cuisine ?? '').toLowerCase();

        if (selectedFilterValue === 'traditional') {
          return /traditional|kosovo|grill|mezze|mediterranean|steakhouse/.test(cuisineText);
        }

        if (selectedFilterValue === 'cafe') {
          return /cafe|breakfast|bakery|dessert|coffee/.test(cuisineText);
        }

        if (selectedFilterValue === 'street food') {
          return /street|burger|pizza|taco|sushi|grill/.test(cuisineText);
        }

        if (selectedFilterValue === 'fine dining') {
          return /fine|european|bistro|steakhouse|restaurant/.test(cuisineText);
        }

        return cuisineText.includes(selectedFilterValue);
      })
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [catalogRestaurants, searchQuery, selectedFilter]);

  const cultureLabels = {
    monument: language === 'sq' ? 'Monument' : 'Monument',
    nature: language === 'sq' ? 'Natyre' : 'Nature',
    directions: language === 'sq' ? 'Hap udhezimet' : 'Open directions',
    photo: language === 'sq' ? 'Foto' : 'Photo',
    open: language === 'sq' ? 'hap detajet' : 'open details',
    close: language === 'sq' ? 'mbyll detajet' : 'collapse details',
    camera: language === 'sq' ? 'Kamera AI' : 'AI Camera',
    scan: language === 'sq' ? 'Skano me kamere' : 'Scan with camera',
    analyzing: language === 'sq' ? 'Duke analizuar foton...' : 'Analyzing photo...',
    analysisTitle: language === 'sq' ? 'Perputhja e mundshme' : 'Likely match',
    permission: language === 'sq' ? 'Lejo kameren per te skanuar monumentet.' : 'Allow camera access to scan monuments.',
    openCamera: language === 'sq' ? 'Hap kameren' : 'Open camera',
    retake: language === 'sq' ? 'Bej foto tjeter' : 'Retake',
  };

  const getSpotCopy = (spot: (typeof monumentSpots)[number]) => ({
    title: language === 'sq' ? spot.titleSq : spot.title,
    location: language === 'sq' ? spot.locationSq : spot.location,
    detail: language === 'sq' ? spot.detailSq : spot.detail,
  });

  const openSpotDirections = (event: GestureResponderEvent, spot: (typeof monumentSpots)[number]) => {
    event.stopPropagation();
    void openDirectionsToPlace({ label: getSpotCopy(spot).title, coordinate: spot.coordinate });
  };

  const openCameraAnalyzer = async (spot?: (typeof monumentSpots)[number]) => {
    setShowCameraHint(false);
    setCameraTargetSpot(spot ?? monumentSpots.find((item) => item.id === expandedSpotId) ?? monumentSpots[0]);
    setCapturedPhotoUri(null);
    setCameraAnalysisSpot(null);
    setIsAnalyzingPhoto(false);

    if (!cameraPermission?.granted) {
      await requestCameraPermission();
    }

    setIsCameraOpen(true);
  };

  const closeCameraAnalyzer = () => {
    setIsCameraOpen(false);
    setCapturedPhotoUri(null);
    setCameraAnalysisSpot(null);
    setIsAnalyzingPhoto(false);
  };

  const takeAnalyzerPhoto = async () => {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.7 });

    if (!photo?.uri) {
      return;
    }

    setCapturedPhotoUri(photo.uri);
    setIsAnalyzingPhoto(true);

    const matchedSpot = cameraTargetSpot ?? monumentSpots[0];
    setTimeout(() => {
      setCameraAnalysisSpot(matchedSpot);
      setExpandedSpotId(matchedSpot.id);
      setIsAnalyzingPhoto(false);
    }, 900);
  };

  if (category === 'Culture') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.monumentsContent}>
          <View style={styles.centerHeader}>
            <Text style={styles.monumentsTitle}>{copy.cultureTitle}</Text>
            <Text style={styles.monumentsSubtitle}>{copy.cultureSubtitle}</Text>
          </View>

          <View style={styles.monumentsGrid}>
            {monumentSpots.map((spot) => {
              const expanded = expandedSpotId === spot.id;
              const isMonument = spot.type === 'monument';
              const localizedSpot = getSpotCopy(spot);

              return (
                <Pressable
                  key={spot.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${localizedSpot.title}, ${expanded ? cultureLabels.close : cultureLabels.open}`}
                  onPress={() => setExpandedSpotId(expanded ? null : spot.id)}
                  style={[styles.monumentCard, expanded && styles.monumentCardExpanded]}>
                  <ImageBackground
                    source={{ uri: spot.image }}
                    style={[styles.monumentImage, expanded && styles.monumentImageExpanded]}>
                    <LinearGradient
                      colors={['rgba(13,13,26,0.02)', 'rgba(13,13,26,0.88)']}
                      style={styles.monumentOverlay}>
                      <View style={styles.monumentTopRow}>
                        <View style={[styles.monumentTypePill, isMonument ? styles.historyPill : styles.naturePill]}>
                          <Ionicons
                            name={isMonument ? 'business-outline' : 'leaf-outline'}
                            size={13}
                            color={theme.colors.surface}
                          />
                          <Text style={styles.monumentTypeText}>
                            {isMonument ? cultureLabels.monument : cultureLabels.nature}
                          </Text>
                        </View>
                        <Pressable
                          accessibilityLabel={`${cultureLabels.directions}: ${localizedSpot.title}`}
                          style={styles.monumentExpandButton}
                          onPress={(event) => openSpotDirections(event, spot)}>
                          <Ionicons
                            name="navigate-outline"
                            size={16}
                            color={theme.colors.secondary}
                          />
                        </Pressable>
                      </View>
                      <View>
                        <Text style={styles.monumentName}>{localizedSpot.title}</Text>
                        <View style={styles.monumentLocationRow}>
                          <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.7)" />
                          <Text style={styles.monumentLocation}>{localizedSpot.location}</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </ImageBackground>

                  {expanded ? (
                    <View style={styles.monumentDetailPanel}>
                      <Text style={styles.monumentDetail}>{localizedSpot.detail}</Text>
                      <Pressable
                        style={styles.directionsButton}
                        onPress={(event) => openSpotDirections(event, spot)}>
                        <Ionicons name="map-outline" size={17} color={theme.colors.surface} />
                        <Text style={styles.directionsLabel}>{cultureLabels.directions}</Text>
                      </Pressable>
                      <Pressable
                        style={styles.scanButton}
                        onPress={(event) => {
                          event.stopPropagation();
                          void openCameraAnalyzer(spot);
                        }}>
                        <Ionicons name="camera-outline" size={17} color={theme.colors.surface} />
                        <Text style={styles.directionsLabel}>{cultureLabels.scan}</Text>
                      </Pressable>
                      <Text style={styles.monumentPhotoCredit}>
                        {cultureLabels.photo}: {spot.photoCredit}
                      </Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <Pressable style={styles.assistantLauncher} onPress={() => void openCameraAnalyzer()}>
          <Animated.View
            pointerEvents={showCameraHint ? 'auto' : 'none'}
            style={[
              styles.assistantPrompt,
              {
                opacity: cameraHintAnim,
                transform: [
                  {
                    translateY: cameraHintAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [10, 0],
                    }),
                  },
                  {
                    scale: cameraHintAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.94, 1],
                    }),
                  },
                ],
              },
            ]}>
            <Text style={styles.assistantPromptText}>{cultureLabels.scan}</Text>
          </Animated.View>
          <View style={styles.assistantOrb}>
            <Ionicons name="camera-outline" size={24} color={theme.colors.surface} />
          </View>
        </Pressable>

        <Modal
          visible={isCameraOpen}
          animationType="slide"
          statusBarTranslucent
          onRequestClose={closeCameraAnalyzer}>
          <SafeAreaView style={styles.cameraScreen} edges={['left', 'right', 'bottom']}>
            <View style={[styles.cameraTopBar, { paddingTop: insets.top + theme.spacing.lg }]}>
              <Pressable style={styles.cameraCloseButton} onPress={closeCameraAnalyzer}>
                <Ionicons name="close" size={24} color={theme.colors.surface} />
              </Pressable>
              <Text style={styles.cameraTitle}>{cultureLabels.camera}</Text>
              <View style={styles.cameraSpacer} />
            </View>

            {cameraPermission?.granted ? (
              capturedPhotoUri ? (
                <View style={styles.analysisWrap}>
                  <Image source={{ uri: capturedPhotoUri }} style={styles.capturedImage} />
                  <View style={styles.analysisPanel}>
                    {isAnalyzingPhoto ? (
                      <View style={styles.analyzingRow}>
                        <ActivityIndicator color={theme.colors.secondary} />
                        <Text style={styles.analysisText}>{cultureLabels.analyzing}</Text>
                      </View>
                    ) : cameraAnalysisSpot ? (
                      <>
                        <Text style={styles.analysisEyebrow}>{cultureLabels.analysisTitle}</Text>
                        <Text style={styles.analysisName}>{getSpotCopy(cameraAnalysisSpot).title}</Text>
                        <Text style={styles.analysisText}>{getSpotCopy(cameraAnalysisSpot).detail}</Text>
                      </>
                    ) : null}
                    <Pressable
                      style={styles.captureButton}
                      onPress={() => {
                        setCapturedPhotoUri(null);
                        setCameraAnalysisSpot(null);
                      }}>
                      <Ionicons name="camera-reverse-outline" size={20} color={theme.colors.surface} />
                      <Text style={styles.captureText}>{cultureLabels.retake}</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View style={styles.cameraPreviewWrap}>
                  <CameraView ref={cameraRef} style={styles.cameraPreview} facing="back" />
                  <View style={styles.cameraBottomBar}>
                    <Pressable style={styles.shutterButton} onPress={takeAnalyzerPhoto}>
                      <View style={styles.shutterInner} />
                    </Pressable>
                  </View>
                </View>
              )
            ) : (
              <View style={styles.permissionPanel}>
                <Ionicons name="camera-outline" size={42} color={theme.colors.secondary} />
                <Text style={styles.permissionText}>{cultureLabels.permission}</Text>
                <Pressable style={styles.captureButton} onPress={() => void requestCameraPermission()}>
                  <Text style={styles.captureText}>{cultureLabels.openCamera}</Text>
                </Pressable>
              </View>
            )}
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.restaurantsContent}>
        <View style={styles.restaurantHero}>
          <Text style={styles.restaurantHeroTitle}>{copy.restaurantTitle}</Text>
          <Text style={styles.restaurantHeroSubtitle}>
            {copy.restaurantSubtitle}
          </Text>
        </View>

        <View style={styles.neonSearchWrap}>
          <LinearGradient colors={['#FF1F3D', '#C8102E']} style={styles.neonOuter}>
            <View style={styles.neonInner}>
              <Ionicons name="search-outline" size={24} color={theme.colors.surface} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={copy.searchPlaceholder}
                placeholderTextColor="rgba(255,255,255,0.5)"
                style={styles.searchInput}
              />
            </View>
          </LinearGradient>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {copy.filters.map((filter) => {
            const active = selectedFilter === filter;
            return (
              <Pressable key={filter} onPress={() => setSelectedFilter(filter)} style={styles.filterChip}>
                {active ? (
                  <LinearGradient colors={theme.gradients.primary} style={styles.filterChipActive}>
                    <Text style={styles.filterLabelActive}>{filter}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.filterChipInactive}>
                    <Text style={styles.filterLabel}>{filter}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionHeading}>Nearby Vibes</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardRow}>
          {nearbyVibesRestaurants.map((restaurant) => (
            <RestaurantShowcaseCard
              key={restaurant.id}
              restaurant={restaurant}
              onPress={() => navigation.navigate('RestaurantDetails', { restaurantId: restaurant.id })}
            />
          ))}
        </ScrollView>

        <View style={styles.sectionHeadingRow}>
          <Text style={styles.sectionHeading}>{copy.restaurants}</Text>
          <Text style={styles.sectionCount}>
            {restaurantsLoading ? 'Loading...' : `${visibleRestaurants.length} places`}
          </Text>
        </View>
        {restaurantsError ? <Text style={styles.errorText}>{restaurantsError}</Text> : null}
        <View style={styles.restaurantList}>
          {visibleRestaurants.map((restaurant) => (
            <RestaurantListCard
              key={restaurant.id}
              restaurant={restaurant}
              onPress={() => navigation.navigate('RestaurantDetails', { restaurantId: restaurant.id })}
            />
          ))}
        </View>

        <View style={styles.reviewPanel}>
          <View style={styles.ratingSummary}>
            <View style={styles.ratingBadge}>
              <Ionicons name="person" size={16} color={theme.colors.surface} />
            </View>
            <View style={styles.starsRow}>
              {Array.from({ length: 3 }).map((_, index) => (
                <Ionicons key={`summary-${index}`} name="star" size={18} color={theme.colors.secondary} />
              ))}
            </View>
          </View>

          {storyReviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <Text style={styles.reviewTitle}>{review.author}</Text>
              <Text style={styles.reviewText}>{review.summary}</Text>
            </View>
          ))}

          <Text style={styles.communityHeading}>{copy.communityReviews}</Text>
          <View style={styles.avatarRow}>
            {['A', 'M', 'R', 'D', 'L'].map((label, index) => (
              <View key={label} style={[styles.avatarRing, index % 2 === 0 ? styles.avatarRed : styles.avatarGold]}>
                <Text style={styles.avatarText}>{label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#05060D',
  },
  restaurantsContent: {
    paddingHorizontal: 24,
    paddingTop: PAGE_TOP_PADDING,
    paddingBottom: PAGE_BOTTOM_PADDING,
  },
  restaurantHero: {
    marginTop: 8,
  },
  restaurantHeroTitle: {
    color: theme.colors.heading,
    fontSize: 42,
    lineHeight: 40,
    fontWeight: '900',
    letterSpacing: -1.6,
    maxWidth: 280,
  },
  restaurantHeroSubtitle: {
    marginTop: 12,
    color: theme.colors.mutedText,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 320,
  },
  neonSearchWrap: {
    marginTop: 28,
  },
  neonOuter: {
    borderRadius: 999,
    padding: 2,
    shadowColor: '#FF1F3D',
    shadowOpacity: 0.9,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  neonInner: {
    minHeight: 62,
    borderRadius: 999,
    backgroundColor: '#08080E',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.heading,
    fontSize: 16,
  },
  filterRow: {
    gap: 12,
    paddingVertical: 24,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,31,61,0.38)',
    overflow: 'hidden',
  },
  filterChipActive: {
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  filterChipInactive: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  filterLabel: {
    color: theme.colors.mutedText,
    fontWeight: '700',
  },
  filterLabelActive: {
    color: theme.colors.surface,
    fontWeight: '800',
  },
  sectionHeading: {
    color: theme.colors.heading,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 16,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  sectionCount: {
    color: theme.colors.mutedText,
    fontSize: 13,
    fontWeight: '700',
    paddingBottom: 4,
  },
  errorText: {
    marginBottom: 12,
    color: '#FFB3B3',
    fontSize: 13,
    fontWeight: '600',
  },
  cardRow: {
    gap: 14,
    paddingRight: 24,
  },
  restaurantList: {
    gap: 12,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
  },
  reviewPanel: {
    marginTop: 26,
    padding: 18,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,31,61,0.34)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewCard: {
    marginTop: 18,
  },
  reviewTitle: {
    color: theme.colors.heading,
    fontSize: 18,
    fontWeight: '800',
  },
  reviewText: {
    marginTop: 6,
    color: theme.colors.mutedText,
    fontSize: 15,
    lineHeight: 24,
  },
  communityHeading: {
    marginTop: 24,
    color: theme.colors.heading,
    fontSize: 18,
    fontWeight: '900',
  },
  avatarRow: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
  },
  avatarRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  avatarRed: {
    borderColor: '#FF1F3D',
    backgroundColor: 'rgba(255,31,61,0.14)',
  },
  avatarGold: {
    borderColor: '#FFB300',
    backgroundColor: 'rgba(255,179,0,0.14)',
  },
  avatarText: {
    color: theme.colors.heading,
    fontWeight: '900',
  },
  monumentsContent: {
    paddingHorizontal: 20,
    paddingTop: PAGE_TOP_PADDING,
    paddingBottom: PAGE_BOTTOM_PADDING,
  },
  centerHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  monumentsTitle: {
    color: theme.colors.heading,
    fontSize: 44,
    lineHeight: 48,
    fontWeight: '900',
    textAlign: 'center',
  },
  assistantLauncher: {
    position: 'absolute',
    right: 18,
    bottom: Math.max(PAGE_BOTTOM_PADDING + 6, 104),
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 4,
  },
  assistantPrompt: {
    maxWidth: 170,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(93,167,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(93,167,255,0.34)',
  },
  assistantPromptText: {
    color: theme.colors.surface,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    textAlign: 'right',
  },
  assistantOrb: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5DA7FF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    ...theme.shadow.floating,
  },
  monumentsSubtitle: {
    marginTop: 8,
    color: '#D6A45E',
    fontSize: 18,
    fontWeight: '500',
  },
  monumentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  monumentCard: {
    width: '47%',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,179,0,0.24)',
    backgroundColor: '#0C0F1A',
  },
  monumentCardExpanded: {
    width: '100%',
    borderColor: 'rgba(66,217,140,0.34)',
  },
  monumentImage: {
    height: 210,
  },
  monumentImageExpanded: {
    height: 250,
  },
  monumentOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 14,
  },
  monumentTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  monumentTypePill: {
    minHeight: 30,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  historyPill: {
    backgroundColor: 'rgba(255,179,0,0.25)',
  },
  naturePill: {
    backgroundColor: 'rgba(66,217,140,0.2)',
  },
  monumentTypeText: {
    color: theme.colors.surface,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  monumentExpandButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,179,0,0.35)',
    backgroundColor: 'rgba(13,13,26,0.38)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monumentName: {
    color: '#F3C273',
    fontSize: 18,
    fontWeight: '800',
  },
  monumentLocationRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  monumentLocation: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '700',
  },
  monumentDetailPanel: {
    padding: 16,
    gap: 12,
  },
  monumentDetail: {
    color: theme.colors.mutedText,
    fontSize: 15,
    lineHeight: 23,
  },
  monumentPhotoCredit: {
    color: 'rgba(255,255,255,0.42)',
    fontSize: 11,
    fontWeight: '700',
  },
  directionsButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,31,61,0.86)',
  },
  scanButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(93,167,255,0.84)',
  },
  directionsLabel: {
    color: theme.colors.surface,
    fontSize: 13,
    fontWeight: '900',
  },
  cameraScreen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  cameraTopBar: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  cameraCloseButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraTitle: {
    color: theme.colors.heading,
    fontSize: 18,
    fontWeight: '900',
  },
  cameraSpacer: {
    width: 48,
  },
  cameraPreviewWrap: {
    flex: 1,
  },
  cameraPreview: {
    flex: 1,
  },
  cameraBottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 34,
    alignItems: 'center',
  },
  shutterButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  shutterInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: theme.colors.surface,
  },
  analysisWrap: {
    flex: 1,
  },
  capturedImage: {
    height: 330,
    width: '100%',
    backgroundColor: '#10131F',
  },
  analysisPanel: {
    margin: 18,
    padding: 18,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 12,
  },
  analyzingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  analysisEyebrow: {
    color: theme.colors.secondary,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  analysisName: {
    color: theme.colors.heading,
    fontSize: 24,
    fontWeight: '900',
  },
  analysisText: {
    color: theme.colors.mutedText,
    fontSize: 15,
    lineHeight: 23,
  },
  captureButton: {
    minHeight: 50,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
  captureText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: '900',
  },
  permissionPanel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 18,
  },
  permissionText: {
    color: theme.colors.mutedText,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
});
