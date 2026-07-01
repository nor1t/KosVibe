-- ============================================================================
-- Sprint 6 — Stories
-- ============================================================================
-- Creates: stories, story_media, story_likes, story_comments
-- Seeds: All 8 base stories (4 en + 4 sq) from hardcoded data.
-- Replaces: AsyncStorage persistence in StoriesRepository.
--
-- Rule: Purely additive. No screens modified.
-- ============================================================================

begin;

-- ============================================================================
-- 1. stories table
-- ============================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'story_visibility') then
    create type public.story_visibility as enum ('public', 'hidden', 'flagged');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'moderation_status') then
    create type public.moderation_status as enum ('pending', 'approved', 'rejected');
  end if;
end
$$;

create table public.stories (
  id uuid primary key default extensions.gen_random_uuid(),
  title text not null,
  author text not null default '@you',
  subtitle text,
  body text,
  image_url text,
  location text,
  category text,
  read_time text,
  posted_at text not null default 'Just now',
  likes_count int not null default 0,
  views_count int not null default 0,
  language text not null default 'en',
  is_user_story boolean not null default false,
  visibility public.story_visibility not null default 'public',
  moderation_status public.moderation_status not null default 'approved',
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  deleted_at timestamptz,
  constraint stories_language_check
    check (language in ('en', 'sq')),
  constraint stories_likes_count_check
    check (likes_count >= 0),
  constraint stories_views_count_check
    check (views_count >= 0)
);

comment on table public.stories is 'Story content with moderation and visibility controls.';
comment on column public.stories.visibility is 'Story visibility: public | hidden | flagged.';
comment on column public.stories.moderation_status is 'Moderation status: pending | approved | rejected.';
comment on column public.stories.deleted_at is 'Soft-delete timestamp — when set, the story is considered removed.';

create trigger set_stories_created_by
  before insert on public.stories
  for each row execute function public.set_created_by();

create trigger set_stories_updated_by
  before update on public.stories
  for each row execute function public.set_updated_by();

create trigger set_stories_updated_at
  before update on public.stories
  for each row execute function public.set_updated_at();

create index stories_language_idx on public.stories (language) where deleted_at is null;
create index stories_visibility_idx on public.stories (visibility) where deleted_at is null;
create index stories_user_id_idx on public.stories (user_id) where deleted_at is null;
create index stories_published_idx on public.stories (language)
  where deleted_at is null
    and visibility = 'public'
    and moderation_status = 'approved';

-- ============================================================================
-- 2. story_media table
-- ============================================================================

