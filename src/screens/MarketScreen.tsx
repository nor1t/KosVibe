import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { PAGE_BOTTOM_PADDING, PAGE_TOP_PADDING } from '../components/Screen';
import { useI18n } from '../i18n/I18nProvider';
import { theme } from '../theme';

type MarketCategoryKey = 'food' | 'craft' | 'clothing';

const marketCopy = {
  en: {
    eyebrow: 'Village Market Guide',
    title: 'Find the local things tourists actually want to take home.',
    subtitle:
      'FROM OUR LAND TO YOUR HAND',
    categories: [
      { key: 'food' as const, label: 'Food & Drink' },
      { key: 'craft' as const, label: 'Items & Instruments' },
      { key: 'clothing' as const, label: 'Traditional Clothes' },
    ],
    marketSpots: [
      {
        title: 'Rahovec Wine Route',
        subtitle: 'Cellars, grape products, village hospitality, and Kosovo wine culture.',
        tone: '#FFB300',
      },
      {
        title: 'Rugova Farm Stays',
        subtitle: 'Mountain food, dairy products, herbal goods, and handmade home items.',
        tone: '#42D98C',
      },
      {
        title: 'Gjakova Old Bazaar',
        subtitle: 'Traditional craft, copper details, textiles, and strong cultural atmosphere.',
        tone: '#5DA7FF',
      },
    ],
    sellersTitle: 'Local sellers to check',
    sellerCategories: {
      food: {
        title: 'Traditional food and drink',
        subtitle: 'Family producers known for wine, rakia, preserves, dairy, and village pantry staples.',
      },
      craft: {
        title: 'Traditional items and instruments',
        subtitle: 'Craft families making woodwork, shepherd tools, lahuta-style instruments, and home objects.',
      },
      clothing: {
        title: 'Traditional clothing',
        subtitle: 'Households and ateliers with woven aprons, plis caps, embroidered vests, and ceremonial dress details.',
      },
    },
    sellers: {
      food: [
        {
          family: 'Krasniqi Family Cellar',
          address: 'Hoqe e Vogel, Rahovec',
          phone: '+383 49 210 415',
          image:
            'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?auto=format&fit=crop&w=900&q=80',
          description:
            'Small family cellar with local red wine, white wine, and grape rakia poured and explained on site.',
        },
        {
          family: 'Bytyqi Dairy House',
          address: 'Drelaj, Rugove, Peje',
          phone: '+383 44 672 188',
          image:
            'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?auto=format&fit=crop&w=900&q=80',
          description:
            'Mountain household selling village cheese, yogurt, preserved butter, and seasonal herbal tea bundles.',
        },
        {
          family: 'Berisha Pantry Table',
          address: 'Krushe e Madhe, Rahovec',
          phone: '+383 45 811 264',
          image:
            'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=900&q=80',
          description:
            'Known for ajvar, fruit preserves, forest honey, and homemade juices prepared with family recipes.',
        },
      ],
      craft: [
        {
          family: 'Gashi Wood & Lahuta Workshop',
          address: 'Junik Center, Junik',
          phone: '+383 49 520 733',
          image: 'https://images.unsplash.com/photo-1462965326201-d02e4f455804?auto=format&fit=crop&w=900&q=80',
          description:
            'A family workshop producing carved wooden trays, shepherd items, and string instruments inspired by local tradition.',
        },
        {
          family: 'Hoxha Copper Corner',
          address: 'Gjakova Old Bazaar, Gjakove',
          phone: '+383 44 398 551',
          image:
            'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=900&q=80',
          description:
            'Hand-finished copper coffee sets, serving pieces, and practical home objects rooted in old bazaar craft.',
        },
        {
          family: 'Rama Heritage Tools',
          address: 'Isniq, Decan',
          phone: '+383 48 703 992',
          image:
            'https://images.unsplash.com/photo-1494883759339-0b042927eb37?auto=format&fit=crop&w=900&q=80',
          description:
            'Rural maker focused on handmade spoons, loom parts, and useful small tools that reflect village life.',
        },
      ],
      clothing: [
        {
          family: 'Luma Weaving Room',
          address: 'Prizren outskirts, Prizren',
          phone: '+383 49 340 226',
          image:
            'https://images.unsplash.com/photo-1601430039674-6e905f056082?auto=format&fit=crop&w=900&q=80',
          description:
            'Traditional aprons, woven belts, and embroidered textile pieces made in a small family weaving space.',
        },
        {
          family: 'Shala Costume House',
          address: 'Peje Old Town, Peje',
          phone: '+383 45 916 448',
          image:
            'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&w=900&q=80',
          description:
            'Local family preserving ceremonial clothing details, plis caps, and stitched vest pieces for visitors and events.',
        },
        {
          family: 'Mustafa Needle Studio',
          address: 'Gjakova artisan quarter, Gjakove',
          phone: '+383 44 280 519',
          image:
            'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=900&q=80',
          description:
            'Traditional clothing accents, hand embroidery, and custom-made pieces based on regional Albanian dress motifs.',
        },
      ],
    },
    collections: [
      {
        icon: 'wine-outline' as const,
        title: 'Wine & Rakia',
        text: 'Village cellars, grape harvest products, and small-batch bottles with a local story.',
      },
      {
        icon: 'restaurant-outline' as const,
        title: 'Traditional Foods',
        text: 'Cheese, honey, ajvar, mountain tea, dried fruit, preserves, and handmade pastries.',
      },
      {
        icon: 'leaf-outline' as const,
        title: 'Agro Culture',
        text: 'Farm visits, orchard routes, village lunches, seasonal produce, and countryside rituals.',
      },
      {
        icon: 'cube-outline' as const,
        title: 'Objects & Craft',
        text: 'Woodwork, woven fabric, kitchen tools, table pieces, and useful handmade goods.',
      },
    ],
  },
  sq: {
    eyebrow: 'Udhezues per Tregun Rural',
    title: 'Gjej gjerat lokale qe turistet duan vertet t i marrin me vete.',
    subtitle:
      'Nje faqe e kuruar per tregjet rurale ku mund te zbulosh vere, raki, objekte artizanale, ushqime tradicionale dhe pervoja autentike neper Kosove.',
    categories: [
      { key: 'food' as const, label: 'Ushqim & Pije' },
      { key: 'craft' as const, label: 'Objekte & Instrumente' },
      { key: 'clothing' as const, label: 'Veshje Tradicionale' },
    ],
    marketSpots: [
      {
        title: 'Rruga e Veres ne Rahovec',
        subtitle: 'Kantina, produkte rrushi, mikpritje fshati dhe kulture e veres se Kosoves.',
        tone: '#FFB300',
      },
      {
        title: 'Bujtinat e Rugoves',
        subtitle: 'Ushqim mali, produkte bulmeti, bime sheruese dhe sende te punuara me dore.',
        tone: '#42D98C',
      },
      {
        title: 'Carshia e Madhe ne Gjakove',
        subtitle: 'Artizanat tradicional, pune bakri, tekstile dhe atmosfere kulturore e forte.',
        tone: '#5DA7FF',
      },
    ],
    sellersTitle: 'Shites lokal qe ia vlejne',
    sellerCategories: {
      food: {
        title: 'Ushqime dhe pije tradicionale',
        subtitle: 'Prodhues familjare te njohur per vere, raki, konserva, bulmet dhe shije te fshatit.',
      },
      craft: {
        title: 'Objekte dhe instrumente tradicionale',
        subtitle: 'Familje artizane qe punojne dru, vegla bariu, instrumente dhe sende shtepie me tradite.',
      },
      clothing: {
        title: 'Veshje tradicionale',
        subtitle: 'Shtepi dhe atelie me perparese te endura, plis, jeleka te qendisur dhe pjese ceremoniale.',
      },
    },
    sellers: {
      food: [
        {
          family: 'Kantina Familjare Krasniqi',
          address: 'Hoqe e Vogel, Rahovec',
          phone: '+383 49 210 415',
          image:
            'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?auto=format&fit=crop&w=900&q=80',
          description:
            'Kantine e vogel familjare me vere te kuqe, vere te bardhe dhe raki rrushi qe prezantohet direkt ne vend.',
        },
        {
          family: 'Shtepia e Bulmetit Bytyqi',
          address: 'Drelaj, Rugove, Peje',
          phone: '+383 44 672 188',
          image:
            'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?auto=format&fit=crop&w=900&q=80',
          description:
            'Shtepi malore qe shet djathe fshati, kos, gjalpe te ruajtur dhe paketa me cajra bimore sezonale.',
        },
        {
          family: 'Tryeza e Konservave Berisha',
          address: 'Krushe e Madhe, Rahovec',
          phone: '+383 45 811 264',
          image:
            'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=900&q=80',
          description:
            'E njohur per ajvar, reçelra, mjalte mali dhe lengje shtepie te pergatitura me receta familjare.',
        },
      ],
      craft: [
        {
          family: 'Punishtja e Drurit dhe Lahutes Gashi',
          address: 'Qendra e Junikut, Junik',
          phone: '+383 49 520 733',
          image: 'https://images.unsplash.com/photo-1462965326201-d02e4f455804?auto=format&fit=crop&w=900&q=80',
          description:
            'Punishte familjare me tabaka druri, sende bariu dhe instrumente me frymezim nga tradita lokale.',
        },
        {
          family: 'Kendi i Bakrit Hoxha',
          address: 'Carshia e Madhe, Gjakove',
          phone: '+383 44 398 551',
          image:
            'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=900&q=80',
          description:
            'Servise bakri per kafe, pjese servirjeje dhe objekte praktike te lidhura me zanatin e vjeter.',
        },
        {
          family: 'Veglat e Trashegimise Rama',
          address: 'Isniq, Decan',
          phone: '+383 48 703 992',
          image:
            'https://images.unsplash.com/photo-1494883759339-0b042927eb37?auto=format&fit=crop&w=900&q=80',
          description:
            'Punues rural i fokusuar ne luga dore, pjese te vekut dhe vegla te vogla qe pasqyrojne jeten e fshatit.',
        },
      ],
      clothing: [
        {
          family: 'Dhoma e Endjes Luma',
          address: 'Periferi e Prizrenit, Prizren',
          phone: '+383 49 340 226',
          image:
            'https://images.unsplash.com/photo-1601430039674-6e905f056082?auto=format&fit=crop&w=900&q=80',
          description:
            'Perparese tradicionale, rripa te endur dhe tekstile te qendisura ne nje hapesire te vogel familjare.',
        },
        {
          family: 'Shtepia e Kostumeve Shala',
          address: 'Qyteti i Vjeter, Peje',
          phone: '+383 45 916 448',
          image:
            'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&w=900&q=80',
          description:
            'Familje lokale qe ruan detaje ceremoniale te veshjeve, plisa dhe pjese jelekesh per vizitore e ngjarje.',
        },
        {
          family: 'Studioja e Gjilperes Mustafa',
          address: 'Lagjja artizanale, Gjakove',
          phone: '+383 44 280 519',
          image:
            'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=900&q=80',
          description:
            'Aksesorë te veshjeve tradicionale, qendisje me dore dhe pjese sipas motiveve shqiptare rajonale.',
        },
      ],
    },
    collections: [
      {
        icon: 'wine-outline' as const,
        title: 'Vere & Raki',
        text: 'Kantina fshati, produkte te vjeljes se rrushit dhe shishe me histori lokale.',
      },
      {
        icon: 'restaurant-outline' as const,
        title: 'Ushqime Tradicionale',
        text: 'Djathera, mjalte, ajvar, caj mali, fruta te thata, konserva dhe embelsira shtepie.',
      },
      {
        icon: 'leaf-outline' as const,
        title: 'Agrokulture',
        text: 'Vizita ne ferma, rruge pemetaresh, dreka ne fshat, prodhim sezonal dhe rituale lokale.',
      },
      {
        icon: 'cube-outline' as const,
        title: 'Objekte & Artizanat',
        text: 'Punime druri, tekstile, vegla kuzhine, pjese tavoline dhe sende te dobishme me dore.',
      },
    ],
  },
};

