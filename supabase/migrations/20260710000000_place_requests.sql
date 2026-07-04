-- ============================================================================
-- Sprint 20 — Place Requests (Business Onboarding)
-- ============================================================================
-- Creates: place_requests table for business owners to submit new restaurants
-- Rule: Purely additive. No existing tables modified.
-- ============================================================================

begin;

-- ============================================================================
-- 1. Enum type
-- ============================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'place_request_status') then
    create type public.place_request_status as enum ('pending', 'approved', 'rejected');
  end if;
end
$$;

-- ============================================================================
-- 2. place_requests table
-- ============================================================================

create table public.place_requests (
  id uuid primary key default extensions.gen_random_uuid(),
  business_account_id uuid not null references public.business_accounts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,

  -- Place fields
  name text not null,
  description text,
  address text,
  city text,
  cuisine text,
  price_range text,
  phone text,
  email text,
  website text,

  -- Review
  status public.place_request_status not null default 'pending',
  admin_notes text,
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,

  -- Audit
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  deleted_at timestamptz
);

comment on table public.place_requests is 'Requests from business owners to add a new restaurant to the platform.';
comment on column public.place_requests.status is 'Lifecycle: pending → approved | rejected.';
comment on column public.place_requests.admin_notes is 'Admin note explaining approval or rejection.';
comment on column public.place_requests.reviewed_by is 'Admin user who reviewed the request.';

-- ============================================================================
-- 3. Triggers
-- ============================================================================

create trigger set_place_requests_created_by
  before insert on public.place_requests
  for each row execute function public.set_created_by();

create trigger set_place_requests_updated_by
  before update on public.place_requests
  for each row execute function public.set_updated_by();

create trigger set_place_requests_updated_at
  before update on public.place_requests
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 4. Indexes
-- ============================================================================

create index place_requests_status_idx on public.place_requests (status) where deleted_at is null;
create index place_requests_business_account_id_idx on public.place_requests (business_account_id) where deleted_at is null;
create index place_requests_user_id_idx on public.place_requests (user_id) where deleted_at is null;

-- ============================================================================
-- 5. Atomic approval function
-- ============================================================================

create or replace function public.approve_place_request(request_id uuid)
returns uuid
language plpgsql
security definer
as $$
declare
  req public.place_requests;
  place_id uuid;
begin
  -- Fetch and lock the request row
  select *
  into req
  from public.place_requests
  where id = request_id
    and deleted_at is null
    and status = 'pending'
  for update;

  if not found then
    raise exception 'Place request not found or already processed.';
  end if;

  if not (public.is_admin()) then
    raise exception 'Only admins can approve place requests.';
  end if;

  -- Create the place
  insert into public.places (
    business_account_id,
    name,
    description,
    address,
    city,
    price_range,
    is_published,
    status,
    created_by
  ) values (
    req.business_account_id,
    req.name,
    req.description,
    req.address,
    req.city,
    req.price_range,
    true,
    'active',
    req.user_id
  ) returning id into place_id;

  -- Create restaurant profile
  insert into public.restaurant_profiles (
    place_id,
    cuisine
  ) values (
    place_id,
    req.cuisine
  );

  -- Create contacts
  if req.phone is not null and req.phone <> '' then
    insert into public.place_contacts (place_id, kind, value, is_primary) values (place_id, 'phone', req.phone, true);
  end if;
  if req.email is not null and req.email <> '' then
    insert into public.place_contacts (place_id, kind, value, is_primary) values (place_id, 'email', req.email, true);
  end if;
  if req.website is not null and req.website <> '' then
    insert into public.place_contacts (place_id, kind, value, is_primary) values (place_id, 'website', req.website, true);
  end if;

  -- Update request status
  update public.place_requests
  set
    status = 'approved',
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    updated_at = now()
  where id = request_id;

  return place_id;
end;
$$;

comment on function public.approve_place_request is 'Atomically creates a place, profile, and contacts from an approved place request. Rolls back on any failure.';

-- ============================================================================
-- 6. RLS
-- ============================================================================

alter table public.place_requests enable row level security;

create policy "Place requests viewable by business owner or admin"
on public.place_requests
for select
to authenticated
using (
  public.is_business_owner(business_account_id)
  or public.is_admin()
  or user_id = auth.uid()
);

create policy "Place requests insertable by authenticated users"
on public.place_requests
for insert
to authenticated
with check (
  created_by = auth.uid() or created_by is null
);

create policy "Place requests updatable by admin"
on public.place_requests
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ============================================================================
-- 7. Seed admin function for approve_place_request
-- ============================================================================

-- The approve_place_request function is called by admin users via rpc.
-- No additional seed needed.

commit;