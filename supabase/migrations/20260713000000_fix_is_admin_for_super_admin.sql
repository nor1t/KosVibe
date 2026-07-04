-- ============================================================================
-- Fix: is_admin() should recognize super_admin from JWT metadata
-- ============================================================================
-- The admin user is identified by user_metadata.account_type = 'super_admin'
-- in the JWT, but is_admin() only checks the user_roles table.
-- If the admin user has no user_roles row, pending businesses are invisible.
-- ============================================================================

begin;

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
  )
  or coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'account_type') = 'super_admin',
    false
  );
$$;

comment on function public.is_admin is 'Returns true if the current user has the admin role OR has super_admin account_type in JWT metadata.';

commit;