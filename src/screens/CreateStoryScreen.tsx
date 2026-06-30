import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useState } from 'react';

import { useI18n } from '../i18n/I18nProvider';
import { nativeCopy } from '../i18n/nativeCopy';
import { useStories } from '../lib/stories-state';
import { theme } from '../theme';

type CreateStoryScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

export function CreateStoryScreen({ navigation }: CreateStoryScreenProps) {
  const { language } = useI18n();
  const copy = nativeCopy[language].stories;
  const { createStory, imageTemplates } = useStories();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [body, setBody] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [selectedImage, setSelectedImage] = useState(imageTemplates[0]);

  const canCreate =
    title.trim().length > 2 &&
    subtitle.trim().length > 5 &&
    body.trim().length > 20 &&
    location.trim().length > 1 &&
    category.trim().length > 1;

  const handleCreate = () => {
    if (!canCreate) {
      return;
    }

    const story = createStory({
      title,
      subtitle,
      body,
      location,
      category,
      image: selectedImage,
      postedAt: copy.justNow,
    });

    navigation.navigate('StoryDetail', { storyId: story.id });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>{copy.creatorEyebrow}</Text>
          <Text style={styles.title}>{copy.createTitle}</Text>
        </View>
      </View>

      <View style={styles.imageChooser}>
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
                    <Ionicons name="checkmark" size={16} color={theme.colors.surface} />
                  </View>
                ) : null}
              </ImageBackground>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.form}>
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
            <TextInput
              value={category}
              onChangeText={setCategory}
              placeholder={copy.categoryPlaceholder}
              placeholderTextColor={theme.colors.subtle}
              style={styles.input}
            />
          </View>
        </View>

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

        <Pressable
          disabled={!canCreate}
          style={[styles.createButton, !canCreate && styles.createButtonDisabled]}
          onPress={handleCreate}>
          <Text style={styles.createButtonText}>{copy.publishButton}</Text>
          <Ionicons name="arrow-forward" size={18} color={theme.colors.surface} />
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
    paddingTop: 88,
    paddingBottom: 140,
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
  },
  title: {
    marginTop: 4,
    color: theme.colors.heading,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '900',
  },
  imageChooser: {
    marginTop: 26,
    flexDirection: 'row',
    gap: 10,
  },
  imageOption: {
    flex: 1,
    height: 86,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  imageOptionSelected: {
    borderColor: theme.colors.secondary,
  },
  imageOptionFill: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 8,
  },
  checkBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    marginTop: 26,
    gap: theme.spacing.xl,
  },
  field: {
    gap: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  rowField: {
    flex: 1,
  },
  label: {
    color: theme.colors.heading,
    fontSize: 13,
    fontWeight: '800',
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
  createButton: {
    minHeight: 58,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '900',
  },
});
