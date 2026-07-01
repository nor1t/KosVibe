import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Alert, Image } from 'react-native';
import { useState } from 'react';

import { PAGE_BOTTOM_PADDING, PAGE_TOP_PADDING } from '../components/Screen';
import { useI18n } from '../i18n/I18nProvider';
import { nativeCopy } from '../i18n/nativeCopy';
import { useAuth } from '../features/auth/AuthProvider';
import { useStories } from '../lib/stories-state';
import { theme } from '../theme';

const UPLOAD_PHOTO = 'Upload photo';
const TAKE_PHOTO = 'Take photo';
const GALLERY = 'Gallery';
const CAMERA = 'Camera';

type CreateStoryScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

const categoryOptions = ['Food', 'Coffee', 'Culture', 'Night Walk', 'Nature', 'Other'];

function getDisplayName(userMeta: { full_name?: unknown } | null, email: string | null): string | undefined {
  if (typeof userMeta?.full_name === 'string' && userMeta.full_name.trim()) return userMeta.full_name.trim();
  if (email) return email.split('@')[0];
  return undefined;
}

export function CreateStoryScreen({ navigation }: CreateStoryScreenProps) {
  const { language } = useI18n();
  const copy = nativeCopy[language].stories;
  const { createStory, imageTemplates } = useStories();
  const { user } = useAuth();
  const displayName = getDisplayName(user?.user_metadata ?? null, user?.email ?? null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [body, setBody] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [selectedImage, setSelectedImage] = useState(imageTemplates[0]);
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);

  const canCreate =
    title.trim().length > 2 &&
    subtitle.trim().length > 5 &&
    body.trim().length > 20 &&
    location.trim().length > 1 &&
    category.trim().length > 1;

  const pickImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]?.uri) {
      return;
    }

    setLocalImageUri(result.assets[0].uri);
    setSelectedImage(result.assets[0].uri);
  };

  const takeImageWithCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Camera permission needed',
        'Please allow camera access to take a photo for your story.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]?.uri) {
      return;
    }

    setLocalImageUri(result.assets[0].uri);
    setSelectedImage(result.assets[0].uri);
  };

  const handleCreate = () => {
    if (!canCreate) {
      return;
    }

    const displayImage = localImageUri || selectedImage || imageTemplates[0];

    const story = createStory({
      title,
      subtitle,
      body,
      location,
      category,
      image: displayImage,
      imageUri: localImageUri || undefined,
      postedAt: copy.justNow,
      authorName: displayName,
      authorId: user?.id,
    });

    navigation.navigate('StoryDetail', { storyId: story.id });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>{copy.creatorEyebrow}</Text>
          <Text style={styles.title}>{copy.createTitle}</Text>
        </View>
      </View>

      {/* Image picker section */}
      <View style={styles.imageSection}>
        {localImageUri || selectedImage ? (
          <View style={styles.imagePreviewWrap}>
            <ImageBackground
              source={{ uri: localImageUri || selectedImage }}
              style={styles.imagePreview}
              imageStyle={{ borderRadius: 24 }}>
              <View style={styles.imagePreviewOverlay} />
              <View style={styles.imagePreviewTopRow}>
                <Pressable style={styles.imageActionPill} onPress={pickImageFromGallery}>
                  <Ionicons name="images-outline" size={16} color={theme.colors.surface} />
                  <Text style={styles.imageActionPillText}>{GALLERY}</Text>
                </Pressable>
                <Pressable style={styles.imageActionPill} onPress={takeImageWithCamera}>
                  <Ionicons name="camera-outline" size={16} color={theme.colors.surface} />
                  <Text style={styles.imageActionPillText}>{CAMERA}</Text>
                </Pressable>
              </View>
            </ImageBackground>
          </View>
        ) : (
          <View style={styles.imagePickerRow}>
            <Pressable style={styles.imagePickerButton} onPress={pickImageFromGallery}>
              <Ionicons name="images-outline" size={28} color={theme.colors.secondary} />
              <Text style={styles.imagePickerText}>{UPLOAD_PHOTO}</Text>
            </Pressable>
            <Pressable style={styles.imagePickerButton} onPress={takeImageWithCamera}>
              <Ionicons name="camera-outline" size={28} color={theme.colors.secondary} />
              <Text style={styles.imagePickerText}>{TAKE_PHOTO}</Text>
            </Pressable>
          </View>
        )}

        {/* Preset image options (only when no local image) */}
        {!localImageUri && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageOptions}>
            {imageTemplates.map((image) => {
              const selected = selectedImage === image;

              return (
                <Pressable
                  key={image}
                  onPress={() => setSelectedImage(image)}
                  style={[styles.imageOption, selected && styles.imageOptionSelected]}>
                  <ImageBackground source={{ uri: image }} style={styles.imageOptionFill}>
                    {selected ? (
                      <View style={styles.checkBadge}>
                        <Ionicons name="checkmark" size={14} color={theme.colors.surface} />
                      </View>
                    ) : null}
                  </ImageBackground>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Form */}
      <View style={styles.form}>
        {/* Title */}
        <View style={styles.field}>
          <Text style={styles.label}>{copy.titleLabel}</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={copy.titlePlaceholder}
            placeholderTextColor={theme.colors.subtle}
            style={styles.input}
          />
        </View>

        {/* Subtitle */}
        <View style={styles.field}>
          <Text style={styles.label}>{copy.subtitleLabel}</Text>
          <TextInput
            value={subtitle}
            onChangeText={setSubtitle}
            placeholder={copy.subtitlePlaceholder}
            placeholderTextColor={theme.colors.subtle}
            style={styles.input}
          />
        </View>

        {/* Location & Category */}
        <View style={styles.row}>
          <View style={[styles.field, styles.rowField]}>
            <Text style={styles.label}>{copy.locationLabel}</Text>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder={copy.locationPlaceholder}
              placeholderTextColor={theme.colors.subtle}
              style={styles.input}
            />
          </View>
          <View style={[styles.field, styles.rowField]}>
            <Text style={styles.label}>{copy.categoryLabel}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              <View style={styles.categoryRow}>
                {categoryOptions.map((cat) => {
                  const isActive = category === cat;
                  return (
                    <Pressable
                      key={cat}
                      style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                      onPress={() => setCategory(cat)}>
                      <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
                        {cat}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Body */}
        <View style={styles.field}>
          <Text style={styles.label}>{copy.bodyLabel}</Text>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder={copy.bodyPlaceholder}
            placeholderTextColor={theme.colors.subtle}
            style={[styles.input, styles.bodyInput]}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Character count */}
        <View style={styles.charCountRow}>
          <Text style={styles.charCountText}>
            {body.length} {language === 'sq' ? 'karaktere' : 'characters'}
          </Text>
          {body.length > 20 ? (
            <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
          ) : (
            <Text style={styles.charCountHint}>
              {language === 'sq' ? 'min 20' : 'min 20'}
            </Text>
          )}
        </View>

        {/* Publish button */}
        <Pressable
          disabled={!canCreate}
          style={[styles.createButton, !canCreate && styles.createButtonDisabled]}
          onPress={handleCreate}>
          <Ionicons name="paper-plane" size={18} color={theme.colors.surface} />
          <Text style={styles.createButtonText}>{copy.publishButton}</Text>
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
    paddingTop: PAGE_TOP_PADDING,
    paddingBottom: PAGE_BOTTOM_PADDING,
  },
  headerRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    color: theme.colors.secondary,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    marginTop: 4,
    color: theme.colors.heading,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '900',
  },
  // Image section
  imageSection: {
    marginTop: 20,
  },
  imagePreviewWrap: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 12,
  },
  imagePreview: {
    height: 200,
    justifyContent: 'flex-end',
  },
  imagePreviewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  imagePreviewTopRow: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    zIndex: 2,
  },
  imageActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  imageActionPillText: {
    color: theme.colors.surface,
    fontSize: 12,
    fontWeight: '800',
  },
  imagePickerRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  imagePickerButton: {
    flex: 1,
    minHeight: 100,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  imagePickerText: {
    color: theme.colors.secondary,
    fontSize: 13,
    fontWeight: '800',
  },
  imageOptions: {
    gap: 10,
    paddingVertical: 4,
  },
  imageOption: {
    width: 90,
    height: 66,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  imageOptionSelected: {
    borderColor: theme.colors.secondary,
  },
  imageOptionFill: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 6,
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Form
  form: {
    marginTop: 24,
    gap: 18,
  },
  field: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowField: {
    flex: 1,
  },
  label: {
    color: theme.colors.secondary,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: theme.colors.heading,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  bodyInput: {
    minHeight: 180,
    paddingTop: 14,
    lineHeight: 22,
  },
  // Category chips
  categoryScroll: {
    flexGrow: 0,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  categoryChipActive: {
    backgroundColor: 'rgba(255,31,61,0.18)',
    borderColor: 'rgba(255,31,61,0.38)',
  },
  categoryChipText: {
    color: theme.colors.mutedText,
    fontSize: 12,
    fontWeight: '800',
  },
  categoryChipTextActive: {
    color: theme.colors.heading,
  },
  // Character count
  charCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: -8,
  },
  charCountText: {
    color: theme.colors.mutedText,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  charCountHint: {
    color: theme.colors.subtle,
    fontSize: 11,
    fontWeight: '700',
  },
  // Button
  createButton: {
    minHeight: 58,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
  },
  createButtonDisabled: {
    opacity: 0.45,
  },
  createButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '900',
  },
});