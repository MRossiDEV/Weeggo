import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Filters, Mode } from "@/lib/discover/types";
import {
  DEFAULT_CATEGORY_PREFS,
  type CategoryPrefs,
  type NotificationCategory,
  type NotificationChannel,
  type NotificationEntry,
  type NotificationStatus,
  type PushSubscriptionInput,
  type SavedSearch,
  type VisitorPrefs,
} from "./types";

type VisitorRow = {
  id: string;
  email: string | null;
  push_enabled: boolean;
  email_enabled: boolean;
  categories: CategoryPrefs;
};

type SavedSearchRow = {
  id: string;
  visitor_id: string;
  mode: string;
  filters: Filters;
  label: string;
  active: boolean;
  last_matched_at: string | null;
  created_at: string;
};

type NotificationRow = {
  id: string;
  category: NotificationCategory;
  channel: NotificationChannel;
  title: string;
  body: string;
  listing_ids: string[];
  status: NotificationStatus;
  read_at: string | null;
  created_at: string;
};

function assertNoError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

function mapVisitor(row: VisitorRow): VisitorPrefs {
  return {
    id: row.id,
    email: row.email,
    pushEnabled: row.push_enabled,
    emailEnabled: row.email_enabled,
    categories: { ...DEFAULT_CATEGORY_PREFS, ...(row.categories ?? {}) },
  };
}

function mapSavedSearch(row: SavedSearchRow): SavedSearch {
  return {
    id: row.id,
    mode: row.mode as Mode,
    filters: row.filters,
    label: row.label,
    active: row.active,
    lastMatchedAt: row.last_matched_at ? new Date(row.last_matched_at).getTime() : null,
    createdAt: new Date(row.created_at).getTime(),
  };
}

function mapNotification(row: NotificationRow): NotificationEntry {
  return {
    id: row.id,
    category: row.category,
    channel: row.channel,
    title: row.title,
    body: row.body,
    listingIds: row.listing_ids ?? [],
    status: row.status,
    readAt: row.read_at ? new Date(row.read_at).getTime() : null,
    createdAt: new Date(row.created_at).getTime(),
  };
}

/** Creates the visitor row on first contact (save a search, subscribe to push) — a no-op if it already exists. */
export async function ensureVisitor(visitorId: string, email?: string | null): Promise<void> {
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("weeggo_visitors")
    .select("id")
    .eq("id", visitorId)
    .maybeSingle();
  assertNoError(fetchError);

  if (!existing) {
    const { error } = await supabaseAdmin.from("weeggo_visitors").insert({ id: visitorId, email: email || null });
    assertNoError(error);
    return;
  }

  if (email) {
    const { error } = await supabaseAdmin.from("weeggo_visitors").update({ email }).eq("id", visitorId);
    assertNoError(error);
  }
}

export async function getVisitorPrefs(visitorId: string): Promise<VisitorPrefs | null> {
  const { data, error } = await supabaseAdmin.from("weeggo_visitors").select("*").eq("id", visitorId).maybeSingle();
  assertNoError(error);
  return data ? mapVisitor(data as VisitorRow) : null;
}

export async function updateVisitorPrefs(
  visitorId: string,
  patch: Partial<{ pushEnabled: boolean; emailEnabled: boolean; categories: CategoryPrefs; email: string | null }>
): Promise<void> {
  const update: Record<string, unknown> = {};
  if (patch.pushEnabled !== undefined) update.push_enabled = patch.pushEnabled;
  if (patch.emailEnabled !== undefined) update.email_enabled = patch.emailEnabled;
  if (patch.categories !== undefined) update.categories = patch.categories;
  if (patch.email !== undefined) update.email = patch.email;
  if (Object.keys(update).length === 0) return;

  const { error } = await supabaseAdmin.from("weeggo_visitors").update(update).eq("id", visitorId);
  assertNoError(error);
}

export async function createSavedSearch(
  visitorId: string,
  data: { mode: Mode; filters: Filters; label: string }
): Promise<SavedSearch> {
  const { data: row, error } = await supabaseAdmin
    .from("weeggo_saved_searches")
    .insert({ visitor_id: visitorId, mode: data.mode, filters: data.filters, label: data.label })
    .select()
    .single();
  assertNoError(error);
  return mapSavedSearch(row as SavedSearchRow);
}

export async function listSavedSearches(visitorId: string): Promise<SavedSearch[]> {
  const { data, error } = await supabaseAdmin
    .from("weeggo_saved_searches")
    .select("*")
    .eq("visitor_id", visitorId)
    .order("created_at", { ascending: false });
  assertNoError(error);
  return (data as SavedSearchRow[]).map(mapSavedSearch);
}

export async function setSavedSearchActive(visitorId: string, id: string, active: boolean): Promise<void> {
  const { error } = await supabaseAdmin
    .from("weeggo_saved_searches")
    .update({ active })
    .eq("id", id)
    .eq("visitor_id", visitorId);
  assertNoError(error);
}

export async function deleteSavedSearch(visitorId: string, id: string): Promise<void> {
  const { error } = await supabaseAdmin.from("weeggo_saved_searches").delete().eq("id", id).eq("visitor_id", visitorId);
  assertNoError(error);
}

export async function savePushSubscription(
  visitorId: string,
  subscription: PushSubscriptionInput,
  userAgent?: string
): Promise<void> {
  const { error } = await supabaseAdmin.from("weeggo_push_subscriptions").upsert(
    {
      visitor_id: visitorId,
      endpoint: subscription.endpoint,
      p256dh: subscription.p256dh,
      auth: subscription.auth,
      user_agent: userAgent ?? null,
    },
    { onConflict: "endpoint" }
  );
  assertNoError(error);
}

export async function removePushSubscription(endpoint: string): Promise<void> {
  const { error } = await supabaseAdmin.from("weeggo_push_subscriptions").delete().eq("endpoint", endpoint);
  assertNoError(error);
}

export async function listNotifications(visitorId: string, limit = 30): Promise<NotificationEntry[]> {
  const { data, error } = await supabaseAdmin
    .from("weeggo_notifications")
    .select("*")
    .eq("visitor_id", visitorId)
    .eq("status", "sent")
    .order("created_at", { ascending: false })
    .limit(limit);
  assertNoError(error);
  return (data as NotificationRow[]).map(mapNotification);
}

export async function markNotificationsRead(visitorId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("weeggo_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("visitor_id", visitorId)
    .is("read_at", null);
  assertNoError(error);
}
