-- ============================================================================
-- Sprint 1 — Backend Foundation
-- ============================================================================
-- Creates: roles, user_roles, business_accounts, business_members
-- Introduces: created_at/updated_at, status enums, slug conventions,
--             created_by/updated_by, soft delete (deleted_at), audit triggers
-- Implements: RLS on all new tables
-- Rule: Purely additive — does NOT modify existing tables or break the frontend.
-- ============================================================================

begin;

-- ============================================================================
-- 1. Enum types
-- ============================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'record_status') then
    create type public.record_status as enum ('active', 'archived');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'business_status') then
    create type public.business_status as enum ('pending', 'active', 'inactive', 'suspended');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'business_member_role') then
    create type public.business_member_role as enum ('owner', 'manager', 'staff');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'business_member_status') then
    create type public.business_member_status as enum ('active', 'invited', 'removed');
  end if;
end
$$;

-- ============================================================================
-- 2. Shared helper functions
-- ============================================================================

-- Slugify: converts arbitrary text into a URL-friendly slug.
create or replace function public.slugify(input text)
returns text
language plpgsql
immutable
strict
as $$
begin
  return lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          coalesce(input, ''),
          '[^a-zA-Z0-9]+',
          '-',
          'g'
        ),
        '^-+',
        ''
      ),
      '-+$',
      ''
    )
  );
end;
$$;

comment on function public.slugify is 'Converts text to a URL-friendly slug (lowercase, hyphen-separated).';

-- set_created_by: auto-populates created_by from the authenticated user on insert.
create or replace function public.set_created_by()
returns trigger
language plpgsql
as $$
begin
  if new.created_by is null and auth.uid() is not null then
    new.created_by = auth.uid();
  end if;
  return new;
end;
$$;

comment on function public.set_created_by is 'Trigger function — sets created_by to auth.uid() on insert if not already set.';

-- set_updated_by: auto-populates updated_by from the authenticated user on update.
create or replace function public.set_updated_by()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is not null then
    new.updated_by = auth.uid();
  end if;
  return new;
end;
$$;

comment on function public.set_updated_by is 'Trigger function — sets updated_by to auth.uid() on update.';

-- ============================================================================
-- 3. roles table
-- ============================================================================

create table public.roles (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  is_system boolean not null default false,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  deleted_at timestamptz
);

comment on table public.roles is 'Role definitions for role-based access control (RBAC).';
comment on column public.roles.slug is 'Stable machine-readable role identifier (e.g. "admin", "user").';
comment on column public.roles.is_system is 'System roles are seeded by migrations and cannot be hard-deleted.';
comment on column public.roles.status is 'Lifecycle status: active | archived.';
comment on column public.roles.deleted_at is 'Soft-delete timestamp — when set, the role is considered deleted.';

create trigger set_roles_created_by
  before insert on public.roles
  for each row execute function public.set_created_by();

create trigger set_roles_updated_by
  before update on public.roles
  for each row execute function public.set_updated_by();

create trigger set_roles_updated_at
  before update on public.roles
  for each row execute function public.set_updated_at();

create index roles_status_idx on public.roles (status) where deleted_at is null;
create index roles_slug_idx on public.roles (slug) where deleted_at is null;

-- ============================================================================
-- 4. user_roles table
-- ============================================================================

create table public.user_roles (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role_id uuid not null references public.roles (id) on delete cascade,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  deleted_at timestamptz
);

comment on table public.user_roles is 'Junction table linking authenticated users to roles.';
comment on column public.user_roles.status is 'Lifecycle status: active | archived (archived = revoked).';
comment on column public.user_roles.deleted_at is 'Soft-delete timestamp — when set, the assignment is considered revoked.';

-- Partial unique index: a user can have at most one active assignment per role.
create unique index user_roles_user_id_role_id_idx
  on public.user_roles (user_id, role_id)
  where deleted_at is null;

create trigger set_user_roles_created_by
  before insert on public.user_roles
  for each row execute function public.set_created_by();

create trigger set_user_roles_updated_by
  before update on public.user_roles
  for each row execute function public.set_updated_by();

create trigger set_user_roles_updated_at
  before update on public.user_roles
  for each row execute function public.set_updated_at();

create index user_roles_user_id_idx on public.user_roles (user_id) where deleted_at is null;
create index user_roles_role_id_idx on public.user_roles (role_id) where deleted_at is null;

-- ============================================================================
-- 5. business_accounts table
-- ============================================================================

create or replace function public.set_business_account_slug()
returns trigger
language plpgsql
as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug = public.slugify(new.name);
  end if;
  return new;
