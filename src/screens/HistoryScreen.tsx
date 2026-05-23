import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { WeatherSettingsButton } from '../components/common/WeatherSettingsButton';
import { useI18n } from '../i18n/I18nProvider';
import { theme } from '../theme';

type HistoryScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

const historyCopy = {
  en: {
    eyebrow: 'Kosovo Library',
    title: 'History of Kosova',
    subtitle:
      'A compact guide to the land, people, culture, monuments, and moments that shaped modern Kosovo.',
    quickFacts: [
      { label: 'Capital', value: 'Prishtina' },
      { label: 'Independence', value: '17 Feb 2008' },
      { label: 'Heritage', value: 'Dardania, Illyrian, Roman, Ottoman, Albanian' },
    ],
    sections: [
      {
        title: 'Ancient Dardania',
        text:
          'Kosovo sits in the heart of ancient Dardania. Archaeological sites like Ulpiana show Roman and early Byzantine urban life, roads, trade, faith, and settlement across the Kosovo plain.',
      },
      {
        title: 'Medieval Heritage',
        text:
          'Medieval Kosovo carries layers of castles, churches, towns, and trade routes. Prizren and its fortress remain powerful reminders of the region role as a meeting place between mountains, rivers, merchants, and communities.',
      },
      {
        title: 'Ottoman Centuries',
        text:
          'Ottoman rule shaped much of Kosovo urban life, especially bazaars, bridges, hammams, mosques, and stone architecture. The Stone Bridge of Prizren is one of the clearest everyday symbols of that period.',
      },
      {
        title: 'Albanian National Movement',
        text:
          'The League of Prizren, founded in 1878, became a defining moment for Albanian political organization, cultural identity, language, and the demand to protect Albanian lands and self-rule.',
      },
      {
        title: 'Kosovo War',
        text:
          'The Kosovo War of 1998-1999 was one of the most painful chapters in modern Kosovo history. Civilians faced displacement, destruction, massacres, and deep loss, while the Kosovo Liberation Army fought Serbian forces. NATO intervention in 1999 ended the war, and many families still carry its memory in missing persons, memorials, rebuilt homes, and stories of survival.',
      },
      {
        title: 'Modern Kosovo',
        text:
          'The twentieth century brought conflict, survival, migration, resistance, and rebuilding. Kosovo declared independence on 17 February 2008, and landmarks like Newborn keep that public memory visible.',
      },
      {
        title: 'Culture Today',
        text:
          'Modern Kosovo blends old town streets, mountain villages, coffee culture, music, food, festivals, diaspora energy, and strong local hospitality. Its identity lives in both monuments and everyday social life.',
      },
      {
        title: 'Nature',
        text:
          'Rugova Canyon, the Sharr Mountains, Mirusha Waterfalls, Germia, and the White Drin show Kosovo wild side: alpine air, limestone cliffs, waterfalls, forest paths, and wide mountain horizons.',
      },
    ],
  },
  sq: {
    eyebrow: 'Biblioteka e Kosoves',
    title: 'Historia e Kosoves',
    subtitle:
      'Udhezues i shkurter per token, njerezit, kulturen, monumentet dhe momentet qe formuan Kosoven moderne.',
    quickFacts: [
      { label: 'Kryeqyteti', value: 'Prishtina' },
      { label: 'Pavaresia', value: '17 Shkurt 2008' },
      { label: 'Trashegimia', value: 'Dardane, ilire, romake, osmane, shqiptare' },
    ],
    sections: [
      {
        title: 'Dardania Antike',
        text:
          'Kosova ndodhet ne zemren e Dardanise antike. Vende arkeologjike si Ulpiana tregojne jeten urbane romake dhe bizantine, rruget, tregtine, besimin dhe vendbanimet ne rrafshin e Kosoves.',
      },
      {
        title: 'Trashegimia Mesjetare',
        text:
          'Kosova mesjetare mban shtresa kalash, kishash, qytetesh dhe rrugesh tregtare. Prizreni dhe kalaja e tij mbeten kujtime te fuqishme te rolit te rajonit si vendtakim mes maleve, lumenjve, tregtareve dhe komuniteteve.',
      },
      {
        title: 'Shekujt Osmane',
        text:
          'Sundimi osman formoi shume nga jeta urbane e Kosoves, sidomos pazaret, urat, hamamet, xhamite dhe arkitekturen prej guri. Ura e Gurit ne Prizren eshte nje nga simbolet me te qarta te asaj periudhe.',
      },
      {
        title: 'Levizja Kombetare Shqiptare',
        text:
          'Lidhja e Prizrenit, e themeluar ne vitin 1878, u be moment kyc per organizimin politik shqiptar, identitetin kulturor, gjuhen dhe kerkesen per mbrojtjen e trojeve dhe veteqeverisjen shqiptare.',
      },
      {
        title: 'Lufta e Kosoves',
        text:
          'Lufta e Kosoves e viteve 1998-1999 ishte nje nga kapitujt me te dhimbshme te historise moderne te Kosoves. Civilet u perballen me zhvendosje, shkaterrim, masakra dhe humbje te medha, ndersa Ushtria Çlirimtare e Kosoves luftoi kunder forcave serbe. Nderhyrja e NATO-s ne vitin 1999 i dha fund luftes, dhe shume familje ende e mbajne kujtimin e saj permes personave te pagjetur, memorialeve, shtepive te rindertuara dhe tregimeve te mbijeteses.',
      },
      {
        title: 'Kosova Moderne',
        text:
          'Shekulli i njezete solli konflikt, mbijetese, migrim, rezistence dhe rindertim. Kosova shpalli pavaresine me 17 shkurt 2008, ndersa monumente si Newborn e mbajne kete kujtese publike te dukshme.',
      },
      {
        title: 'Kultura Sot',
        text:
          'Kosova moderne bashkon rruget e qyteteve te vjetra, fshatrat malore, kulturen e kafese, muziken, ushqimin, festivalet, energjine e diaspores dhe mikpritjen e forte lokale.',
      },
      {
        title: 'Natyra',
        text:
          'Gryka e Rugoves, Malet e Sharrit, Ujevarat e Mirushes, Germia dhe Drini i Bardhe tregojne anen e eger te Kosoves: ajer alpin, shkembinj gelqerore, ujevara, shtigje pyjore dhe horizonte malore.',
      },
    ],
  },
};

