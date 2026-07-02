import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PAGE_BOTTOM_PADDING, PAGE_TOP_PADDING } from '../components/Screen';
import { useAuth } from '../features/auth/AuthProvider';
import { useI18n } from '../i18n/I18nProvider';
import { nativeCopy } from '../i18n/nativeCopy';
import { normalizeImageUri } from '../lib/image-uri';
import { uploadAvatar } from '../lib/storage';
import { theme } from '../theme';

type ProfileEditScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

function getStringMetadata(value: unknown) {
  return typeof value === 'string' ? value : '';
}

export function ProfileEditScreen({ navigation }: ProfileEditScreenProps) {
  const { language } = useI18n();
  const copy = nativeCopy[language].profile;
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const previewAvatarUrl = normalizeImageUri(localAvatarUri || avatarUrl);

  useEffect(() => {
    const nextFullName = getStringMetadata(user?.user_metadata?.full_name);
    const nextBio = getStringMetadata(user?.user_metadata?.bio);
    const nextAvatarUrl = getStringMetadata(user?.user_metadata?.avatar_url);

    setFullName(nextFullName || user?.email?.split('@')[0] || '');
    setBio(nextBio || copy.bio);
    setAvatarUrl(nextAvatarUrl);
  }, [copy.bio, user?.email, user?.id, user?.user_metadata]);

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]?.uri) {
      return;
    }

    setLocalAvatarUri(result.assets[0].uri);
    setAvatarUrl(result.assets[0].uri);
  };

  const saveProfile = async () => {
    const nextFullName = fullName.trim();

    if (!nextFullName) {
      Alert.alert(
        copy.title,
        language === 'sq' ? 'Shkruaj emrin e plote.' : 'Please enter your full name.'
      );
      return;
    }

    try {
      setIsSaving(true);

      // Upload avatar to storage if user picked a local image
      let uploadedAvatarUrl: string | null = null;
      if (localAvatarUri) {
        uploadedAvatarUrl = await uploadAvatar(localAvatarUri);
      }

      const finalAvatarUrl = uploadedAvatarUrl || avatarUrl.trim() || null;

      await updateProfile({
        fullName: nextFullName,
        bio: bio.trim() || null,
        avatarUrl: finalAvatarUrl || null,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        copy.title,
        error instanceof Error
          ? error.message
          : language === 'sq'
            ? 'Nuk arritem ta ruajme profilin.'
            : 'We could not save your profile.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.heroCard}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatarRing}>
            <View style={styles.avatarCore}>
              {previewAvatarUrl ? (
                <Image source={{ uri: previewAvatarUrl }} style={styles.avatarImage} resizeMode="cover" />
              ) : (
                <Ionicons name="person" size={36} color={theme.colors.surface} />
              )}
            </View>
          </View>
        </View>

        <Text style={styles.title}>{copy.editTitle}</Text>
        <Text style={styles.subtitle}>{copy.editSubtitle}</Text>

        <View style={styles.avatarActions}>
          <Pressable style={styles.secondaryButton} onPress={pickAvatar}>
            <Ionicons name="cloud-upload-outline" size={18} color={theme.colors.surface} />
            <Text style={styles.secondaryButtonText}>{copy.uploadPhoto}</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => setAvatarUrl('')}>
            <Ionicons name="trash-outline" size={18} color={theme.colors.surface} />
            <Text style={styles.secondaryButtonText}>{copy.removePhoto}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>{copy.fullNameLabel}</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder={copy.fullNameLabel}
            placeholderTextColor={theme.colors.subtle}
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{copy.bioLabel}</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder={copy.bioLabel}
            placeholderTextColor={theme.colors.subtle}
            style={[styles.input, styles.bioInput]}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{copy.avatarLabel}</Text>
          <TextInput
            value={avatarUrl}
            onChangeText={setAvatarUrl}
            placeholder="https://..."
            placeholderTextColor={theme.colors.subtle}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.hint}>{copy.avatarHint}</Text>
        </View>

        <Pressable
          disabled={isSaving}
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={saveProfile}>
          <Text style={styles.saveButtonText}>{isSaving ? copy.savingChanges : copy.saveChanges}</Text>
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
    gap: 22,
  },
  heroCard: {
    padding: 22,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  avatarWrap: {
    marginBottom: 14,
  },
  avatarRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,179,0,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCore: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#121522',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    color: theme.colors.heading,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    color: theme.colors.mutedText,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  avatarActions: {
    marginTop: 18,
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  secondaryButtonText: {
    color: theme.colors.surface,
    fontSize: 13,
    fontWeight: '900',
  },
  form: {
    gap: theme.spacing.xl,
  },
  field: {
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.colors.heading,
    fontSize: 13,
    fontWeight: '800',
  },
  input: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: theme.colors.heading,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  bioInput: {
    minHeight: 150,
    paddingTop: 14,
    lineHeight: 22,
  },
  hint: {
    color: theme.colors.subtle,
    fontSize: 12,
    lineHeight: 18,
  },
  saveButton: {
    minHeight: 58,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.65,
  },
  saveButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '900',
  },
});
