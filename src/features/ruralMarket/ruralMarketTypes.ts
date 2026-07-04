/**
 * Rural Market — Types
 *
 * Listing status lifecycle: active → sold | archived
 * Soft-delete via deleted_at at the database level; the repository
 * exposes archive / restore / delete operations as explicit methods.
 */

export type ListingStatus = 'active' | 'sold' | 'archived';

export type RuralMarketCategory = {
  id: string;
  slug: string;
  labelEn: string;
  labelSq: string;
  iconName: string;
  isActive: boolean;
  sortOrder: number;
};

export type RuralMarketImage = {
  id: string;
  listingId: string;
  storagePath: string;
  publicUrl: string;
  sortOrder: number;
};

export type RuralMarketListing = {
  id: string;
  ownerId: string;
  categoryId: string;
  title: string;
  description: string;
  price: string;
  contactPhone: string;
  address: string;
  city: string;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
  /** Joined after fetch */
  category?: RuralMarketCategory | null;
  images: RuralMarketImage[];
  /** Computed for display */
  thumbnailUrl: string | null;
};

export type RuralMarketListingInput = {
  categoryId: string;
  title: string;
  description: string;
  price: string;
  contactPhone: string;
  address: string;
  city: string;
  imageUris: string[];
};

export type RuralMarketListingUpdate = {
  categoryId?: string;
  title?: string;
  description?: string;
  price?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  /** Replace all images. Provide existing image IDs to keep + new URIs to upload. */
  keepImageIds?: string[];
  newImageUris?: string[];
};

export type MyListingsStats = {
  total: number;
  active: number;
  sold: number;
  archived: number;
};