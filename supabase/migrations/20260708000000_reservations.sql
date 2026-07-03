-- ============================================================================
-- Sprint 18 — Reservations Backend Foundation
-- ============================================================================
-- Creates: reservation_status enum, reservations table
-- Rule: Purely additive. No existing tables modified.
-- ============================================================================

begin;

-- ============================================================================
-- 1. Enum type
-- ============================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'reservation_status') then
    create type public.reservation_status as enum (
      'pending', 'confirmed', 'rejected', 'cancelled', 'checked_in', 'completed'
    );
  end if;
end
$$;

-- ============================================================================
-- 2. reservations table
-- ============================================================================

create table public.reservations (
  id uuid primary key default extensions.gen_random_uuid(),
  place_id uuid not null references public.places (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  customer_name text not null,
  customer_email text,
  customer_phone text,
  party_size int not null default 2,
  reservation_date date not null,
  reservation_time text not null,
  special_requests text,
  status public.reservation_status not null default 'pending',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  deleted_at timestamptz,
  constraint reservations_party_size_check check (party_size >= 1 and party_size <= 50),
  constraint reservations_date_check check (reservation_date >= current_date),
  constraint reservations_email_check
    check (customer_email is null or customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  constraint reservations_time_check
    check (reservation_time ~* '^[0-2]?[0-9]:[0-5][0-9]$')
);

comment on table public.reservations is 'Customer reservation bookings for restaurant places.';
comment on column public.reservations.customer_name is 'Name of the person making the reservation.';
comment on column public.reservations.party_size is 'Number of guests (1-50).';
comment on column public.reservations.reservation_date is 'Date of the reservation (must be today or future).';
comment on column public.reservations.reservation_time is 'Time of the reservation in HH:MM format (24h).';
comment on column public.reservations.special_requests is 'Optional special requests or notes from the customer.';
comment on column public.reservations.status is 'Lifecycle: pending → confirmed → checked_in → completed | rejected | cancelled.';
comment on column public.reservations.admin_notes is 'Internal notes visible only to restaurant owners and admins.';
comment on column public.reservations.deleted_at is 'Soft-delete timestamp — when set, the reservation is considered removed.';

-- ============================================================================
-- 3. Trigger: auto-set created_by/updated_by and updated_at
-- ============================================================================

create trigger set_reservations_created_by
  before insert on public.reservations
  for each row execute function public.set_created_by();

create trigger set_reservations_updated_by
  before update on public.reservations
  for each row execute function public.set_updated_by();

create trigger set_reservations_updated_at
  before update on public.reservations
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 4. Indexes
-- ============================================================================

create index reservations_place_id_idx on public.reservations (place_id) where deleted_at is null;
create index reservations_user_id_idx on public.reservations (user_id) where deleted_at is null;
create index reservations_status_idx on public.reservations (status) where deleted_at is null;
create index reservations_date_idx on public.reservations (reservation_date) where deleted_at is null;
create index reservations_place_date_idx on public.reservations (place_id, reservation_date) where deleted_at is null;

-- ============================================================================
-- 5. RLS helper: reservation ownership check
-- ============================================================================

create or replace function public.is_reservation_owner(reservation_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select
    public.is_admin()
    or exists (
      select 1
      from public.reservations r
      where r.id = reservation_id
        and r.deleted_at is null
        and (
          r.user_id = auth.uid()
          or exists (
            select 1
            from public.places p
            where p.id = r.place_id
              and p.deleted_at is null
              and public.is_place_owner(p.id)
          )
        )
    );
$$;

comment on function public.is_reservation_owner is 'Returns true if the current user is the customer, the place owner, or an admin.';

-- ============================================================================
-- 6. RLS policies
-- ============================================================================

alter table public.reservations enable row level security;

-- SELECT: customers see their own, owners see their place's, admins see all
create policy "Reservations are viewable by customer, owner, or admin"
on public.reservations
for select
to authenticated
using (
  public.is_admin()
  or user_id = auth.uid()
  or public.is_place_owner(place_id)
);

-- INSERT: any authenticated user can create a reservation
create policy "Reservations are insertable by authenticated users"
on public.reservations
for insert
to authenticated
with check (
  created_by = auth.uid() or created_by is null
);

-- UPDATE: customer, owner, or admin
create policy "Reservations are updatable by customer, owner, or admin"
on public.reservations
for update
to authenticated
using (public.is_reservation_owner(id))
with check (public.is_reservation_owner(id));

-- DELETE: customer, owner, or admin (soft-delete)
create policy "Reservations are deletable by customer, owner, or admin"
on public.reservations
for delete
to authenticated
using (public.is_reservation_owner(id));

commit;