create table public.story_media (
  id uuid primary key default extensions.gen_random_uuid(),
  story_id uuid not null references public.stories (id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint story_media_sort_order_check
    check (sort_order >= 0)
);

comment on table public.story_media is 'Additional images attached to stories.';
comment on column public.story_media.deleted_at is 'Soft-delete timestamp.';

create trigger set_story_media_updated_at
  before update on public.story_media
  for each row execute function public.set_updated_at();

create index story_media_story_id_idx on public.story_media (story_id) where deleted_at is null;

-- ============================================================================
-- 3. story_likes table
-- ============================================================================

create table public.story_likes (
  id uuid primary key default extensions.gen_random_uuid(),
  story_id uuid not null references public.stories (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.story_likes is 'User likes on stories.';

-- Unique index: one like per user per story
create unique index story_likes_story_id_user_id_idx
  on public.story_likes (story_id, user_id);

create index story_likes_story_id_idx on public.story_likes (story_id);

-- ============================================================================
-- 4. story_comments table
-- ============================================================================

create table public.story_comments (
  id uuid primary key default extensions.gen_random_uuid(),
  story_id uuid not null references public.stories (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  author_name text not null default 'Anonymous',
  body text not null,
  moderation_status public.moderation_status not null default 'approved',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  deleted_at timestamptz
);

comment on table public.story_comments is 'User comments on stories with moderation.';
comment on column public.story_comments.deleted_at is 'Soft-delete timestamp.';

create trigger set_story_comments_created_by
  before insert on public.story_comments
  for each row execute function public.set_created_by();

create trigger set_story_comments_updated_by
  before update on public.story_comments
  for each row execute function public.set_updated_by();

create trigger set_story_comments_updated_at
  before update on public.story_comments
  for each row execute function public.set_updated_at();

create index story_comments_story_id_idx on public.story_comments (story_id) where deleted_at is null;
create index story_comments_approved_idx on public.story_comments (story_id)
  where deleted_at is null and moderation_status = 'approved';

-- ============================================================================
-- 5. Enable RLS
-- ============================================================================

alter table public.stories enable row level security;
alter table public.story_media enable row level security;
alter table public.story_likes enable row level security;
alter table public.story_comments enable row level security;

-- ============================================================================
-- 6. RLS policies — stories
-- ============================================================================

create policy "Public approved stories are readable by everyone"
on public.stories
for select
to anon, authenticated
using (
  deleted_at is null
  and visibility = 'public'
  and moderation_status = 'approved'
);

create policy "Own stories are readable by author"
on public.stories
for select
to authenticated
using (
  auth.uid() = user_id
  or (auth.uid() = created_by)
  or public.is_admin()
);

create policy "Stories are insertable by authenticated users"
on public.stories
for insert
to authenticated
with check (auth.uid() = created_by or created_by is null);

create policy "Stories are updatable by author or admin"
on public.stories
for update
to authenticated
using (
  auth.uid() = user_id
  or auth.uid() = created_by
  or public.is_admin()
)
with check (
  auth.uid() = user_id
  or auth.uid() = created_by
  or public.is_admin()
);

create policy "Stories are deletable by author or admin"
on public.stories
for delete
to authenticated
using (
  auth.uid() = user_id
  or auth.uid() = created_by
  or public.is_admin()
);

-- ============================================================================
-- 7. RLS policies — story_media
-- ============================================================================

create policy "Story media is readable with parent story"
on public.story_media
for select
to anon, authenticated
using (
  deleted_at is null
  and exists (
    select 1 from public.stories s
    where s.id = story_media.story_id
      and s.visibility = 'public'
      and s.moderation_status = 'approved'
      and s.deleted_at is null
  )
  or public.is_admin()
);

create policy "Story media is insertable by story author or admin"
on public.story_media
for insert
to authenticated
with check (
  exists (
    select 1 from public.stories s
    where s.id = story_media.story_id
      and (s.user_id = auth.uid() or s.created_by = auth.uid())
    and s.deleted_at is null
  )
  or public.is_admin()
);

create policy "Story media is updatable by story author or admin"
on public.story_media
for update
to authenticated
using (
  exists (
    select 1 from public.stories s
    where s.id = story_media.story_id
      and (s.user_id = auth.uid() or s.created_by = auth.uid())
    and s.deleted_at is null
  )
  or public.is_admin()
)
with check (
  exists (
    select 1 from public.stories s
    where s.id = story_media.story_id
      and (s.user_id = auth.uid() or s.created_by = auth.uid())
    and s.deleted_at is null
  )
  or public.is_admin()
);

-- ============================================================================
-- 8. RLS policies — story_likes
-- ============================================================================

create policy "Story likes are publicly readable"
on public.story_likes
for select
to anon, authenticated
using (exists (
  select 1 from public.stories s
  where s.id = story_likes.story_id
    and s.visibility = 'public'
    and s.moderation_status = 'approved'
    and s.deleted_at is null
));

create policy "Story likes are insertable by authenticated users"
on public.story_likes
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Story likes are deletable by the user"
on public.story_likes
for delete
to authenticated
using (auth.uid() = user_id or public.is_admin());

-- ============================================================================
-- 9. RLS policies — story_comments
-- ============================================================================

create policy "Approved story comments are publicly readable"
on public.story_comments
for select
to anon, authenticated
using (
  deleted_at is null
  and moderation_status = 'approved'
  and exists (
    select 1 from public.stories s
    where s.id = story_comments.story_id
      and s.visibility = 'public'
      and s.deleted_at is null
  )
);

create policy "Own comments are readable by author"
on public.story_comments
for select
to authenticated
using (
  auth.uid() = created_by
  or public.is_admin()
);

create policy "Story comments are insertable by authenticated users"
on public.story_comments
for insert
to authenticated
with check (auth.uid() = created_by or created_by is null);

create policy "Story comments are updatable by author or admin"
on public.story_comments
for update
to authenticated
using (auth.uid() = created_by or public.is_admin())
with check (auth.uid() = created_by or public.is_admin());

create policy "Story comments are deletable by author or admin"
on public.story_comments
for delete
to authenticated
using (auth.uid() = created_by or public.is_admin());

-- ============================================================================
-- 10. Seed base stories (English)
-- ============================================================================

insert into public.stories (title, author, subtitle, body, image_url, location, category, read_time, posted_at, likes_count, views_count, language, is_user_story)
values
  ('Midnight in Prizren',
   '@streetvibes.xk',
   'A cinematic walk through river lights, food spots, and late-night chatter.',
   'Prizren changes after sunset. The bridge glows, the river gets louder, and every narrow street seems to point toward a warm table. This route starts at Shadervan, drifts toward old stone walls, then ends with late food and music near the square.',
   'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80',
   'Prizren', 'Night Walk', '3 min', 'Tonight', 248, 1900, 'en', false),
  ('Kosovo Coffee Trails',
   '@beansandbridges',
   'Warm cafes, gold-hour corners, and local stories behind every cup.',
   'The best Kosovo coffee days are slow: a morning espresso in Prishtina, a roadside macchiato before Peje, and a tiny table in Prizren as the light drops. This story collects the stops where the coffee is good and the room feels lived in.',
   'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
   'Prishtina, Peje, Prizren', 'Coffee', '4 min', '2h ago', 183, 1300, 'en', false),
  ('Icons After Rain',
   '@culturepulse',
   'How monuments, mist, and city sounds collide into one proud moodboard.',
   'Rain makes the stone brighter. The monuments feel quieter, the streets reflect every sign, and the city turns into a soft museum without walls. Save this for a cloudy afternoon when Kosovo feels especially cinematic.',
   'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80',
   'Kosovo', 'Culture', '5 min', 'Yesterday', 321, 2400, 'en', false),
  ('One Table, Six Friends',
   '@tabletalk.xk',
   'A dinner route built for sharing plates, dessert, and long conversations.',
   'Start with mezze, move into grilled plates, and leave room for cake. Kosovo dinners are at their best when the table is crowded and nobody is rushing. These are the places that turn dinner into the plan, not the stop before it.',
   'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
   'Prishtina', 'Food', '4 min', '3 days ago', 156, 980, 'en', false)
on conflict do nothing;

-- ============================================================================
-- 11. Seed base stories (Albanian)
-- ============================================================================

insert into public.stories (title, author, subtitle, body, image_url, location, category, read_time, posted_at, likes_count, views_count, language, is_user_story)
values
  ('Mesnate ne Prizren',
   '@streetvibes.xk',
   'Nje ecje kinematike mes dritave te lumit, ushqimit dhe bisedave te vona.',
   'Prizreni ndryshon pas perendimit. Ura ndricon, lumi degjohet me shume dhe cdo rruge e ngushte te con drejt nje tavoline te ngrohte. Rruga nis te Shadervani dhe perfundon me ushqim e muzike afer sheshit.',
   'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80',
   'Prizren', 'Ecje nate', '3 min', 'Sonte', 248, 1900, 'sq', false),
  ('Shtigjet e kafes ne Kosove',
   '@beansandbridges',
   'Kafene te ngrohta, qoshe me drite te arte dhe histori lokale pas cdo filxhani.',
   'Ditet me te mira te kafes ne Kosove jane te ngadalta: espresso ne Prishtine, macchiato rruges per Peje dhe nje tavoline e vogel ne Prizren kur bie drita.',
   'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
   'Prishtine, Peje, Prizren', 'Kafe', '4 min', '2h me pare', 183, 1300, 'sq', false),
  ('Ikonat pas shiut',
   '@culturepulse',
   'Monumente, mjegull dhe tinguj qyteti qe bashkohen ne nje atmosfere krenare.',
   'Shiu e ben gurin me te ndritshem. Monumentet duken me te qeta, rruget reflektojne dritat dhe qyteti kthehet ne nje muze te bute pa mure.',
   'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80',
   'Kosove', 'Kulture', '5 min', 'Dje', 321, 2400, 'sq', false),
  ('Nje tavoline, gjashte shoke',
   '@tabletalk.xk',
   'Nje rruge darke per pjata te perbashketa, embelsire dhe biseda te gjata.',
   'Fillo me mezze, vazhdo me skare dhe ruaj vend per embelsire. Darkat ne Kosove jane me te mirat kur tavolina eshte plot dhe askush nuk ngutet.',
   'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
   'Prishtine', 'Ushqim', '4 min', '3 dite me pare', 156, 980, 'sq', false)
on conflict do nothing;

commit;