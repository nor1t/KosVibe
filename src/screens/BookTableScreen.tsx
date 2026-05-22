import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { WeatherSettingsButton } from '../components/common/WeatherSettingsButton';
import { bookingDates, bookingTimes, getRestaurantById } from '../data/mockData';
import { useI18n } from '../i18n/I18nProvider';
import { nativeCopy } from '../i18n/nativeCopy';
import { theme } from '../theme';

type BookTableRoute = RouteProp<{ BookTable: { restaurantId: string } }, 'BookTable'>;

type BookTableScreenProps = {
  navigation: NavigationProp<ParamListBase>;
  route: BookTableRoute;
};

export function BookTableScreen({ navigation, route }: BookTableScreenProps) {
  const { language } = useI18n();
  const copy = nativeCopy[language].booking;
  const restaurant = getRestaurantById(route.params.restaurantId);
  const [selectedDateId, setSelectedDateId] = useState(bookingDates[0]?.id ?? '');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <Pressable style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={22} color={theme.colors.surface} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.subtitle}>{restaurant?.name ?? copy.fallbackRestaurant}</Text>
        </View>
        <WeatherSettingsButton navigation={navigation} compact />
      </View>

      <LinearGradient colors={['rgba(255,31,61,0.2)', 'rgba(255,179,0,0.08)']} style={styles.heroCard}>
        <Text style={styles.heroTitle}>{copy.heroTitle}</Text>
        <Text style={styles.heroText}>
          {copy.heroText}
        </Text>
      </LinearGradient>

      <Text style={styles.sectionHeading}>{copy.dates}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
        {bookingDates.map((date) => {
          const active = date.id === selectedDateId;
          return (
            <Pressable key={date.id} onPress={() => setSelectedDateId(date.id)} style={styles.dateCardWrap}>
              {active ? (
                <LinearGradient colors={theme.gradients.primary} style={styles.dateCardActive}>
                  <Text style={styles.dateTopActive}>{date.dayLabel}</Text>
                  <Text style={styles.dateNumberActive}>{date.dayNumber}</Text>
                  <Text style={styles.dateMonthActive}>{date.month}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.dateCard}>
                  <Text style={styles.dateTop}>{date.dayLabel}</Text>
                  <Text style={styles.dateNumber}>{date.dayNumber}</Text>
                  <Text style={styles.dateMonth}>{date.month}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.sectionHeading}>{copy.timeSlots}</Text>
      <View style={styles.timeGrid}>
        {bookingTimes.map((time) => {
          const active = selectedTime === time;
          return (
            <Pressable key={time} onPress={() => setSelectedTime(time)} style={styles.timeCellWrap}>
              {active ? (
                <LinearGradient colors={theme.gradients.gold} style={styles.timeCellActive}>
                  <Text style={styles.timeLabelActive}>{time}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.timeCell}>
                  <Text style={styles.timeLabel}>{time}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <Pressable disabled={!selectedTime} style={[styles.confirmWrap, !selectedTime && styles.confirmDisabled]}>
        <LinearGradient colors={selectedTime ? theme.gradients.primary : theme.gradients.disabled} style={styles.confirmButton}>
          <Text style={styles.confirmLabel}>{copy.confirm}</Text>
        </LinearGradient>
      </Pressable>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    color: theme.colors.heading,
    fontSize: 30,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 4,
    color: theme.colors.mutedText,
    fontSize: 14,
  },
  heroCard: {
    marginTop: 20,
    padding: 20,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  heroTitle: {
    color: theme.colors.heading,
    fontSize: 24,
    fontWeight: '900',
  },
  heroText: {
    marginTop: 10,
    color: '#E5DFDB',
    fontSize: 15,
    lineHeight: 22,
  },
  sectionHeading: {
    marginTop: 24,
    marginBottom: 14,
    color: theme.colors.heading,
    fontSize: 22,
    fontWeight: '900',
  },
  dateRow: {
    gap: 12,
    paddingRight: 20,
  },
  dateCardWrap: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  dateCard: {
    width: 88,
    paddingVertical: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  dateCardActive: {
    width: 88,
    paddingVertical: 16,
    alignItems: 'center',
  },
  dateTop: {
    color: theme.colors.mutedText,
    fontSize: 12,
    fontWeight: '700',
  },
  dateNumber: {
    marginTop: 8,
    color: theme.colors.heading,
    fontSize: 28,
    fontWeight: '900',
  },
  dateMonth: {
    marginTop: 4,
    color: theme.colors.mutedText,
    fontSize: 12,
  },
  dateTopActive: {
    color: theme.colors.surface,
    fontSize: 12,
    fontWeight: '700',
  },
  dateNumberActive: {
    marginTop: 8,
    color: theme.colors.surface,
    fontSize: 28,
    fontWeight: '900',
  },
  dateMonthActive: {
    marginTop: 4,
    color: theme.colors.surface,
    fontSize: 12,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeCellWrap: {
    width: '22%',
    borderRadius: 18,
    overflow: 'hidden',
  },
  timeCell: {
    minHeight: 46,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeCellActive: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeLabel: {
    color: theme.colors.heading,
    fontSize: 13,
    fontWeight: '700',
  },
  timeLabelActive: {
    color: '#1A1203',
    fontSize: 13,
    fontWeight: '900',
  },
  confirmWrap: {
    marginTop: 30,
    borderRadius: 999,
    overflow: 'hidden',
  },
  confirmDisabled: {
    opacity: 0.6,
  },
  confirmButton: {
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmLabel: {
    color: theme.colors.surface,
    fontSize: 17,
    fontWeight: '900',
  },
});