export function HistoryScreen({ navigation }: HistoryScreenProps) {
  const { language } = useI18n();
  const copy = historyCopy[language];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={22} color={theme.colors.surface} />
        </Pressable>
        <WeatherSettingsButton navigation={navigation} showHistory={false} compact collapseInfoActions showWeather={false} />
      </View>

      <LinearGradient colors={['rgba(255,179,0,0.22)', 'rgba(93,167,255,0.12)']} style={styles.hero}>
        <View style={styles.bookMark}>
          <Ionicons name="book-outline" size={28} color={theme.colors.surface} />
        </View>
        <Text style={styles.eyebrow}>{copy.eyebrow}</Text>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.subtitle}>{copy.subtitle}</Text>
      </LinearGradient>

      <View style={styles.factGrid}>
        {copy.quickFacts.map((fact) => (
          <View key={fact.label} style={styles.factCard}>
            <Text style={styles.factLabel}>{fact.label}</Text>
            <Text style={styles.factValue}>{fact.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.timeline}>
        {copy.sections.map((section, index) => (
          <View key={section.title} style={styles.historyCard}>
            <View style={styles.cardTopRow}>
              <View style={styles.indexBadge}>
                <Text style={styles.indexText}>{index + 1}</Text>
              </View>
              <Text style={styles.cardTitle}>{section.title}</Text>
            </View>
            <Text style={styles.cardText}>{section.text}</Text>
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
    paddingTop: 54,
    paddingBottom: 140,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 18,
  },
  backButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  bookMark: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,31,61,0.28)',
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
    marginTop: 10,
    color: theme.colors.heading,
    fontSize: 40,
    lineHeight: 42,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 12,
    color: '#E5E8F4',
    fontSize: 16,
    lineHeight: 24,
  },
  factGrid: {
    marginTop: 18,
    gap: 12,
  },
  factCard: {
    padding: 16,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  factLabel: {
    color: theme.colors.secondary,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  factValue: {
    marginTop: 6,
    color: theme.colors.heading,
    fontSize: 16,
    fontWeight: '800',
  },
  timeline: {
    marginTop: 22,
    gap: 14,
  },
  historyCard: {
    padding: 18,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  indexBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,179,0,0.2)',
  },
  indexText: {
    color: theme.colors.secondary,
    fontSize: 13,
    fontWeight: '900',
  },
  cardTitle: {
    flex: 1,
    color: theme.colors.heading,
    fontSize: 20,
    fontWeight: '900',
  },
  cardText: {
    marginTop: 12,
    color: theme.colors.mutedText,
    fontSize: 15,
    lineHeight: 23,
  },
});
