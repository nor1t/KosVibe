import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  type LanguageOption,
  type NotificationOption,
  type QuickLink,
} from '../data/mockData';
import { OptionListCard } from '../components/cards/OptionListCard';
import { WeatherSettingsButton } from '../components/common/WeatherSettingsButton';
import { IconCircleButton } from '../components/common/IconCircleButton';
import { SectionTitle } from '../components/common/SectionTitle';
import { ToggleSwitch } from '../components/common/ToggleSwitch';
import { useAuth } from '../features/auth/AuthProvider';
import { useI18n } from '../i18n/I18nProvider';
import type { SupportedLanguage } from '../i18n/messages';
import { GradientHeaderShell } from '../components/layout/GradientHeaderShell';
import { Screen } from '../components/layout/Screen';
import { theme } from '../theme';

type SettingsScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

const settingsCopy: Record<
  SupportedLanguage,
  {
    title: string;
    languageTitle: string;
    notificationsTitle: string;
    accountTitle: string;
    versionLabel: string;
    footerNote: string;
    selectedLabel: string;
    signOutErrorTitle: string;
    signOutErrorFallback: string;
    languages: LanguageOption[];
    notifications: NotificationOption[];
    accountLinks: QuickLink[];
  }
> = {
  en: {
    title: 'Settings',
    languageTitle: 'Language',
    notificationsTitle: 'Notifications',
    accountTitle: 'Account',
    versionLabel: 'Version 1.0.0',
    
    footerNote: 'Copyright 2026 KosVibe. All rights reserved.',
    selectedLabel: 'Selected',
    signOutErrorTitle: 'Sign out failed',
    signOutErrorFallback: 'Unable to sign out.',
    languages: [
      { id: 'en', flag: 'EN', label: 'English', selected: true },
      { id: 'sq', flag: 'SQ', label: 'Albanian', selected: false },
    ],
    notifications: [
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
    ],
    accountLinks: [
      { id: 'profile', icon: 'person-outline', label: 'My Profile' },
      { id: 'addresses', icon: 'location-sharp', label: 'Addresses' },
      { id: 'payments', icon: 'card-outline', label: 'Payment Methods' },
      { id: 'help', icon: 'help-circle-outline', label: 'Help & Support' },
      { id: 'logout', icon: 'log-out-outline', label: 'Sign Out', tone: 'danger' },
    ],
  },
  sq: {
    title: 'Cilesimet',
    languageTitle: 'Gjuha',
    notificationsTitle: 'Njoftimet',
    accountTitle: 'Llogaria',
    versionLabel: 'Versioni 1.0.0',
    footerNote: 'Copyright 2026 Yummy Kosova. Te gjitha te drejtat e rezervuara.',
    selectedLabel: 'E zgjedhur',
    signOutErrorTitle: 'Dalja deshtoi',
    signOutErrorFallback: 'Nuk mund te dilni nga llogaria.',
    languages: [
      { id: 'en', flag: 'EN', label: 'Anglisht', selected: false },
      { id: 'sq', flag: 'SQ', label: 'Shqip', selected: true },
    ],
    notifications: [
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
    ],
    accountLinks: [
      { id: 'profile', icon: 'person-outline', label: 'Profili im' },
      { id: 'addresses', icon: 'location-sharp', label: 'Adresat' },
      { id: 'payments', icon: 'card-outline', label: 'Metodat e pageses' },
      { id: 'help', icon: 'help-circle-outline', label: 'Ndihme & Mbeshtejte' },
      { id: 'logout', icon: 'log-out-outline', label: 'Dil nga llogaria', tone: 'danger' },
    ],
  },
};

function isSupportedLanguage(languageId: string): languageId is SupportedLanguage {
  return languageId === 'en' || languageId === 'sq';
}

function getLanguagesForSelection(selectedLanguage: SupportedLanguage, languages: LanguageOption[]) {
  return languages.map((language) => ({
    ...language,
    selected: language.id === selectedLanguage,
  }));
}

function LanguageCard({
  languages,
  onSelect,
  selectedLabel,
}: {
  languages: LanguageOption[];
  onSelect: (languageId: string) => void;
  selectedLabel: string;
}) {
  return (
    <View style={styles.languageList}>
      {languages.map((language) => (
        <Pressable
          key={language.id}
          accessibilityRole="button"
          accessibilityState={{ selected: language.selected }}
          onPress={() => onSelect(language.id)}
          style={[
            styles.languageCard,
            language.selected && styles.selectedRow,
          ]}>
          <View style={styles.languageLeft}>
            <View style={[styles.languageBadge, language.selected && styles.selectedLanguageBadge]}>
              <Text style={[styles.flag, language.selected && styles.selectedFlag]}>
                {language.flag}
              </Text>
            </View>
            <View style={styles.languageCopy}>
              <Text style={[styles.languageLabel, language.selected && styles.selectedLanguageLabel]}>
                {language.label}
              </Text>
              {language.selected ? <Text style={styles.selectedHint}>{selectedLabel}</Text> : null}
            </View>
          </View>

          <ToggleSwitch value={language.selected} onValueChange={() => onSelect(language.id)} />
        </Pressable>
      ))}
    </View>
  );
}

