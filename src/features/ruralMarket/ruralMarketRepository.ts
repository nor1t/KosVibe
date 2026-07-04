import { supabase } from '../../lib/supabase';
import type {
  MyListingsStats,
  RuralMarketCategory,
  RuralMarketImage,
  RuralMarketListing,
  RuralMarketListingInput,
  RuralMarketListingUpdate,
} from './ruralMarketTypes';

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------
const BUCKET = 'rural-market-images';
const STORAGE_BASE = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}`;

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function fetchCategories(): Promise<RuralMarketCategory[]> {
  const { data, error } = await supabase
    .from('rural_market_categories')
    .select('*')
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((r) => ({
    id: r.id,
    slug: r.slug,
    labelEn: r.label_en,
    labelSq: r.label_sq,
    iconName: r.icon_name,
    isActive: r.is_active,
    sortOrder: r.sort_order,
  }));
}

// ---------------------------------------------------------------------------
// Feed (public)
// ---------------------------------------------------------------------------

export async function fetchActiveListings(filters?: {
  categoryId?: string;
  city?: string;
  search?: string;
}): Promise<RuralMarketListing[]> {
  let query = supabase
    .from('rural_market_listings')
    .select('*, images:rural_market_images(*)', { count: 'exact' })
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (filters?.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }
  if (filters?.city) {
    query = query.ilike('city', `%${filters.city}%`);
  }
  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data ?? []).map(mapListing);
}

// ---------------------------------------------------------------------------
// My Listings
// ---------------------------------------------------------------------------

export async function fetchMyListings(): Promise<RuralMarketListing[]> {
  const { data: user } = await supabase.auth.getUser();
  const userId = user.user?.id;
  if (!userId) return [];

  const { data, error } = await supabase
    .from('rural_market_listings')
    .select('*, images:rural_market_images(*)')
    .eq('owner_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map(mapListing);
}

export async function fetchMyListingsStats(): Promise<MyListingsStats> {
  const { data: user } = await supabase.auth.getUser();
  const userId = user.user?.id;
  if (!userId) return { total: 0, active: 0, sold: 0, archived: 0 };

  const { data, error } = await supabase
    .from('rural_market_listings')
    .select('status')
    .eq('owner_id', userId)
    .is('deleted_at', null);

  if (error) throw error;

  const rows = data ?? [];
  return {
    total: rows.length,
    active: rows.filter((r) => r.status === 'active').length,
    sold: rows.filter((r) => r.status === 'sold').length,
    archived: rows.filter((r) => r.status === 'archived').length,
  };
}

// ---------------------------------------------------------------------------
// Single listing
// ---------------------------------------------------------------------------

export async function fetchListingById(id: string): Promise<RuralMarketListing | null> {
  const { data, error } = await supabase
    .from('rural_market_listings')
    .select('*, images:rural_market_images(*)')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return mapListing(data);
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export async function createListing(input: RuralMarketListingInput): Promise<RuralMarketListing> {
  const { data: user } = await supabase.auth.getUser();
  const userId = user.user?.id;
  if (!userId) throw new Error('Not authenticated');

  const { data: listing, error: listingErr } = await supabase
    .from('rural_market_listings')
    .insert({
      owner_id: userId,
      category_id: input.categoryId,
      title: input.title,
      description: input.description,
      price: input.price,
      contact_phone: input.contactPhone,
      address: input.address,
      city: input.city,
      status: 'active',
    })
    .select('*')
    .single();

  if (listingErr) throw listingErr;

  if (input.imageUris.length > 0) {
    await uploadImages(listing.id, input.imageUris);
  }

  const created = await fetchListingById(listing.id);
  if (!created) throw new Error('Listing created but could not be fetched');
  return created;
}

export async function updateListing(
  id: string,
  input: RuralMarketListingUpdate
): Promise<RuralMarketListing> {
  await verifyOwnership(id);

  const fields: Record<string, unknown> = {};
  if (input.categoryId !== undefined) fields.category_id = input.categoryId;
  if (input.title !== undefined) fields.title = input.title;
  if (input.description !== undefined) fields.description = input.description;
  if (input.price !== undefined) fields.price = input.price;
  if (input.contactPhone !== undefined) fields.contact_phone = input.contactPhone;
  if (input.address !== undefined) fields.address = input.address;
  if (input.city !== undefined) fields.city = input.city;

  if (Object.keys(fields).length > 0) {
    const { error } = await supabase
      .from('rural_market_listings')
      .update(fields)
      .eq('id', id);
    if (error) throw error;
  }

  if (input.keepImageIds !== undefined) {
    const { data: existingImages } = await supabase
      .from('rural_market_images')
      .select('*')
      .eq('listing_id', id);

    const keepSet = new Set(input.keepImageIds);
    for (const img of existingImages ?? []) {
      if (!keepSet.has(img.id)) {
        await deleteImageInternal(img);
      }
    }
  }

  if (input.newImageUris && input.newImageUris.length > 0) {
    await uploadImages(id, input.newImageUris);
  }

  const updated = await fetchListingById(id);
  if (!updated) throw new Error('Listing updated but could not be fetched');
  return updated;
}

export async function markListingSold(id: string): Promise<RuralMarketListing> {
  await verifyOwnership(id);
  const { error } = await supabase
    .from('rural_market_listings')
    .update({ status: 'sold' })
    .eq('id', id);
  if (error) throw error;
  const listing = await fetchListingById(id);
  if (!listing) throw new Error('Listing not found');
  return listing;
}

export async function archiveListing(id: string): Promise<void> {
  await verifyOwnership(id);
  const { error } = await supabase
    .from('rural_market_listings')
    .update({ status: 'archived' })
    .eq('id', id);
  if (error) throw error;
}

export async function restoreListing(id: string): Promise<RuralMarketListing> {
  await verifyOwnership(id);
  const { error } = await supabase
    .from('rural_market_listings')
    .update({ status: 'active' })
    .eq('id', id);
  if (error) throw error;
  const listing = await fetchListingById(id);
  if (!listing) throw new Error('Listing not found');
  return listing;
}

export async function deleteListing(id: string): Promise<void> {
  await verifyOwnership(id);

  const { data: images } = await supabase
    .from('rural_market_images')
    .select('*')
    .eq('listing_id', id);

  if (images) {
    const paths = images.map((img) => extractStoragePath(img.storage_path));
    if (paths.length > 0) {
      await supabase.storage.from(BUCKET).remove(paths);
    }
  }

  const { error } = await supabase
    .from('rural_market_listings')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Realtime subscription
// ---------------------------------------------------------------------------

/**
 * Subscribe to realtime changes on rural_market_listings.
 *
 * Returns a cleanup function that calls supabase.removeChannel().
 * Each call generates a UNIQUE channel name so multiple screens
 * can subscribe simultaneously without collision.
 */
export function subscribeToMarketChanges(
  onEvent: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    new: Record<string, unknown> | null;
    old: Record<string, unknown> | null;
  }) => void
): () => void {
  // Unique name prevents collision when MarketScreen and
  // MyMarketListingsScreen are both mounted in the stack.
  const channelName = `rural-market-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'rural_market_listings' },
      (payload) => {
        onEvent({
          eventType: payload.eventType,
          new: payload.new as Record<string, unknown> | null,
          old: payload.old as Record<string, unknown> | null,
        });
      }
    )
    .subscribe((status, err) => {
      if (status === 'CHANNEL_ERROR' || status === 'CLOSED' || status === 'TIMED_OUT') {
        console.warn('[RuralMarket] channel error:', channelName, status, err?.message ?? '');
      }
    });

  return () => {
    supabase.removeChannel(channel).catch(() => {});
  };
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

