import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PAGE_BOTTOM_PADDING, PAGE_TOP_PADDING } from '../components/Screen';
import { businessRepository } from '../features/business/businessRepository';
import { restaurantsRepository } from '../repositories/restaurantsRepository';
import { theme } from '../theme';
import type { PlaceForEditing, PlaceHour, PlaceImage } from '../repositories/types';

const DAY_LABELS: Record<string, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const PRICE_RANGES = [
  { key: '€', label: 'Budget' },
  { key: '€€', label: 'Moderate' },
  { key: '€€€', label: 'Upscale' },
  { key: '€€€€', label: 'Fine Dining' },
];

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

type EditRestaurantScreenProps = {
  navigation: NavigationProp<ParamListBase>;
  route: { params: { placeId: string } };
};

export function EditRestaurantScreen({ navigation, route }: EditRestaurantScreenProps) {
  const { placeId } = route.params;
  const [place, setPlace] = useState<PlaceForEditing | null>(null);
  const [images, setImages] = useState<PlaceImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [tagline, setTagline] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [hours, setHours] = useState<PlaceHour[]>([]);

  const nav = navigation as NavigationProp<ParamListBase & Record<string, object | undefined>>;

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const [data, imgs] = await Promise.all([
          businessRepository.getPlaceForEditing(placeId),
          businessRepository.getPlaceImages(placeId).catch(() => [] as PlaceImage[]),
        ]);
        if (data) {
          setPlace(data);
          setName(data.name ?? '');
          setDescription(data.description ?? '');
          setAddress(data.address ?? '');
          setPhone(data.phone ?? '');
          setEmail(data.email ?? '');
          setWebsite(data.website ?? '');
          setCuisine(data.cuisine ?? '');
          setTagline(data.tagline ?? '');
          setPriceRange(data.priceRange ?? '');

          // Ensure all 7 days exist
          const existingMap = new Map(data.hours.map((h) => [h.dayOfWeek, h]));
          const filledHours: PlaceHour[] = DAY_KEYS.map((day) => {
            const existing = existingMap.get(day);
            return existing ?? { dayOfWeek: day, openTime: null, closeTime: null, isClosed: false };
          });
          setHours(filledHours);
        }
        setImages(imgs);
        setLoading(false);
      };
      void load();
    }, [placeId])
  );

  const updateHour = (index: number, field: keyof PlaceHour, value: string | boolean) => {
    setHours((prev) => {
      const next = [...prev];
      if (field === 'isClosed') {
        next[index] = { ...next[index], isClosed: value as boolean };
      } else if (field === 'openTime' || field === 'closeTime') {
        next[index] = { ...next[index], [field]: value as string };
      }
      return next;
    });
  };

  const validateHours = (): boolean => {
    for (const h of hours) {
      if (h.isClosed) continue;
      if (h.openTime && !TIME_RE.test(h.openTime)) {
        Alert.alert('Invalid Time', `Open time for ${DAY_LABELS[h.dayOfWeek] ?? h.dayOfWeek} must be HH:MM format (e.g. 09:00).`);
        return false;
      }
      if (h.closeTime && !TIME_RE.test(h.closeTime)) {
        Alert.alert('Invalid Time', `Close time for ${DAY_LABELS[h.dayOfWeek] ?? h.dayOfWeek} must be HH:MM format (e.g. 22:00).`);
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Restaurant name is required.');
      return;
    }

    if (!validateHours()) return;

    setSaving(true);
    try {
      await businessRepository.updatePlaceDetails(placeId, {
        name: name.trim(),
        description: description.trim() || undefined,
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        website: website.trim() || undefined,
        cuisine: cuisine.trim() || undefined,
        tagline: tagline.trim() || undefined,
        priceRange: priceRange || undefined,
        hours,
      });

      // Refresh cache: clear stale data, then immediately re-fetch fresh detail
      restaurantsRepository.clearPlaceCache(placeId);
      await restaurantsRepository.getByIdAsync(placeId);

      navigation.goBack();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save.';
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  };

  // ─── Loading State ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!place) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={40} color={theme.colors.mutedText} />
        <Text style={styles.errorText}>Place not found</Text>
      </View>
    );
  }

  // ─── Header ───────────────────────────────────────────────────────────────

  const primaryImage = images.find((img) => img.isPrimary) ?? images[0];

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Thumbnail header */}
        <Pressable
          style={styles.thumbnailCard}
          onPress={() => nav.navigate('GalleryManager', { placeId })}
        >
          {primaryImage ? (
            <Image source={{ uri: primaryImage.imageUrl }} style={styles.thumbnail} />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Ionicons name="restaurant-outline" size={36} color={theme.colors.mutedText} />
            </View>
          )}
          <View style={styles.thumbnailOverlay}>
            <Ionicons name="camera-outline" size={18} color={theme.colors.surface} />
            <Text style={styles.thumbnailLabel}>
              {images.length > 0 ? `${images.length} photos — Manage` : 'Add Photos'}
            </Text>
          </View>
        </Pressable>

        {/* Name */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Restaurant Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Restaurant name"
            placeholderTextColor={theme.colors.mutedText}
            maxLength={100}
          />
        </View>

        {/* Description */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Brief description of your restaurant"
            placeholderTextColor={theme.colors.mutedText}
            multiline
            numberOfLines={3}
            maxLength={500}
          />
        </View>

        {/* Cuisine + Price Range side by side */}
        <View style={styles.rowGroup}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Cuisine</Text>
            <TextInput
              style={styles.input}
              value={cuisine}
              onChangeText={setCuisine}
              placeholder="Italian, Traditional..."
              placeholderTextColor={theme.colors.mutedText}
              maxLength={50}
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Price Range</Text>
            <View style={styles.chipRow}>
              {PRICE_RANGES.map((pr) => (
                <Pressable
                  key={pr.key}
                  style={[styles.chip, priceRange === pr.key && styles.chipActive]}
                  onPress={() => setPriceRange(priceRange === pr.key ? '' : pr.key)}
                >
                  <Text style={[styles.chipText, priceRange === pr.key && styles.chipTextActive]}>
                    {pr.key}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Tagline */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Tagline</Text>
          <TextInput
            style={styles.input}
            value={tagline}
            onChangeText={setTagline}
            placeholder="Short marketing tagline"
            placeholderTextColor={theme.colors.mutedText}
            maxLength={100}
          />
        </View>

        {/* Address */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="Street address"
            placeholderTextColor={theme.colors.mutedText}
            maxLength={200}
          />
        </View>

        {/* Contact fields */}
        <Text style={styles.sectionHeading}>Contact Information</Text>

        {/* Phone */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+383 44 000 000"
            placeholderTextColor={theme.colors.mutedText}
            keyboardType="phone-pad"
            maxLength={30}
          />
        </View>

        {/* Email */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="info@yourrestaurant.com"
            placeholderTextColor={theme.colors.mutedText}
            keyboardType="email-address"
            autoCapitalize="none"
            maxLength={100}
          />
        </View>

        {/* Website */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Website</Text>
          <TextInput
            style={styles.input}
            value={website}
            onChangeText={setWebsite}
            placeholder="https://yourrestaurant.com"
            placeholderTextColor={theme.colors.mutedText}
            keyboardType="url"
            autoCapitalize="none"
            maxLength={200}
          />
        </View>

        {/* Opening Hours */}
        <Text style={styles.sectionHeading}>Opening Hours</Text>
        <Text style={styles.sectionHelp}>
          Enter times in HH:MM format (e.g. 09:00). Toggle off for closed days.
        </Text>
        <View style={styles.hoursList}>
          {hours.map((h, i) => (
            <View key={h.dayOfWeek} style={styles.hourRow}>
              <Text style={styles.dayLabel}>
                {DAY_LABELS[h.dayOfWeek] ?? h.dayOfWeek}
              </Text>
              <Switch
                value={!h.isClosed}
                onValueChange={(val) => updateHour(i, 'isClosed', !val)}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(66,217,140,0.4)' }}
                thumbColor={!h.isClosed ? '#42D98C' : '#555'}
              />
              {!h.isClosed ? (
                <View style={styles.timeInputs}>
                  <TextInput
                    style={styles.timeInput}
                    value={h.openTime ?? ''}
                    onChangeText={(v) => updateHour(i, 'openTime', v)}
                    placeholder="09:00"
                    placeholderTextColor={theme.colors.mutedText}
                    maxLength={5}
                    keyboardType="numbers-and-punctuation"
                  />
                  <Text style={styles.timeDash}>-</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={h.closeTime ?? ''}
                    onChangeText={(v) => updateHour(i, 'closeTime', v)}
                    placeholder="22:00"
                    placeholderTextColor={theme.colors.mutedText}
                    maxLength={5}
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
              ) : (
                <Text style={styles.closedLabel}>Closed</Text>
              )}
            </View>
          ))}
        </View>

        {/* Save */}
        <Pressable
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={theme.colors.surface} />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
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
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: PAGE_TOP_PADDING,
    paddingBottom: PAGE_BOTTOM_PADDING,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    gap: 10,
  },
  errorText: {
    color: theme.colors.mutedText,
    fontSize: 16,
  },

  // ─── Thumbnail Card ────────────────────────────────────────────

  thumbnailCard: {
    marginTop: 25,
    height: 180,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbnailPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  thumbnailLabel: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: '700',
  },

  // ─── Form ──────────────────────────────────────────────────────

  formGroup: {
    marginTop: 20,
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

  // ─── Row Group ─────────────────────────────────────────────────

  rowGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  halfField: {
    flex: 1,
  },

  // ─── Price Range Chips ─────────────────────────────────────────

  chipRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chipActive: {
    backgroundColor: 'rgba(255,31,61,0.2)',
    borderColor: 'rgba(255,31,61,0.4)',
  },
  chipText: {
    color: theme.colors.mutedText,
    fontSize: 14,
    fontWeight: '700',
  },
  chipTextActive: {
    color: theme.colors.heading,
  },

  // ─── Section Heading ───────────────────────────────────────────

  sectionHeading: {
    marginTop: 28,
    color: theme.colors.heading,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 6,
  },
  sectionHelp: {
    color: theme.colors.mutedText,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },

  // ─── Hours ─────────────────────────────────────────────────────

  hoursList: {
    gap: 10,
  },
  hourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  dayLabel: {
    color: theme.colors.heading,
    fontSize: 13,
    fontWeight: '600',
    width: 80,
  },
  timeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  timeInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: theme.colors.heading,
    fontSize: 13,
    textAlign: 'center',
  },
  timeDash: {
    color: theme.colors.mutedText,
    fontSize: 13,
  },
  closedLabel: {
    color: theme.colors.mutedText,
    fontSize: 13,
    fontStyle: 'italic',
    flex: 1,
  },

  // ─── Save Button ───────────────────────────────────────────────

  saveButton: {
    marginTop: 30,
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '800',
  },
});