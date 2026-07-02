import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { usePageSpacing } from '../components/Screen';
import { useAuth } from '../features/auth/AuthProvider';
import { useI18n } from '../i18n/I18nProvider';
import { nativeCopy } from '../i18n/nativeCopy';
import { useScrollBehavior } from '../lib/scroll-behavior';
import { eventsRepository } from '../repositories/eventsRepository';
import type { TavolinaInvite } from '../repositories/types';
import { uploadEventImage } from '../lib/storage';
import { theme } from '../theme';

type TavolinaScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

type EventInvite = Omit<TavolinaInvite, 'restaurantId'> & {
  restaurantId?: string;
};

type EventType = 'food' | 'culture' | 'nightlife' | 'other';

type ComposerEventType = EventType;

type CreatorProfile = {
  name: string;
  avatar: string;
  rating: number;
  eventCount: number;
  confirmedGuests: number;
  reliability: string;
  badges: string[];
  recentPraise: string[];
};

const moodKeys = ['all', 'food', 'culture', 'nightlife', 'other'] as const;

const eventTypeLabelIndex: Record<EventType, number> = {
  food: 1,
  culture: 2,
  nightlife: 3,
  other: 4,
};

const eventTypeIcons: Record<EventType, keyof typeof Ionicons.glyphMap> = {
  food: 'restaurant-outline',
  culture: 'color-palette-outline',
  nightlife: 'wine-outline',
  other: 'grid-outline',
};

const eventTypeColors: Record<EventType, readonly [string, string]> = {
  food: theme.gradients.primary,
  culture: ['#5DA7FF', '#2F6BFF'] as const,
  nightlife: ['#A43AFF', '#7C3AED'] as const,
  other: ['#22C55E', '#16A34A'] as const,
};

const eventImages = [
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=80',
];

const fallbackHostProfile = {
  rating: 0,
  eventCount: 0,
  confirmedGuests: 0,
  reliability: 'New host',
  badges: ['New to KosVibe'],
  recentPraise: ['Welcome them to the community!'],
};

const hostProfileOverrides: Record<string, Partial<CreatorProfile>> = {};

function formatSpotsLabel(spotsLabel: string, joined: boolean) {
  const match = spotsLabel.match(/^(\d+)\/(\d+)(.*)$/);
  if (!match) return spotsLabel;
  const current = Number(match[1]);
  const total = Number(match[2]);
  const suffix = match[3] ?? '';
  const visibleCurrent = joined ? Math.min(current + 1, total) : current;
  return `${visibleCurrent}/${total}${suffix}`;
}

function getCreatorProfile(invite: EventInvite): CreatorProfile {
  const override = hostProfileOverrides[invite.creator] ?? {};
  return {
    name: invite.creator,
    avatar: invite.creatorAvatar,
    ...fallbackHostProfile,
    ...override,
  };
}

