-- ============================================================================
-- Fix: Remove duplicate membership INSERT from create_business_account()
-- ============================================================================
-- The create_business_owner_on_account_create trigger already handles
-- membership creation. The RPC was also inserting, causing:
--   duplicate key value violates unique constraint
--   business_members_business_account_id_user_id_idx
-- ============================================================================

begin;

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
  v_user_id := auth.uid();
  
  if v_user_id is null then
    raise exception 'You must be logged in to create a business account.';
  end if;

  if p_business_type is not null and p_business_type not in ('restaurant', 'venue', 'service', 'other') then
    raise exception 'Invalid business type. Must be one of: restaurant, venue, service, other.';
  end if;

  if p_website is not null and p_website != '' and p_website !~* '^https?://' then
    p_website := 'https://' || p_website;
  end if;

  if p_email is not null and p_email != '' and p_email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' then
    raise exception 'Invalid email format.';
  end if;

  -- Insert business account only.
  -- Owner membership is created automatically by the
  -- create_business_owner_on_account_create trigger.
  insert into public.business_accounts (
    name, slug, description, business_type,
    email, phone, website, status, created_by
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

comment on function public.create_business_account is 'Atomically creates a business account. Membership is handled by the create_business_owner_on_account_create trigger.';

grant execute on function public.create_business_account to authenticated;

commit;