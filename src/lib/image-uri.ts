import { Platform } from 'react-native';

const REMOTE_IMAGE_URI = /^https?:\/\//i;

export function normalizeImageUri(uri: string | null | undefined) {
  const trimmed = typeof uri === 'string' ? uri.trim() : '';

  if (!trimmed) {
    return null;
  }

  if (REMOTE_IMAGE_URI.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('file://') || trimmed.startsWith('content://') || trimmed.startsWith('asset:')) {
    return trimmed;
  }

  if (Platform.OS === 'web' && trimmed.startsWith('blob:')) {
    return trimmed;
  }

  return null;
}