export function TavolinaScreen({ navigation }: TavolinaScreenProps) {
  const { language } = useI18n();
  const { setScrollOffset } = useScrollBehavior();
  const copy = nativeCopy[language].tavolina;
  const createCopy = copy.createEvent;
  const pageSpacing = usePageSpacing();
  const { user } = useAuth();
  const currentUserName =
    typeof user?.user_metadata?.full_name === 'string' && user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name.trim()
      : user?.email?.split('@')[0];
  const currentUserAvatar =
    typeof user?.user_metadata?.avatar_url === 'string'
      ? user.user_metadata.avatar_url
      : undefined;
  const [events, setEvents] = useState<EventInvite[]>([]);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventInvite | null>(null);
  const [selectedCreatorEvent, setSelectedCreatorEvent] = useState<EventInvite | null>(null);
  const [joinedEventIds, setJoinedEventIds] = useState<Set<string>>(new Set());
  const [presenceConfirmedEventIds, setPresenceConfirmedEventIds] = useState<Set<string>>(new Set());
  const [eventRatings, setEventRatings] = useState<Record<string, number>>({});
  const [selectedMoodIndex, setSelectedMoodIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedComposerType, setSelectedComposerType] = useState<ComposerEventType>('food');
  const [eventName, setEventName] = useState('');
  const [city, setCity] = useState('');
  const [day, setDay] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState(eventImages[0]);
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('');

  // Sprint 12: Load events + attendance + ratings from DB on mount
  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      await eventsRepository.refresh();
      setEvents(eventsRepository.getTavolinaInvites());

      // Load current user's joined/confirmed events and ratings
      try {
        const [joined, confirmed, ratings] = await Promise.all([
          eventsRepository.getAttendedEventIds(),
          eventsRepository.getConfirmedEventIds(),
          eventsRepository.getEventRatings(),
        ]);
        setJoinedEventIds(new Set(joined));
        setPresenceConfirmedEventIds(new Set(confirmed));
        setEventRatings(ratings);
      } catch {
        // Non-critical — UI still works without personal state
      }
      setLoading(false);
    }
    void loadAll();
  }, []);

  const visibleEvents = useMemo(() => {
    const selectedMood = moodKeys[selectedMoodIndex] ?? 'all';
    if (selectedMood === 'all') return events;
    return events.filter((invite) => invite.eventType === selectedMood);
  }, [events, selectedMoodIndex]);

  const selectedCreatorProfile = selectedEvent ? getCreatorProfile(selectedEvent) : null;

  const canProceedToStep2 = selectedComposerType !== null;
  const canProceedToStep3 =
    eventName.trim().length > 2 && city.trim().length > 1 && day.trim().length > 1 && time.trim().length > 0;
  const canPublish = canProceedToStep3 && (!isPaid || (isPaid && price.trim().length > 0));

  const resetForm = () => {
    setCurrentStep(0);
    setSelectedComposerType('food');
    setEventName('');
    setCity('');
    setDay('');
    setTime('');
    setDescription('');
    setSelectedImage(eventImages[0]);
    setLocalImageUri(null);
    setIsPaid(false);
    setPrice('');
    setMaxAttendees('');
  };

  const closeComposer = () => {
    setIsComposerOpen(false);
    resetForm();
  };

  const pickImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]?.uri) return;
    setLocalImageUri(result.assets[0].uri);
    setSelectedImage('');
  };

  const takeImageWithCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera permission needed', 'Please allow camera access to take a photo for your event.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true, aspect: [16, 9], quality: 0.85,
    });
    if (result.canceled || !result.assets[0]?.uri) return;
    setLocalImageUri(result.assets[0].uri);
    setSelectedImage('');
  };

  // Sprint 12: Persist to DB
  const publishEvent = async () => {
    if (!canPublish) return;

    const maxCap = maxAttendees ? parseInt(maxAttendees, 10) : 8;
    const spotsText = language === 'sq' ? `0/${maxCap} vende` : `0/${maxCap} spots`;

    // Upload image to storage if user picked a local image
    let uploadedImageUrl: string | null = null;
    if (localImageUri) {
      uploadedImageUrl = await uploadEventImage(localImageUri);
    }

    const displayImage = uploadedImageUrl || localImageUri || selectedImage || eventImages[0];

    const created = await eventsRepository.createEvent({
      restaurantName: eventName.trim(),
      city: city.trim(),
      day: day.trim(),
      time: time.trim(),
      eventType: selectedComposerType,
      creatorName: currentUserName || 'KosVibe',
      creatorAvatar: uploadedImageUrl || selectedImage || eventImages[0],
      description: description.trim(),
      tags: [copy.moods[eventTypeLabelIndex[selectedComposerType]], city.trim()],
      spotsLabel: spotsText,
      imageUrl: uploadedImageUrl || displayImage,
      isPaid,
      price: isPaid ? price.trim() : undefined,
      maxAttendees: maxCap,
    });

    if (created) {
      setEvents((current) => [created, ...current]);
      setIsComposerOpen(false);
      resetForm();
      setSelectedEvent(created);
    }
  };

  const isSelectedEventJoined = selectedEvent ? joinedEventIds.has(selectedEvent.id) : false;
  const isSelectedEventConfirmed = selectedEvent ? presenceConfirmedEventIds.has(selectedEvent.id) : false;
  const selectedEventRating = selectedEvent ? eventRatings[selectedEvent.id] ?? 0 : 0;

  // Sprint 12: Persist join/leave to DB
  const toggleJoinSelectedEvent = async () => {
    if (!selectedEvent) return;

    const isCurrentlyJoined = joinedEventIds.has(selectedEvent.id);

    if (isCurrentlyJoined) {
      const ok = await eventsRepository.leaveEvent(selectedEvent.id);
      if (ok) {
        setJoinedEventIds((current) => { const n = new Set(current); n.delete(selectedEvent.id); return n; });
        setPresenceConfirmedEventIds((c) => { const n = new Set(c); n.delete(selectedEvent.id); return n; });
        setEventRatings((current) => { const { [selectedEvent.id]: _r, ...rest } = current; return rest; });
      }
    } else {
      const ok = await eventsRepository.joinEvent(selectedEvent.id);
      if (ok) {
        setJoinedEventIds((current) => new Set([...current, selectedEvent.id]));
      }
    }
  };

  // Sprint 12: Persist confirm to DB
  const confirmPresenceForSelectedEvent = async () => {
    if (!selectedEvent || !isSelectedEventJoined) return;
    const ok = await eventsRepository.confirmAttendance(selectedEvent.id);
    if (ok) {
      setPresenceConfirmedEventIds((current) => new Set([...current, selectedEvent.id]));
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    const eventId = selectedEvent.id;
    const ok = await eventsRepository.deleteEvent(eventId);
    if (ok) {
      setSelectedEvent(null);
      setEvents((current) => current.filter((e) => e.id !== eventId));
    }
  };

  const confirmDeleteEvent = () => {
    if (!selectedEvent) return;
    Alert.alert('Delete event', 'Are you sure you want to delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: handleDeleteEvent },
    ]);
  };

  // Sprint 12: Persist rating to DB
  const rateSelectedEvent = async (rating: number) => {
    if (!selectedEvent || !isSelectedEventConfirmed) return;
    const ok = await eventsRepository.rateEvent(selectedEvent.id, rating);
    if (ok) {
      setEventRatings((current) => ({ ...current, [selectedEvent.id]: rating }));
    }
  };

  const renderRatingStars = (value: number, onRate: (r: number) => void, disabled = false) => (
    <View style={[styles.ratingStars, disabled ? styles.ratingStarsDisabled : undefined]}>
      {[1, 2, 3, 4, 5].map((rating) => (
        <Pressable key={rating} disabled={disabled} style={styles.ratingStarButton} onPress={() => onRate(rating)}>
          <Ionicons name={rating <= value ? 'star' : 'star-outline'} size={24} color={disabled ? theme.colors.mutedText : theme.colors.gold} />
        </Pressable>
      ))}
    </View>
  );

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[0, 1, 2].map((step) => (
        <View key={step} style={styles.stepRow}>
          <View style={[styles.stepDot, currentStep === step && styles.stepDotActive, currentStep > step && styles.stepDotCompleted]}>
            {currentStep > step ? <Ionicons name="checkmark" size={14} color={theme.colors.surface} /> : <Text style={[styles.stepNumber, currentStep === step && styles.stepNumberActive]}>{step + 1}</Text>}
          </View>
          {step < 2 && <View style={[styles.stepLine, currentStep > step && styles.stepLineCompleted]} />}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>{createCopy.stepType}</Text>
      <View style={styles.typeGrid}>
        {(['food', 'culture', 'nightlife', 'other'] as const).map((type) => {
          const isActive = selectedComposerType === type;
          const colors = eventTypeColors[type];
          return (
            <Pressable key={type} style={[styles.typeCard, isActive && styles.typeCardActive]} onPress={() => setSelectedComposerType(type)}>
              {isActive ? (
                <View style={[styles.typeCardGradient, { backgroundColor: colors[0] }]}>
                  <View style={styles.typeCardContent}>
                    <Ionicons name={eventTypeIcons[type]} size={32} color={theme.colors.surface} />
                    <Text style={styles.typeCardLabel}>{createCopy[type]}</Text>
                    <View style={styles.typeCardCheck}><Ionicons name="checkmark-circle" size={20} color={theme.colors.surface} /></View>
                  </View>
                </View>
              ) : (
                <View style={styles.typeCardInactive}>
                  <Ionicons name={eventTypeIcons[type]} size={32} color={theme.colors.mutedText} />
                  <Text style={styles.typeCardLabelInactive}>{createCopy[type]}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>{createCopy.stepDetails}</Text>
      <View style={styles.imagePickerSection}>
        {(localImageUri || selectedImage) ? (
          <View style={styles.imagePreviewWrap}>
            <ImageBackground source={{ uri: localImageUri || selectedImage }} style={styles.imagePreview} imageStyle={{ borderRadius: 20 }}>
              <View style={styles.imagePreviewOverlay} />
              <View style={styles.imagePreviewActions}>
                <Pressable style={styles.imageActionButton} onPress={pickImageFromGallery}><Ionicons name="images-outline" size={18} color={theme.colors.surface} /></Pressable>
                <Pressable style={styles.imageActionButton} onPress={takeImageWithCamera}><Ionicons name="camera-outline" size={18} color={theme.colors.surface} /></Pressable>
              </View>
            </ImageBackground>
            <Text style={styles.imageHint}>{createCopy.changePhoto}</Text>
          </View>
        ) : (
          <View style={styles.imagePickerRow}>
            <Pressable style={styles.imagePickerButton} onPress={pickImageFromGallery}><Ionicons name="images-outline" size={24} color={theme.colors.secondary} /><Text style={styles.imagePickerText}>{createCopy.uploadPhoto}</Text></Pressable>
            <Pressable style={styles.imagePickerButton} onPress={takeImageWithCamera}><Ionicons name="camera-outline" size={24} color={theme.colors.secondary} /><Text style={styles.imagePickerText}>{createCopy.takePhoto}</Text></Pressable>
          </View>
        )}
        {!localImageUri && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageOptions}>
            {eventImages.map((image) => {
              const selected = selectedImage === image;
              return (
                <Pressable key={image} style={[styles.imageOption, selected && styles.imageOptionSelected]} onPress={() => setSelectedImage(image)}>
                  <ImageBackground source={{ uri: image }} style={styles.imageOptionFill}>
                    {selected ? <View style={styles.selectedImageBadge}><Ionicons name="checkmark" size={16} color={theme.colors.surface} /></View> : null}
                  </ImageBackground>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>
      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>{createCopy.eventName}</Text>
          <TextInput value={eventName} onChangeText={setEventName} placeholder={createCopy.eventNamePlaceholder} placeholderTextColor={theme.colors.subtle} style={styles.input} />
        </View>
        <View style={styles.formRow}>
          <View style={[styles.field, styles.formRowField]}>
            <Text style={styles.label}>{createCopy.city}</Text>
            <TextInput value={city} onChangeText={setCity} placeholder={createCopy.cityPlaceholder} placeholderTextColor={theme.colors.subtle} style={styles.input} />
          </View>
          <View style={[styles.field, styles.formRowField]}>
            <Text style={styles.label}>{createCopy.day}</Text>
            <TextInput value={day} onChangeText={setDay} placeholder={createCopy.dayPlaceholder} placeholderTextColor={theme.colors.subtle} style={styles.input} />
          </View>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>{createCopy.time}</Text>
          <TextInput value={time} onChangeText={setTime} placeholder={createCopy.timePlaceholder} placeholderTextColor={theme.colors.subtle} style={styles.input} />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>{createCopy.description}</Text>
          <TextInput value={description} onChangeText={setDescription} placeholder={createCopy.descriptionPlaceholder} placeholderTextColor={theme.colors.subtle} multiline textAlignVertical="top" style={[styles.input, styles.descriptionInput]} />
        </View>
      </View>
    </ScrollView>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>{createCopy.stepPricing}</Text>
      <View style={styles.pricingToggle}>
        <Pressable style={[styles.pricingOption, !isPaid && styles.pricingOptionActive]} onPress={() => setIsPaid(false)}>
          <Ionicons name={!isPaid ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={!isPaid ? theme.colors.success : theme.colors.mutedText} />
          <Text style={[styles.pricingLabel, !isPaid && styles.pricingLabelActive]}>{createCopy.isFree}</Text>
        </Pressable>
        <Pressable style={[styles.pricingOption, isPaid && styles.pricingOptionActive]} onPress={() => setIsPaid(true)}>
          <Ionicons name={isPaid ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={isPaid ? theme.colors.secondary : theme.colors.mutedText} />
          <Text style={[styles.pricingLabel, isPaid && styles.pricingLabelActive]}>{createCopy.isPaid}</Text>
        </Pressable>
      </View>
      {isPaid && (
        <View style={styles.field}>
          <Text style={styles.label}>{createCopy.price}</Text>
          <TextInput value={price} onChangeText={setPrice} placeholder={createCopy.pricePlaceholder} placeholderTextColor={theme.colors.subtle} keyboardType="default" returnKeyType="done" style={styles.input} />
        </View>
      )}
      <View style={styles.field}>
        <Text style={styles.label}>{createCopy.maxAttendees}</Text>
        <TextInput value={maxAttendees} onChangeText={setMaxAttendees} placeholder={createCopy.maxAttendeesPlaceholder} placeholderTextColor={theme.colors.subtle} keyboardType="default" returnKeyType="done" style={styles.input} />
      </View>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>{eventName || createCopy.eventNamePlaceholder}</Text>
        <View style={styles.summaryRow}><Ionicons name="location-outline" size={14} color={theme.colors.mutedText} /><Text style={styles.summaryText}>{city || createCopy.cityPlaceholder}</Text></View>
        <View style={styles.summaryRow}><Ionicons name="calendar-outline" size={14} color={theme.colors.mutedText} /><Text style={styles.summaryText}>{day || createCopy.dayPlaceholder} | {time || createCopy.timePlaceholder}</Text></View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryBadgeRow}>
          <View style={styles.summaryBadge}><Text style={styles.summaryBadgeText}>{isPaid ? createCopy.paidLabel : createCopy.freeLabel}</Text></View>
          {maxAttendees ? <View style={styles.summaryBadge}><Ionicons name="people-outline" size={12} color={theme.colors.secondary} /><Text style={styles.summaryBadgeText}>{maxAttendees} {createCopy.capacityLabel}</Text></View> : null}
          {isPaid && price ? <View style={styles.summaryBadge}><Text style={styles.summaryBadgeText}>{price}</Text></View> : null}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingHorizontal: pageSpacing.horizontalPadding, paddingTop: pageSpacing.topPadding, paddingBottom: pageSpacing.bottomPadding }]}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => setScrollOffset(event.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>{copy.eyebrow}</Text>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.subtitle}>{copy.subtitle}</Text>
        </View>
        <View style={styles.actionBar}>
          {copy.moods.map((mood, index) => (
            <Pressable key={mood} style={[styles.moodChip, index === selectedMoodIndex && styles.moodChipActive]} onPress={() => setSelectedMoodIndex(index)}>
              <Text style={[styles.moodLabel, index === selectedMoodIndex && styles.moodLabelActive]}>{mood}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.sectionHeading}>{copy.communityDrops}</Text>
        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}><Text style={{ color: theme.colors.mutedText, fontWeight: '600' }}>Loading events...</Text></View>
        ) : (
          <View style={styles.inviteList}>
            {visibleEvents.map((invite, index) => (
              <Pressable key={invite.id} style={styles.inviteCard} onPress={() => setSelectedEvent(invite)}>
                <ImageBackground source={{ uri: invite.image }} style={styles.inviteImage}>
                  <View style={styles.imageShade} />
                  <View style={styles.inviteTypeBadge}><Text style={styles.inviteTypeBadgeText}>{copy.moods[eventTypeLabelIndex[invite.eventType]]}</Text></View>
                  <View style={[styles.inviteBadge, index % 2 === 0 ? styles.inviteRed : styles.inviteGold]}>
                    <Ionicons name={index % 2 === 0 ? 'flame-outline' : 'sparkles-outline'} size={18} color={theme.colors.surface} />
                  </View>
                </ImageBackground>
                <View style={styles.inviteBody}>
                  <View style={styles.inviteRow}>
                    <View style={styles.inviteCopy}>
                      <Text style={styles.inviteTitle}>{invite.restaurantName}</Text>
                      <Text style={styles.inviteMeta}>{invite.day} | {invite.time} | {invite.city}</Text>
                    </View>
                    <Text style={styles.spotsLabel}>{formatSpotsLabel(invite.spotsLabel, joinedEventIds.has(invite.id))}</Text>
                  </View>
                  <Text style={styles.inviteDescription}>{invite.description}</Text>
                  <View style={styles.inviteMetaRow}>
                    <View style={styles.tagRow}>
                      {invite.tags.map((tag) => (<View key={`${invite.id}-${tag}`} style={styles.tag}><Text style={styles.tagLabel}>{tag}</Text></View>))}
                    </View>
                    {invite.isPaid && invite.price ? (<View style={styles.priceBadge}><Ionicons name="cash-outline" size={12} color={theme.colors.gold} /><Text style={styles.priceBadgeText}>{invite.price}</Text></View>) : null}
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <Pressable accessibilityLabel={createCopy.stepType} style={[styles.createFab, { bottom: Math.max(pageSpacing.bottomPadding + 8, 104) }]} onPress={() => setIsComposerOpen(true)}>
        <Ionicons name="add" size={30} color={theme.colors.surface} />
      </Pressable>

      {/* Multi-step create event modal */}
      <Modal visible={isComposerOpen} transparent={false} animationType="slide" onRequestClose={closeComposer}>
        <View style={styles.composerFullScreen}>
          <View style={[styles.composerHeaderBar, { paddingTop: pageSpacing.topPadding }]}>
            <View>
              <Text style={styles.composerTitle}>{currentStep === 0 ? createCopy.stepType : currentStep === 1 ? createCopy.stepDetails : createCopy.stepPricing}</Text>
              <Text style={styles.composerStepLabel}>Step {currentStep + 1} of 3</Text>
            </View>
            <Pressable style={styles.modalCloseButton} onPress={closeComposer}><Ionicons name="close" size={20} color={theme.colors.surface} /></Pressable>
          </View>
          {renderStepIndicator()}
          <ScrollView
            style={styles.composerBodyScroll}
            contentContainerStyle={styles.composerBodyContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {currentStep === 0 && renderStep1()}
            {currentStep === 1 && renderStep2()}
            {currentStep === 2 && renderStep3()}
          </ScrollView>
          <View style={[styles.modalActions, { paddingBottom: pageSpacing.bottomPadding }]}>
            {currentStep > 0 ? (
              <Pressable style={styles.backButton} onPress={() => { setCurrentStep((s) => s - 1); }}>
                <Ionicons name="chevron-back" size={18} color={theme.colors.heading} />
                <Text style={styles.backButtonText}>{createCopy.back}</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.backButton} onPress={closeComposer}><Text style={styles.backButtonText}>{createCopy.cancel}</Text></Pressable>
            )}
            {currentStep < 2 ? (
              <Pressable disabled={currentStep === 0 ? !canProceedToStep2 : !canProceedToStep3} style={[styles.nextButton, (currentStep === 0 ? !canProceedToStep2 : !canProceedToStep3) && styles.nextButtonDisabled]} onPress={() => setCurrentStep((s) => s + 1)}>
                <Text style={styles.nextButtonText}>{createCopy.next}</Text><Ionicons name="chevron-forward" size={18} color={theme.colors.surface} />
              </Pressable>
            ) : (
              <Pressable disabled={!canPublish} style={[styles.publishButton, !canPublish && styles.publishButtonDisabled]} onPress={publishEvent}>
                <Ionicons name="paper-plane" size={18} color={theme.colors.surface} /><Text style={styles.publishButtonText}>{createCopy.publish}</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>

      {/* Event detail modal */}
      <Modal visible={selectedEvent !== null} transparent animationType="slide" onRequestClose={() => setSelectedEvent(null)}>
        <View style={styles.modalBackdrop}>
          {selectedEvent ? (
            <View style={styles.eventDetailCard}>
              <ScrollView style={styles.eventDetailScroll} contentContainerStyle={styles.eventDetailScrollContent} showsVerticalScrollIndicator={false}>
                <Pressable style={styles.modalHandle} onPress={() => setSelectedEvent(null)} />
                <ImageBackground source={{ uri: selectedEvent.image }} style={styles.eventDetailImage}>
                  <View style={styles.eventDetailShade} />
                  <View style={styles.eventDetailTopRow}>
                    <View style={styles.eventDetailBadge}><Ionicons name="calendar-outline" size={18} color={theme.colors.surface} /><Text style={styles.eventDetailBadgeText}>{createCopy.eventDetails}</Text></View>
                    <Pressable style={styles.modalCloseButton} onPress={() => setSelectedEvent(null)}><Ionicons name="close" size={20} color={theme.colors.surface} /></Pressable>
                  </View>
                </ImageBackground>
                <View style={styles.eventDetailBody}>
                <Text style={styles.eventDetailTitle}>{selectedEvent.restaurantName}</Text>
                <Text style={styles.eventDetailMeta}>{selectedEvent.day} | {selectedEvent.time} | {selectedEvent.city}</Text>
                <View style={styles.eventTrustRow}>
                  <View style={styles.eventTypePill}><Ionicons name={eventTypeIcons[selectedEvent.eventType]} size={13} color={theme.colors.surface} /><Text style={styles.eventTypePillText}>{copy.moods[eventTypeLabelIndex[selectedEvent.eventType]]}</Text></View>
                  <View style={styles.verifiedPill}><Ionicons name="shield-checkmark-outline" size={13} color={theme.colors.success} /><Text style={styles.verifiedPillText}>{selectedCreatorProfile?.rating.toFixed(1)} host</Text></View>
                </View>
                <Pressable style={styles.hostRow} onPress={() => setSelectedCreatorEvent(selectedEvent)}>
                  <ImageBackground source={{ uri: selectedEvent.creatorAvatar }} style={styles.hostAvatar} />
                  <View style={styles.hostCopy}><Text style={styles.hostLabel}>{createCopy.hostedBy}</Text><Text style={styles.hostName}>{selectedEvent.creator}</Text><Text style={styles.hostSubline}>{selectedCreatorProfile?.reliability} | tap for ratings</Text></View>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.mutedText} />
                  <Text style={styles.spotsLabel}>{formatSpotsLabel(selectedEvent.spotsLabel, isSelectedEventJoined)}</Text>
                </Pressable>
                <Text style={styles.eventDetailDescription}>{selectedEvent.description}</Text>
                <View style={styles.tagRow}>{selectedEvent.tags.map((tag) => (<View key={`detail-${selectedEvent.id}-${tag}`} style={styles.tag}><Text style={styles.tagLabel}>{tag}</Text></View>))}</View>
                <View style={styles.attendancePanel}>
                  <View style={styles.attendanceIcon}><Ionicons name={isSelectedEventConfirmed ? 'checkmark-done-outline' : 'ticket-outline'} size={20} color={isSelectedEventConfirmed ? theme.colors.success : theme.colors.secondary} /></View>
                  <View style={styles.attendanceCopy}>
                    <Text style={styles.attendanceTitle}>{isSelectedEventConfirmed ? 'Presence confirmed' : isSelectedEventJoined ? 'Waiting for host confirmation' : 'Join first to request a spot'}</Text>
                    <Text style={styles.attendanceText}>Ratings unlock only after the event maker confirms you attended.</Text>
                  </View>
                </View>
                {isSelectedEventJoined && !isSelectedEventConfirmed ? (
                  <Pressable style={styles.confirmPresenceButton} onPress={confirmPresenceForSelectedEvent}><Ionicons name="shield-checkmark-outline" size={18} color={theme.colors.surface} /><Text style={styles.confirmPresenceText}>Host confirms your presence</Text></Pressable>
                ) : null}
                <View style={styles.ratingPanel}>
                  <View style={styles.ratingHeader}><Text style={styles.ratingTitle}>Rate after attending</Text><Text style={styles.ratingLockText}>{isSelectedEventConfirmed ? 'Unlocked' : 'Locked'}</Text></View>
                  <Text style={styles.ratingLabel}>Event organization</Text>
                  {renderRatingStars(selectedEventRating, rateSelectedEvent, !isSelectedEventConfirmed)}
                </View>
                {selectedEvent.creator !== currentUserName ? (
                  <Pressable style={[styles.joinButton, isSelectedEventJoined && styles.joinButtonActive]} onPress={toggleJoinSelectedEvent}>
                    <Ionicons name={isSelectedEventJoined ? 'checkmark-circle' : 'person-add-outline'} size={20} color={theme.colors.surface} />
                    <Text style={styles.joinButtonText}>{isSelectedEventJoined ? createCopy.joined : createCopy.join}</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    style={styles.deleteEventButton}
                    onPress={confirmDeleteEvent}>
                    <Ionicons name="trash-outline" size={20} color="#FF4D4D" />
                    <Text style={styles.deleteEventButtonText}>Delete event</Text>
                  </Pressable>
                )}
                </View>
              </ScrollView>
            </View>
          ) : null}
        </View>
      </Modal>

      {/* Creator profile modal */}
      <Modal visible={selectedCreatorEvent !== null} transparent animationType="fade" onRequestClose={() => setSelectedCreatorEvent(null)}>
        <Pressable style={styles.profileBackdrop} onPress={() => setSelectedCreatorEvent(null)}>
          {selectedCreatorEvent ? (
            <Pressable style={styles.creatorProfileCard} onPress={(event) => event.stopPropagation()}>
              {(() => {
                const profile = getCreatorProfile(selectedCreatorEvent);
                return (
                  <>
                    <View style={styles.creatorProfileTop}>
                      <Image source={{ uri: profile.avatar }} style={styles.creatorProfileAvatar} />
                      <View style={styles.creatorProfileCopy}>
                        <Text style={styles.creatorProfileEyebrow}>Event maker</Text>
                        <Text style={styles.creatorProfileName}>{profile.name}</Text>
                        <Text style={styles.creatorProfileMeta}>{profile.reliability}</Text>
                      </View>
                      <Pressable style={styles.modalCloseButton} onPress={() => setSelectedCreatorEvent(null)}><Ionicons name="close" size={20} color={theme.colors.surface} /></Pressable>
                    </View>
                    <View style={styles.creatorStatsGrid}>
                      <View style={styles.creatorStat}><Text style={styles.creatorStatValue}>{profile.rating.toFixed(1)}</Text><Text style={styles.creatorStatLabel}>Host rating</Text></View>
                      <View style={styles.creatorStat}><Text style={styles.creatorStatValue}>{profile.eventCount}</Text><Text style={styles.creatorStatLabel}>Events</Text></View>
                      <View style={styles.creatorStat}><Text style={styles.creatorStatValue}>{profile.confirmedGuests}</Text><Text style={styles.creatorStatLabel}>Confirmed</Text></View>
                    </View>
                    <View style={styles.creatorBadgeRow}>{profile.badges.map((badge) => (<View key={badge} style={styles.creatorBadge}><Ionicons name="sparkles-outline" size={12} color={theme.colors.gold} /><Text style={styles.creatorBadgeText}>{badge}</Text></View>))}</View>
                    <View style={styles.creatorPraisePanel}>
                      <Text style={styles.creatorPraiseTitle}>Recent guest notes</Text>
                      {profile.recentPraise.map((praise) => (<Text key={praise} style={styles.creatorPraiseText}>- {praise}</Text>))}
                    </View>
                  </>
                );
              })()}
            </Pressable>
          ) : null}
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: {},
  header: { marginBottom: 24 },
  eyebrow: { color: theme.colors.secondary, fontSize: 13, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  title: { marginTop: 10, color: theme.colors.heading, fontSize: 44, lineHeight: 42, fontWeight: '900', letterSpacing: -1.8, width: '100%' },
  subtitle: { marginTop: 12, color: theme.colors.mutedText, fontSize: 16, lineHeight: 24, maxWidth: 320 },
  actionBar: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  moodChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  moodChipActive: { backgroundColor: 'rgba(255,31,61,0.18)', borderColor: 'rgba(255,31,61,0.38)' },
  moodLabel: { color: theme.colors.mutedText, fontWeight: '700' },
  moodLabelActive: { color: theme.colors.heading },
  sectionHeading: { marginTop: 28, color: theme.colors.heading, fontSize: 24, fontWeight: '900' },
  inviteList: { marginTop: 16, gap: 16 },
  inviteCard: { borderRadius: 26, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  inviteImage: { height: 164, justifyContent: 'flex-start', alignItems: 'flex-end', padding: 14 },
  inviteTypeBadge: { alignSelf: 'flex-start', position: 'absolute', left: 14, top: 14, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(7,8,16,0.7)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', zIndex: 2 },
  inviteTypeBadgeText: { color: theme.colors.heading, fontSize: 11, fontWeight: '900', letterSpacing: 0.6, textTransform: 'uppercase' },
  imageShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(7,8,16,0.2)' },
  inviteBody: { padding: 18 },
  inviteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  inviteBadge: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  inviteRed: { backgroundColor: 'rgba(255,31,61,0.82)' },
  inviteGold: { backgroundColor: 'rgba(255,179,0,0.82)' },
  inviteCopy: { flex: 1 },
  inviteTitle: { color: theme.colors.heading, fontSize: 19, fontWeight: '900' },
  inviteMeta: { marginTop: 4, color: theme.colors.mutedText, fontSize: 13 },
  spotsLabel: { color: theme.colors.secondary, fontSize: 12, fontWeight: '900' },
  inviteDescription: { marginTop: 14, color: '#DDE1EF', fontSize: 15, lineHeight: 22 },
  inviteMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.06)' },
  tagLabel: { color: theme.colors.secondary, fontSize: 12, fontWeight: '700' },
  priceBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: 'rgba(255,179,0,0.12)', borderWidth: 1, borderColor: 'rgba(255,179,0,0.2)' },
  priceBadgeText: { color: theme.colors.gold, fontSize: 12, fontWeight: '900' },
  createFab: { position: 'absolute', right: 20, width: 66, height: 66, borderRadius: 33, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', ...theme.shadow.glow },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#0B0D16' },
  backdropTouchArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  profileBackdrop: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'rgba(0,0,0,0.7)' },
  modalCard: { maxHeight: '92%', padding: 20, borderTopLeftRadius: 30, borderTopRightRadius: 30, backgroundColor: '#0B0D16', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  modalTitle: { flex: 1, color: theme.colors.heading, fontSize: 24, fontWeight: '900' },
  modalCloseButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 0, marginTop: 20, marginBottom: 8 },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  stepDotActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  stepDotCompleted: { backgroundColor: theme.colors.success, borderColor: theme.colors.success },
  stepNumber: { color: theme.colors.mutedText, fontSize: 13, fontWeight: '800' },
  stepNumberActive: { color: theme.colors.surface },
  stepLine: { width: 40, height: 2, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 4 },
  stepLineCompleted: { backgroundColor: theme.colors.success },
  stepContainer: { maxHeight: 400 },
  stepContent: { marginTop: 16 },
  stepTitle: { color: theme.colors.heading, fontSize: 18, fontWeight: '800', marginBottom: 16 },
  typeGrid: { gap: 12 },
  typeCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  typeCardActive: { borderColor: 'transparent' },
  typeCardGradient: { borderRadius: 20, overflow: 'hidden' },
  typeCardContent: { padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16 },
  typeCardLabel: { flex: 1, color: theme.colors.surface, fontSize: 18, fontWeight: '900' },
  typeCardCheck: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  typeCardInactive: { padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: 'rgba(255,255,255,0.03)' },
  typeCardLabelInactive: { flex: 1, color: theme.colors.mutedText, fontSize: 18, fontWeight: '800' },
  imagePickerSection: { marginBottom: 16 },
  imagePickerRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  imagePickerButton: { flex: 1, minHeight: 80, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 8 },
  imagePickerText: { color: theme.colors.secondary, fontSize: 12, fontWeight: '800' },
  imagePreviewWrap: { marginBottom: 12 },
  imagePreview: { height: 160, borderRadius: 20, overflow: 'hidden', justifyContent: 'flex-end' },
  imagePreviewOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20 },
  imagePreviewActions: { flexDirection: 'row', gap: 10, padding: 12, zIndex: 2 },
  imageActionButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  imageHint: { marginTop: 6, color: theme.colors.mutedText, fontSize: 11, textAlign: 'center' },
  imageOptions: { gap: 12, paddingVertical: 4 },
  imageOption: { width: 100, height: 72, borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  imageOptionSelected: { borderColor: theme.colors.secondary },
  imageOptionFill: { flex: 1, alignItems: 'flex-end', padding: 6 },
  selectedImageBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  form: { gap: 14 },
  formRow: { flexDirection: 'row', gap: 12 },
  formRowField: { flex: 1 },
  field: { gap: 8 },
  label: { color: theme.colors.secondary, fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  input: { minHeight: 52, borderRadius: 18, paddingHorizontal: 14, color: theme.colors.heading, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  descriptionInput: { minHeight: 96, paddingTop: 14 },
  pricingToggle: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  pricingOption: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  pricingOptionActive: { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)' },
  pricingLabel: { color: theme.colors.mutedText, fontSize: 14, fontWeight: '800' },
  pricingLabelActive: { color: theme.colors.heading },
  summaryCard: { marginTop: 20, padding: 18, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  summaryTitle: { color: theme.colors.heading, fontSize: 17, fontWeight: '900', marginBottom: 8 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  summaryText: { color: theme.colors.mutedText, fontSize: 13 },
  summaryDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 12 },
  summaryBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  summaryBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.06)' },
  summaryBadgeText: { color: theme.colors.secondary, fontSize: 12, fontWeight: '800' },
  composerFullScreen: {
    flex: 1,
    backgroundColor: '#0A0C14',
  },
  composerHeaderBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: '#0A0C14',
  },
  composerTitle: {
    color: theme.colors.heading,
    fontSize: 24,
    fontWeight: '900',
  },
  composerStepLabel: {
    color: theme.colors.mutedText,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  composerBodyScroll: {
    flex: 1,
  },
  composerBodyContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalActions: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.06)', backgroundColor: '#0A0C14' },
  backButton: { flex: 1, minHeight: 52, borderRadius: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.06)' },
  backButtonText: { color: theme.colors.heading, fontWeight: '900' },
  nextButton: { flex: 1, minHeight: 52, borderRadius: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: theme.colors.primary },
  nextButtonDisabled: { opacity: 0.45 },
  nextButtonText: { color: theme.colors.surface, fontWeight: '900' },
  publishButton: { flex: 1, minHeight: 52, borderRadius: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: theme.colors.primary },
  publishButtonDisabled: { opacity: 0.45 },
  publishButtonText: { color: theme.colors.surface, fontWeight: '900' },
  eventDetailCard: { flex: 1, width: '100%', overflow: 'hidden', backgroundColor: '#0B0D16' },
  modalHandle: { position: 'absolute', top: 8, alignSelf: 'center', width: 54, height: 5, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.32)', zIndex: 5 },
  eventDetailImage: { height: 292, padding: 18, paddingTop: 54 },
  eventDetailShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(7,8,16,0.34)' },
  eventDetailTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  eventDetailBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, backgroundColor: 'rgba(255,31,61,0.82)' },
  eventDetailBadgeText: { color: theme.colors.surface, fontSize: 12, fontWeight: '900' },
  eventDetailBody: { padding: 20, paddingBottom: 46 },
  eventDetailScroll: { flex: 1 },
  eventDetailScrollContent: { flexGrow: 1 },
  eventDetailTitle: { color: theme.colors.heading, fontSize: 28, lineHeight: 30, fontWeight: '900' },
  eventDetailMeta: { marginTop: 8, color: theme.colors.secondary, fontSize: 14, fontWeight: '800' },
  eventTypePill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: 'rgba(255,179,0,0.16)', borderWidth: 1, borderColor: 'rgba(255,179,0,0.24)' },
  eventTypePillText: { color: '#FFD787', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  eventTrustRow: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  verifiedPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: 'rgba(66,217,140,0.12)', borderWidth: 1, borderColor: 'rgba(66,217,140,0.24)' },
  verifiedPillText: { color: theme.colors.success, fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  hostRow: { marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  hostAvatar: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
  hostCopy: { flex: 1 },
  hostLabel: { color: theme.colors.mutedText, fontSize: 12, fontWeight: '700' },
  hostName: { marginTop: 2, color: theme.colors.heading, fontSize: 15, fontWeight: '900' },
  hostSubline: { marginTop: 3, color: theme.colors.secondary, fontSize: 12, fontWeight: '700' },
  eventDetailDescription: { marginTop: 18, color: '#DDE1EF', fontSize: 15, lineHeight: 23 },
  attendancePanel: { marginTop: 18, flexDirection: 'row', gap: 12, padding: 14, borderRadius: 22, backgroundColor: 'rgba(93,167,255,0.1)', borderWidth: 1, borderColor: 'rgba(93,167,255,0.2)' },
  attendanceIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)' },
  attendanceCopy: { flex: 1 },
  attendanceTitle: { color: theme.colors.heading, fontSize: 15, fontWeight: '900' },
  attendanceText: { marginTop: 4, color: theme.colors.mutedText, fontSize: 13, lineHeight: 18 },
  confirmPresenceButton: { marginTop: 12, minHeight: 48, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(66,217,140,0.8)' },
  confirmPresenceText: { color: theme.colors.surface, fontSize: 14, fontWeight: '900' },
  ratingPanel: { marginTop: 16, padding: 16, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.045)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  ratingHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 },
  ratingTitle: { color: theme.colors.heading, fontSize: 17, fontWeight: '900' },
  ratingLockText: { color: theme.colors.secondary, fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  ratingLabel: { marginTop: 10, color: theme.colors.mutedText, fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  ratingStars: { marginTop: 8, flexDirection: 'row', gap: 4 },
  ratingStarsDisabled: { opacity: 0.45 },
  ratingStarButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  joinButton: { marginTop: 22, minHeight: 56, borderRadius: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: theme.colors.primary },
  joinButtonActive: { backgroundColor: theme.colors.success },
  joinButtonText: { color: theme.colors.surface, fontSize: 16, fontWeight: '900' },
  deleteEventButton: {
    marginTop: 22,
    minHeight: 56,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,77,77,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,77,77,0.3)',
  },
  deleteEventButtonText: {
    color: '#FF4D4D',
    fontSize: 16,
    fontWeight: '900',
  },
  creatorProfileCard: { padding: 18, borderRadius: 28, backgroundColor: '#0B0D16', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', ...theme.shadow.floating },
  creatorProfileTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  creatorProfileAvatar: { width: 62, height: 62, borderRadius: 31 },
  creatorProfileCopy: { flex: 1 },
  creatorProfileEyebrow: { color: theme.colors.secondary, fontSize: 11, fontWeight: '900', letterSpacing: 0.8, textTransform: 'uppercase' },
  creatorProfileName: { marginTop: 3, color: theme.colors.heading, fontSize: 22, fontWeight: '900' },
  creatorProfileMeta: { marginTop: 3, color: theme.colors.mutedText, fontSize: 13, fontWeight: '700' },
  creatorStatsGrid: { marginTop: 18, flexDirection: 'row', gap: 10 },
  creatorStat: { flex: 1, padding: 12, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.055)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  creatorStatValue: { color: theme.colors.heading, fontSize: 21, fontWeight: '900' },
  creatorStatLabel: { marginTop: 3, color: theme.colors.mutedText, fontSize: 11, fontWeight: '800' },
  creatorBadgeRow: { marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  creatorBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, backgroundColor: 'rgba(255,179,0,0.12)', borderWidth: 1, borderColor: 'rgba(255,179,0,0.18)' },
  creatorBadgeText: { color: theme.colors.gold, fontSize: 12, fontWeight: '900' },
  creatorPraisePanel: { marginTop: 16, padding: 14, borderRadius: 20, backgroundColor: 'rgba(66,217,140,0.08)', borderWidth: 1, borderColor: 'rgba(66,217,140,0.16)' },
  creatorPraiseTitle: { color: theme.colors.heading, fontSize: 15, fontWeight: '900', marginBottom: 8 },
  creatorPraiseText: { color: '#DDE1EF', fontSize: 13, lineHeight: 20, fontWeight: '700' },
});