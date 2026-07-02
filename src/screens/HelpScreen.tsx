import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PAGE_BOTTOM_PADDING } from '../components/Screen';
import { useI18n } from '../i18n/I18nProvider';
import { theme } from '../theme';

const supportEmail = 'ermir.gerguri@umib.net';

const helpCopy = {
  en: {
    title: 'About KosVibe',
    subtitle: 'A local discovery app for food, places, stories, and plans across Kosovo.',
    contactTitle: 'Need help?',
    contactText: `Contact ${supportEmail} and the KosVibe team will help you with account access, story publishing, restaurant details, or app feedback.`,
    emailButton: 'Email support',
    sections: [
      {
        id: 'mission',
        icon: 'compass-outline',
        title: 'Our mission',
        body: 'KosVibe helps locals and visitors discover Kosovo through restaurants, cultural spots, events, markets, and community stories.',
      },
      {
        id: 'community',
        icon: 'people-outline',
        title: 'Built around community',
        body: 'Stories, favorites, and recommendations are designed to make every city feel easier to explore and more personal to remember.',
      },
      {
        id: 'mock',
        icon: 'construct-outline',
        title: 'Mock support data',
        body: 'Response time: within 24 hours. Support hours: Monday-Friday, 09:00-17:00. App version: 1.0.0.',
      },
    ],
  },
  sq: {
    title: 'Rreth KosVibe',
    subtitle: 'Aplikacion lokal per ushqim, vende, storje dhe plane ne Kosove.',
    contactTitle: 'Ke nevoje per ndihme?',
    contactText: `Kontakto ${supportEmail} dhe ekipi i KosVibe do te ndihmoje per llogarine, storjet, restoranet ose sugjerimet per aplikacionin.`,
    emailButton: 'Dergo email',
    sections: [
      {
        id: 'mission',
        icon: 'compass-outline',
        title: 'Misioni yne',
        body: 'KosVibe ndihmon vendasit dhe vizitoret te zbulojne Kosoven permes restoraneve, vendeve kulturore, eventeve, tregjeve dhe storjeve.',
      },
      {
        id: 'community',
        icon: 'people-outline',
        title: 'Per komunitetin',
        body: 'Storjet, te preferuarat dhe rekomandimet e bejne cdo qytet me te lehte per ta eksploruar dhe me personal per ta mbajtur mend.',
      },
      {
        id: 'mock',
        icon: 'construct-outline',
        title: 'Te dhena mock per ndihme',
        body: 'Koha e pergjigjes: brenda 24 oreve. Orari: e hene-e premte, 09:00-17:00. Versioni: 1.0.0.',
      },
    ],
  },
};

function emailUrl() {
  return `mailto:${supportEmail}?subject=KosVibe%20Support`;
}

export function HelpScreen() {
  const { language } = useI18n();
  const insets = useSafeAreaInsets();
  const copy = helpCopy[language];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Math.max(insets.top + 18, 34) },
      ]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.helpIcon}>
          <Ionicons name="information-circle-outline" size={30} color={theme.colors.surface} />
        </View>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.subtitle}>{copy.subtitle}</Text>
      </View>

      <View style={styles.sectionList}>
        {copy.sections.map((section) => (
          <View key={section.id} style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons name={section.icon as never} size={22} color={theme.colors.secondary} />
            </View>
            <View style={styles.infoCopy}>
              <Text style={styles.infoTitle}>{section.title}</Text>
              <Text style={styles.infoBody}>{section.body}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.contactCard}>
        <View style={styles.contactHeader}>
          <Ionicons name="mail-outline" size={22} color={theme.colors.secondary} />
          <Text style={styles.contactTitle}>{copy.contactTitle}</Text>
        </View>
        <Text style={styles.contactText}>{copy.contactText}</Text>
        <Pressable style={styles.emailButton} onPress={() => void Linking.openURL(emailUrl())}>
          <Ionicons name="send-outline" size={18} color={theme.colors.surface} />
          <Text style={styles.emailButtonText}>{copy.emailButton}</Text>
        </Pressable>
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
    paddingBottom: PAGE_BOTTOM_PADDING,
  },
  hero: {
    padding: 20,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    ...theme.shadow.card,
  },
  helpIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,31,61,0.32)',
    marginBottom: 16,
  },
  title: {
    color: theme.colors.heading,
    fontSize: 36,
    lineHeight: 38,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 10,
    color: theme.colors.mutedText,
    fontSize: 16,
    lineHeight: 24,
  },
  sectionList: {
    marginTop: 18,
    gap: 12,
  },
  infoCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    ...theme.shadow.card,
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,179,0,0.12)',
  },
  infoCopy: {
    flex: 1,
    gap: 5,
  },
  infoTitle: {
    color: theme.colors.heading,
    fontSize: 16,
    fontWeight: '900',
  },
  infoBody: {
    color: theme.colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
  },
  contactCard: {
    marginTop: 18,
    padding: 18,
    borderRadius: 26,
    backgroundColor: 'rgba(255,179,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,179,0,0.2)',
    ...theme.shadow.card,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactTitle: {
    color: theme.colors.heading,
    fontSize: 18,
    fontWeight: '900',
  },
  contactText: {
    marginTop: 10,
    color: theme.colors.mutedText,
    fontSize: 14,
    lineHeight: 21,
  },
  emailButton: {
    marginTop: 16,
    minHeight: 50,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
  },
  emailButtonText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: '900',
  },
});
