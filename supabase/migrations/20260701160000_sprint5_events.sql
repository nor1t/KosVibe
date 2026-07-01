-- ============================================================================
-- Sprint 5 — Events
-- ============================================================================
-- Creates: tavolina_events, event_highlights, kosovo_highlights,
--          event_attendance, event_reviews, event_organizers,
--          event_notifications
-- Seeds: All existing mock event data into the database.
--
-- Rule: Purely additive. No screens are modified.
--       Once seeded, repositories drop mock-data fallbacks.
-- ============================================================================

begin;

-- ============================================================================
-- 1. tavolina_events table
-- ============================================================================

create table public.tavolina_events (
  id uuid primary key default extensions.gen_random_uuid(),
  restaurant_id uuid references public.places (id) on delete set null,
  restaurant_name text not null,
  city text not null,
  day text not null,
  time text not null,
  event_type text not null,
  creator_name text not null,
  creator_avatar text,
  description text,
  tags text[] not null default '{}',
  spots_label text not null default '0/0 spots',
  image_url text,
  is_paid boolean not null default false,
  price text,
  max_attendees int,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  deleted_at timestamptz,
  constraint tavolina_events_event_type_check
    check (event_type in ('food', 'culture', 'nightlife', 'other')),
  constraint tavolina_events_max_attendees_check
    check (max_attendees is null or max_attendees >= 1)
);

comment on table public.tavolina_events is 'Community events created by users (Tavolina feature).';
comment on column public.tavolina_events.event_type is 'Event category: food | culture | nightlife | other.';
comment on column public.tavolina_events.deleted_at is 'Soft-delete timestamp — when set, the event is considered cancelled.';

create trigger set_tavolina_events_created_by
  before insert on public.tavolina_events
  for each row execute function public.set_created_by();

create trigger set_tavolina_events_updated_by
  before update on public.tavolina_events
  for each row execute function public.set_updated_by();

create trigger set_tavolina_events_updated_at
  before update on public.tavolina_events
  for each row execute function public.set_updated_at();

create index tavolina_events_city_idx on public.tavolina_events (city) where deleted_at is null;
create index tavolina_events_event_type_idx on public.tavolina_events (event_type) where deleted_at is null;
create index tavolina_events_created_at_idx on public.tavolina_events (created_at desc) where deleted_at is null;

-- ============================================================================
-- 2. event_highlights table
-- ============================================================================

create table public.event_highlights (
  id uuid primary key default extensions.gen_random_uuid(),
  title text not null,
  category text not null,
  venue text not null,
  date_display text not null,
  description text,
  color_from text not null,
  color_to text not null,
  image_url text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  deleted_at timestamptz,
  constraint event_highlights_category_check
    check (category in ('Restaurants', 'Hiking', 'Party', 'Culture', 'Study')),
  constraint event_highlights_sort_order_check
    check (sort_order >= 0)
);

comment on table public.event_highlights is 'Curated event cards shown on the explore/discover screens.';
comment on column public.event_highlights.category is 'Event category matching frontend union: Restaurants | Hiking | Party | Culture | Study.';
comment on column public.event_highlights.deleted_at is 'Soft-delete timestamp — when set, the highlight is considered removed.';

create trigger set_event_highlights_created_by
  before insert on public.event_highlights
  for each row execute function public.set_created_by();

create trigger set_event_highlights_updated_by
  before update on public.event_highlights
  for each row execute function public.set_updated_by();

create trigger set_event_highlights_updated_at
  before update on public.event_highlights
  for each row execute function public.set_updated_at();

create index event_highlights_category_idx on public.event_highlights (category) where deleted_at is null;
create index event_highlights_active_idx on public.event_highlights (is_active) where deleted_at is null and is_active = true;
create index event_highlights_sort_order_idx on public.event_highlights (sort_order) where deleted_at is null;

-- ============================================================================
-- 3. kosovo_highlights table
-- ============================================================================

create table public.kosovo_highlights (
  id uuid primary key default extensions.gen_random_uuid(),
  title text not null,
  description text,
  accent_color text not null,
  icon_name text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  deleted_at timestamptz,
  constraint kosovo_highlights_sort_order_check
    check (sort_order >= 0)
);

