import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { PAGE_BOTTOM_PADDING, PAGE_TOP_PADDING } from '../components/Screen';
import { businessRepository } from '../features/business/businessRepository';
import { restaurantsRepository } from '../repositories/restaurantsRepository';
import { theme } from '../theme';
import type { PlaceImage } from '../repositories/types';

type GalleryManagerScreenProps = {
  navigation: NavigationProp<ParamListBase>;
  route: { params: { placeId: string } };
};

export function GalleryManagerScreen({ navigation, route }: GalleryManagerScreenProps) {
  const { placeId } = route.params;
  const [images, setImages] = useState<PlaceImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [reordering, setReordering] = useState<string | null>(null);

  const loadImages = useCallback(async () => {
    const data = await businessRepository.getPlaceImages(placeId);
    setImages(data);
    setLoading(false);
  }, [placeId]);

  useFocusEffect(
    useCallback(() => {
      void loadImages();
    }, [loadImages])
  );

  const handleAddImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please grant photo library access to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: true,
    });

    if (result.canceled || !result.assets?.length) return;

    setUploading(true);
    try {
      for (const asset of result.assets) {
        const fileName = asset.fileName ?? `image_${Date.now()}.jpg`;
        await businessRepository.uploadPlaceImage(placeId, asset.uri, fileName);
      }
      restaurantsRepository.clearPlaceCache(placeId);
      await loadImages();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload.';
      Alert.alert('Error', message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (imageId: string) => {
    Alert.alert('Delete Image', 'Are you sure you want to delete this image?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await businessRepository.deletePlaceImage(imageId);
            restaurantsRepository.clearPlaceCache(placeId);
            setImages((prev) => prev.filter((img) => img.id !== imageId));
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete.';
            Alert.alert('Error', message);
          }
        },
      },
    ]);
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      await businessRepository.setPrimaryImage(imageId, placeId);
      restaurantsRepository.clearPlaceCache(placeId);
      setImages((prev) =>
        prev.map((img) => ({
          ...img,
          isPrimary: img.id === imageId,
        }))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to set cover.';
      Alert.alert('Error', message);
    }
  };

  const handleMove = async (imageId: string, direction: 'up' | 'down') => {
    const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
    const index = sorted.findIndex((img) => img.id === imageId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sorted.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const a = sorted[index];
    const b = sorted[targetIndex];

    // Swap sort orders
    const updates = [
      { id: a.id, sortOrder: b.sortOrder },
      { id: b.id, sortOrder: a.sortOrder },
    ];

    setReordering(imageId);
    try {
      await businessRepository.reorderImages(updates);
      await loadImages();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reorder.';
      Alert.alert('Error', message);
    } finally {
      setReordering(null);
    }
  };

  const sortedImages = [...images].sort((a, b) => a.sortOrder - b.sortOrder);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>
          Gallery ({images.length} {images.length === 1 ? 'photo' : 'photos'})
        </Text>
        <Pressable
          style={[styles.addButton, uploading && styles.addButtonDisabled]}
          onPress={handleAddImage}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color={theme.colors.surface} />
          ) : (
            <>
              <Ionicons name="add-outline" size={18} color={theme.colors.surface} />
              <Text style={styles.addButtonText}>Add Photos</Text>
            </>
          )}
        </Pressable>
      </View>

      {images.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="images-outline" size={48} color={theme.colors.mutedText} />
          <Text style={styles.emptyText}>No photos yet</Text>
          <Text style={styles.emptySubtext}>
            Add photos to showcase your restaurant. The first photo will be your cover image.
          </Text>
        </View>
      ) : (
        <View style={styles.galleryGrid}>
          {sortedImages.map((img) => {
            const isBusy = reordering === img.id;
            const canMoveUp = sortedImages.indexOf(img) > 0;
            const canMoveDown = sortedImages.indexOf(img) < sortedImages.length - 1;

            return (
              <View key={img.id} style={styles.imageCard}>
                <Image source={{ uri: img.imageUrl }} style={styles.image} resizeMode="cover" />
                {img.isPrimary && (
                  <View style={styles.primaryBadge}>
                    <Ionicons name="star" size={12} color={theme.colors.surface} />
                    <Text style={styles.primaryText}>Cover</Text>
                  </View>
                )}
                <View style={styles.imageActions}>
                  {canMoveUp && (
                    <Pressable
                      style={[styles.actionButton, isBusy && styles.actionButtonDisabled]}
                      onPress={() => handleMove(img.id, 'up')}
                      disabled={isBusy}
                    >
                      <Ionicons name="chevron-up" size={16} color="#A0A6C4" />
                    </Pressable>
                  )}
                  {canMoveDown && (
                    <Pressable
                      style={[styles.actionButton, isBusy && styles.actionButtonDisabled]}
                      onPress={() => handleMove(img.id, 'down')}
                      disabled={isBusy}
                    >
                      <Ionicons name="chevron-down" size={16} color="#A0A6C4" />
                    </Pressable>
                  )}
                  {!img.isPrimary && (
                    <Pressable
                      style={[styles.actionButton, isBusy && styles.actionButtonDisabled]}
                      onPress={() => handleSetPrimary(img.id)}
                      disabled={isBusy}
                    >
                      {isBusy ? (
                        <ActivityIndicator size="small" color="#FFB300" />
                      ) : (
                        <Ionicons name="star-outline" size={16} color="#FFB300" />
                      )}
                    </Pressable>
                  )}
                  <Pressable
                    style={[styles.actionButton, styles.deleteButton, isBusy && styles.actionButtonDisabled]}
                    onPress={() => handleDelete(img.id)}
                    disabled={isBusy}
                  >
                    <Ionicons name="trash-outline" size={16} color="#FF3B3B" />
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 25,
  },
  heading: {
    color: theme.colors.heading,
    fontSize: 22,
    fontWeight: '900',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: '700',
  },
  galleryGrid: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  imageCard: {
    width: '47%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  primaryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,179,0,0.75)',
  },
  primaryText: {
    color: theme.colors.surface,
    fontSize: 10,
    fontWeight: '700',
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    padding: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.4,
  },
  deleteButton: {
    backgroundColor: 'rgba(255,59,59,0.15)',
  },
  emptyState: {
    marginTop: 60,
    alignItems: 'center',
    gap: 10,
  },
  emptyText: {
    color: theme.colors.heading,
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtext: {
    color: theme.colors.mutedText,
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 20,
  },
});