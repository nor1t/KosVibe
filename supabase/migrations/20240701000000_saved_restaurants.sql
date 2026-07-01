-- Saved Restaurants table + RLS
create table if not exists public.saved_restaurants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  restaurant_id uuid not null references public.places(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  unique(user_id, restaurant_id)
);

-- Index for fast user lookups
create index if not exists idx_saved_restaurants_user on public.saved_restaurants(user_id, created_at desc);

-- Enable RLS
alter table public.saved_restaurants enable row level security;

-- Users can see only their own saved restaurants
create policy "Users can view their own saved restaurants"
  on public.saved_restaurants for select
  using (auth.uid() = user_id);

-- Users can insert their own saved restaurants
create policy "Users can insert their own saved restaurants"
  on public.saved_restaurants for insert
  with check (auth.uid() = user_id);

-- Users can delete their own saved restaurants
create policy "Users can delete their own saved restaurants"
  on public.saved_restaurants for delete
  using (auth.uid() = user_id);

-- No update policy needed (saved/un-saved is insert/delete)