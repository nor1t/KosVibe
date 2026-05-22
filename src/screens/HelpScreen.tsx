import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import { WeatherSettingsButton } from '../components/common/WeatherSettingsButton';
import { useI18n } from '../i18n/I18nProvider';
import { theme } from '../theme';

type HelpScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

type HelpSectionId = 'government' | 'taxi' | 'guides';

type HelpContact = {
  id: string;
  name: string;
  detail: string;
  phone: string;
};

const helpCopy = {
  en: {
    title: 'Important numbers',
    subtitle: 'Fast contacts for emergencies, taxis, and local guides in Kosovo.',
    call: 'Call',
    sections: {
      government: 'Government',
      taxi: 'Taxi',
      guides: 'Guides',
    },
    contacts: {
      government: [
        { id: 'emergency', name: 'Unified Emergency Number', detail: 'Police, ambulance, fire', phone: '112' },
        { id: 'police', name: 'Kosovo Police', detail: 'Direct police line', phone: '192' },
        { id: 'fire', name: 'Firefighters', detail: 'Fire and rescue', phone: '193' },
        { id: 'ambulance', name: 'Ambulance', detail: 'Medical emergency', phone: '194' },
        {
          id: 'public-health',
          name: 'National Institute of Public Health',
          detail: 'Public health information',
          phone: '038 200 80 800',
        },
      ],
      taxi: [
        { id: 'hej', name: 'Hej Taxi', detail: 'Prishtina taxi service', phone: '044 333 999' },
        { id: 'victory', name: 'Victory Taxi', detail: 'Prishtina taxi service', phone: '+381 38 555 333' },
        { id: 'london', name: 'London Taxi', detail: 'Prishtina taxi service', phone: '+377 44 300 300' },
        { id: 'beki', name: 'Beki Taxi', detail: 'Prishtina taxi service', phone: '+377 44 111 555' },
      ],
      guides: [
        { id: 'my-kosovo-guide', name: 'My Kosovo Guide', detail: 'WhatsApp / Viber guide contact', phone: '+383 44 157 663' },
        { id: 'kosovo-tour-guide-1', name: 'Kosovo Tour Guide', detail: 'National/local guide contact', phone: '+383 44 561 081' },
        { id: 'kosovo-tour-guide-2', name: 'Kosovo Tour Guide', detail: 'National/local guide contact', phone: '+383 49 205 254' },
      ],
    },
  },
  sq: {
    title: 'Numra te rendesishem',
    subtitle: 'Kontakte te shpejta per emergjenca, taksi dhe guida lokale ne Kosove.',
    call: 'Thirr',
    sections: {
      government: 'Qeveria',
      taxi: 'Taksi',
      guides: 'Guida',
    },
    contacts: {
      government: [
        { id: 'emergency', name: 'Numri unik emergjent', detail: 'Polici, ambulance, zjarrfikes', phone: '112' },
        { id: 'police', name: 'Policia e Kosoves', detail: 'Linja direkte e policise', phone: '192' },
        { id: 'fire', name: 'Zjarrfikesit', detail: 'Zjarr dhe shpetim', phone: '193' },
        { id: 'ambulance', name: 'Ambulanca', detail: 'Emergjence mjekesore', phone: '194' },
        {
          id: 'public-health',
          name: 'Instituti Kombetar i Shendetit Publik',
          detail: 'Informata per shendet publik',
          phone: '038 200 80 800',
        },
      ],
      taxi: [
        { id: 'hej', name: 'Hej Taxi', detail: 'Sherbim taksi ne Prishtine', phone: '044 333 999' },
        { id: 'victory', name: 'Victory Taxi', detail: 'Sherbim taksi ne Prishtine', phone: '+381 38 555 333' },
        { id: 'london', name: 'London Taxi', detail: 'Sherbim taksi ne Prishtine', phone: '+377 44 300 300' },
        { id: 'beki', name: 'Beki Taxi', detail: 'Sherbim taksi ne Prishtine', phone: '+377 44 111 555' },
      ],
      guides: [
        { id: 'my-kosovo-guide', name: 'My Kosovo Guide', detail: 'Kontakt guide ne WhatsApp / Viber', phone: '+383 44 157 663' },
        { id: 'kosovo-tour-guide-1', name: 'Kosovo Tour Guide', detail: 'Kontakt guide kombetare/lokale', phone: '+383 44 561 081' },
        { id: 'kosovo-tour-guide-2', name: 'Kosovo Tour Guide', detail: 'Kontakt guide kombetare/lokale', phone: '+383 49 205 254' },
      ],
    },
  },
} satisfies Record<
  string,
  {
    title: string;
    subtitle: string;
    call: string;
    sections: Record<HelpSectionId, string>;
    contacts: Record<HelpSectionId, HelpContact[]>;
  }
>;

const sectionOrder: HelpSectionId[] = ['government', 'taxi', 'guides'];

function phoneUrl(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export function HelpScreen({ navigation }: HelpScreenProps) {
  const { language } = useI18n();
  const copy = helpCopy[language];
  const [activeSection, setActiveSection] = useState<HelpSectionId>('government');
  const contacts = copy.contacts[activeSection];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={22} color={theme.colors.surface} />
        </Pressable>
        <WeatherSettingsButton navigation={navigation} showHelp={false} compact />
      </View>

      <View style={styles.hero}>
        <View style={styles.helpIcon}>
          <Ionicons name="help-outline" size={28} color={theme.colors.surface} />
        </View>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.subtitle}>{copy.subtitle}</Text>
      </View>

      <View style={styles.tabs}>
        {sectionOrder.map((section) => {
          const active = activeSection === section;

          return (
            <Pressable
              key={section}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setActiveSection(section)}>
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {copy.sections[section]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.contactList}>
        {contacts.map((contact) => (
          <View key={contact.id} style={styles.contactCard}>
            <View style={styles.contactIcon}>
              <Ionicons
                name={activeSection === 'government' ? 'shield-checkmark-outline' : activeSection === 'taxi' ? 'car-outline' : 'map-outline'}
                size={22}
                color={theme.colors.secondary}
              />
            </View>
            <View style={styles.contactCopy}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactDetail}>{contact.detail}</Text>
              <Text style={styles.contactPhone}>{contact.phone}</Text>
            </View>
            <Pressable style={styles.callButton} onPress={() => void Linking.openURL(phoneUrl(contact.phone))}>
              <Ionicons name="call-outline" size={18} color={theme.colors.surface} />
              <Text style={styles.callText}>{copy.call}</Text>
            </Pressable>
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
    padding: 20,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  helpIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
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
  tabs: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  tabActive: {
    backgroundColor: 'rgba(255,31,61,0.22)',
    borderColor: 'rgba(255,31,61,0.38)',
  },
  tabText: {
    color: theme.colors.mutedText,
    fontSize: 12,
    fontWeight: '900',
  },
  tabTextActive: {
    color: theme.colors.heading,
  },
  contactList: {
    marginTop: 18,
    gap: 12,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,179,0,0.12)',
  },
  contactCopy: {
    flex: 1,
  },
  contactName: {
    color: theme.colors.heading,
    fontSize: 16,
    fontWeight: '900',
  },
  contactDetail: {
    marginTop: 3,
    color: theme.colors.mutedText,
    fontSize: 12,
    lineHeight: 17,
  },
  contactPhone: {
    marginTop: 5,
    color: theme.colors.secondary,
    fontSize: 14,
    fontWeight: '900',
  },
  callButton: {
    minWidth: 76,
    minHeight: 42,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
  },
  callText: {
    color: theme.colors.surface,
    fontSize: 12,
    fontWeight: '900',
  },
});