end;
$$;

comment on function public.set_business_account_slug is 'Trigger function — auto-generates a slug from name if not provided.';

create table public.business_accounts (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  business_type text,
  email text,
  phone text,
  website text,
  logo_url text,
  status public.business_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  deleted_at timestamptz,
  constraint business_accounts_business_type_check
    check (business_type is null or business_type in ('restaurant', 'venue', 'service', 'other')),
  constraint business_accounts_website_check
    check (website is null or website ~* '^https?://'),
  constraint business_accounts_email_check
    check (email is null or email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

comment on table public.business_accounts is 'Business entities that can own restaurants, venues, or services.';
comment on column public.business_accounts.slug is 'URL-friendly identifier auto-generated from name if not provided.';
comment on column public.business_accounts.business_type is 'Category: restaurant | venue | service | other.';
comment on column public.business_accounts.status is 'Lifecycle: pending → active | inactive | suspended.';
comment on column public.business_accounts.deleted_at is 'Soft-delete timestamp — when set, the account is considered deleted.';

create trigger set_business_account_slug
  before insert on public.business_accounts
  for each row execute function public.set_business_account_slug();

create trigger set_business_accounts_created_by
  before insert on public.business_accounts
  for each row execute function public.set_created_by();

create trigger set_business_accounts_updated_by
  before update on public.business_accounts
  for each row execute function public.set_updated_by();

create trigger set_business_accounts_updated_at
  before update on public.business_accounts
  for each row execute function public.set_updated_at();

create index business_accounts_status_idx on public.business_accounts (status) where deleted_at is null;
create index business_accounts_slug_idx on public.business_accounts (slug) where deleted_at is null;
create index business_accounts_business_type_idx on public.business_accounts (business_type) where deleted_at is null;
create index business_accounts_created_by_idx on public.business_accounts (created_by);

-- ============================================================================
-- 6. business_members table
-- ============================================================================

create table public.business_members (
  id uuid primary key default extensions.gen_random_uuid(),
  business_account_id uuid not null references public.business_accounts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.business_member_role not null default 'staff',
  status public.business_member_status not null default 'invited',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  deleted_at timestamptz
);

comment on table public.business_members is 'Memberships linking authenticated users to business accounts.';
comment on column public.business_members.role is 'Member role within the business: owner | manager | staff.';
comment on column public.business_members.status is 'Membership lifecycle: active | invited | removed.';
comment on column public.business_members.deleted_at is 'Soft-delete timestamp — when set, the membership is considered removed.';

-- Partial unique index: a user can have at most one active membership per business.
create unique index business_members_business_account_id_user_id_idx
  on public.business_members (business_account_id, user_id)
  where deleted_at is null;

create trigger set_business_members_created_by
  before insert on public.business_members
  for each row execute function public.set_created_by();

create trigger set_business_members_updated_by
  before update on public.business_members
  for each row execute function public.set_updated_by();

create trigger set_business_members_updated_at
  before update on public.business_members
  for each row execute function public.set_updated_at();

create index business_members_business_account_id_idx on public.business_members (business_account_id) where deleted_at is null;
create index business_members_user_id_idx on public.business_members (user_id) where deleted_at is null;

-- ============================================================================
-- 7. RLS helper functions (SECURITY DEFINER — bypass RLS internally)
-- ============================================================================

-- is_admin: returns true if the current user has the 'admin' role.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.slug = 'admin'
      and ur.status = 'active'
      and ur.deleted_at is null
      and r.deleted_at is null
  );
$$;

comment on function public.is_admin is 'Returns true if the current authenticated user has the active "admin" role.';

-- is_business_owner: returns true if the current user is an active owner of the given business.
create or replace function public.is_business_owner(business_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.business_members
    where business_account_id = business_id
      and user_id = auth.uid()
      and role = 'owner'
      and status = 'active'
      and deleted_at is null
  );
$$;

comment on function public.is_business_owner is 'Returns true if the current user is an active owner of the specified business account.';

-- is_business_member: returns true if the current user is any active member of the given business.
create or replace function public.is_business_member(business_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.business_members
    where business_account_id = business_id
      and user_id = auth.uid()
      and status = 'active'
      and deleted_at is null
  );
$$;

comment on function public.is_business_member is 'Returns true if the current user is an active member of the specified business account.';

-- ============================================================================
-- 8. Auto-assign default 'user' role on profile creation
-- ============================================================================

create or replace function public.assign_default_role()
returns trigger
language plpgsql
security definer
as $$
declare
  user_role_id uuid;
  existing_count int;
begin
  select id into user_role_id
  from public.roles
  where slug = 'user'
    and deleted_at is null
  limit 1;

  if user_role_id is not null then
    select count(*) into existing_count
    from public.user_roles
    where user_id = new.id
      and role_id = user_role_id
      and deleted_at is null;

    if existing_count = 0 then
      insert into public.user_roles (user_id, role_id, status, created_by)
      values (new.id, user_role_id, 'active', new.id);
    end if;
  end if;

  return new;
end;
$$;

comment on function public.assign_default_role is 'Trigger function — assigns the default "user" role to a newly created profile.';

create trigger assign_default_role_on_profile_create
  after insert on public.profiles
  for each row execute function public.assign_default_role();

-- ============================================================================
-- 9. Auto-create owner membership on business account creation
-- ============================================================================

create or replace function public.create_business_owner_membership()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.created_by is not null then
    insert into public.business_members (business_account_id, user_id, role, status, created_by)
    values (new.id, new.created_by, 'owner', 'active', new.created_by);
  end if;
  return new;
end;
$$;

comment on function public.create_business_owner_membership is 'Trigger function — creates an owner membership for the user who created the business account.';

create trigger create_business_owner_on_account_create
  after insert on public.business_accounts
  for each row execute function public.create_business_owner_membership();

-- ============================================================================
-- 10. Enable RLS on all new tables
-- ============================================================================

alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.business_accounts enable row level security;
alter table public.business_members enable row level security;

-- ============================================================================
-- 11. RLS policies — roles
-- ============================================================================

create policy "Active roles are publicly readable"
on public.roles
for select
to anon, authenticated
using (
  (status = 'active' and deleted_at is null)
  or public.is_admin()
);

create policy "Roles are insertable by admin"
on public.roles
for insert
to authenticated
with check (public.is_admin());

create policy "Roles are updatable by admin"
on public.roles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Roles are deletable by admin"
on public.roles
for delete
to authenticated
using (public.is_admin());

-- ============================================================================
-- 12. RLS policies — user_roles
-- ============================================================================

create policy "User roles are viewable by self or admin"
on public.user_roles
for select
to authenticated
using (
  auth.uid() = user_id
  or public.is_admin()
);

create policy "User roles are insertable by admin"
on public.user_roles
for insert
to authenticated
with check (public.is_admin());

create policy "User roles are updatable by admin"
on public.user_roles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "User roles are deletable by admin"
on public.user_roles
for delete
to authenticated
using (public.is_admin());

-- ============================================================================
-- 13. RLS policies — business_accounts
-- ============================================================================

create policy "Business accounts are readable when active, by members, or by admin"
on public.business_accounts
for select
to anon, authenticated
using (
  (status = 'active' and deleted_at is null)
  or public.is_business_member(id)
  or public.is_admin()
);

create policy "Business accounts are insertable by authenticated users"
on public.business_accounts
for insert
to authenticated
with check (created_by = auth.uid() or created_by is null);

create policy "Business accounts are updatable by owner or admin"
on public.business_accounts
for update
to authenticated
using (
  public.is_business_owner(id)
  or public.is_admin()
)
with check (
  public.is_business_owner(id)
  or public.is_admin()
);

create policy "Business accounts are deletable by admin"
on public.business_accounts
for delete
to authenticated
using (public.is_admin());

-- ============================================================================
-- 14. RLS policies — business_members
-- ============================================================================

create policy "Business members are viewable by self, business owner, or admin"
on public.business_members
for select
to authenticated
using (
  auth.uid() = user_id
  or public.is_business_owner(business_account_id)
  or public.is_admin()
);

create policy "Business members are insertable by business owner or admin"
on public.business_members
for insert
to authenticated
with check (
  public.is_business_owner(business_account_id)
  or public.is_admin()
);

create policy "Business members are updatable by business owner or admin"
on public.business_members
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

create policy "Business members are deletable by business owner or admin"
on public.business_members
for delete
to authenticated
using (
  public.is_business_owner(business_account_id)
  or public.is_admin()
);

-- ============================================================================
-- 15. Seed system roles
-- ============================================================================

insert into public.roles (slug, name, description, is_system, status)
values
  ('admin', 'Administrator', 'Full system access including role and business management.', true, 'active'),
  ('business_owner', 'Business Owner', 'Owns and manages one or more business accounts.', true, 'active'),
  ('member', 'Member', 'Active member of a business account with staff-level access.', true, 'active'),
  ('user', 'User', 'Default role assigned to every newly registered user.', true, 'active')
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  is_system = excluded.is_system,
  status = excluded.status,
  updated_at = now();

commit;