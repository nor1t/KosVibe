-- ============================================================================
-- Fix: Reservation date CHECK constraint blocks business actions on past dates
-- ============================================================================
-- Problem: CHECK (reservation_date >= CURRENT_DATE) fires on UPDATE too,
-- preventing business owners from confirming/rejecting past-date reservations.
-- Solution: Trigger that only validates on INSERT, not UPDATE.
-- ============================================================================

begin;

-- Drop the table-level CHECK constraint
alter table public.reservations drop constraint if exists reservations_date_check;

-- Create a trigger function that only validates on INSERT
create or replace function public.check_reservation_date_future()
returns trigger
language plpgsql
as $$
begin
  if new.reservation_date < current_date then
    raise exception 'Reservation date must be today or in the future.';
  end if;
  return new;
end;
$$;

-- Trigger fires BEFORE INSERT only — updates are not validated
create trigger check_reservation_date_future_trigger
  before insert on public.reservations
  for each row execute function public.check_reservation_date_future();

comment on function public.check_reservation_date_future is 'Validates that new reservations are for today or a future date. Does not apply to updates so business owners can manage past reservations.';

commit;