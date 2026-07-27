import type { Filters, Mode } from "@/lib/discover/types";

export type NotificationCategory = "new_match" | "price_drop" | "status_change" | "digest";
export type NotificationChannel = "push" | "email";
export type NotificationStatus = "sent" | "failed" | "skipped_quiet_hours" | "skipped_cap";

export type CategoryPrefs = Record<NotificationCategory, { push: boolean; email: boolean }>;

export const DEFAULT_CATEGORY_PREFS: CategoryPrefs = {
  new_match: { push: true, email: true },
  price_drop: { push: true, email: true },
  status_change: { push: true, email: true },
  digest: { push: false, email: true },
};

export interface VisitorPrefs {
  id: string;
  email: string | null;
  pushEnabled: boolean;
  emailEnabled: boolean;
  categories: CategoryPrefs;
}

export interface SavedSearch {
  id: string;
  mode: Mode;
  filters: Filters;
  label: string;
  active: boolean;
  lastMatchedAt: number | null;
  createdAt: number;
}

export interface PushSubscriptionInput {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface NotificationEntry {
  id: string;
  category: NotificationCategory;
  channel: NotificationChannel;
  title: string;
  body: string;
  listingIds: string[];
  status: NotificationStatus;
  readAt: number | null;
  createdAt: number;
}
