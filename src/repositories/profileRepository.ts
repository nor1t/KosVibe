import type { IProfileRepository, ProfileData, Activity, QuickLink, BookingDate } from './types';

/**
 * Sprint 11 — Profile Repository (static data inlined)
 *
 * Profile stats, achievements, quick links, settings, and booking data
 * are static UI configuration. They're inlined here to remove the
 * mockData.ts dependency. Can be migrated to DB tables later.
 */

const profileStats = [
  { id: 'bookings', icon: 'calendar-outline', value: '0', label: 'Bookings' },
  { id: 'favorites', icon: 'heart-outline', value: '0', label: 'Favorites' },
  { id: 'reviews', icon: 'star-outline', value: '0', label: 'Reviews' },
];

const profileAchievements = [
  { id: 'first-booking', icon: 'star' as const, title: 'First Booking', subtitle: 'Make your first reservation', status: 'Locked', unlocked: false },
  { id: 'food-lover', icon: 'heart' as const, title: 'Food Lover', subtitle: 'Save 10+ favorites', status: 'Locked', unlocked: false },
  { id: 'reviewer', icon: 'create' as const, title: 'Reviewer', subtitle: 'Write 5+ reviews', status: 'Locked', unlocked: false },
  { id: 'vip', icon: 'diamond' as const, title: 'VIP Member', subtitle: 'Book 25 tables', status: 'Locked', unlocked: false },
];

const recentActivity: Activity[] = [];

const profileQuickLinks: QuickLink[] = [
  { id: 'favorites', icon: 'heart-outline', label: 'My Favorites' },
  { id: 'reviews', icon: 'star-outline', label: 'My Reviews' },
  { id: 'history', icon: 'calendar-outline', label: 'Reservation History' },
  { id: 'visited', icon: 'location-outline', label: 'Visited Places' },
];

const settingsLanguages = [
  { id: 'en', flag: '🇬🇧', label: 'English', selected: true },
  { id: 'sq', flag: '🇽🇰', label: 'Albanian', selected: false },
];

const notificationOptions = [
  { id: 'offers', title: 'Offers & Promotions', subtitle: 'Get notifications about new offers', enabled: true },
  { id: 'reservations', title: 'Reservations', subtitle: 'Reminders for your reservations', enabled: true },
  { id: 'reviews', title: 'Reviews', subtitle: 'Notifications about new reviews', enabled: false },
];

const accountLinks: QuickLink[] = [
  { id: 'profile', icon: 'person-outline', label: 'My Profile' },
  { id: 'addresses', icon: 'location-sharp', label: 'Addresses' },
  { id: 'payments', icon: 'card-outline', label: 'Payment Methods' },
  { id: 'help', icon: 'help-circle-outline', label: 'Help & Support' },
  { id: 'logout', icon: 'log-out-outline', label: 'Sign Out', tone: 'danger' },
];

const bookingDates: BookingDate[] = [
  { id: 'today-22', dayLabel: 'Today', dayNumber: '22', month: 'Apr', isToday: true },
  { id: 'thu-23', dayLabel: 'Thu', dayNumber: '23', month: 'Apr' },
  { id: 'fri-24', dayLabel: 'Fri', dayNumber: '24', month: 'Apr' },
  { id: 'sat-25', dayLabel: 'Sat', dayNumber: '25', month: 'Apr' },
  { id: 'sun-26', dayLabel: 'Sun', dayNumber: '26', month: 'Apr' },
];

const bookingTimes = [
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00',
];

export class ProfileRepository implements IProfileRepository {
  getProfileData(): ProfileData {
    return {
      stats: profileStats.map((s) => ({ ...s })),
      achievements: profileAchievements.map((a) => ({ ...a })),
      recentActivity: recentActivity.map((a) => ({ ...a })),
      quickLinks: profileQuickLinks.map((l) => ({ ...l })),
      settingsLanguages: settingsLanguages.map((l) => ({ ...l })),
      notificationOptions: notificationOptions.map((o) => ({ ...o })),
      accountLinks: accountLinks.map((l) => ({ ...l })),
      bookingDates: bookingDates.map((d) => ({ ...d })),
      bookingTimes: [...bookingTimes],
    };
  }
}

export const profileRepository = new ProfileRepository();