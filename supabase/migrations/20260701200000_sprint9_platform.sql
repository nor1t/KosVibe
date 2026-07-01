-- ============================================================================
-- Sprint 9 — Platform Services
-- ============================================================================
-- Creates: notifications, notification_preferences, analytics_events,
--          recommendation_events, reports, audit_logs
-- Rule: Purely additive. No screens modified. Backend only.
-- ============================================================================

begin;

-- ============================================================================
-- 1. Enums
-- ============================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'notification_channel') then
    create type public.notification_channel as enum ('push', 'in_app', 'email');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'report_status') then
    create type public.report_status as enum ('pending', 'reviewed', 'resolved', 'dismissed');
  end if;
end
$$;

-- ============================================================================
-- 2. notifications table (unified — supersedes event_notifications)
-- ============================================================================

create table public.notifications (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  data jsonb,
  channel public.notification_channel not null default 'in_app',
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint notifications_type_check
    check (type in ('event_join', 'event_confirm', 'event_cancel', 'event_reminder', 'review_request', 'new_follower', 'recommendation', 'system'))
);

comment on table public.notifications is 'Unified notification system for all app events.';
comment on column public.notifications.data is 'JSON payload for rich notification content (e.g. entity IDs, URLs).';
comment on column public.notifications.channel is 'Delivery channel: push | in_app | email.';

create trigger set_notifications_updated_at
  before update on public.notifications
  for each row execute function public.set_updated_at();

create index notifications_user_id_idx on public.notifications (user_id) where deleted_at is null;
create index notifications_unread_idx on public.notifications (user_id) where deleted_at is null and is_read = false;
create index notifications_type_idx on public.notifications (type) where deleted_at is null;

-- ============================================================================
-- 3. notification_preferences table
-- ============================================================================

