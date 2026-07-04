import { supabase } from '../../lib/supabase';
import type {
  BusinessAccount, BusinessMembership, BusinessPlaceClaim, BusinessWithMembership,
  CreateBusinessInput, CreatePlaceClaimInput, CreatePlaceRequestInput, IBusinessRepository,
  MenuCategoryForEditing, MenuItemForEditing, PlaceForEditing, PlaceImage, PlaceRequest,
  RestaurantCatalogItem, SpecialForEditing, CreateSpecialInput, UpdateSpecialInput,
  UpdateBusinessInput, UpdatePlaceInput,
} from '../../repositories/types';

function mapBusinessAccount(row: Record<string, unknown>): BusinessAccount {
  return { id: row.id as string, slug: (row.slug as string) ?? '', name: row.name as string, description: (row.description as string) ?? null, businessType: (row.business_type as string) ?? null, email: (row.email as string) ?? null, phone: (row.phone as string) ?? null, website: (row.website as string) ?? null, logoUrl: (row.logo_url as string) ?? null, status: (row.status as BusinessAccount['status']) ?? 'pending', createdAt: (row.created_at as string) ?? '', updatedAt: (row.updated_at as string) ?? '', createdBy: (row.created_by as string) ?? null };
}
function mapBusinessMembership(row: Record<string, unknown>): BusinessMembership {
  return { id: row.id as string, businessAccountId: (row.business_account_id as string) ?? '', userId: (row.user_id as string) ?? '', role: (row.role as BusinessMembership['role']) ?? 'staff', status: (row.status as BusinessMembership['status']) ?? 'invited', createdAt: (row.created_at as string) ?? '' };
}
function mapBusinessPlaceClaim(row: Record<string, unknown>): BusinessPlaceClaim {
  return { id: row.id as string, businessAccountId: (row.business_account_id as string) ?? '', placeId: (row.place_id as string) ?? '', userId: (row.user_id as string) ?? '', claimMessage: (row.claim_message as string) ?? null, status: (row.status as BusinessPlaceClaim['status']) ?? 'pending', adminNotes: (row.admin_notes as string) ?? null, reviewedBy: (row.reviewed_by as string) ?? null, reviewedAt: (row.reviewed_at as string) ?? null, createdAt: (row.created_at as string) ?? '', updatedAt: (row.updated_at as string) ?? '' };
}
function mapPlaceRequest(row: Record<string, unknown>): PlaceRequest {
  return { id: row.id as string, businessAccountId: row.business_account_id as string, userId: row.user_id as string, name: row.name as string, description: (row.description as string) ?? null, address: (row.address as string) ?? null, city: (row.city as string) ?? null, cuisine: (row.cuisine as string) ?? null, priceRange: (row.price_range as string) ?? null, phone: (row.phone as string) ?? null, email: (row.email as string) ?? null, website: (row.website as string) ?? null, status: (row.status as PlaceRequest['status']) ?? 'pending', adminNotes: (row.admin_notes as string) ?? null, reviewedBy: (row.reviewed_by as string) ?? null, reviewedAt: (row.reviewed_at as string) ?? null, createdAt: (row.created_at as string) ?? '', updatedAt: (row.updated_at as string) ?? '', createdBy: (row.created_by as string) ?? null };
}

