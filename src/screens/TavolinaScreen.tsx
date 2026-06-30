import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import {
    Alert,
    ImageBackground,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { tavolinaInvites, type TavolinaInvite } from '../data/mockData';
import { useI18n } from '../i18n/I18nProvider';
import { nativeCopy } from '../i18n/nativeCopy';
import { useScrollBehavior } from '../lib/scroll-behavior';
import { theme } from '../theme';

type TavolinaScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

type EventInvite = Omit<TavolinaInvite, 'restaurantId'> & {
  restaurantId?: string;
};

type EventType = 'food' | 'culture' | 'nightlife';

type ComposerEventType = EventType;

const moodKeys = ['all', 'food', 'culture', 'nightlife'] as const;
type MoodKey = (typeof moodKeys)[number];

const eventTypeLabelIndex: Record<EventType, number> = {
  food: 1,
  culture: 2,
  nightlife: 3,
};

const composerTypeOptions: Record<
  string,
  { id: ComposerEventType; label: string }[]
> = {
  en: [
    { id: 'food', label: 'Food' },
    { id: 'culture', label: 'Culture' },
    { id: 'nightlife', label: 'Nightlife' },
  ],
  sq: [
    { id: 'food', label: 'Ushqim' },
    { id: 'culture', label: 'Kulture' },
    { id: 'nightlife', label: 'Nate' },
  ],
};

const eventImages = [
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=80',
];

const formCopy = {
  en: {
    modalTitle: 'New community event',
    eventName: 'Event name',
    city: 'City',
    day: 'Day',
    time: 'Time',
    description: 'Description',
    eventNamePlaceholder: 'Sunset food meetup',
    cityPlaceholder: 'Prishtina',
    dayPlaceholder: 'Friday',
    timePlaceholder: '20:00',
    descriptionPlaceholder: 'Tell people what the vibe is and who should join.',
    publish: 'Publish',
    cancel: 'Cancel',
    spots: 'Open spots',
    join: 'Join event',
    joined: 'Joined',
    hostedBy: 'Hosted by',
    eventDetails: 'Event details',
    joinSuccessTitle: 'You joined the event',
    joinSuccessMessage: 'Your spot is saved in this community event.',
  },
  sq: {
    modalTitle: 'Event i ri nga komuniteti',
    eventName: 'Emri i eventit',
    city: 'Qyteti',
    day: 'Dita',
    time: 'Ora',
    description: 'Pershkrimi',
    eventNamePlaceholder: 'Takim ushqimi ne perendim',
    cityPlaceholder: 'Prishtine',
    dayPlaceholder: 'E premte',
    timePlaceholder: '20:00',
    descriptionPlaceholder: 'Trego cfare vibe ka eventi dhe kush mund te bashkohet.',
    publish: 'Publiko',
    cancel: 'Anulo',
    spots: 'Vende te lira',
    join: 'Bashkohu',
    joined: 'Je bashkuar',
    hostedBy: 'Organizuar nga',
    eventDetails: 'Detajet e eventit',
    joinSuccessTitle: 'U bashkove ne event',
    joinSuccessMessage: 'Vendi yt u ruajt ne kete event te komunitetit.',
  },
};

function formatSpotsLabel(spotsLabel: string, joined: boolean) {
  const match = spotsLabel.match(/^(\d+)\/(\d+)(.*)$/);

  if (!match) {
    return spotsLabel;
  }

  const current = Number(match[1]);
  const total = Number(match[2]);
  const suffix = match[3] ?? '';
  const visibleCurrent = joined ? Math.min(current + 1, total) : current;

  return `${visibleCurrent}/${total}${suffix}`;
}

export function TavolinaScreen({ navigation }: TavolinaScreenProps) {
  const { language } = useI18n();
  const { setScrollOffset } = useScrollBehavior();
  const copy = nativeCopy[language].tavolina;
  const modalCopy = formCopy[language];
  const composerTypeOptionsForLanguage = composerTypeOptions[language] ?? composerTypeOptions.en;
  const [events, setEvents] = useState<EventInvite[]>(tavolinaInvites);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventInvite | null>(null);
  const [joinedEventIds, setJoinedEventIds] = useState<Set<string>>(() => new Set());
  const [selectedMoodIndex, setSelectedMoodIndex] = useState(0);
  const [eventName, setEventName] = useState('');
  const [city, setCity] = useState('');
  const [day, setDay] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState(eventImages[0]);
  const [selectedComposerType, setSelectedComposerType] = useState<ComposerEventType>('food');

  const visibleEvents = useMemo(() => {
    const selectedMood = moodKeys[selectedMoodIndex] ?? 'all';

    if (selectedMood === 'all') {
      return events;
    }

    return events.filter((invite) => invite.eventType === selectedMood);
  }, [events, selectedMoodIndex]);

  const canPublish =
    eventName.trim().length > 2 &&
    city.trim().length > 1 &&
    day.trim().length > 1 &&
    time.trim().length > 1 &&
    description.trim().length > 8;

  const resetForm = () => {
    setEventName('');
    setCity('');
    setDay('');
    setTime('');
    setDescription('');
    setSelectedImage(eventImages[0]);
    setSelectedComposerType('food');
  };

  const closeComposer = () => {
    setIsComposerOpen(false);
    resetForm();
  };

  const publishEvent = () => {
    if (!canPublish) {
      return;
    }

    const newEvent: EventInvite = {
      id: `event-${Date.now()}`,
      restaurantName: eventName.trim(),
      city: city.trim(),
      day: day.trim(),
      time: time.trim(),
      eventType: selectedComposerType,
      creator: 'KosVibe',
      creatorAvatar: selectedImage,
      description: description.trim(),
      tags: [copy.moods[eventTypeLabelIndex[selectedComposerType]], city.trim()],
      spotsLabel: language === 'sq' ? '0/8 vende' : '0/8 spots',
      image: selectedImage,
    };

    setEvents((current) => [newEvent, ...current]);
    setIsComposerOpen(false);
    resetForm();
    setSelectedEvent(newEvent);
  };

  const isSelectedEventJoined = selectedEvent ? joinedEventIds.has(selectedEvent.id) : false;

  const toggleJoinSelectedEvent = () => {
    if (!selectedEvent) {
      return;
    }

    setJoinedEventIds((current) => {
      const next = new Set(current);

      if (next.has(selectedEvent.id)) {
        next.delete(selectedEvent.id);
      } else {
        next.add(selectedEvent.id);
        Alert.alert(modalCopy.joinSuccessTitle, modalCopy.joinSuccessMessage);
      }

      return next;
    });
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
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
            <Pressable
              key={mood}
              style={[styles.moodChip, index === selectedMoodIndex && styles.moodChipActive]}
              onPress={() => setSelectedMoodIndex(index)}>
              <Text style={[styles.moodLabel, index === selectedMoodIndex && styles.moodLabelActive]}>
                {mood}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionHeading}>{copy.communityDrops}</Text>
        <View style={styles.inviteList}>
          {visibleEvents.map((invite, index) => (
            <Pressable
              key={invite.id}
              style={styles.inviteCard}
              onPress={() => setSelectedEvent(invite)}>
              <ImageBackground source={{ uri: invite.image }} style={styles.inviteImage}>
                <View style={styles.imageShade} />
                <View style={styles.inviteTypeBadge}>
                  <Text style={styles.inviteTypeBadgeText}>
                    {copy.moods[eventTypeLabelIndex[invite.eventType]]}
                  </Text>
                </View>
                <View style={[styles.inviteBadge, index % 2 === 0 ? styles.inviteRed : styles.inviteGold]}>
                  <Ionicons
                    name={index % 2 === 0 ? 'flame-outline' : 'sparkles-outline'}
                    size={18}
                    color={theme.colors.surface}
                  />
                </View>
              </ImageBackground>

              <View style={styles.inviteBody}>
                <View style={styles.inviteRow}>
                  <View style={styles.inviteCopy}>
                    <Text style={styles.inviteTitle}>{invite.restaurantName}</Text>
                    <Text style={styles.inviteMeta}>
                      {invite.day} | {invite.time} | {invite.city}
                    </Text>
                  </View>
                  <Text style={styles.spotsLabel}>
                    {formatSpotsLabel(invite.spotsLabel, joinedEventIds.has(invite.id))}
                  </Text>
                </View>

                <Text style={styles.inviteDescription}>{invite.description}</Text>

                <View style={styles.tagRow}>
                  {invite.tags.map((tag) => (
                    <View key={`${invite.id}-${tag}`} style={styles.tag}>
                      <Text style={styles.tagLabel}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Pressable
        accessibilityLabel={modalCopy.modalTitle}
        style={styles.createFab}
        onPress={() => setIsComposerOpen(true)}>
        <Ionicons name="add" size={30} color={theme.colors.surface} />
      </Pressable>

      <Modal visible={isComposerOpen} transparent animationType="slide" onRequestClose={closeComposer}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{modalCopy.modalTitle}</Text>
              <Pressable style={styles.modalCloseButton} onPress={closeComposer}>
                <Ionicons name="close" size={20} color={theme.colors.surface} />
              </Pressable>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageOptions}>
              {eventImages.map((image) => {
                const selected = selectedImage === image;

                return (
                  <Pressable
                    key={image}
                    style={[styles.imageOption, selected && styles.imageOptionSelected]}
                    onPress={() => setSelectedImage(image)}>
                    <ImageBackground source={{ uri: image }} style={styles.imageOptionFill}>
                      {selected ? (
                        <View style={styles.selectedImageBadge}>
                          <Ionicons name="checkmark" size={16} color={theme.colors.surface} />
                        </View>
                      ) : null}
                    </ImageBackground>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.field}>
              <Text style={styles.label}>{language === 'sq' ? 'Lloji i aktivitetit' : 'Activity type'}</Text>
              <View style={styles.typeRow}>
                {composerTypeOptionsForLanguage.map((option) => {
                  const active = selectedComposerType === option.id;

                  return (
                    <Pressable
                      key={option.id}
                      style={[styles.typeChip, active && styles.typeChipActive]}
                      onPress={() => setSelectedComposerType(option.id)}>
                      <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>{modalCopy.eventName}</Text>
                <TextInput
                  value={eventName}
                  onChangeText={setEventName}
                  placeholder={modalCopy.eventNamePlaceholder}
                  placeholderTextColor={theme.colors.subtle}
                  style={styles.input}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.field, styles.formRowField]}>
                  <Text style={styles.label}>{modalCopy.city}</Text>
                  <TextInput
                    value={city}
                    onChangeText={setCity}
                    placeholder={modalCopy.cityPlaceholder}
                    placeholderTextColor={theme.colors.subtle}
                    style={styles.input}
                  />
                </View>
                <View style={[styles.field, styles.formRowField]}>
                  <Text style={styles.label}>{modalCopy.day}</Text>
                  <TextInput
                    value={day}
                    onChangeText={setDay}
                    placeholder={modalCopy.dayPlaceholder}
                    placeholderTextColor={theme.colors.subtle}
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>{modalCopy.time}</Text>
                <TextInput
                  value={time}
                  onChangeText={setTime}
                  placeholder={modalCopy.timePlaceholder}
                  placeholderTextColor={theme.colors.subtle}
                  style={styles.input}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>{modalCopy.description}</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder={modalCopy.descriptionPlaceholder}
                  placeholderTextColor={theme.colors.subtle}
                  multiline
                  textAlignVertical="top"
                  style={[styles.input, styles.descriptionInput]}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={closeComposer}>
                <Text style={styles.cancelButtonText}>{modalCopy.cancel}</Text>
              </Pressable>
              <Pressable
                disabled={!canPublish}
                style={[styles.publishButton, !canPublish && styles.publishButtonDisabled]}
                onPress={publishEvent}>
                <Text style={styles.publishButtonText}>{modalCopy.publish}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={selectedEvent !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedEvent(null)}>
        <View style={styles.modalBackdrop}>
          {selectedEvent ? (
            <View style={styles.eventDetailCard}>
              <ImageBackground source={{ uri: selectedEvent.image }} style={styles.eventDetailImage}>
                <View style={styles.eventDetailShade} />
                <View style={styles.eventDetailTopRow}>
                  <View style={styles.eventDetailBadge}>
                    <Ionicons name="calendar-outline" size={18} color={theme.colors.surface} />
                    <Text style={styles.eventDetailBadgeText}>{modalCopy.eventDetails}</Text>
                  </View>
                  <Pressable style={styles.modalCloseButton} onPress={() => setSelectedEvent(null)}>
                    <Ionicons name="close" size={20} color={theme.colors.surface} />
                  </Pressable>
                </View>
              </ImageBackground>

              <View style={styles.eventDetailBody}>
                <Text style={styles.eventDetailTitle}>{selectedEvent.restaurantName}</Text>
                <Text style={styles.eventDetailMeta}>
                  {selectedEvent.day} | {selectedEvent.time} | {selectedEvent.city}
                </Text>
                <View style={styles.eventTypePill}>
                  <Text style={styles.eventTypePillText}>
                    {copy.moods[eventTypeLabelIndex[selectedEvent.eventType]]}
                  </Text>
                </View>

                <View style={styles.hostRow}>
                  <ImageBackground source={{ uri: selectedEvent.creatorAvatar }} style={styles.hostAvatar} />
                  <View style={styles.hostCopy}>
                    <Text style={styles.hostLabel}>{modalCopy.hostedBy}</Text>
                    <Text style={styles.hostName}>{selectedEvent.creator}</Text>
                  </View>
                  <Text style={styles.spotsLabel}>
                    {formatSpotsLabel(selectedEvent.spotsLabel, isSelectedEventJoined)}
                  </Text>
                </View>

                <Text style={styles.eventDetailDescription}>{selectedEvent.description}</Text>

                <View style={styles.tagRow}>
                  {selectedEvent.tags.map((tag) => (
                    <View key={`detail-${selectedEvent.id}-${tag}`} style={styles.tag}>
                      <Text style={styles.tagLabel}>{tag}</Text>
                    </View>
                  ))}
                </View>

                <Pressable
                  style={[styles.joinButton, isSelectedEventJoined && styles.joinButtonActive]}
                  onPress={toggleJoinSelectedEvent}>
                  <Ionicons
                    name={isSelectedEventJoined ? 'checkmark-circle' : 'person-add-outline'}
                    size={20}
                    color={theme.colors.surface}
                  />
                  <Text style={styles.joinButtonText}>
                    {isSelectedEventJoined ? modalCopy.joined : modalCopy.join}
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 120,
    paddingBottom: 160,
  },
  header: {
    marginBottom: 24,
  },
  eyebrow: {
    color: theme.colors.secondary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 10,
    color: theme.colors.heading,
    fontSize: 44,
    lineHeight: 42,
    fontWeight: '900',
    letterSpacing: -1.8,
    width: '100%',
  },
  subtitle: {
    marginTop: 12,
    color: theme.colors.mutedText,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 320,
  },
  actionBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  moodChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  moodChipActive: {
    backgroundColor: 'rgba(255,31,61,0.18)',
    borderColor: 'rgba(255,31,61,0.38)',
  },
  moodLabel: {
    color: theme.colors.mutedText,
    fontWeight: '700',
  },
  moodLabelActive: {
    color: theme.colors.heading,
  },
  sectionHeading: {
    marginTop: 28,
    color: theme.colors.heading,
    fontSize: 24,
    fontWeight: '900',
  },
  inviteList: {
    marginTop: 16,
    gap: 16,
  },
  inviteCard: {
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  inviteImage: {
    height: 164,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 14,
  },
  inviteTypeBadge: {
    alignSelf: 'flex-start',
    position: 'absolute',
    left: 14,
    top: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(7,8,16,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    zIndex: 2,
  },
  inviteTypeBadgeText: {
    color: theme.colors.heading,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  imageShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7,8,16,0.2)',
  },
  inviteBody: {
    padding: 18,
  },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  inviteBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteRed: {
    backgroundColor: 'rgba(255,31,61,0.82)',
  },
  inviteGold: {
    backgroundColor: 'rgba(255,179,0,0.82)',
  },
  inviteCopy: {
    flex: 1,
  },
  inviteTitle: {
    color: theme.colors.heading,
    fontSize: 19,
    fontWeight: '900',
  },
  inviteMeta: {
    marginTop: 4,
    color: theme.colors.mutedText,
    fontSize: 13,
  },
  spotsLabel: {
    color: theme.colors.secondary,
    fontSize: 12,
    fontWeight: '900',
  },
  inviteDescription: {
    marginTop: 14,
    color: '#DDE1EF',
    fontSize: 15,
    lineHeight: 22,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  tagLabel: {
    color: theme.colors.secondary,
    fontSize: 12,
    fontWeight: '700',
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  typeChipActive: {
    backgroundColor: 'rgba(255,31,61,0.22)',
    borderColor: 'rgba(255,31,61,0.38)',
  },
  typeChipText: {
    color: theme.colors.mutedText,
    fontSize: 12,
    fontWeight: '900',
  },
  typeChipTextActive: {
    color: theme.colors.heading,
  },
  createFab: {
    position: 'absolute',
    right: 20,
    bottom: 104,
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.glow,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.64)',
  },
  modalCard: {
    maxHeight: '88%',
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#0B0D16',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalTitle: {
    flex: 1,
    color: theme.colors.heading,
    fontSize: 24,
    fontWeight: '900',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageOptions: {
    gap: 12,
    paddingVertical: 18,
  },
  imageOption: {
    width: 132,
    height: 92,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  imageOptionSelected: {
    borderColor: theme.colors.secondary,
  },
  imageOptionFill: {
    flex: 1,
    alignItems: 'flex-end',
    padding: 8,
  },
  selectedImageBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    gap: 14,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formRowField: {
    flex: 1,
  },
  field: {
    gap: 8,
  },
  label: {
    color: theme.colors.secondary,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  input: {
    minHeight: 52,
    borderRadius: 18,
    paddingHorizontal: 14,
    color: theme.colors.heading,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  descriptionInput: {
    minHeight: 96,
    paddingTop: 14,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  cancelButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  cancelButtonText: {
    color: theme.colors.heading,
    fontWeight: '900',
  },
  publishButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  publishButtonDisabled: {
    opacity: 0.45,
  },
  publishButtonText: {
    color: theme.colors.surface,
    fontWeight: '900',
  },
  eventDetailCard: {
    maxHeight: '88%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#0B0D16',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  eventDetailImage: {
    height: 220,
    padding: 18,
  },
  eventDetailShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7,8,16,0.34)',
  },
  eventDetailTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  eventDetailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(255,31,61,0.82)',
  },
  eventDetailBadgeText: {
    color: theme.colors.surface,
    fontSize: 12,
    fontWeight: '900',
  },
  eventDetailBody: {
    padding: 20,
  },
  eventDetailTitle: {
    color: theme.colors.heading,
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '900',
  },
  eventDetailMeta: {
    marginTop: 8,
    color: theme.colors.secondary,
    fontSize: 14,
    fontWeight: '800',
  },
  eventTypePill: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,179,0,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,179,0,0.24)',
  },
  eventTypePillText: {
    color: '#FFD787',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  hostRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hostAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  hostCopy: {
    flex: 1,
  },
  hostLabel: {
    color: theme.colors.mutedText,
    fontSize: 12,
    fontWeight: '700',
  },
  hostName: {
    marginTop: 2,
    color: theme.colors.heading,
    fontSize: 15,
    fontWeight: '900',
  },
  eventDetailDescription: {
    marginTop: 18,
    color: '#DDE1EF',
    fontSize: 15,
    lineHeight: 23,
  },
  joinButton: {
    marginTop: 22,
    minHeight: 56,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: theme.colors.primary,
  },
  joinButtonActive: {
    backgroundColor: theme.colors.success,
  },
  joinButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '900',
  },
});