comment on table public.kosovo_highlights is 'Kosovo-themed content cards for the discover/explore screens.';
comment on column public.kosovo_highlights.deleted_at is 'Soft-delete timestamp — when set, the highlight is considered removed.';

create trigger set_kosovo_highlights_created_by
  before insert on public.kosovo_highlights
  for each row execute function public.set_created_by();

create trigger set_kosovo_highlights_updated_by
  before update on public.kosovo_highlights
  for each row execute function public.set_updated_by();

create trigger set_kosovo_highlights_updated_at
  before update on public.kosovo_highlights
  for each row execute function public.set_updated_at();

create index kosovo_highlights_active_idx on public.kosovo_highlights (is_active) where deleted_at is null and is_active = true;
create index kosovo_highlights_sort_order_idx on public.kosovo_highlights (sort_order) where deleted_at is null;

-- ============================================================================
-- 4. event_attendance table
-- ============================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'event_attendance_status') then
    create type public.event_attendance_status as enum ('joined', 'confirmed', 'cancelled');
  end if;
end
$$;

create table public.event_attendance (
  id uuid primary key default extensions.gen_random_uuid(),
  event_id uuid not null references public.tavolina_events (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  status public.event_attendance_status not null default 'joined',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  deleted_at timestamptz
);

comment on table public.event_attendance is 'Tracks user attendance for community events.';
comment on column public.event_attendance.status is 'Attendance status: joined (waiting) | confirmed (host approved) | cancelled (left or removed).';
comment on column public.event_attendance.deleted_at is 'Soft-delete timestamp — when set, the attendance record is considered removed.';

-- Partial unique index: a user can have at most one active attendance per event.
create unique index event_attendance_event_id_user_id_idx
  on public.event_attendance (event_id, user_id)
  where deleted_at is null;

create trigger set_event_attendance_updated_by
  before update on public.event_attendance
  for each row execute function public.set_updated_by();

create trigger set_event_attendance_updated_at
  before update on public.event_attendance
  for each row execute function public.set_updated_at();

create index event_attendance_event_id_idx on public.event_attendance (event_id) where deleted_at is null;
create index event_attendance_user_id_idx on public.event_attendance (user_id) where deleted_at is null;
create index event_attendance_status_idx on public.event_attendance (status) where deleted_at is null;

-- ============================================================================
-- 5. event_reviews table
-- ============================================================================

create table public.event_reviews (
  id uuid primary key default extensions.gen_random_uuid(),
  event_id uuid not null references public.tavolina_events (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  rating int not null,
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  deleted_at timestamptz,
  constraint event_reviews_rating_check
    check (rating >= 1 and rating <= 5)
);

comment on table public.event_reviews is 'User ratings and reviews for attended community events.';
comment on column public.event_reviews.deleted_at is 'Soft-delete timestamp — when set, the review is considered removed.';

-- Partial unique index: a user can have at most one active review per event.
create unique index event_reviews_event_id_user_id_idx
  on public.event_reviews (event_id, user_id)
  where deleted_at is null;

create trigger set_event_reviews_updated_by
  before update on public.event_reviews
  for each row execute function public.set_updated_by();

create trigger set_event_reviews_updated_at
  before update on public.event_reviews
  for each row execute function public.set_updated_at();

create index event_reviews_event_id_idx on public.event_reviews (event_id) where deleted_at is null;
create index event_reviews_user_id_idx on public.event_reviews (user_id) where deleted_at is null;

-- ============================================================================
-- 6. event_organizers table
-- ============================================================================

create table public.event_organizers (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null unique,
  avatar text,
  rating numeric(2,1) not null default 0,
  event_count int not null default 0,
  confirmed_guests int not null default 0,
  reliability text,
  badges text[] not null default '{}',
  recent_praise text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  deleted_at timestamptz,
  constraint event_organizers_rating_check
    check (rating >= 0 and rating <= 5),
  constraint event_organizers_event_count_check
    check (event_count >= 0),
  constraint event_organizers_confirmed_guests_check
    check (confirmed_guests >= 0)
);

comment on table public.event_organizers is 'Community event organizer profiles with reputation data.';
comment on column public.event_organizers.badges is 'Reputation badges (e.g. "Verified vibe", "Fast replies").';
comment on column public.event_organizers.recent_praise is 'Recent guest feedback snippets.';
comment on column public.event_organizers.deleted_at is 'Soft-delete timestamp — when set, the profile is considered removed.';

create trigger set_event_organizers_created_by
  before insert on public.event_organizers
  for each row execute function public.set_created_by();

create trigger set_event_organizers_updated_by
  before update on public.event_organizers
  for each row execute function public.set_updated_by();

create trigger set_event_organizers_updated_at
  before update on public.event_organizers
  for each row execute function public.set_updated_at();

create index event_organizers_name_idx on public.event_organizers (name) where deleted_at is null;

-- ============================================================================
-- 7. event_notifications table
-- ============================================================================

create table public.event_notifications (
  id uuid primary key default extensions.gen_random_uuid(),
  event_id uuid references public.tavolina_events (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint event_notifications_type_check
    check (type in ('join', 'confirm', 'cancel', 'reminder', 'review'))
);

comment on table public.event_notifications is 'Notifications related to event attendance and updates.';
comment on column public.event_notifications.type is 'Notification type: join | confirm | cancel | reminder | review.';
comment on column public.event_notifications.deleted_at is 'Soft-delete timestamp — when set, the notification is considered removed.';

create trigger set_event_notifications_updated_at
  before update on public.event_notifications
  for each row execute function public.set_updated_at();

create index event_notifications_user_id_idx on public.event_notifications (user_id) where deleted_at is null;
create index event_notifications_event_id_idx on public.event_notifications (event_id) where deleted_at is null;
create index event_notifications_unread_idx on public.event_notifications (user_id) where deleted_at is null and is_read = false;

-- ============================================================================
-- 8. Enable RLS
-- ============================================================================

alter table public.tavolina_events enable row level security;
alter table public.event_highlights enable row level security;
alter table public.kosovo_highlights enable row level security;
alter table public.event_attendance enable row level security;
alter table public.event_reviews enable row level security;
alter table public.event_organizers enable row level security;
alter table public.event_notifications enable row level security;

-- ============================================================================
-- 9. RLS policies — tavolina_events
-- ============================================================================

create policy "Tavolina events are publicly readable"
on public.tavolina_events
for select
to anon, authenticated
using (deleted_at is null);

create policy "Tavolina events are insertable by authenticated users"
on public.tavolina_events
for insert
to authenticated
with check (auth.uid() = created_by or created_by is null);

create policy "Tavolina events are updatable by creator or admin"
on public.tavolina_events
for update
to authenticated
using (created_by = auth.uid() or public.is_admin())
with check (created_by = auth.uid() or public.is_admin());

create policy "Tavolina events are deletable by creator or admin"
on public.tavolina_events
for delete
to authenticated
using (created_by = auth.uid() or public.is_admin());

-- ============================================================================
-- 10. RLS policies — event_highlights
-- ============================================================================

create policy "Active event highlights are publicly readable"
on public.event_highlights
for select
to anon, authenticated
using (
  (is_active = true and deleted_at is null)
  or public.is_admin()
);

create policy "Event highlights are insertable by admin"
on public.event_highlights
for insert
to authenticated
with check (public.is_admin());

create policy "Event highlights are updatable by admin"
on public.event_highlights
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Event highlights are deletable by admin"
on public.event_highlights
for delete
to authenticated
using (public.is_admin());

-- ============================================================================
-- 11. RLS policies — kosovo_highlights
-- ============================================================================

create policy "Active Kosovo highlights are publicly readable"
on public.kosovo_highlights
for select
to anon, authenticated
using (
  (is_active = true and deleted_at is null)
  or public.is_admin()
);

create policy "Kosovo highlights are insertable by admin"
on public.kosovo_highlights
for insert
to authenticated
with check (public.is_admin());

create policy "Kosovo highlights are updatable by admin"
on public.kosovo_highlights
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Kosovo highlights are deletable by admin"
on public.kosovo_highlights
for delete
to authenticated
using (public.is_admin());

-- ============================================================================
-- 12. RLS policies — event_attendance
-- ============================================================================

create policy "Event attendance is viewable by self or admin"
on public.event_attendance
for select
to authenticated
using (
  auth.uid() = user_id
  or public.is_admin()
);

create policy "Event attendance is insertable by authenticated users"
on public.event_attendance
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Event attendance is updatable by self or admin"
on public.event_attendance
for update
to authenticated
using (
  auth.uid() = user_id
  or public.is_admin()
)
with check (
  auth.uid() = user_id
  or public.is_admin()
);

create policy "Event attendance is deletable by self or admin"
on public.event_attendance
for delete
to authenticated
using (
  auth.uid() = user_id
  or public.is_admin()
);

-- ============================================================================
-- 13. RLS policies — event_reviews
-- ============================================================================

create policy "Event reviews are publicly readable"
on public.event_reviews
for select
to anon, authenticated
using (deleted_at is null);

create policy "Event reviews are insertable by authenticated users"
on public.event_reviews
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Event reviews are updatable by author or admin"
on public.event_reviews
for update
to authenticated
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

create policy "Event reviews are deletable by author or admin"
on public.event_reviews
for delete
to authenticated
using (auth.uid() = user_id or public.is_admin());

-- ============================================================================
-- 14. RLS policies — event_organizers
-- ============================================================================

create policy "Event organizers are publicly readable"
on public.event_organizers
for select
to anon, authenticated
using (deleted_at is null);

create policy "Event organizers are insertable by admin"
on public.event_organizers
for insert
to authenticated
with check (public.is_admin());

create policy "Event organizers are updatable by admin"
on public.event_organizers
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Event organizers are deletable by admin"
on public.event_organizers
for delete
to authenticated
using (public.is_admin());

-- ============================================================================
-- 15. RLS policies — event_notifications
-- ============================================================================

create policy "Event notifications are viewable by owner"
on public.event_notifications
for select
to authenticated
using (
  auth.uid() = user_id
  or public.is_admin()
);

create policy "Event notifications are insertable by system/admin"
on public.event_notifications
for insert
to authenticated
with check (public.is_admin());

create policy "Event notifications are updatable by owner or admin"
on public.event_notifications
for update
to authenticated
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

create policy "Event notifications are deletable by owner or admin"
on public.event_notifications
for delete
to authenticated
using (auth.uid() = user_id or public.is_admin());

-- ============================================================================
-- 16. Seed event_highlights
-- ============================================================================

insert into public.event_highlights (title, category, venue, date_display, description, color_from, color_to, sort_order)
values
  ('Duplex Night Market',    'Party',     'Duplex Bar, Prishtina',          'Fri • 22:00', 'A vibrant night with live DJs, local cocktails, and a lively crowd that speaks the city''s energy.',                                         '#A43AFF', '#F52698', 1),
  ('Rugova Canyon Sunrise Hike','Hiking', 'Rugova Canyon, Peje',            'Sat • 06:30', 'Guided trail through limestone cliffs, waterfalls, and Kosovo''s most dramatic nature views.',                                               '#1FCA65', '#64D98A', 2),
  ('Prizren Heritage Walk',  'Culture',   'Old Stone Bridge, Prizren',       'Sun • 11:00', 'A storytelling tour across Ottoman streets, historic mosques, and local artisan markets.',                                                   '#316CFF', '#74A8FF', 3),
  ('Kosovo Flavors Dinner',  'Restaurants','Pishat Restaurant, Prishtina',   'Wed • 19:00', 'Enjoy authentic dishes with live traditional music and warm hospitality from Kosovo hosts.',                                               '#FF6A2F', '#FF9A54', 4),
  ('Campus Study Circle',    'Study',     'Innovation Hub, Prishtina',       'Thu • 17:00', 'Meet students, attend quick workshops, and discover Kosovo''s study culture.',                                                              '#FFC92C', '#FFB54A', 5)
on conflict do nothing;

-- ============================================================================
-- 17. Seed kosovo_highlights
-- ============================================================================

insert into public.kosovo_highlights (title, description, accent_color, sort_order)
values
  ('Economy in Motion',       'A fast-growing entrepreneurial scene, local tech hubs, and lively markets that welcome tourists and locals alike.',  '#FFC92C', 1),
  ('Nature & Adventure',     'Rugged canyons, mountain lakes, and hiking trails make Kosovo a natural playground for active travelers.',           '#1FCA65', 2),
  ('Nightlife & Events',     'From rooftop lounges to underground parties, Kosovo''s music scene keeps your nights memorable.',                   '#A537FF', 3),
  ('Culture & Heritage',     'Traditional festivals, historic architecture, and warm hospitality show the heart of Kosovo culture.',              '#316CFF', 4),
  ('Study & Creativity',     'A young student community, modern campuses, and inspiring events for learning and collaboration.',                   '#FF6A2F', 5)
on conflict do nothing;

-- ============================================================================
-- 18. Seed tavolina_events
-- ============================================================================

insert into public.tavolina_events (restaurant_name, city, day, time, event_type, creator_name, creator_avatar, description, tags, spots_label, image_url, restaurant_id)
select
  'Pishat Restaurant',
  'Prishtina',
  'Friday',
  '20:00',
  'food',
  'Arta K.',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80',
  'Who wants to join for dinner? I booked a table for 4 people.',
  array['Grill', 'Casual'],
  '2/4 spots',
  'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=1200&q=80',
  p.id
from public.places p
where p.slug = 'pishat' and p.deleted_at is null
  and not exists (select 1 from public.tavolina_events te where te.restaurant_name = 'Pishat Restaurant' and te.creator_name = 'Arta K.' and te.deleted_at is null);

insert into public.tavolina_events (restaurant_name, city, day, time, event_type, creator_name, creator_avatar, description, tags, spots_label, image_url, restaurant_id)
select
  'Sushi Bar Tokio',
  'Prishtina',
  'Saturday',
  '19:30',
  'food',
  'Rina D.',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80',
  'Looking for two people for sushi night and good conversation.',
  array['Sushi', 'Friendly'],
  '1/3 spots',
  'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80',
  p.id
from public.places p
where p.slug = 'sushi-bar-tokio' and p.deleted_at is null
  and not exists (select 1 from public.tavolina_events te where te.restaurant_name = 'Sushi Bar Tokio' and te.creator_name = 'Rina D.' and te.deleted_at is null);

insert into public.tavolina_events (restaurant_name, city, day, time, event_type, creator_name, creator_avatar, description, tags, spots_label, image_url, restaurant_id)
select
  'Prizren Old Town Walk',
  'Prizren',
  'Sunday',
  '18:30',
  'culture',
  'Dren A.',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80',
  'Come for a sunset walk, street photos, and a relaxed old-town stop.',
  array['Culture', 'Walk'],
  '4/6 spots',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
  p.id
from public.places p
where p.slug = 'pishat' and p.deleted_at is null
  and not exists (select 1 from public.tavolina_events te where te.restaurant_name = 'Prizren Old Town Walk' and te.creator_name = 'Dren A.' and te.deleted_at is null);

-- ============================================================================
-- 19. Seed event_organizers
-- ============================================================================

insert into public.event_organizers (name, avatar, rating, event_count, confirmed_guests, reliability, badges, recent_praise)
values
  ('Arta K.',
   'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80',
   4.9, 18, 96, 'Top food host',
   array['Dinner pro', 'On-time', 'Warm tables'],
   array['Booked exactly as promised', 'Made newcomers feel welcome']),
  ('Rina D.',
   'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80',
   4.8, 12, 58, 'Trusted organizer',
   array['Small groups', 'Great taste'],
   array['Good communication', 'Easy-going host']),
  ('Dren A.',
   'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80',
   4.7, 10, 74, 'Culture guide',
   array['Local routes', 'Photo walks'],
   array['Great route planning', 'Kept everyone together'])
on conflict (name) do update
set
  rating           = excluded.rating,
  event_count      = excluded.event_count,
  confirmed_guests = excluded.confirmed_guests,
  reliability      = excluded.reliability,
  badges           = excluded.badges,
  recent_praise    = excluded.recent_praise,
  updated_at       = now();

commit;