-- ============================================================================
-- Sprint 13 — Business Ownership: Place Claims
-- ============================================================================
-- Creates: business_place_claims table for claiming existing places
-- Extends: business_accounts with admin approval support
-- Rule: Purely additive. No existing tables modified.
-- ============================================================================

begin;

-- ============================================================================
-- 1. Enum types
-- ============================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'claim_status') then
    create type public.claim_status as enum ('pending', 'approved', 'rejected');
  end if;
end
$$;

-- ============================================================================
-- 2. business_place_claims table
-- ============================================================================

create table public.business_place_claims (
  id uuid primary key default extensions.gen_random_uuid(),
  business_account_id uuid not null references public.business_accounts (id) on delete cascade,
  place_id uuid not null references public.places (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  claim_message text,
  status public.claim_status not null default 'pending',
  admin_notes text,
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  deleted_at timestamptz
);

comment on table public.business_place_claims is 'Requests from business owners to claim/verify ownership of an existing place.';
comment on column public.business_place_claims.claim_message is 'Optional message explaining why the user claims this place.';
comment on column public.business_place_claims.status is 'Claim lifecycle: pending → approved | rejected.';
comment on column public.business_place_claims.admin_notes is 'Admin note explaining approval or rejection.';
comment on column public.business_place_claims.reviewed_by is 'Admin user who reviewed the claim.';
comment on column public.business_place_claims.deleted_at is 'Soft-delete timestamp — when set, the claim is considered withdrawn.';

-- Partial unique index: a user can have at most one active claim per place per business
create unique index business_place_claims_business_place_user_idx
  on public.business_place_claims (business_account_id, place_id, user_id)
  where deleted_at is null and status = 'pending';

create trigger set_business_place_claims_created_by
  before insert on public.business_place_claims
  for each row execute function public.set_created_by();

create trigger set_business_place_claims_updated_by
  before update on public.business_place_claims
  for each row execute function public.set_updated_by();

create trigger set_business_place_claims_updated_at
  before update on public.business_place_claims
  for each row execute function public.set_updated_at();

create index business_place_claims_status_idx on public.business_place_claims (status) where deleted_at is null;
create index business_place_claims_business_account_id_idx on public.business_place_claims (business_account_id) where deleted_at is null;
create index business_place_claims_place_id_idx on public.business_place_claims (place_id) where deleted_at is null;
create index business_place_claims_user_id_idx on public.business_place_claims (user_id) where deleted_at is null;

-- ============================================================================
-- 3. RLS helper: is_place_claimant
-- ============================================================================

create or replace function public.is_place_claimant(claim_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.business_place_claims bpc
    join public.business_members bm
      on bm.business_account_id = bpc.business_account_id
     and bm.user_id = auth.uid()
     and bm.status = 'active'
     and bm.deleted_at is null
    where bpc.id = claim_id
      and bpc.deleted_at is null
  );
$$;

comment on function public.is_place_claimant is 'Returns true if the current user is an active member of the business that created the claim.';

-- ============================================================================
-- 4. Trigger: auto-link place to business on claim approval
-- ============================================================================

create or replace function public.link_place_on_claim_approval()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.status = 'approved' and old.status = 'pending' then
    update public.places
    set
      business_account_id = new.business_account_id,
      updated_at = now(),
      updated_by = new.reviewed_by
    where id = new.place_id
      and deleted_at is null
      and (business_account_id is null or business_account_id = new.business_account_id);
  end if;
  return new;
end;
$$;

comment on function public.link_place_on_claim_approval is 'Trigger function — links the place to the business when a claim is approved.';

create trigger link_place_on_claim_approval
  before update on public.business_place_claims
  for each row
  when (new.status = 'approved' and old.status = 'pending')
  execute function public.link_place_on_claim_approval();

-- ============================================================================
-- 5. Enable RLS
-- ============================================================================

alter table public.business_place_claims enable row level security;

-- ============================================================================
-- 6. RLS policies — business_place_claims
-- ============================================================================

create policy "Claims are viewable by business members, claimants, or admin"
on public.business_place_claims
for select
to authenticated
using (
  public.is_business_member(business_account_id)
  or auth.uid() = user_id
  or public.is_admin()
);

create policy "Claims are insertable by business owner or admin"
on public.business_place_claims
for insert
to authenticated
with check (
  public.is_business_owner(business_account_id)
  or public.is_admin()
);

create policy "Claims are updatable by business owner or admin"
on public.business_place_claims
for update
to authenticated
using (
  public.is_business_owner(business_account_id)
  or public.is_admin()
)
with check (
  public.is_business_owner(business_account_id)
  or public.is_admin()
);

create policy "Claims are deletable by business owner or admin"
on public.business_place_claims
for delete
to authenticated
using (
  public.is_business_owner(business_account_id)
  or public.is_admin()
);

-- ============================================================================
-- 7. RLS enhancement — add admin insert for business_accounts
-- ============================================================================

-- The existing business_accounts insert policy only allows created_by = auth.uid()
-- Admin needs to be able to create business accounts on behalf of others in some workflows.
-- We add a separate admin insert policy to cover this case.

drop policy if exists "Business accounts are insertable by admin" on public.business_accounts;

create policy "Business accounts are insertable by admin"
on public.business_accounts
for insert
to authenticated
with check (public.is_admin());

commit;