function mapListing(row: Record<string, unknown>): RuralMarketListing {
  const images: RuralMarketImage[] = (row.images as Array<Record<string, unknown>> | undefined)?.map(
    (img) => ({
      id: img.id as string,
      listingId: img.listing_id as string,
      storagePath: img.storage_path as string,
      publicUrl: img.public_url as string,
      sortOrder: (img.sort_order as number) ?? 0,
    })
  ) ?? [];

  const firstImage = images.length > 0 ? images.sort((a, b) => a.sortOrder - b.sortOrder)[0] : null;

  return {
    id: row.id as string,
    ownerId: row.owner_id as string,
    categoryId: row.category_id as string,
    title: row.title as string,
    description: (row.description as string) ?? '',
    price: (row.price as string) ?? '',
    contactPhone: (row.contact_phone as string) ?? '',
    address: (row.address as string) ?? '',
    city: (row.city as string) ?? '',
    status: (row.status as 'active' | 'sold' | 'archived') ?? 'active',
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    category: null,
    images,
    thumbnailUrl: firstImage?.publicUrl ?? null,
  };
}

async function uploadImages(listingId: string, uris: string[]): Promise<void> {
  for (let i = 0; i < uris.length; i++) {
    const uri = uris[i];
    const ext = (uri.split('.').pop()?.split('?')[0] ?? 'jpg').toLowerCase();
    const fileName = `${listingId}_${Date.now()}_${i}.${ext}`;
    const storagePath = `${listingId}/${fileName}`;

    // Use arrayBuffer (proven pattern from src/lib/storage.ts).
    // fetch().blob() produces 0-byte payloads on React Native.
    const response = await fetch(uri);
    if (!response.ok) throw new Error(`Failed to read image file: ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();
    const contentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : ext === 'heic' ? 'image/heic' : 'image/jpeg';

    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, arrayBuffer, {
        contentType,
        upsert: false,
      });

    if (uploadErr) throw uploadErr;

    const publicUrl = `${STORAGE_BASE}/${storagePath}`;

    const { error: insertErr } = await supabase.from('rural_market_images').insert({
      listing_id: listingId,
      storage_path: storagePath,
      public_url: publicUrl,
      sort_order: i,
    });

    if (insertErr) {
      await supabase.storage.from(BUCKET).remove([storagePath]);
      throw insertErr;
    }
  }
}

async function deleteImageInternal(image: RuralMarketImage): Promise<void> {
  const path = extractStoragePath(image.storagePath);
  await supabase.storage.from(BUCKET).remove([path]);
  await supabase.from('rural_market_images').delete().eq('id', image.id);
}

function extractStoragePath(storagePathOrUrl: string): string {
  if (!storagePathOrUrl.startsWith('http')) return storagePathOrUrl;
  const idx = storagePathOrUrl.indexOf(`/${BUCKET}/`);
  if (idx === -1) return storagePathOrUrl;
  return storagePathOrUrl.slice(idx + BUCKET.length + 2);
}

async function verifyOwnership(listingId: string): Promise<void> {
  const { data: user } = await supabase.auth.getUser();
  const userId = user.user?.id;
  if (!userId) throw new Error('Not authenticated');

  const { data: isAdmin } = await supabase.rpc('is_admin');
  if (isAdmin) return;

  const { data, error } = await supabase
    .from('rural_market_listings')
    .select('owner_id')
    .eq('id', listingId)
    .single();

  if (error || !data) throw new Error('Listing not found');
  if (data.owner_id !== userId) throw new Error('Not authorized');
}