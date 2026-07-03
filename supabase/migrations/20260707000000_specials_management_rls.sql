-- ============================================================================
-- Sprint 17 — Daily Specials Management RLS
-- ============================================================================
-- Adds INSERT/UPDATE/DELETE RLS policies for restaurant_specials
-- so business owners can manage their daily specials.
-- Rule: Purely additive. Existing tables and policies untouched.
-- ============================================================================

begin;

-- INSERT: authenticated users can create specials for places they own
create policy "Specials are insertable by place owner"
on public.restaurant_specials
for insert
to authenticated
with check (
  public.is_admin()
  or public.is_place_owner(place_id)
);

-- UPDATE: place owners or admins
create policy "Specials are updatable by place owner"
on public.restaurant_specials
for update
to authenticated
using (
  public.is_admin()
  or public.is_place_owner(place_id)
)
with check (
  public.is_admin()
  or public.is_place_owner(place_id)
);

-- DELETE: place owners or admins (soft-delete)
create policy "Specials are deletable by place owner"
on public.restaurant_specials
for delete
to authenticated
using (
  public.is_admin()
  or public.is_place_owner(place_id)
);

commit;