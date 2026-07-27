"use server";

import type { Filters, Mode } from "@/lib/discover/types";
import * as store from "@/lib/notifications/store";
import type { CategoryPrefs, NotificationEntry, PushSubscriptionInput, SavedSearch, VisitorPrefs } from "@/lib/notifications/types";

export async function saveSearchAction(
  visitorId: string,
  data: { mode: Mode; filters: Filters; label: string; email?: string }
): Promise<{ ok: true; savedSearch: SavedSearch } | { ok: false; error: string }> {
  try {
    await store.ensureVisitor(visitorId, data.email);
    const savedSearch = await store.createSavedSearch(visitorId, {
      mode: data.mode,
      filters: data.filters,
      label: data.label,
    });
    return { ok: true, savedSearch };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "No pudimos guardar tu búsqueda." };
  }
}

export async function listSavedSearchesAction(visitorId: string): Promise<SavedSearch[]> {
  return store.listSavedSearches(visitorId);
}

export async function setSavedSearchActiveAction(visitorId: string, id: string, active: boolean): Promise<void> {
  await store.setSavedSearchActive(visitorId, id, active);
}

export async function deleteSavedSearchAction(visitorId: string, id: string): Promise<void> {
  await store.deleteSavedSearch(visitorId, id);
}

export async function getVisitorPrefsAction(visitorId: string): Promise<VisitorPrefs | null> {
  return store.getVisitorPrefs(visitorId);
}

export async function updateVisitorPrefsAction(
  visitorId: string,
  patch: Partial<{ pushEnabled: boolean; emailEnabled: boolean; categories: CategoryPrefs; email: string }>
): Promise<void> {
  await store.ensureVisitor(visitorId);
  await store.updateVisitorPrefs(visitorId, patch);
}

export async function subscribePushAction(
  visitorId: string,
  subscription: PushSubscriptionInput,
  userAgent?: string
): Promise<void> {
  await store.ensureVisitor(visitorId);
  await store.savePushSubscription(visitorId, subscription, userAgent);
}

export async function unsubscribePushAction(endpoint: string): Promise<void> {
  await store.removePushSubscription(endpoint);
}

export async function listNotificationsAction(visitorId: string): Promise<NotificationEntry[]> {
  return store.listNotifications(visitorId);
}

export async function markNotificationsReadAction(visitorId: string): Promise<void> {
  await store.markNotificationsRead(visitorId);
}
