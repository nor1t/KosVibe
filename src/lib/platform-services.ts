/**
 * Sprint 9 — Platform Services
 *
 * Unified write operations for notifications, analytics events,
 * recommendation events, reports, and audit logs.
 *
 * These are backend-only services. The frontend calls these
 * through the repository layer indirectly — no UI changes.
 */

import { supabase } from './supabase';

// ─── Notifications ──────────────────────────────────────────────────────────

type NotificationType =
  | 'event_join'
  | 'event_confirm'
  | 'event_cancel'
  | 'event_reminder'
  | 'review_request'
  | 'new_follower'
  | 'recommendation'
  | 'system';

type NotificationChannel = 'push' | 'in_app' | 'email';

/**
 * Send a notification to a user. Inserts into the `notifications` table.
 * Returns the notification ID or null on failure.
 */
export async function sendNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body?: string,
  data?: Record<string, unknown>,
  channel: NotificationChannel = 'in_app'
): Promise<string | null> {
  const { error, data: result } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      body: body ?? null,
      data: data ?? null,
      channel,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to send notification', error);
    return null;
  }

  return result?.id ?? null;
}

/**
 * Mark a notification as read.
 */
export async function markNotificationRead(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  return !error;
}

/**
 * Get unread notification count for a user.
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)
    .is('deleted_at', null);

  if (error) return 0;
  return count ?? 0;
}

// ─── Notification Preferences ───────────────────────────────────────────────

/**
 * Get a user's notification preferences. Returns defaults if none set.
 */
export async function getNotificationPreferences(userId: string) {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Update a user's notification preference for a specific type and channel.
 */
export async function updateNotificationPreference(
  userId: string,
  type: NotificationType,
  channel: 'push' | 'in_app' | 'email',
  enabled: boolean
): Promise<boolean> {
  const column = `${type}_${channel}`;
  const { error } = await supabase
    .from('notification_preferences')
    .upsert({ user_id: userId, [column]: enabled }, { onConflict: 'user_id' });

  return !error;
}

// ─── Analytics Events ───────────────────────────────────────────────────────

/**
 * Track an analytics event. Fire-and-forget — returns immediately.
 */
export async function trackAnalyticsEvent(
  eventName: string,
  properties?: Record<string, unknown>,
  userId?: string
): Promise<void> {
  void supabase
    .from('analytics_events')
    .insert({
      event_name: eventName,
      properties: properties ?? null,
      user_id: userId ?? null,
    })
    .then(() => undefined, () => undefined);
}

/**
 * Track a screen view event.
 */
export function trackScreenView(screenName: string, userId?: string): void {
  void trackAnalyticsEvent('screen_view', { screen: screenName }, userId);
}

/**
 * Track an entity interaction event.
 */
export function trackInteraction(
  action: string,
  entityType: string,
  entityId: string,
  userId?: string
): void {
  void trackAnalyticsEvent(
    'interaction',
    { action, entity_type: entityType, entity_id: entityId },
    userId
  );
}

// ─── Recommendation Events ──────────────────────────────────────────────────

type RecommendationAction = 'view' | 'click' | 'bookmark' | 'book' | 'rate' | 'share' | 'dismiss';
type RecommendationEntityType = 'restaurant' | 'event' | 'story' | 'seller' | 'product';

/**
 * Track a recommendation event. Used to build personalized feeds.
 */
export async function trackRecommendationEvent(
  userId: string,
  action: RecommendationAction,
  entityType: RecommendationEntityType,
  entityId: string,
  context?: Record<string, unknown>
): Promise<boolean> {
  const { error } = await supabase
    .from('recommendation_events')
    .insert({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      context: context ?? null,
    });

  return !error;
}

// ─── Reports ────────────────────────────────────────────────────────────────

type ReportEntityType = 'restaurant' | 'event' | 'story' | 'comment' | 'user' | 'seller';

/**
 * Submit a report for moderation.
 */
export async function submitReport(
  reporterId: string,
  entityType: ReportEntityType,
  entityId: string,
  reason: string,
  description?: string
): Promise<string | null> {
  const { error, data } = await supabase
    .from('reports')
    .insert({
      reporter_id: reporterId,
      entity_type: entityType,
      entity_id: entityId,
      reason,
      description: description ?? null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to submit report', error);
    return null;
  }

  return data?.id ?? null;
}

/**
 * Resolve a report (admin action).
 */
export async function resolveReport(
  reportId: string,
  resolution: 'resolved' | 'dismissed',
  note?: string
): Promise<boolean> {
  const { error } = await supabase
    .from('reports')
    .update({
      status: resolution,
      resolution_note: note ?? null,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', reportId);

  return !error;
}

// ─── Audit Logs ─────────────────────────────────────────────────────────────

type AuditAction = 'create' | 'update' | 'delete' | 'restore' | 'report' | 'moderate' | 'export';

/**
 * Log an audit event. Fire-and-forget.
 */
export async function logAudit(
  actorId: string | null,
  action: AuditAction,
  entityType: string,
  entityId?: string,
  changes?: Record<string, unknown>
): Promise<void> {
  void supabase
    .from('audit_logs')
    .insert({
      actor_id: actorId,
      action,
      entity_type: entityType,
      entity_id: entityId ?? null,
      changes: changes ?? null,
    })
    .then(() => undefined, () => undefined);
}