function NotificationCard({
  items,
  onToggle,
}: {
  items: NotificationOption[];
  onToggle: (itemId: string) => void;
}) {
  return (
    <View style={styles.card}>
      {items.map((item, index) => (
        <View key={item.id} style={[styles.notificationRow, index < items.length - 1 && styles.rowBorder]}>
          <View style={styles.notificationCopy}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationSubtitle}>{item.subtitle}</Text>
          </View>

          <ToggleSwitch value={item.enabled} onValueChange={() => onToggle(item.id)} />
        </View>
      ))}
    </View>
  );
}

export function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { signOut } = useAuth();
  const { language, setLanguage } = useI18n();
  const copy = settingsCopy[language];
  const [notificationSettings, setNotificationSettings] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(settingsCopy.en.notifications.map((item) => [item.id, item.enabled]))
  );

  const languages = useMemo(
    () => getLanguagesForSelection(language, copy.languages),
    [copy.languages, language]
  );
  const notifications = useMemo(
    () =>
      copy.notifications.map((item) => ({
        ...item,
        enabled: notificationSettings[item.id] ?? item.enabled,
      })),
    [copy.notifications, notificationSettings]
  );

  const handleLanguageSelect = (languageId: string) => {
    if (isSupportedLanguage(languageId)) {
      setLanguage(languageId);
    }
  };

  const handleAccountPress = async (item: QuickLink) => {
    if (item.id !== 'logout') {
      return;
    }

    try {
      await signOut();
    } catch (error) {
      Alert.alert(
        copy.signOutErrorTitle,
        error instanceof Error ? error.message : copy.signOutErrorFallback
      );
    }
  };

  return (
    <Screen contentContainerStyle={styles.content}>
      <GradientHeaderShell
        bottomRadius={theme.radius.lg}
        contentStyle={styles.headerContent}
        topPadding={0}>
        <View style={styles.headerRow}>
          <IconCircleButton onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-outline" size={24} color={theme.colors.surface} />
          </IconCircleButton>
          <Text style={styles.headerTitle}>{copy.title}</Text>
          <WeatherSettingsButton navigation={navigation} showSettings={false} compact collapseInfoActions showWeather={false} />
        </View>
      </GradientHeaderShell>

      <View style={styles.section}>
        <SectionTitle
          title={copy.languageTitle}
          icon={<Ionicons name="globe-outline" size={22} color={theme.colors.danger} />}
        />
        <LanguageCard
          languages={languages}
          onSelect={handleLanguageSelect}
          selectedLabel={copy.selectedLabel}
        />
      </View>

      <View style={styles.section}>
        <SectionTitle
          title={copy.notificationsTitle}
          icon={<Ionicons name="notifications-outline" size={22} color={theme.colors.danger} />}
        />
        <NotificationCard
          items={notifications}
          onToggle={(itemId) =>
            setNotificationSettings((current) => ({
              ...current,
              [itemId]: !(current[itemId] ?? false),
            }))
          }
        />
      </View>

      <View style={styles.section}>
        <SectionTitle
          title={copy.accountTitle}
          icon={<Ionicons name="person-circle-outline" size={22} color={theme.colors.heading} />}
        />
        <OptionListCard items={copy.accountLinks} onItemPress={handleAccountPress} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerBrand}>YUMMY KOSOVA</Text>
        <Text style={styles.footerVersion}>{copy.versionLabel}</Text>
        <Text style={styles.footerNote}>{copy.footerNote}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.xxxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    paddingBottom: theme.spacing.xs,
  },
  headerTitle: {
    color: theme.colors.surface,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    flex: 1,
    marginLeft: theme.spacing.lg,
  },
  section: {
    gap: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xxl,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    ...theme.shadow.card,
  },
  languageList: {
    gap: theme.spacing.lg,
  },
  languageCard: {
    minHeight: 86,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.lg,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    ...theme.shadow.card,
  },
  selectedRow: {
    backgroundColor: 'rgba(255,179,0,0.18)',
    borderColor: 'rgba(255,179,0,0.34)',
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  languageLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  languageBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  selectedLanguageBadge: {
    backgroundColor: 'rgba(255,31,61,0.72)',
    borderColor: 'rgba(255,255,255,0.18)',
  },
  flag: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
    color: theme.colors.mutedText,
  },
  selectedFlag: {
    color: theme.colors.surface,
  },
  languageCopy: {
    flex: 1,
    gap: 3,
  },
  languageLabel: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    color: theme.colors.heading,
  },
  selectedLanguageLabel: {
    color: '#FFD787',
  },
  selectedHint: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: theme.colors.secondary,
    textTransform: 'uppercase',
  },
  notificationRow: {
    minHeight: 100,
    paddingHorizontal: theme.spacing.xxl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  notificationCopy: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  notificationTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
    color: theme.colors.heading,
  },
  notificationSubtitle: {
    fontSize: 14,
    lineHeight: 19,
    color: theme.colors.mutedText,
  },
  footer: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xxl,
  },
  footerBrand: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.secondary,
  },
  footerVersion: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.mutedText,
  },
  footerNote: {
    fontSize: 14,
    color: theme.colors.subtle,
    textAlign: 'center',
  },
});
