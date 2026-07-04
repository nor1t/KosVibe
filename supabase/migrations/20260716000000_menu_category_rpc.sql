-- ============================================================================
-- Fix: Menu category INSERT fails with RLS violation
-- ============================================================================
-- Root cause: The menu_categories INSERT RLS policy uses is_place_owner() 
-- which depends on auth.uid(). In some RLS evaluation contexts, auth.uid()
-- returns NULL, causing the check to fail even for valid business owners.
-- Solution: SECURITY DEFINER RPC function (consistent with create_business_account)
-- ============================================================================

begin;

-- Add admin_notes column if missing (referenced by rejectBusiness but may not exist)
do $$
begin
  if not exists (select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'business_accounts' and column_name = 'admin_notes') then
    alter table public.business_accounts add column admin_notes text;
  end if;
end
$$;

-- RPC for creating menu categories
create or replace function public.create_menu_category(
  p_restaurant_id uuid,
  p_name text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_category_id uuid;
  v_sort_order int;
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'You must be logged in to create a menu category.';
  end if;

  -- Verify the user owns this place (or is admin)
  if not (public.is_place_owner(p_restaurant_id) or public.is_admin()) then
    raise exception 'You must be the place owner to manage menus.';
  end if;

  -- Get next sort order
  select coalesce(max(sort_order), 0) + 1 into v_sort_order
  from public.menu_categories
  where restaurant_id = p_restaurant_id;

  -- Insert category
  insert into public.menu_categories (restaurant_id, name, sort_order, is_active)
  values (p_restaurant_id, p_name, v_sort_order, true)
  returning id into v_category_id;

  return v_category_id;
end;
$$;

comment on function public.create_menu_category is 'Creates a menu category for a place. Bypasses RLS via SECURITY DEFINER.';

grant execute on function public.create_menu_category to authenticated;

-- RPC for creating menu items
create or replace function public.create_menu_item(
  p_category_id uuid,
  p_name text,
  p_description text default null,
  p_price numeric default 0
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item_id uuid;
  v_restaurant_id uuid;
  v_sort_order int;
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'You must be logged in to create a menu item.';
  end if;

  -- Get the restaurant_id through the category chain
  select mc.restaurant_id into v_restaurant_id
  from public.menu_categories mc
  where mc.id = p_category_id;

  if v_restaurant_id is null then
    raise exception 'Menu category not found.';
  end if;

  -- Verify ownership
  if not (public.is_place_owner(v_restaurant_id) or public.is_admin()) then
    raise exception 'You must be the place owner to manage menus.';
  end if;

  -- Get next sort order
  select coalesce(max(sort_order), 0) + 1 into v_sort_order
  from public.menu_items
  where category_id = p_category_id;

  -- Insert item
  insert into public.menu_items (category_id, name, description, price, sort_order, is_available)
  values (p_category_id, p_name, p_description, p_price, v_sort_order, true)
  returning id into v_item_id;

  return v_item_id;
end;
$$;

comment on function public.create_menu_item is 'Creates a menu item for a category. Bypasses RLS via SECURITY DEFINER.';

grant execute on function public.create_menu_item to authenticated;

commit;