export function MarketScreen() {
  const { language } = useI18n();
  const copy = marketCopy[language];
  const [selectedCategory, setSelectedCategory] = useState<MarketCategoryKey>('food');
  const activeCategory = copy.sellerCategories[selectedCategory];
  const activeSellers = copy.sellers[selectedCategory];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: PAGE_TOP_PADDING + 30 }]}
      showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['rgba(255,179,0,0.2)', 'rgba(66,217,140,0.12)']} style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="storefront-outline" size={28} color={theme.colors.surface} />
        </View>
        <Text style={styles.eyebrow}>{copy.eyebrow}</Text>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.subtitle}>{copy.subtitle}</Text>

        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={20} color="rgba(255,255,255,0.7)" />
          <TextInput
            placeholder={language === 'sq' ? 'Kerko nga tregu rural' : 'Search the rural market'}
            placeholderTextColor="rgba(255,255,255,0.52)"
            style={styles.searchInput}
          />
        </View>

        <View style={styles.badgeRow}>
          {copy.categories.map((category) => {
            const active = selectedCategory === category.key;
            return (
              <Pressable
                key={category.key}
                style={[styles.badgeButton, active && styles.badgeButtonActive]}
                onPress={() => setSelectedCategory(category.key)}>
                <Text style={[styles.badgeText, active && styles.badgeTextActive]}>
                  {category.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </LinearGradient>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{copy.sellersTitle}</Text>
      </View>

      <View style={styles.collectionGrid}>
        {activeSellers.map((seller) => (
          <View key={seller.family} style={styles.collectionCard}>
            <Image source={{ uri: seller.image }} style={styles.sellerImage} />
            <View style={styles.sellerHeader}>
              <View style={styles.collectionIcon}>
                <Ionicons name="person-circle-outline" size={20} color={theme.colors.secondary} />
              </View>
              <View style={styles.sellerMeta}>
                <Text style={styles.collectionTitle}>{seller.family}</Text>
                <View style={styles.sellerAddressRow}>
                  <Ionicons name="location-outline" size={15} color={theme.colors.secondary} />
                  <Text style={styles.sellerAddress}>{seller.address}</Text>
                </View>
                <View style={styles.sellerAddressRow}>
                  <Ionicons name="call-outline" size={15} color={theme.colors.secondary} />
                  <Text style={styles.sellerPhone}>{seller.phone}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.collectionText}>{seller.description}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {language === 'sq' ? 'Gjerat me te mira per te pare' : 'Best things to browse'}
        </Text>
      </View>

      <View style={styles.collectionGrid}>
        {copy.collections.map((collection) => (
          <View key={collection.title} style={styles.collectionCard}>
            <View style={styles.collectionIcon}>
              <Ionicons name={collection.icon} size={20} color={theme.colors.secondary} />
            </View>
            <Text style={styles.collectionTitle}>{collection.title}</Text>
            <Text style={styles.collectionText}>{collection.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Market Routes</Text>
      </View>

      <View style={styles.routeList}>
        {copy.marketSpots.map((spot) => (
          <View key={spot.title} style={styles.routeCard}>
            <View style={[styles.routeAccent, { backgroundColor: spot.tone }]} />
            <View style={styles.routeCopy}>
              <Text style={styles.routeTitle}>{spot.title}</Text>
              <Text style={styles.routeSubtitle}>{spot.subtitle}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

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
  hero: {
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    ...theme.shadow.card,
  },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,179,0,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  eyebrow: {
    color: '#FFD787',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 8,
    color: theme.colors.heading,
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 10,
    color: '#E4E7F3',
    fontSize: 14,
    lineHeight: 21,
  },
  searchWrap: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchInput: {
    flex: 1,
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
  },
  badgeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.round,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  badgeButtonActive: {
    backgroundColor: 'rgba(255,179,0,0.18)',
    borderColor: 'rgba(255,179,0,0.34)',
  },
  badgeText: {
    color: theme.colors.surface,
    fontSize: 12,
    fontWeight: '800',
  },
  badgeTextActive: {
    color: '#FFD787',
  },
  sectionHeader: {
    marginTop: 26,
    marginBottom: 14,
  },
  sectionTitle: {
    color: theme.colors.secondary,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  collectionGrid: {
    gap: 14,
  },
  categoryIntroCard: {
    padding: 18,
    borderRadius: 24,
    backgroundColor: 'rgba(255,179,0,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,179,0,0.2)',
    ...theme.shadow.card,
  },
  collectionCard: {
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    ...theme.shadow.card,
  },
  sellerImage: {
    width: '100%',
    height: 168,
    backgroundColor: theme.colors.surfaceAlt,
  },
  sellerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  sellerMeta: {
    flex: 1,
  },
  sellerAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  sellerAddress: {
    flex: 1,
    color: '#FFD787',
    fontSize: 13,
    fontWeight: '700',
  },
  sellerPhone: {
    flex: 1,
    color: theme.colors.surface,
    fontSize: 13,
    fontWeight: '700',
  },
  collectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,179,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  collectionTitle: {
    color: theme.colors.heading,
    fontSize: 18,
    fontWeight: '800',
  },
  collectionText: {
    marginTop: 8,
    paddingHorizontal: 18,
    paddingBottom: 18,
    color: theme.colors.mutedText,
    fontSize: 14,
    lineHeight: 22,
  },
  routeList: {
    gap: 12,
  },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    ...theme.shadow.card,
  },
  routeAccent: {
    width: 6,
  },
  routeCopy: {
    flex: 1,
    padding: 18,
  },
  routeTitle: {
    color: theme.colors.heading,
    fontSize: 17,
    fontWeight: '800',
  },
  routeSubtitle: {
    marginTop: 8,
    color: theme.colors.mutedText,
    fontSize: 14,
    lineHeight: 21,
  },
});
