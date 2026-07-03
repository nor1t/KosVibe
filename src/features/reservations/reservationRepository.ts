import { supabase } from '../../lib/supabase';
import type {
  CreateReservationInput,
  IReservationRepository,
  Reservation,
  UpdateReservationInput,
} from '../../repositories/types';

function mapReservation(row: Record<string, unknown>): Reservation {
  return {
    id: row.id as string,
    placeId: row.place_id as string,
    userId: row.user_id as string,
    customerName: row.customer_name as string,
    customerEmail: (row.customer_email as string) ?? null,
    customerPhone: (row.customer_phone as string) ?? null,
    partySize: Number(row.party_size ?? 2),
    reservationDate: (row.reservation_date as string) ?? '',
    reservationTime: (row.reservation_time as string) ?? '',
    specialRequests: (row.special_requests as string) ?? null,
    status: (row.status as Reservation['status']) ?? 'pending',
    adminNotes: (row.admin_notes as string) ?? null,
    createdAt: (row.created_at as string) ?? '',
    updatedAt: (row.updated_at as string) ?? '',
  };
}

export class ReservationRepository implements IReservationRepository {

  async getMyReservations(): Promise<Reservation[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .is('deleted_at', null)
      .order('reservation_date', { ascending: true })
      .order('reservation_time', { ascending: true });

    if (error || !data) return [];
    return data.map((r) => mapReservation(r as Record<string, unknown>));
  }

  async getPlaceReservations(placeId: string): Promise<Reservation[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('place_id', placeId)
      .is('deleted_at', null)
      .order('reservation_date', { ascending: true })
      .order('reservation_time', { ascending: true });

    if (error || !data) return [];
    return data.map((r) => mapReservation(r as Record<string, unknown>));
  }

  async getReservationById(reservationId: string): Promise<Reservation | null> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', reservationId)
      .is('deleted_at', null)
      .single();

    if (error || !data) return null;
    return mapReservation(data as Record<string, unknown>);
  }

  async createReservation(input: CreateReservationInput): Promise<Reservation> {
    const { data, error } = await supabase
      .from('reservations')
      .insert({
        place_id: input.placeId,
        customer_name: input.customerName,
        customer_email: input.customerEmail ?? null,
        customer_phone: input.customerPhone ?? null,
        party_size: input.partySize,
        reservation_date: input.reservationDate,
        reservation_time: input.reservationTime,
        special_requests: input.specialRequests ?? null,
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create reservation: ${error.message}`);
    }

    return mapReservation(data as Record<string, unknown>);
  }

  async updateReservation(
    reservationId: string,
    input: UpdateReservationInput,
  ): Promise<Reservation> {
    const updates: Record<string, unknown> = {};
    if (input.customerName !== undefined) updates.customer_name = input.customerName;
    if (input.customerEmail !== undefined) updates.customer_email = input.customerEmail;
    if (input.customerPhone !== undefined) updates.customer_phone = input.customerPhone;
    if (input.partySize !== undefined) updates.party_size = input.partySize;
    if (input.reservationDate !== undefined) updates.reservation_date = input.reservationDate;
    if (input.reservationTime !== undefined) updates.reservation_time = input.reservationTime;
    if (input.specialRequests !== undefined) updates.special_requests = input.specialRequests;
    if (input.status !== undefined) updates.status = input.status;
    if (input.adminNotes !== undefined) updates.admin_notes = input.adminNotes;

    const { data, error } = await supabase
      .from('reservations')
      .update(updates)
      .eq('id', reservationId)
      .is('deleted_at', null)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to update reservation: ${error.message}`);
    }

    return mapReservation(data as Record<string, unknown>);
  }

  async cancelReservation(reservationId: string): Promise<void> {
    const { error } = await supabase
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('id', reservationId)
      .is('deleted_at', null);

    if (error) {
      throw new Error(`Failed to cancel reservation: ${error.message}`);
    }
  }
}

export const reservationRepository = new ReservationRepository();