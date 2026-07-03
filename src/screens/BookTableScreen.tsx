import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PAGE_BOTTOM_PADDING, PAGE_TOP_PADDING } from '../components/Screen';
import { useAuth } from '../features/auth/AuthProvider';
import { reservationRepository } from '../features/reservations/reservationRepository';
import { useI18n } from '../i18n/I18nProvider';
import { nativeCopy } from '../i18n/nativeCopy';
import { useRestaurantCatalog } from '../lib/restaurant-catalog';
import { restaurantsRepository } from '../repositories/restaurantsRepository';
import { theme } from '../theme';

type BookTableRoute = RouteProp<{ BookTable: { restaurantId: string } }, 'BookTable'>;

type BookTableScreenProps = {
  navigation: NavigationProp<ParamListBase>;
  route: BookTableRoute;
};

function generateDates(): { label: string; number: string; month: string; iso: string }[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const dates: { label: string; number: string; month: string; iso: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : days[d.getDay()];
    dates.push({ label, number: String(d.getDate()), month: months[d.getMonth()], iso });
  }
  return dates;
}

const TIME_SLOTS = [
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00',
];

const PARTY_SIZES = [1, 2, 3, 4, 5, 6, 7, 8];

export function BookTableScreen({ navigation, route }: BookTableScreenProps) {
  const { language } = useI18n();
  const copy = nativeCopy[language].booking;
  const { user } = useAuth();
  const { getRestaurantById: getCatalogRestaurantById } = useRestaurantCatalog();
  const dates = useMemo(() => generateDates(), []);
  const restaurant =
    getCatalogRestaurantById(route.params.restaurantId) ??
    restaurantsRepository.getById(route.params.restaurantId);

  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [partySize, setPartySize] = useState(2);
  const [customerName, setCustomerName] = useState(
    typeof user?.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : '',
  );
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState(user?.email ?? '');
  const [specialRequests, setSpecialRequests] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isValid = selectedTime !== null && customerName.trim().length > 0;

  const handleConfirm = async () => {
    if (!isValid || !user) return;

    setSubmitting(true);
    try {
      await reservationRepository.createReservation({
        placeId: route.params.restaurantId,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        partySize,
        reservationDate: selectedDate.iso,
        reservationTime: selectedTime,
        specialRequests: specialRequests.trim() || undefined,
      });

      Alert.alert(
        'Reservation Confirmed',
        `Your table for ${partySize} on ${selectedDate.label} ${selectedDate.number} ${selectedDate.month} at ${selectedTime} has been requested.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create reservation.';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>{copy.title}</Text>
            <Text style={styles.subtitle}>{restaurant?.name ?? copy.fallbackRestaurant}</Text>
          </View>
        </View>

        {/* Date selection */}
        <Text style={styles.sectionHeading}>{copy.dates}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
          {dates.map((date) => {
            const active = date.iso === selectedDate.iso;
            return (
              <Pressable key={date.iso} onPress={() => setSelectedDate(date)} style={styles.dateCardWrap}>
                {active ? (
                  <LinearGradient colors={theme.gradients.primary} style={styles.dateCardActive}>
                    <Text style={styles.dateTopActive}>{date.label}</Text>
                    <Text style={styles.dateNumberActive}>{date.number}</Text>
                    <Text style={styles.dateMonthActive}>{date.month}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.dateCard}>
                    <Text style={styles.dateTop}>{date.label}</Text>
                    <Text style={styles.dateNumber}>{date.number}</Text>
                    <Text style={styles.dateMonth}>{date.month}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Time selection */}
        <Text style={styles.sectionHeading}>{copy.timeSlots}</Text>
        <View style={styles.timeGrid}>
          {TIME_SLOTS.map((time) => {
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

        {/* Party size */}
        <Text style={styles.sectionHeading}>Party Size</Text>
        <View style={styles.partyRow}>
          {PARTY_SIZES.map((size) => {
            const active = partySize === size;
            return (
              <Pressable
                key={size}
                style={[styles.partyChip, active && styles.partyChipActive]}
                onPress={() => setPartySize(size)}
              >
                <Text style={[styles.partyChipText, active && styles.partyChipTextActive]}>
                  {size}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Customer details */}
        <Text style={styles.sectionHeading}>Your Details</Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="Your name"
            placeholderTextColor={theme.colors.mutedText}
            maxLength={100}
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={customerPhone}
            onChangeText={setCustomerPhone}
            placeholder="+383 44 000 000"
            placeholderTextColor={theme.colors.mutedText}
            keyboardType="phone-pad"
            maxLength={30}
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={customerEmail}
            onChangeText={setCustomerEmail}
            placeholder="your@email.com"
            placeholderTextColor={theme.colors.mutedText}
            keyboardType="email-address"
            autoCapitalize="none"
            maxLength={100}
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Special Requests</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={specialRequests}
            onChangeText={setSpecialRequests}
            placeholder="Allergies, seating preferences, occasion..."
            placeholderTextColor={theme.colors.mutedText}
            multiline
            numberOfLines={3}
            maxLength={300}
          />
        </View>

        {/* Summary card */}
        {selectedTime && (
          <LinearGradient colors={['rgba(255,31,61,0.12)', 'rgba(255,179,0,0.06)']} style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Ionicons name="restaurant-outline" size={16} color={theme.colors.secondary} />
              <Text style={styles.summaryText}>{restaurant?.name ?? copy.fallbackRestaurant}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Ionicons name="calendar-outline" size={16} color={theme.colors.secondary} />
              <Text style={styles.summaryText}>{selectedDate.label}, {selectedDate.number} {selectedDate.month}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Ionicons name="time-outline" size={16} color={theme.colors.secondary} />
              <Text style={styles.summaryText}>{selectedTime}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Ionicons name="people-outline" size={16} color={theme.colors.secondary} />
              <Text style={styles.summaryText}>{partySize} {partySize === 1 ? 'guest' : 'guests'}</Text>
            </View>
          </LinearGradient>
        )}

        {/* Confirm button */}
        <Pressable
          disabled={!isValid || submitting}
          style={[styles.confirmWrap, (!isValid || submitting) && styles.confirmDisabled]}
          onPress={handleConfirm}
        >
          <LinearGradient colors={isValid ? theme.gradients.primary : theme.gradients.disabled} style={styles.confirmButton}>
            {submitting ? (
              <ActivityIndicator size="small" color={theme.colors.surface} />
            ) : (
              <Text style={styles.confirmLabel}>{copy.confirm}</Text>
            )}
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: PAGE_TOP_PADDING,
    paddingBottom: PAGE_BOTTOM_PADDING,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
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
  partyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  partyChip: {
    width: 52,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  partyChipActive: {
    backgroundColor: 'rgba(255,31,61,0.2)',
    borderColor: 'rgba(255,31,61,0.4)',
  },
  partyChipText: {
    color: theme.colors.heading,
    fontSize: 16,
    fontWeight: '700',
  },
  partyChipTextActive: {
    color: theme.colors.surface,
    fontWeight: '800',
  },
  formGroup: {
    marginTop: 16,
  },
  label: {
    color: theme.colors.heading,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: theme.colors.heading,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  summaryCard: {
    marginTop: 24,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryText: {
    color: theme.colors.heading,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmWrap: {
    marginTop: 30,
    marginBottom: 20,
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