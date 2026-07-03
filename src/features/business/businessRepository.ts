import { supabase } from '../../lib/supabase';
import type {
  BusinessAccount,
  BusinessMembership,
  BusinessPlaceClaim,
  BusinessWithMembership,
  CreateBusinessInput,
  CreatePlaceClaimInput,
  IBusinessRepository,
  MenuCategoryForEditing,
  MenuItemForEditing,
  PlaceForEditing,
  PlaceImage,
  RestaurantCatalogItem,
  UpdateBusinessInput,
  UpdatePlaceInput,
} from '../../repositories/types';

function mapBusinessAccount(row: Record<string, unknown>): BusinessAccount {
  return {
    id: row.id as string,
    slug: (row.slug as string) ?? '',
    name: row.name as string,
    description: (row.description as string) ?? null,
    businessType: (row.business_type as string) ?? null,
    email: (row.email as string) ?? null,
    phone: (row.phone as string) ?? null,
    website: (row.website as string) ?? null,
    logoUrl: (row.logo_url as string) ?? null,
    status: (row.status as BusinessAccount['status']) ?? 'pending',
    createdAt: (row.created_at as string) ?? '',
    updatedAt: (row.updated_at as string) ?? '',
    createdBy: (row.created_by as string) ?? null,
  };
}

function mapBusinessMembership(row: Record<string, unknown>): BusinessMembership {
  return {
    id: row.id as string,
    businessAccountId: (row.business_account_id as string) ?? '',
    userId: (row.user_id as string) ?? '',
    role: (row.role as BusinessMembership['role']) ?? 'staff',
    status: (row.status as BusinessMembership['status']) ?? 'invited',
    createdAt: (row.created_at as string) ?? '',
  };
}

function mapBusinessPlaceClaim(row: Record<string, unknown>): BusinessPlaceClaim {
  return {
    id: row.id as string,
    businessAccountId: (row.business_account_id as string) ?? '',
    placeId: (row.place_id as string) ?? '',
    userId: (row.user_id as string) ?? '',
    claimMessage: (row.claim_message as string) ?? null,
    status: (row.status as BusinessPlaceClaim['status']) ?? 'pending',
    adminNotes: (row.admin_notes as string) ?? null,
    reviewedBy: (row.reviewed_by as string) ?? null,
    reviewedAt: (row.reviewed_at as string) ?? null,
    createdAt: (row.created_at as string) ?? '',
    updatedAt: (row.updated_at as string) ?? '',
  };
}

export class BusinessRepository implements IBusinessRepository {