export class BusinessRepository implements IBusinessRepository {
  async getMyBusinesses(): Promise<BusinessWithMembership[]> {
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return [];
    const { data: memberships, error } = await supabase.from('business_members').select('*').eq('user_id', user.id).eq('status', 'active').is('deleted_at', null);
    if (error || !memberships?.length) return [];
    const ids = [...new Set(memberships.map(m => m.business_account_id as string))];
    const { data: businesses, error: e2 } = await supabase.from('business_accounts').select('*').in('id', ids).is('deleted_at', null);
    if (e2 || !businesses) return [];
    const mm = new Map<string, BusinessMembership>();
    memberships.forEach(m => mm.set(m.business_account_id as string, mapBusinessMembership(m as Record<string, unknown>)));
    return businesses.map(b => ({ ...mapBusinessAccount(b as Record<string, unknown>), membership: mm.get((b as Record<string, unknown>).id as string) ?? null }));
  }
  async getBusinessById(businessId: string) { const { data, error } = await supabase.from('business_accounts').select('*').eq('id', businessId).is('deleted_at', null).single(); if (error || !data) return null; return mapBusinessAccount(data as Record<string, unknown>); }
  async createBusiness(input: CreateBusinessInput): Promise<BusinessAccount> {
    const { data, error } = await supabase.rpc('create_business_account', {
      p_name: input.name,
      p_description: input.description ?? null,
      p_business_type: input.businessType ?? null,
      p_email: input.email ?? null,
      p_phone: input.phone ?? null,
      p_website: input.website ?? null,
    });
    if (error) throw new Error(error.message);
    const business = await this.getBusinessById(data as string);
    if (!business) throw new Error('Business created but could not be retrieved. Please refresh the dashboard.');
    return business;
  }
  async updateBusiness(businessId: string, input: UpdateBusinessInput) { const u: Record<string, unknown> = {}; if (input.name !== undefined) u.name = input.name; if (input.description !== undefined) u.description = input.description; if (input.businessType !== undefined) u.business_type = input.businessType; if (input.email !== undefined) u.email = input.email; if (input.phone !== undefined) u.phone = input.phone; if (input.website !== undefined) u.website = input.website; const { data, error } = await supabase.from('business_accounts').update(u).eq('id', businessId).select('*').single(); if (error) throw new Error(error.message); return mapBusinessAccount(data as Record<string, unknown>); }
  async getBusinessPlaces(businessId: string): Promise<RestaurantCatalogItem[]> {
    const { data, error } = await supabase.from('places').select('id, slug, name, description, city, address, price_range, rating, latitude, longitude, is_featured, place_images(image_url, sort_order, is_primary), place_contacts(kind, value, is_primary), restaurant_profiles!inner(cuisine)').eq('business_account_id', businessId).is('deleted_at', null).order('name');
    if (error || !data) return [];
    return data.map((p: Record<string, unknown>) => { const imgs = (p.place_images as Record<string, unknown>[]) ?? []; const pi = imgs.find(i => i.is_primary) ?? imgs.sort((a, b) => Number(a.sort_order) - Number(b.sort_order))[0]; const ct = (p.place_contacts as Record<string, unknown>[]) ?? []; const ph = ct.find(c => c.kind === 'phone' && c.is_primary) ?? ct.find(c => c.kind === 'phone'); const ws = ct.find(c => c.kind === 'website' && c.is_primary) ?? ct.find(c => c.kind === 'website'); const pf = (p.restaurant_profiles as Record<string, unknown>[])?.[0]; return { id: p.id as string, slug: (p.slug as string) ?? '', name: p.name as string, description: (p.description as string) ?? null, city: (p.city as string) ?? '', address: (p.address as string) ?? null, cuisine: (pf?.cuisine as string) ?? null, priceRange: (p.price_range as string) ?? null, rating: Number.isFinite(Number(p.rating)) ? Number(p.rating) : 0, latitude: p.latitude == null ? null : Number(p.latitude), longitude: p.longitude == null ? null : Number(p.longitude), phone: (ph?.value as string) ?? null, website: (ws?.value as string) ?? null, imageUrl: (pi?.image_url as string) ?? null, isFeatured: Boolean(p.is_featured) }; });
  }
  async getBusinessClaims(businessId: string) { const { data, error } = await supabase.from('business_place_claims').select('*').eq('business_account_id', businessId).is('deleted_at', null).order('created_at', { ascending: false }); if (error || !data) return []; return data.map(r => mapBusinessPlaceClaim(r as Record<string, unknown>)); }
  async getMyClaims() { const { data, error } = await supabase.from('business_place_claims').select('*').is('deleted_at', null).order('created_at', { ascending: false }); if (error || !data) return []; return data.map(r => mapBusinessPlaceClaim(r as Record<string, unknown>)); }
  async createPlaceClaim(input: CreatePlaceClaimInput) { const { data: u } = await supabase.auth.getUser(); const { data, error } = await supabase.from('business_place_claims').insert({ business_account_id: input.businessAccountId, place_id: input.placeId, claim_message: input.claimMessage ?? null, user_id: u.user?.id }).select('*').single(); if (error) throw new Error(error.message); return mapBusinessPlaceClaim(data as Record<string, unknown>); }
  async getAdminPendingClaims() { const { data, error } = await supabase.from('business_place_claims').select('*').eq('status', 'pending').is('deleted_at', null).order('created_at'); if (error || !data) return []; return data.map(r => mapBusinessPlaceClaim(r as Record<string, unknown>)); }
  async getAdminPendingBusinesses() { const { data, error } = await supabase.from('business_accounts').select('*').eq('status', 'pending').is('deleted_at', null).order('created_at'); if (error || !data) return []; return data.map(r => mapBusinessAccount(r as Record<string, unknown>)); }
  async approveClaim(claimId: string, notes?: string) { const { data, error } = await supabase.from('business_place_claims').update({ status: 'approved', admin_notes: notes ?? null, reviewed_at: new Date().toISOString() }).eq('id', claimId).select('*').single(); if (error) throw new Error(error.message); return mapBusinessPlaceClaim(data as Record<string, unknown>); }
  async rejectClaim(claimId: string, notes: string) { const { data, error } = await supabase.from('business_place_claims').update({ status: 'rejected', admin_notes: notes, reviewed_at: new Date().toISOString() }).eq('id', claimId).select('*').single(); if (error) throw new Error(error.message); return mapBusinessPlaceClaim(data as Record<string, unknown>); }
  async approveBusiness(businessId: string) { const { data, error } = await supabase.from('business_accounts').update({ status: 'active' }).eq('id', businessId).select('*').single(); if (error) throw new Error(error.message); return mapBusinessAccount(data as Record<string, unknown>); }
  async rejectBusiness(businessId: string, notes: string) { const { data, error } = await supabase.from('business_accounts').update({ status: 'inactive', admin_notes: notes }).eq('id', businessId).select('*').single(); if (error) throw new Error(error.message); return mapBusinessAccount(data as Record<string, unknown>); }
  async isAdmin() { const { data, error } = await supabase.rpc('is_admin'); if (error) return false; return Boolean(data); }
  async getAdminPendingPlaceRequests() { const { data, error } = await supabase.from('place_requests').select('*').eq('status', 'pending').is('deleted_at', null).order('created_at'); if (error || !data) return []; return data.map(r => mapPlaceRequest(r as Record<string, unknown>)); }
  async approvePlaceRequest(requestId: string) { const { error } = await supabase.rpc('approve_place_request', { request_id: requestId }); if (error) throw new Error(error.message); }
  async rejectPlaceRequest(requestId: string, notes: string) { const { error } = await supabase.from('place_requests').update({ status: 'rejected', admin_notes: notes, reviewed_at: new Date().toISOString() }).eq('id', requestId); if (error) throw new Error(error.message); }
  async getPlaceForEditing(placeId: string) { const { data, error } = await supabase.from('places').select('id, name, description, address, city, price_range, restaurant_profiles(cuisine, tagline), place_contacts(kind, value, is_primary), place_hours(day_of_week, open_time, close_time, is_closed, sort_order)').eq('id', placeId).is('deleted_at', null).single(); if (error || !data) return null; const p = data as Record<string, unknown>; const pf = (p.restaurant_profiles as Record<string, unknown>[])?.[0]; const ct = (p.place_contacts as Record<string, unknown>[]) ?? []; const hrs = (p.place_hours as Record<string, unknown>[]) ?? []; const ph = ct.find(c => c.kind === 'phone' && c.is_primary) ?? ct.find(c => c.kind === 'phone'); const em = ct.find(c => c.kind === 'email' && c.is_primary) ?? ct.find(c => c.kind === 'email'); const ws = ct.find(c => c.kind === 'website' && c.is_primary) ?? ct.find(c => c.kind === 'website'); const order = ['mon','tue','wed','thu','fri','sat','sun']; const sh = [...hrs].sort((a,b) => order.indexOf(a.day_of_week as string) - order.indexOf(b.day_of_week as string)); return { id: p.id as string, name: p.name as string, description: (p.description as string) ?? null, address: (p.address as string) ?? null, city: (p.city as string) ?? null, phone: (ph?.value as string) ?? null, email: (em?.value as string) ?? null, website: (ws?.value as string) ?? null, cuisine: (pf?.cuisine as string) ?? null, tagline: (pf?.tagline as string) ?? null, priceRange: (p.price_range as string) ?? null, hours: sh.map(h => ({ dayOfWeek: (h.day_of_week as string) ?? '', openTime: (h.open_time as string) ?? null, closeTime: (h.close_time as string) ?? null, isClosed: Boolean(h.is_closed) })) }; }
  async updatePlaceDetails(placeId: string, input: UpdatePlaceInput): Promise<void> {
    const up: Record<string, unknown> = {};
    if (input.name !== undefined) up.name = input.name; if (input.description !== undefined) up.description = input.description; if (input.address !== undefined) up.address = input.address; if (input.city !== undefined) up.city = input.city; if (input.priceRange !== undefined) up.price_range = input.priceRange;
    if (Object.keys(up).length) { const { error } = await supabase.from('places').update(up).eq('id', placeId); if (error) throw new Error(error.message); }
    const fup: Record<string, unknown> = {}; if (input.cuisine !== undefined) fup.cuisine = input.cuisine; if (input.tagline !== undefined) fup.tagline = input.tagline;
    if (Object.keys(fup).length) { const { error } = await supabase.from('restaurant_profiles').update(fup).eq('place_id', placeId); if (error && error.code !== 'PGRST116') { const { error: ue } = await supabase.from('restaurant_profiles').upsert({ place_id: placeId, ...fup }, { onConflict: 'place_id' }); if (ue) throw new Error(ue.message); } }
    if (input.phone !== undefined || input.email !== undefined || input.website !== undefined) {
      const { data: ec } = await supabase.from('place_contacts').select('id, kind').eq('place_id', placeId).is('deleted_at', null); const m = new Map<string, string>(); if (ec) ec.forEach(c => m.set(c.kind as string, c.id as string));
      const ups: Record<string, unknown>[] = [];
      if (input.phone !== undefined) { const id = m.get('phone'); ups.push({ ...(id ? { id } : {}), place_id: placeId, kind: 'phone', value: input.phone || null, is_primary: true }); }
      if (input.email !== undefined) { const id = m.get('email'); ups.push({ ...(id ? { id } : {}), place_id: placeId, kind: 'email', value: input.email || null, is_primary: true }); }
      if (input.website !== undefined) { const id = m.get('website'); ups.push({ ...(id ? { id } : {}), place_id: placeId, kind: 'website', value: input.website || null, is_primary: true }); }
      if (ups.length) { const { error } = await supabase.from('place_contacts').upsert(ups, { onConflict: 'id' }); if (error) throw new Error(error.message); }
    }
    if (input.hours) { await supabase.from('place_hours').delete().eq('place_id', placeId); const h = input.hours.map(h => ({ place_id: placeId, day_of_week: h.dayOfWeek, open_time: h.openTime || null, close_time: h.closeTime || null, is_closed: h.isClosed })); if (h.length) { const { error } = await supabase.from('place_hours').insert(h); if (error) throw new Error(error.message); } }
  }
  async getPlaceImages(placeId: string) { const { data, error } = await supabase.from('place_images').select('*').eq('place_id', placeId).is('deleted_at', null).order('sort_order'); if (error || !data) return []; return data.map(r => ({ id: r.id as string, placeId: r.place_id as string, imageUrl: r.image_url as string, altText: (r.alt_text as string) ?? null, sortOrder: Number(r.sort_order), isPrimary: Boolean(r.is_primary) })); }
  async uploadPlaceImage(placeId: string, uri: string, fileName: string) {
    const ext = (fileName.split('.').pop()?.split('?')[0] ?? 'jpg').toLowerCase();
    const fp = `${placeId}/${Date.now()}_${fileName}`;

    // Use arrayBuffer (proven pattern from src/lib/storage.ts and ruralMarketRepository).
    // fetch().blob() produces 0-byte payloads on React Native.
    const response = await fetch(uri);
    if (!response.ok) throw new Error(`Failed to read image file: ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();
    const contentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : ext === 'heic' ? 'image/heic' : 'image/jpeg';

    const { error: ue } = await supabase.storage.from('restaurant-images').upload(fp, arrayBuffer, { contentType, upsert: false });
    if (ue) throw new Error(ue.message);

    const { data: ud } = supabase.storage.from('restaurant-images').getPublicUrl(fp);
    const url = ud?.publicUrl ?? '';
    const { data: ex } = await supabase.from('place_images').select('sort_order').eq('place_id', placeId).is('deleted_at', null).order('sort_order', { ascending: false }).limit(1);
    const so = (ex?.[0]?.sort_order ?? 0) + 1;
    const { data: ins, error: ie } = await supabase.from('place_images').insert({ place_id: placeId, image_url: url, sort_order: so, is_primary: false }).select('*').single();
    if (ie) throw new Error(ie.message);
    return { id: ins.id as string, placeId: ins.place_id as string, imageUrl: ins.image_url as string, altText: (ins.alt_text as string) ?? null, sortOrder: Number(ins.sort_order), isPrimary: Boolean(ins.is_primary) };
  }
  async deletePlaceImage(imageId: string) { const { data: img } = await supabase.from('place_images').select('image_url').eq('id', imageId).single(); if (img?.image_url) { const m = (img.image_url as string).match(/restaurant-images\/(.+)$/); if (m) await supabase.storage.from('restaurant-images').remove([m[1]]); } const { error } = await supabase.from('place_images').update({ deleted_at: new Date().toISOString() }).eq('id', imageId); if (error) throw new Error(error.message); }
  async setPrimaryImage(imageId: string, placeId: string) { const { error: e1 } = await supabase.from('place_images').update({ is_primary: false }).eq('place_id', placeId).is('deleted_at', null); if (e1) throw new Error(e1.message); const { error: e2 } = await supabase.from('place_images').update({ is_primary: true }).eq('id', imageId); if (e2) throw new Error(e2.message); }
  async reorderImages(images: { id: string; sortOrder: number }[]) { for (const img of images) { const { error } = await supabase.from('place_images').update({ sort_order: img.sortOrder }).eq('id', img.id); if (error) throw new Error(error.message); } }
  async getMenuCategories(placeId: string): Promise<MenuCategoryForEditing[]> { const { data, error } = await supabase.from('menu_categories').select('id, name, description, sort_order, is_active, menu_items(id, name, description, price, image_url, sort_order, is_available)').eq('restaurant_id', placeId).order('sort_order'); if (error || !data) return []; return (data as unknown as Record<string, unknown>[]).map(cat => { const items = (cat.menu_items as Record<string, unknown>[]) ?? []; const si = items.sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)).map(item => ({ id: item.id as string, name: item.name as string, description: (item.description as string) ?? null, price: Number(item.price ?? 0), imageUrl: (item.image_url as string) ?? null, sortOrder: Number(item.sort_order ?? 0), isAvailable: Boolean(item.is_available ?? true) })); return { id: cat.id as string, name: cat.name as string, description: (cat.description as string) ?? null, sortOrder: Number(cat.sort_order ?? 0), isActive: Boolean(cat.is_active ?? true), items: si }; }); }
  async createMenuCategory(placeId: string, name: string) {
    const { data, error } = await supabase.rpc('create_menu_category', { p_restaurant_id: placeId, p_name: name });
    if (error) throw new Error(error.message);
    return { id: data as string, name, description: null as string | null, sortOrder: 0, isActive: true, items: [] as MenuItemForEditing[] };
  }
  async updateMenuCategory(categoryId: string, input: { name?: string; description?: string; isActive?: boolean }) { const u: Record<string, unknown> = {}; if (input.name !== undefined) u.name = input.name; if (input.description !== undefined) u.description = input.description; if (input.isActive !== undefined) u.is_active = input.isActive; const { error } = await supabase.from('menu_categories').update(u).eq('id', categoryId); if (error) throw new Error(error.message); }
  async deleteMenuCategory(categoryId: string) { const { error } = await supabase.from('menu_categories').delete().eq('id', categoryId); if (error) throw new Error(error.message); }
  async createMenuItem(categoryId: string, input: { name: string; description?: string; price: number }) {
    const { data, error } = await supabase.rpc('create_menu_item', { p_category_id: categoryId, p_name: input.name, p_description: input.description ?? null, p_price: input.price });
    if (error) throw new Error(error.message);
    return { id: data as string, name: input.name, description: input.description ?? null, price: input.price, imageUrl: null as string | null, sortOrder: 0, isAvailable: true };
  }
  async updateMenuItem(itemId: string, input: { name?: string; description?: string; price?: number; isAvailable?: boolean }) { const u: Record<string, unknown> = {}; if (input.name !== undefined) u.name = input.name; if (input.description !== undefined) u.description = input.description; if (input.price !== undefined) u.price = input.price; if (input.isAvailable !== undefined) u.is_available = input.isAvailable; const { error } = await supabase.from('menu_items').update(u).eq('id', itemId); if (error) throw new Error(error.message); }
  async deleteMenuItem(itemId: string) { const { error } = await supabase.from('menu_items').delete().eq('id', itemId); if (error) throw new Error(error.message); }
  async getSpecials(placeId: string): Promise<SpecialForEditing[]> { const { data, error } = await supabase.from('restaurant_specials').select('*').eq('place_id', placeId).is('deleted_at', null).order('sort_order'); if (error || !data) return []; return data.map(r => ({ id: r.id as string, name: r.name as string, description: (r.description as string) ?? null, originalPrice: (r.original_price as string) ?? null, price: (r.price as string) ?? '', discountLabel: (r.discount_label as string) ?? null, availableUntil: (r.available_until as string) ?? null, isActive: Boolean(r.is_active ?? true), sortOrder: Number(r.sort_order ?? 0) })); }
  async createSpecial(placeId: string, input: CreateSpecialInput): Promise<SpecialForEditing> { const { data: ms } = await supabase.from('restaurant_specials').select('sort_order').eq('place_id', placeId).is('deleted_at', null).order('sort_order', { ascending: false }).limit(1); const so = (ms?.[0]?.sort_order ?? 0) + 1; const { data, error } = await supabase.from('restaurant_specials').insert({ place_id: placeId, name: input.name, description: input.description ?? null, original_price: input.originalPrice ?? null, price: input.price, discount_label: input.discountLabel ?? null, available_until: input.availableUntil ?? null, sort_order: so, is_active: true }).select('*').single(); if (error) throw new Error(error.message); return { id: data.id as string, name: data.name as string, description: (data.description as string) ?? null, originalPrice: (data.original_price as string) ?? null, price: (data.price as string) ?? '', discountLabel: (data.discount_label as string) ?? null, availableUntil: (data.available_until as string) ?? null, isActive: Boolean(data.is_active ?? true), sortOrder: Number(data.sort_order ?? 0) }; }
  async updateSpecial(specialId: string, input: UpdateSpecialInput) { const u: Record<string, unknown> = {}; if (input.name !== undefined) u.name = input.name; if (input.description !== undefined) u.description = input.description; if (input.originalPrice !== undefined) u.original_price = input.originalPrice; if (input.price !== undefined) u.price = input.price; if (input.discountLabel !== undefined) u.discount_label = input.discountLabel; if (input.availableUntil !== undefined) u.available_until = input.availableUntil; if (input.isActive !== undefined) u.is_active = input.isActive; const { error } = await supabase.from('restaurant_specials').update(u).eq('id', specialId); if (error) throw new Error(error.message); }
  async deleteSpecial(specialId: string) { const { error } = await supabase.from('restaurant_specials').update({ deleted_at: new Date().toISOString() }).eq('id', specialId); if (error) throw new Error(error.message); }
  async createPlaceRequest(input: CreatePlaceRequestInput): Promise<PlaceRequest> { const { data: ud } = await supabase.auth.getUser(); const { data, error } = await supabase.from('place_requests').insert({ business_account_id: input.businessAccountId, user_id: ud.user?.id, name: input.name, description: input.description ?? null, address: input.address ?? null, city: input.city ?? null, cuisine: input.cuisine ?? null, price_range: input.priceRange ?? null, phone: input.phone ?? null, email: input.email ?? null, website: input.website ?? null }).select('*').single(); if (error) throw new Error(error.message); return mapPlaceRequest(data as Record<string, unknown>); }
  async getMyPlaceRequests(businessId: string): Promise<PlaceRequest[]> { const { data, error } = await supabase.from('place_requests').select('*').eq('business_account_id', businessId).is('deleted_at', null).order('created_at', { ascending: false }); if (error || !data) return []; return data.map(r => mapPlaceRequest(r as Record<string, unknown>)); }
}

export const businessRepository = new BusinessRepository();