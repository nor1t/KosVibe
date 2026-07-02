import { supabase } from '../lib/supabase';
import type {
  ActiveOffer,
  EventFeature,
  IEventsRepository,
  KosovoHighlight,
  TavolinaInvite,
} from './types';

// ─── DB Helpers ─────────────────────────────────────────────────────────────

function buildEventHighlight(row: Record<string, unknown>): EventFeature {
  return {
    id: row.id as string,
    title: row.title as string,
    category: row.category as EventFeature['category'],
    venue: row.venue as string,
    date: row.date_display as string,
    description: row.description as string,
    colors: [row.color_from as string, row.color_to as string] as const,
  };
}

function buildInvite(row: Record<string, unknown>): TavolinaInvite {
  return {
    id: row.id as string,
    restaurantId: (row.restaurant_id as string) ?? undefined,
    restaurantName: row.restaurant_name as string,
    city: row.city as string,
    day: row.day as string,
    time: row.time as string,
    eventType: row.event_type as TavolinaInvite['eventType'],
    creator: row.creator_name as string,
    creatorAvatar: row.creator_avatar as string,
    description: row.description as string,
    tags: (row.tags as string[]) ?? [],
    spotsLabel: row.spots_label as string,
    image: row.image_url as string,
    isPaid: (row.is_paid as boolean) ?? undefined,
    price: (row.price as string) ?? undefined,
    maxAttendees: (row.max_attendees as number) ?? undefined,
  };
}

/**
 * Sprint 5 — Database-backed Events Repository
 *
 * All event data comes from the database.
 * Write methods (join, leave, confirm, rate, create) persist to Supabase.
 * Reads populate a cache so the TavolinaScreen stays responsive.
 */

export class EventsRepository implements IEventsRepository {
  private eventHighlightsCache: EventFeature[] = [];
  private tavolinaInvitesCache: TavolinaInvite[] = [];
  private kosovoHighlightsCache: KosovoHighlight[] = [];
  private initialized = false;

