-- ============================================================================
-- Fix: Business Registration RLS Error
-- ============================================================================
-- Problem: INSERT into business_accounts fails with RLS violation because
-- auth.uid() can be NULL in trigger context on some Supabase configurations.
-- Solution: SECURITY DEFINER RPC function that atomically creates the business
-- account and owner membership, bypassing RLS entirely.
-- ============================================================================

begin;

-- ============================================================================
-- 1. Atomic business creation function (SECURITY DEFINER)
-- ============================================================================

create or replace function public.create_business_account(
  p_name text,
  p_description text default null,
  p_business_type text default null,
  p_email text default null,
  p_phone text default null,
  p_website text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_business_id uuid;
  v_user_id uuid;
begin
  -- Get the authenticated user
  v_user_id := auth.uid();
  
  if v_user_id is null then
    raise exception 'You must be logged in to create a business account.';
  end if;

  -- Validate business type
  if p_business_type is not null and p_business_type not in ('restaurant', 'venue', 'service', 'other') then
    raise exception 'Invalid business type. Must be one of: restaurant, venue, service, other.';
  end if;

  -- Validate website format if provided
  if p_website is not null and p_website != '' and p_website !~* '^https?://' then
    p_website := 'https://' || p_website;
  end if;

  -- Validate email format if provided
  if p_email is not null and p_email != '' and p_email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' then
    raise exception 'Invalid email format.';
  end if;

  -- Insert business account
  -- (owner membership is created automatically by the
  --  create_business_owner_on_account_create trigger)
  insert into public.business_accounts (
    name,
    slug,
    description,
    business_type,
    email,
    phone,
    website,
    status,
    created_by
  ) values (
    p_name,
    public.slugify(p_name),
    p_description,
    p_business_type,
    p_email,
    p_phone,
    p_website,
    'pending',
    v_user_id
  ) returning id into v_business_id;

  return v_business_id;
end;
$$;

comment on function public.create_business_account is 'Atomically creates a business account and owner membership. Bypasses RLS via SECURITY DEFINER.';

-- ============================================================================
-- 2. Grant execute permission to authenticated users
-- ============================================================================

grant execute on function public.create_business_account to authenticated;

-- ============================================================================
-- 3. Also fix: ensure the set_created_by trigger works reliably by 
--    making it SECURITY DEFINER
-- ============================================================================

create or replace function public.set_created_by()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.created_by is null and auth.uid() is not null then
    new.created_by = auth.uid();
  end if;
  return new;
end;
$$;

comment on function public.set_created_by is 'Trigger function — sets created_by to auth.uid() on insert if not already set. Runs as SECURITY DEFINER to ensure auth.uid() is accessible.';

-- ============================================================================
-- 4. Also fix: set_updated_by as SECURITY DEFINER for consistency
-- ============================================================================

create or replace function public.set_updated_by()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is not null then
    new.updated_by = auth.uid();
  end if;
  return new;
end;
$$;

comment on function public.set_updated_by is 'Trigger function — sets updated_by to auth.uid() on update. Runs as SECURITY DEFINER to ensure auth.uid() is accessible.';

commit;