  async getMyBusinesses(): Promise<BusinessWithMembership[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data: memberships, error: membershipError } = await supabase
      .from('business_members')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .is('deleted_at', null);
    if (membershipError || !memberships?.length) return [];
    const businessIds = [...new Set(memberships.map((m) => m.business_account_id as string))];
    const { data: businesses, error: businessError } = await supabase
      .from('business_accounts').select('*').in('id', businessIds).is('deleted_at', null);
    if (businessError || !businesses) return [];
    const memberMap = new Map<string, BusinessMembership>();
    for (const m of memberships) {
      memberMap.set(m.business_account_id as string, mapBusinessMembership(m as Record<string, unknown>));
    }
    return businesses.map((b) => {
      const account = mapBusinessAccount(b as Record<string, unknown>);
      return { ...account, membership: memberMap.get(account.id) ?? null };
    });
  }

  async getBusinessById(businessId: string): Promise<BusinessAccount | null> {
    const { data, error } = await supabase
      .from('business_accounts').select('*').eq('id', businessId).is('deleted_at', null).single();
    if (error || !data) return null;
    return mapBusinessAccount(data as Record<string, unknown>);
  }

  async createBusiness(input: CreateBusinessInput): Promise<BusinessAccount> {
    const { data, error } = await supabase
      .from('business_accounts')
      .insert({
        name: input.name, description: input.description ?? null, business_type: input.businessType ?? null,
        email: input.email ?? null, phone: input.phone ?? null, website: input.website ?? null,
      })
      .select('*').single();
    if (error) throw new Error(`Failed to create business: ${error.message}`);
    return mapBusinessAccount(data as Record<string, unknown>);
  }

  async updateBusiness(businessId: string, input: UpdateBusinessInput): Promise<BusinessAccount> {
    const updates: Record<string, unknown> = {};
    if (input.name !== undefined) updates.name = input.name;
    if (input.description !== undefined) updates.description = input.description;
    if (input.businessType !== undefined) updates.business_type = input.businessType;
    if (input.email !== undefined) updates.email = input.email;
    if (input.phone !== undefined) updates.phone = input.phone;
    if (input.website !== undefined) updates.website = input.website;
    const { data, error } = await supabase
      .from('business_accounts').update(updates).eq('id', businessId).select('*').single();
    if (error) throw new Error(`Failed to update business: ${error.message}`);
    return mapBusinessAccount(data as Record<string, unknown>);
  }

  async getBusinessPlaces(businessId: string): Promise<RestaurantCatalogItem[]> {
    const { data: places, error } = await supabase
      .from('places')
      .select(`id, slug, name, description, city, address, cuisine, price_range, rating, latitude, longitude, is_featured, place_images(image_url, sort_order, is_primary), place_contacts(kind, value, is_primary)`)
      .eq('business_account_id', businessId).is('deleted_at', null).order('name', { ascending: true });
    if (error || !places) return [];
    return places.map((p) => {
      const images = (p.place_images as Record<string, unknown>[]) ?? [];
      const primaryImage = images.find((img) => img.is_primary === true) ?? images.sort((a, b) => Number(a.sort_order) - Number(b.sort_order))[0];
      const contacts = (p.place_contacts as Record<string, unknown>[]) ?? [];
      const phoneContact = contacts.find((c) => c.kind === 'phone' && c.is_primary === true) ?? contacts.find((c) => c.kind === 'phone');
      const websiteContact = contacts.find((c) => c.kind === 'website' && c.is_primary === true) ?? contacts.find((c) => c.kind === 'website');
      return {
        id: p.id as string, slug: (p.slug as string) ?? '', name: p.name as string,
        description: (p.description as string) ?? null, city: (p.city as string) ?? '',
        address: (p.address as string) ?? null, cuisine: (p.cuisine as string) ?? null,
        priceRange: (p.price_range as string) ?? null,
        rating: Number.isFinite(Number(p.rating)) ? Number(p.rating) : 0,
        latitude: p.latitude == null ? null : Number(p.latitude),
        longitude: p.longitude == null ? null : Number(p.longitude),
        phone: (phoneContact?.value as string) ?? null,
        website: (websiteContact?.value as string) ?? null,
        imageUrl: (primaryImage?.image_url as string) ?? null,
        isFeatured: Boolean(p.is_featured),
      };
    });
  }

  async getBusinessClaims(businessId: string): Promise<BusinessPlaceClaim[]> {
    const { data, error } = await supabase
      .from('business_place_claims').select('*').eq('business_account_id', businessId).is('deleted_at', null).order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((row) => mapBusinessPlaceClaim(row as Record<string, unknown>));
  }

  async getMyClaims(): Promise<BusinessPlaceClaim[]> {
    const { data, error } = await supabase
      .from('business_place_claims').select('*').is('deleted_at', null).order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((row) => mapBusinessPlaceClaim(row as Record<string, unknown>));
  }

  async createPlaceClaim(input: CreatePlaceClaimInput): Promise<BusinessPlaceClaim> {
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('business_place_claims')
      .insert({
        business_account_id: input.businessAccountId,
        place_id: input.placeId,
        claim_message: input.claimMessage ?? null,
        user_id: userData.user?.id,
      })
      .select('*').single();
    if (error) throw new Error(`Failed to create claim: ${error.message}`);
    return mapBusinessPlaceClaim(data as Record<string, unknown>);
  }

  async getAdminPendingClaims(): Promise<BusinessPlaceClaim[]> {
    const { data, error } = await supabase
      .from('business_place_claims').select('*').eq('status', 'pending').is('deleted_at', null).order('created_at', { ascending: true });
    if (error || !data) return [];
    return data.map((row) => mapBusinessPlaceClaim(row as Record<string, unknown>));
  }

  async getAdminPendingBusinesses(): Promise<BusinessAccount[]> {
    const { data, error } = await supabase
      .from('business_accounts').select('*').eq('status', 'pending').is('deleted_at', null).order('created_at', { ascending: true });
    if (error || !data) return [];
    return data.map((row) => mapBusinessAccount(row as Record<string, unknown>));
  }

  async approveClaim(claimId: string, notes?: string): Promise<BusinessPlaceClaim> {
    const { data, error } = await supabase
      .from('business_place_claims')
      .update({ status: 'approved', admin_notes: notes ?? null, reviewed_at: new Date().toISOString() })
      .eq('id', claimId).select('*').single();
    if (error) throw new Error(`Failed to approve claim: ${error.message}`);
    return mapBusinessPlaceClaim(data as Record<string, unknown>);
  }

  async rejectClaim(claimId: string, notes: string): Promise<BusinessPlaceClaim> {
    const { data, error } = await supabase
      .from('business_place_claims')
      .update({ status: 'rejected', admin_notes: notes, reviewed_at: new Date().toISOString() })
      .eq('id', claimId).select('*').single();
    if (error) throw new Error(`Failed to reject claim: ${error.message}`);
    return mapBusinessPlaceClaim(data as Record<string, unknown>);
  }

  async approveBusiness(businessId: string): Promise<BusinessAccount> {
    const { data, error } = await supabase
      .from('business_accounts').update({ status: 'active' }).eq('id', businessId).select('*').single();
    if (error) throw new Error(`Failed to approve business: ${error.message}`);
    return mapBusinessAccount(data as Record<string, unknown>);
  }

  async isAdmin(): Promise<boolean> {
    const { data, error } = await supabase.rpc('is_admin');
    if (error) return false;
    return Boolean(data);
  }

  async getPlaceForEditing(placeId: string): Promise<PlaceForEditing | null> {
    const { data: place, error } = await supabase
      .from('places')
      .select(`id, name, description, address, city, price_range, restaurant_profiles(cuisine, tagline), place_contacts(kind, value, is_primary), place_hours(day_of_week, open_time, close_time, is_closed, sort_order)`)
      .eq('id', placeId).is('deleted_at', null).single();
    if (error || !place) return null;
    const profile = (place.restaurant_profiles as Record<string, unknown>[])?.[0];
    const contacts = (place.place_contacts as Record<string, unknown>[]) ?? [];
    const hours = (place.place_hours as Record<string, unknown>[]) ?? [];
    const phoneContact = contacts.find((c) => c.kind === 'phone' && c.is_primary === true) ?? contacts.find((c) => c.kind === 'phone');
    const emailContact = contacts.find((c) => c.kind === 'email' && c.is_primary === true) ?? contacts.find((c) => c.kind === 'email');
    const websiteContact = contacts.find((c) => c.kind === 'website' && c.is_primary === true) ?? contacts.find((c) => c.kind === 'website');
    const dayOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const sortedHours = [...hours].sort((a, b) => dayOrder.indexOf(a.day_of_week as string) - dayOrder.indexOf(b.day_of_week as string));
    return {
      id: place.id as string, name: place.name as string, description: (place.description as string) ?? null,
      address: (place.address as string) ?? null, city: (place.city as string) ?? null,
      phone: (phoneContact?.value as string) ?? null, email: (emailContact?.value as string) ?? null,
      website: (websiteContact?.value as string) ?? null,
      cuisine: (profile?.cuisine as string) ?? null, tagline: (profile?.tagline as string) ?? null,
      priceRange: (place.price_range as string) ?? null,
      hours: sortedHours.map((h) => ({
        dayOfWeek: (h.day_of_week as string) ?? '', openTime: (h.open_time as string) ?? null,
        closeTime: (h.close_time as string) ?? null, isClosed: (h.is_closed as boolean) ?? false,
      })),
    };
  }

  async updatePlaceDetails(placeId: string, input: UpdatePlaceInput): Promise<void> {
    const placeUpdates: Record<string, unknown> = {};
    if (input.name !== undefined) placeUpdates.name = input.name;
    if (input.description !== undefined) placeUpdates.description = input.description;
    if (input.address !== undefined) placeUpdates.address = input.address;
    if (input.city !== undefined) placeUpdates.city = input.city;
    if (input.priceRange !== undefined) placeUpdates.price_range = input.priceRange;
    if (Object.keys(placeUpdates).length > 0) {
      const { error: placeError } = await supabase.from('places').update(placeUpdates).eq('id', placeId);
      if (placeError) throw new Error(`Failed to update place: ${placeError.message}`);
    }
    const profileUpdates: Record<string, unknown> = {};
    if (input.cuisine !== undefined) profileUpdates.cuisine = input.cuisine;
    if (input.tagline !== undefined) profileUpdates.tagline = input.tagline;
    if (Object.keys(profileUpdates).length > 0) {
      const { error: profileError } = await supabase.from('restaurant_profiles').update(profileUpdates).eq('place_id', placeId);
      if (profileError && profileError.code !== 'PGRST116') {
        const { error: upsertError } = await supabase.from('restaurant_profiles').upsert({ place_id: placeId, ...profileUpdates }, { onConflict: 'place_id' });
        if (upsertError) throw new Error(`Failed to update restaurant profile: ${upsertError.message}`);
      }
    }
    if (input.phone !== undefined || input.email !== undefined || input.website !== undefined) {
      const { data: existingContacts } = await supabase.from('place_contacts').select('id, kind').eq('place_id', placeId).is('deleted_at', null);
      const existingMap = new Map<string, string>();
      if (existingContacts) for (const c of existingContacts) existingMap.set(c.kind as string, c.id as string);
      const contactUpserts: Record<string, unknown>[] = [];
      if (input.phone !== undefined) {
        const id = existingMap.get('phone');
        contactUpserts.push({ ...(id ? { id } : {}), place_id: placeId, kind: 'phone', value: input.phone || null, is_primary: true });
      }
      if (input.email !== undefined) {
        const id = existingMap.get('email');
        contactUpserts.push({ ...(id ? { id } : {}), place_id: placeId, kind: 'email', value: input.email || null, is_primary: true });
      }
      if (input.website !== undefined) {
        const id = existingMap.get('website');
        contactUpserts.push({ ...(id ? { id } : {}), place_id: placeId, kind: 'website', value: input.website || null, is_primary: true });
      }
      if (contactUpserts.length > 0) {
        const { error: contactError } = await supabase.from('place_contacts').upsert(contactUpserts, { onConflict: 'place_id,kind' });
        if (contactError) throw new Error(`Failed to update contacts: ${contactError.message}`);
      }
    }
    if (input.hours) {
      await supabase.from('place_hours').delete().eq('place_id', placeId);
      const hoursToInsert = input.hours.map((h) => ({
        place_id: placeId, day_of_week: h.dayOfWeek, open_time: h.openTime || null, close_time: h.closeTime || null, is_closed: h.isClosed,
      }));
      if (hoursToInsert.length > 0) {
        const { error: hoursError } = await supabase.from('place_hours').insert(hoursToInsert);
        if (hoursError) throw new Error(`Failed to update hours: ${hoursError.message}`);
      }
    }
  }

  async getPlaceImages(placeId: string): Promise<PlaceImage[]> {
    const { data, error } = await supabase
      .from('place_images').select('*').eq('place_id', placeId).is('deleted_at', null).order('sort_order', { ascending: true });
    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id as string, placeId: row.place_id as string, imageUrl: row.image_url as string,
      altText: (row.alt_text as string) ?? null, sortOrder: Number(row.sort_order), isPrimary: Boolean(row.is_primary),
    }));
  }

  async uploadPlaceImage(placeId: string, uri: string, fileName: string): Promise<PlaceImage> {
    const filePath = `${placeId}/${Date.now()}_${fileName}`;
    const response = await fetch(uri);
    const blob = await response.blob();
    const { error: uploadError } = await supabase.storage.from('restaurant-images').upload(filePath, blob, { contentType: blob.type || 'image/jpeg', upsert: false });
    if (uploadError) throw new Error(`Failed to upload image: ${uploadError.message}`);
    const { data: urlData } = supabase.storage.from('restaurant-images').getPublicUrl(filePath);
    const imageUrl = urlData?.publicUrl ?? '';
    const { data: existing } = await supabase.from('place_images').select('sort_order').eq('place_id', placeId).is('deleted_at', null).order('sort_order', { ascending: false }).limit(1);
    const sortOrder = (existing?.[0]?.sort_order ?? 0) + 1;
    const { data: inserted, error: insertError } = await supabase
      .from('place_images').insert({ place_id: placeId, image_url: imageUrl, sort_order: sortOrder, is_primary: false }).select('*').single();
    if (insertError) throw new Error(`Failed to save image record: ${insertError.message}`);
    return {
      id: inserted.id as string, placeId: inserted.place_id as string, imageUrl: inserted.image_url as string,
      altText: (inserted.alt_text as string) ?? null, sortOrder: Number(inserted.sort_order), isPrimary: Boolean(inserted.is_primary),
    };
  }

  async deletePlaceImage(imageId: string): Promise<void> {
    const { data: image } = await supabase.from('place_images').select('image_url').eq('id', imageId).single();
    if (image?.image_url) {
      const url = image.image_url as string;
      const pathMatch = url.match(/restaurant-images\/(.+)$/);
      if (pathMatch) await supabase.storage.from('restaurant-images').remove([pathMatch[1]]);
    }
    const { error } = await supabase.from('place_images').update({ deleted_at: new Date().toISOString() }).eq('id', imageId);
    if (error) throw new Error(`Failed to delete image: ${error.message}`);
  }

  async setPrimaryImage(imageId: string, placeId: string): Promise<void> {
    const { error: unsetError } = await supabase.from('place_images').update({ is_primary: false }).eq('place_id', placeId).is('deleted_at', null);
    if (unsetError) throw new Error(`Failed to unset primary: ${unsetError.message}`);
    const { error: setError } = await supabase.from('place_images').update({ is_primary: true }).eq('id', imageId);
    if (setError) throw new Error(`Failed to set primary: ${setError.message}`);
  }

  async reorderImages(images: { id: string; sortOrder: number }[]): Promise<void> {
    for (const img of images) {
      const { error } = await supabase.from('place_images').update({ sort_order: img.sortOrder }).eq('id', img.id);
      if (error) throw new Error(`Failed to reorder: ${error.message}`);
    }
  }

  async getMenuCategories(placeId: string): Promise<MenuCategoryForEditing[]> {
    const { data, error } = await supabase
      .from('menu_categories')
      .select(`id, name, description, sort_order, is_active, menu_items(id, name, description, price, image_url, sort_order, is_available)`)
      .eq('restaurant_id', placeId)
      .order('sort_order', { ascending: true });
    if (error || !data) return [];
    return (data as unknown as Record<string, unknown>[]).map((cat) => {
      const items = (cat.menu_items as Record<string, unknown>[]) ?? [];
      const sortedItems = items
        .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
        .map((item) => ({
          id: item.id as string, name: item.name as string, description: (item.description as string) ?? null,
          price: Number(item.price ?? 0), imageUrl: (item.image_url as string) ?? null,
          sortOrder: Number(item.sort_order ?? 0), isAvailable: Boolean(item.is_available ?? true),
        }));
      return {
        id: cat.id as string, name: cat.name as string, description: (cat.description as string) ?? null,
        sortOrder: Number(cat.sort_order ?? 0), isActive: Boolean(cat.is_active ?? true), items: sortedItems,
      };
    });
  }

  async createMenuCategory(placeId: string, name: string): Promise<MenuCategoryForEditing> {
    const { data: maxSort } = await supabase.from('menu_categories').select('sort_order').eq('restaurant_id', placeId).order('sort_order', { ascending: false }).limit(1);
    const sortOrder = (maxSort?.[0]?.sort_order ?? 0) + 1;
    const { data, error } = await supabase.from('menu_categories').insert({ restaurant_id: placeId, name, sort_order: sortOrder, is_active: true }).select('*').single();
    if (error) throw new Error(`Failed to create category: ${error.message}`);
    return {
      id: data.id as string, name: data.name as string, description: (data.description as string) ?? null,
      sortOrder: Number(data.sort_order ?? 0), isActive: Boolean(data.is_active ?? true), items: [],
    };
  }

  async updateMenuCategory(categoryId: string, input: { name?: string; description?: string; isActive?: boolean }): Promise<void> {
    const updates: Record<string, unknown> = {};
    if (input.name !== undefined) updates.name = input.name;
    if (input.description !== undefined) updates.description = input.description;
    if (input.isActive !== undefined) updates.is_active = input.isActive;
    const { error } = await supabase.from('menu_categories').update(updates).eq('id', categoryId);
    if (error) throw new Error(`Failed to update category: ${error.message}`);
  }

  async deleteMenuCategory(categoryId: string): Promise<void> {
    const { error } = await supabase.from('menu_categories').delete().eq('id', categoryId);
    if (error) throw new Error(`Failed to delete category: ${error.message}`);
  }

  async createMenuItem(categoryId: string, input: { name: string; description?: string; price: number }): Promise<MenuItemForEditing> {
    const { data: maxSort } = await supabase.from('menu_items').select('sort_order').eq('category_id', categoryId).order('sort_order', { ascending: false }).limit(1);
    const sortOrder = (maxSort?.[0]?.sort_order ?? 0) + 1;
    const { data, error } = await supabase.from('menu_items').insert({
      category_id: categoryId, name: input.name, description: input.description ?? null, price: input.price, sort_order: sortOrder, is_available: true,
    }).select('*').single();
    if (error) throw new Error(`Failed to create menu item: ${error.message}`);
    return {
      id: data.id as string, name: data.name as string, description: (data.description as string) ?? null,
      price: Number(data.price ?? 0), imageUrl: (data.image_url as string) ?? null,
      sortOrder: Number(data.sort_order ?? 0), isAvailable: Boolean(data.is_available ?? true),
    };
  }

  async updateMenuItem(itemId: string, input: { name?: string; description?: string; price?: number; isAvailable?: boolean }): Promise<void> {
    const updates: Record<string, unknown> = {};
    if (input.name !== undefined) updates.name = input.name;
    if (input.description !== undefined) updates.description = input.description;
    if (input.price !== undefined) updates.price = input.price;
    if (input.isAvailable !== undefined) updates.is_available = input.isAvailable;
    const { error } = await supabase.from('menu_items').update(updates).eq('id', itemId);
    if (error) throw new Error(`Failed to update menu item: ${error.message}`);
  }

  async deleteMenuItem(itemId: string): Promise<void> {
    const { error } = await supabase.from('menu_items').delete().eq('id', itemId);
    if (error) throw new Error(`Failed to delete menu item: ${error.message}`);
  }

  async getSpecials(placeId: string): Promise<import('../../repositories/types').SpecialForEditing[]> {
    const { data, error } = await supabase
      .from('restaurant_specials')
      .select('*')
      .eq('place_id', placeId)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true });
    if (error || !data) return [];
    return data.map((r) => ({
      id: r.id as string,
      name: r.name as string,
      description: (r.description as string) ?? null,
      originalPrice: (r.original_price as string) ?? null,
      price: (r.price as string) ?? '',
      discountLabel: (r.discount_label as string) ?? null,
      availableUntil: (r.available_until as string) ?? null,
      isActive: Boolean(r.is_active ?? true),
      sortOrder: Number(r.sort_order ?? 0),
    }));
  }

  async createSpecial(
    placeId: string,
    input: import('../../repositories/types').CreateSpecialInput,
  ): Promise<import('../../repositories/types').SpecialForEditing> {
    const { data: maxSort } = await supabase.from('restaurant_specials').select('sort_order').eq('place_id', placeId).is('deleted_at', null).order('sort_order', { ascending: false }).limit(1);
    const sortOrder = (maxSort?.[0]?.sort_order ?? 0) + 1;
    const { data, error } = await supabase.from('restaurant_specials').insert({
      place_id: placeId, name: input.name, description: input.description ?? null,
      original_price: input.originalPrice ?? null, price: input.price, discount_label: input.discountLabel ?? null,
      available_until: input.availableUntil ?? null, sort_order: sortOrder, is_active: true,
    }).select('*').single();
    if (error) throw new Error(`Failed to create special: ${error.message}`);
    return {
      id: data.id as string, name: data.name as string, description: (data.description as string) ?? null,
      originalPrice: (data.original_price as string) ?? null, price: (data.price as string) ?? '',
      discountLabel: (data.discount_label as string) ?? null, availableUntil: (data.available_until as string) ?? null,
      isActive: Boolean(data.is_active ?? true), sortOrder: Number(data.sort_order ?? 0),
    };
  }

  async updateSpecial(specialId: string, input: import('../../repositories/types').UpdateSpecialInput): Promise<void> {
    const updates: Record<string, unknown> = {};
    if (input.name !== undefined) updates.name = input.name;
    if (input.description !== undefined) updates.description = input.description;
    if (input.originalPrice !== undefined) updates.original_price = input.originalPrice;
    if (input.price !== undefined) updates.price = input.price;
    if (input.discountLabel !== undefined) updates.discount_label = input.discountLabel;
    if (input.availableUntil !== undefined) updates.available_until = input.availableUntil;
    if (input.isActive !== undefined) updates.is_active = input.isActive;
    const { error } = await supabase.from('restaurant_specials').update(updates).eq('id', specialId);
    if (error) throw new Error(`Failed to update special: ${error.message}`);
  }

  async deleteSpecial(specialId: string): Promise<void> {
    const { error } = await supabase.from('restaurant_specials').update({ deleted_at: new Date().toISOString() }).eq('id', specialId);
    if (error) throw new Error(`Failed to delete special: ${error.message}`);
  }
}

export const businessRepository = new BusinessRepository();