create table public.notification_preferences (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  event_join_push boolean not null default true,
  event_join_in_app boolean not null default true,
  event_join_email boolean not null default false,
  event_confirm_push boolean not null default true,
  event_confirm_in_app boolean not null default true,
  event_confirm_email boolean not null default false,
  event_reminder_push boolean not null default true,
  event_reminder_in_app boolean not null default true,
  event_reminder_email boolean not null default false,
  review_request_push boolean not null default true,
  review_request_in_app boolean not null default true,
  review_request_email boolean not null default false,
  recommendation_push boolean not null default false,
  recommendation_in_app boolean not null default true,
  recommendation_email boolean not null default false,
  system_push boolean not null default true,
  system_in_app boolean not null default true,
  system_email boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.notification_preferences is 'Per-user notification channel preferences by notification type.';
comment on column public.notification_preferences.user_id is 'One row per user (unique).';

create trigger set_notification_preferences_updated_at
  before update on public.notification_preferences
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 4. analytics_events table
-- ============================================================================

create table public.analytics_events (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  event_name text not null,
  properties jsonb,
  session_id text,
  device_info jsonb,
  created_at timestamptz not null default now()
);

comment on table public.analytics_events is 'User behavior tracking for analytics.';
comment on column public.analytics_events.properties is 'Event-specific payload (e.g. screen name, duration, entity IDs).';
comment on column public.analytics_events.device_info is 'Device metadata (platform, OS version, app version).';

create index analytics_events_user_id_idx on public.analytics_events (user_id);
create index analytics_events_event_name_idx on public.analytics_events (event_name);
create index analytics_events_created_at_idx on public.analytics_events (created_at desc);

-- ============================================================================
-- 5. recommendation_events table
-- ============================================================================

create table public.recommendation_events (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  context jsonb,
  created_at timestamptz not null default now(),
  constraint recommendation_events_action_check
    check (action in ('view', 'click', 'bookmark', 'book', 'rate', 'share', 'dismiss')),
  constraint recommendation_events_entity_type_check
    check (entity_type in ('restaurant', 'event', 'story', 'seller', 'product'))
);

comment on table public.recommendation_events is 'User interaction events for building recommendation feeds.';
comment on column public.recommendation_events.action is 'Interaction type: view | click | bookmark | book | rate | share | dismiss.';
comment on column public.recommendation_events.context is 'Additional context (e.g. source screen, position in list, session metadata).';

create index recommendation_events_user_id_idx on public.recommendation_events (user_id);
create index recommendation_events_action_idx on public.recommendation_events (user_id, action);
create index recommendation_events_entity_idx on public.recommendation_events (entity_type, entity_id);
create index recommendation_events_created_at_idx on public.recommendation_events (created_at desc);

-- ============================================================================
-- 6. reports table
-- ============================================================================

create table public.reports (
  id uuid primary key default extensions.gen_random_uuid(),
  reporter_id uuid not null references auth.users (id) on delete cascade,
  entity_type text not null,
  entity_id text not null,
  reason text not null,
  description text,
  status public.report_status not null default 'pending',
  resolution_note text,
  resolved_by uuid references auth.users (id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reports_entity_type_check
    check (entity_type in ('restaurant', 'event', 'story', 'comment', 'user', 'seller'))
);

comment on table public.reports is 'User-submitted reports for moderation.';
comment on column public.reports.status is 'Report lifecycle: pending → reviewed → resolved | dismissed.';
comment on column public.reports.resolution_note is 'Admin note explaining resolution or dismissal.';

create trigger set_reports_updated_at
  before update on public.reports
  for each row execute function public.set_updated_at();

create index reports_status_idx on public.reports (status);
create index reports_entity_idx on public.reports (entity_type, entity_id);
create index reports_reporter_idx on public.reports (reporter_id);
create index reports_created_at_idx on public.reports (created_at desc);

-- ============================================================================
-- 7. audit_logs table
-- ============================================================================

create table public.audit_logs (
  id uuid primary key default extensions.gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  changes jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

comment on table public.audit_logs is 'Detailed audit trail for all data mutations.';
comment on column public.audit_logs.action is 'Action performed: create | update | delete | restore | report | moderate | export.';
comment on column public.audit_logs.changes is 'JSON diff of before/after values for updates.';

create index audit_logs_actor_id_idx on public.audit_logs (actor_id);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);
create index audit_logs_action_idx on public.audit_logs (action);
create index audit_logs_created_at_idx on public.audit_logs (created_at desc);

-- ============================================================================
-- 8. Enable RLS
-- ============================================================================

alter table public.notifications enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.analytics_events enable row level security;
alter table public.recommendation_events enable row level security;
alter table public.reports enable row level security;
alter table public.audit_logs enable row level security;

-- ============================================================================
-- 9. RLS policies — notifications
-- ============================================================================

create policy "Users can read own notifications"
on public.notifications for select to authenticated
using (auth.uid() = user_id or public.is_admin());

create policy "System can insert notifications"
on public.notifications for insert to authenticated
with check (public.is_admin());

create policy "Users can update own notifications (mark read)"
on public.notifications for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ============================================================================
-- 10. RLS policies — notification_preferences
-- ============================================================================

create policy "Users can read own preferences"
on public.notification_preferences for select to authenticated
using (auth.uid() = user_id or public.is_admin());

create policy "Users can upsert own preferences"
on public.notification_preferences for insert to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own preferences"
on public.notification_preferences for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ============================================================================
-- 11. RLS policies — analytics_events
-- ============================================================================

create policy "Analytics events are insertable by authenticated users"
on public.analytics_events for insert to authenticated
with check (auth.uid() = user_id or user_id is null);

create policy "Analytics events are readable by admin"
on public.analytics_events for select to authenticated
using (public.is_admin());

-- ============================================================================
-- 12. RLS policies — recommendation_events
-- ============================================================================

create policy "Recommendation events are insertable by authenticated users"
on public.recommendation_events for insert to authenticated
with check (auth.uid() = user_id or user_id is null);

create policy "Recommendation events are readable by admin"
on public.recommendation_events for select to authenticated
using (public.is_admin());

-- ============================================================================
-- 13. RLS policies — reports
-- ============================================================================

create policy "Users can read own reports"
on public.reports for select to authenticated
using (auth.uid() = reporter_id or public.is_admin());

create policy "Reports are insertable by authenticated users"
on public.reports for insert to authenticated
with check (auth.uid() = reporter_id);

create policy "Reports are updatable by admin"
on public.reports for update to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ============================================================================
-- 14. RLS policies — audit_logs
-- ============================================================================

create policy "Audit logs are readable by admin"
on public.audit_logs for select to authenticated
using (public.is_admin());

create policy "Audit logs are insertable by authenticated users"
on public.audit_logs for insert to authenticated
with check (auth.uid() = actor_id or actor_id is null);

commit;