  async refresh(): Promise<void> {
    const [highlightsRes, invitesRes, kosovoRes] = await Promise.all([
      supabase
        .from('event_highlights')
        .select('*')
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('sort_order', { ascending: true }),
      supabase
        .from('tavolina_events')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false }),
      supabase
        .from('kosovo_highlights')
        .select('*')
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('sort_order', { ascending: true }),
    ]);

    if (highlightsRes.data) {
      this.eventHighlightsCache = highlightsRes.data.map(buildEventHighlight);
    }

    if (invitesRes.data) {
      this.tavolinaInvitesCache = invitesRes.data.map(buildInvite);
    }

    if (kosovoRes.data) {
      this.kosovoHighlightsCache = kosovoRes.data.map((row) => ({
        id: row.id as string,
        title: row.title as string,
        description: row.description as string,
        accentColor: row.accent_color as string,
      }));
    }

    this.initialized = true;
  }

  private async ensureReady(): Promise<void> {
    if (!this.initialized) {
      await this.refresh();
    }
  }

  // ─── Reads ──────────────────────────────────────────────────────────────

  getEventHighlights(): EventFeature[] {
    return this.eventHighlightsCache.map((e) => ({
      ...e,
      colors: [...e.colors] as const,
    }));
  }

  getTavolinaInvites(): TavolinaInvite[] {
    return this.tavolinaInvitesCache.map((invite) => ({
      ...invite,
      tags: [...invite.tags],
    }));
  }

  getActiveOffers(): ActiveOffer[] {
    // Active offers are restaurant_promotions from Sprint 4.
    // Return empty for now — they're part of the explore/recommendations flow.
    return [];
  }

  getKosovoHighlights(): KosovoHighlight[] {
    return this.kosovoHighlightsCache.map((h) => ({ ...h }));
  }

  // ─── Async reads ────────────────────────────────────────────────────────

  async getTavolinaInvitesAsync(): Promise<TavolinaInvite[]> {
    await this.ensureReady();
    return this.getTavolinaInvites();
  }

  async getKosovoHighlightsAsync(): Promise<KosovoHighlight[]> {
    await this.ensureReady();
    return this.getKosovoHighlights();
  }

  async getEventHighlightsAsync(): Promise<EventFeature[]> {
    await this.ensureReady();
    return this.getEventHighlights();
  }

  // ─── Writes ─────────────────────────────────────────────────────────────

  async createEvent(input: {
    restaurantName: string;
    city: string;
    day: string;
    time: string;
    eventType: string;
    creatorName: string;
    creatorAvatar: string;
    description: string;
    tags: string[];
    spotsLabel: string;
    imageUrl: string;
    isPaid?: boolean;
    price?: string;
    maxAttendees?: number;
    restaurantId?: string;
  }): Promise<TavolinaInvite | null> {
    const { data, error } = await supabase
      .from('tavolina_events')
      .insert({
        restaurant_name: input.restaurantName,
        city: input.city,
        day: input.day,
        time: input.time,
        event_type: input.eventType,
        creator_name: input.creatorName,
        creator_avatar: input.creatorAvatar,
        description: input.description,
        tags: input.tags,
        spots_label: input.spotsLabel,
        image_url: input.imageUrl,
        is_paid: input.isPaid ?? false,
        price: input.price ?? null,
        max_attendees: input.maxAttendees ?? null,
        restaurant_id: input.restaurantId ?? null,
      })
      .select('*')
      .single();

    if (error || !data) {
      console.error('Failed to create event', error);
      return null;
    }

    const invite = buildInvite(data);
    this.tavolinaInvitesCache.unshift(invite);
    return invite;
  }

  async joinEvent(eventId: string): Promise<boolean> {
    const uid = (await supabase.auth.getUser()).data.user?.id;
    if (!uid) return false;
    const { error } = await supabase
      .from('event_attendance')
      .insert({
        event_id: eventId,
        user_id: uid,
        status: 'joined',
      });

    if (error) {
      console.error('Failed to join event', error);
      return false;
    }

    return true;
  }

  async leaveEvent(eventId: string): Promise<boolean> {
    const uid = (await supabase.auth.getUser()).data.user?.id;
    if (!uid) return false;
    const { error } = await supabase
      .from('event_attendance')
      .update({ status: 'cancelled' })
      .eq('event_id', eventId)
      .eq('user_id', uid)
      .eq('status', 'joined');

    if (error) {
      console.error('Failed to leave event', error);
      return false;
    }

    return true;
  }

  async confirmAttendance(eventId: string): Promise<boolean> {
    const { error } = await supabase
      .from('event_attendance')
      .update({ status: 'confirmed' })
      .eq('event_id', eventId)
      .eq('status', 'joined');

    if (error) {
      console.error('Failed to confirm attendance', error);
      return false;
    }

    return true;
  }

  async rateEvent(eventId: string, rating: number): Promise<boolean> {
    const { error } = await supabase
      .from('event_reviews')
      .upsert(
        {
          event_id: eventId,
          rating,
        },
        { onConflict: 'event_id,user_id' }
      );

    if (error) {
      console.error('Failed to rate event', error);
      return false;
    }

    return true;
  }

  async getAttendedEventIds(): Promise<string[]> {
    const { data, error } = await supabase
      .from('event_attendance')
      .select('event_id')
      .eq('status', 'joined')
      .is('deleted_at', null);

    if (error || !data) {
      return [];
    }

    return data.map((row) => row.event_id);
  }

  async getConfirmedEventIds(): Promise<string[]> {
    const { data, error } = await supabase
      .from('event_attendance')
      .select('event_id')
      .eq('status', 'confirmed')
      .is('deleted_at', null);

    if (error || !data) {
      return [];
    }

    return data.map((row) => row.event_id);
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    // Hard-delete: RLS requires a DELETE policy for the event creator
    const { error } = await supabase
      .from('tavolina_events')
      .delete()
      .eq('id', eventId);
    if (!error) {
      this.tavolinaInvitesCache = this.tavolinaInvitesCache.filter((e) => e.id !== eventId);
    } else {
      // Fallback: try soft-delete via update
      const { error: updateError } = await supabase
        .from('tavolina_events')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', eventId);
      if (!updateError) {
        this.tavolinaInvitesCache = this.tavolinaInvitesCache.filter((e) => e.id !== eventId);
        return true;
      }
    }
    return !error;
  }

  async getEventRatings(): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from('event_reviews')
      .select('event_id, rating')
      .is('deleted_at', null);

    if (error || !data) {
      return {};
    }

    const ratings: Record<string, number> = {};
    for (const row of data) {
      ratings[row.event_id] = Number(row.rating);
    }

    return ratings;
  }
}

export const eventsRepository = new EventsRepository();