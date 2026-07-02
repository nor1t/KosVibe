/**
 * Supabase Storage upload helpers.
 *
 * All uploads are organized under the user's UID folder:
 *   avatars/{uid}/filename
 *   story-images/{uid}/filename
 *   event-images/{uid}/filename
 */

import { supabase } from './supabase';

const BUCKETS = {
  avatars: 'avatars',
  storyImages: 'story-images',
  eventImages: 'event-images',
} as const;

/**
 * Upload a local image file to Supabase Storage and return the public URL.
 */
async function uploadFile(
  localUri: string,
  bucket: string,
  fileName: string,
): Promise<string | null> {
  try {
    const uid = (await supabase.auth.getUser()).data.user?.id;
    if (!uid) {
      console.error('uploadFile: No authenticated user');
      return null;
    }

    const extension = localUri.split('.').pop()?.split('?')[0] ?? 'jpg';
    const safeName = `${fileName}.${extension}`.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${uid}/${safeName}`;

    // Fetch the local file (works on web, iOS, Android)
    const response = await fetch(localUri);
    if (!response.ok) {
      console.error('Failed to read local file:', response.status);
      return null;
    }

    const contentType = extension === 'png' ? 'image/png' : extension === 'webp' ? 'image/webp' : 'image/jpeg';

    // Use arrayBuffer (works on native) instead of blob (web-only)
    const arrayBuffer = await response.arrayBuffer();

    // Upload to storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(storagePath, arrayBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error('Storage upload failed:', error.message);
      return null;
    }

    if (!data?.path) {
      return null;
    }

    // Get the public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return urlData.publicUrl;
  } catch (err) {
    console.error('uploadFile error:', err);
    return null;
  }
}

/**
 * Upload a profile avatar image.
 * Returns the public URL or null on failure.
 */
export async function uploadAvatar(localUri: string): Promise<string | null> {
  return uploadFile(localUri, BUCKETS.avatars, `avatar-${Date.now()}`);
}

/**
 * Upload a story image.
 * Returns the public URL or null on failure.
 */
export async function uploadStoryImage(localUri: string): Promise<string | null> {
  return uploadFile(localUri, BUCKETS.storyImages, `story-${Date.now()}`);
}

/**
 * Upload an event image.
 * Returns the public URL or null on failure.
 */
export async function uploadEventImage(localUri: string): Promise<string | null> {
  return uploadFile(localUri, BUCKETS.eventImages, `event-${Date.now()}`);
}

/**
 * Delete a file from storage given its full public URL.
 * Extracts the path from the bucket URL.
 */
export async function deleteStorageFile(publicUrl: string, bucket: string): Promise<boolean> {
  try {
    // Extract path from public URL (e.g. https://xxx.supabase.co/storage/v1/object/public/bucket/uid/file.jpg)
    const urlParts = publicUrl.split(`/public/${bucket}/`);
    if (urlParts.length < 2) return false;
    const path = urlParts[1];
    const { error } = await supabase.storage.from(bucket).remove([path]);
    return !error;
  } catch {
    return false;
  }
}