import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { OptionListCard } from '../components/cards/OptionListCard';
import { SectionTitle } from '../components/common/SectionTitle';
import { ToggleSwitch } from '../components/common/ToggleSwitch';
import { PAGE_BOTTOM_PADDING, PAGE_TOP_PADDING, Screen } from '../components/Screen';
import { useAuth } from '../features/auth/AuthProvider';
import { useI18n } from '../i18n/I18nProvider';
import type { SupportedLanguage } from '../i18n/messages';
import type { LanguageOption, NotificationOption, QuickLink } from '../repositories/types';
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
    footerNote: 'Copyright 2026 KosVibe. Te gjitha te drejtat e rezervuara.',
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
  const { signOut, accountType } = useAuth();
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
    if (item.id === 'help') {
      navigation.navigate('Help' as never);
      return;
    }

    if (item.id === 'logout') {
      try {
        await signOut();
      } catch (error) {
        Alert.alert(
          copy.signOutErrorTitle,
          error instanceof Error ? error.message : copy.signOutErrorFallback
        );
      }
    }
  };

  return (
    <Screen scrollable contentContainerStyle={styles.content}>
      {accountType === 'consumer' && (
        <>
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
        </>
      )}

      {accountType === 'business' && (
        <>
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
              title={copy.accountTitle}
              icon={<Ionicons name="person-circle-outline" size={22} color={theme.colors.heading} />}
            />
            <OptionListCard
              items={[
                { id: 'logout', icon: 'log-out-outline', label: 'Sign Out', tone: 'danger' as const },
              ]}
              onItemPress={handleAccountPress}
            />
          </View>
        </>
      )}

      {accountType === 'super_admin' && (
        <View style={styles.section}>
          <SectionTitle
            title={copy.accountTitle}
            icon={<Ionicons name="person-circle-outline" size={22} color={theme.colors.heading} />}
          />
          <OptionListCard
            items={[
              { id: 'logout', icon: 'log-out-outline', label: 'Sign Out', tone: 'danger' as const },
            ]}
            onItemPress={handleAccountPress}
          />
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerBrand}>KOSVIBE</Text>
        <Text style={styles.footerVersion}>{copy.versionLabel}</Text>
        <Text style={styles.footerNote}>{copy.footerNote}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 24,
    paddingTop: PAGE_TOP_PADDING - 20,
    paddingBottom: PAGE_BOTTOM_PADDING,
  },
  heroCard: {
    marginHorizontal: 24,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  heroIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(93,167,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(93,167,255,0.3)',
  },
  heroCopy: {
    flex: 1,
    gap: 4,
  },
  heroTitle: {
    color: theme.colors.heading,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: theme.colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    gap: 16,
    paddingHorizontal: 24,
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
    minHeight: 74,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
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
    width: 42,
    height: 42,
    borderRadius: 14,
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
    minHeight: 84,
    paddingHorizontal: theme.spacing.xl,
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
    gap: 8,
    paddingHorizontal: 24,
    marginTop: 12,
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
