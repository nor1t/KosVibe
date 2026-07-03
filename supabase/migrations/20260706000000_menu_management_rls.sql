-- ============================================================================
-- Sprint 16 — Menu Management RLS
-- ============================================================================
-- Adds INSERT/UPDATE/DELETE RLS policies for menu_categories and menu_items
-- so business owners can manage their restaurant menus.
-- Rule: Purely additive. Existing tables and policies untouched.
-- ============================================================================

begin;

-- ============================================================================
-- 1. RLS helper: checks if user owns the place behind a menu category
-- ============================================================================

create or replace function public.is_menu_owner(category_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select
    public.is_admin()
    or exists (
      select 1
      from public.menu_categories mc
      join public.places p on p.id = mc.restaurant_id
      where mc.id = category_id
        and p.deleted_at is null
        and (
          public.is_place_owner(p.id)
          or p.business_account_id is not null
            and public.is_business_member(p.business_account_id)
        )
    );
$$;

comment on function public.is_menu_owner is 'Returns true if the current user is an admin or owns the place that the menu category belongs to.';

-- ============================================================================
-- 2. RLS policies — menu_categories
-- ============================================================================

-- INSERT: authenticated users can create categories for places they own
create policy "Menu categories are insertable by place owner"
on public.menu_categories
for insert
to authenticated
with check (
  public.is_admin()
  or (
    exists (
      select 1
      from public.places p
      where p.id = menu_categories.restaurant_id
        and p.deleted_at is null
        and (
          public.is_place_owner(p.id)
          or p.business_account_id is not null
            and public.is_business_member(p.business_account_id)
        )
    )
  )
);

-- UPDATE: category owners or admins
create policy "Menu categories are updatable by place owner"
on public.menu_categories
for update
to authenticated
using (public.is_menu_owner(id))
with check (public.is_menu_owner(id));

-- DELETE: category owners or admins (soft-delete)
create policy "Menu categories are deletable by place owner"
on public.menu_categories
for delete
to authenticated
using (public.is_menu_owner(id));

-- ============================================================================
-- 3. RLS helper: checks if user owns the place behind a menu item
-- ============================================================================

create or replace function public.is_menu_item_owner(item_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select
    public.is_admin()
    or exists (
      select 1
      from public.menu_items mi
      join public.menu_categories mc on mc.id = mi.category_id
      where mi.id = item_id
        and public.is_menu_owner(mc.id)
    );
$$;

comment on function public.is_menu_item_owner is 'Returns true if the current user is an admin or owns the place that the menu item belongs to.';

-- ============================================================================
-- 4. RLS policies — menu_items
-- ============================================================================

-- INSERT: authenticated users can create items for categories they own
create policy "Menu items are insertable by place owner"
on public.menu_items
for insert
to authenticated
with check (
  public.is_admin()
  or public.is_menu_owner(menu_items.category_id)
);

-- UPDATE: item owners or admins
create policy "Menu items are updatable by place owner"
on public.menu_items
for update
to authenticated
using (public.is_menu_item_owner(id))
with check (public.is_menu_item_owner(id));

-- DELETE: item owners or admins
create policy "Menu items are deletable by place owner"
on public.menu_items
for delete
to authenticated
using (public.is_menu_item_owner(id));

commit;