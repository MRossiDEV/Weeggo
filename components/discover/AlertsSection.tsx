"use client";

import { useEffect, useState, useTransition } from "react";
import { Bell, Mail, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useVisitorId } from "@/lib/notifications/visitor";
import { isPushSupported, subscribeToPush, unsubscribeFromPush } from "@/lib/notifications/push-client";
import {
  deleteSavedSearchAction,
  getVisitorPrefsAction,
  listSavedSearchesAction,
  setSavedSearchActiveAction,
  subscribePushAction,
  unsubscribePushAction,
  updateVisitorPrefsAction,
} from "@/app/(app)/_lib/actions/notifications";
import type { NotificationCategory, SavedSearch, VisitorPrefs } from "@/lib/notifications/types";
import { useTranslation, type TranslationKey } from "@/lib/i18n/useTranslation";

const CATEGORIES: NotificationCategory[] = ["new_match", "price_drop", "digest"];

const CATEGORY_LABEL: Record<NotificationCategory, TranslationKey> = {
  new_match: "alerts.categoryNewMatch",
  price_drop: "alerts.categoryPriceDrop",
  status_change: "alerts.categoryStatusChange",
  digest: "alerts.categoryDigest",
};

/** Preference center for saved-search alerts (PRD 6.1/6.2/6.3 + section 7) — rendered inside /profile. */
export function AlertsSection() {
  const visitorId = useVisitorId();
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState<VisitorPrefs | null>(null);
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [pushOn, setPushOn] = useState(false);
  const [, startTransition] = useTransition();
  const pushSupported = isPushSupported();

  useEffect(() => {
    if (!visitorId) return;
    let cancelled = false;

    (async () => {
      const [visitorPrefs, savedSearches] = await Promise.all([
        getVisitorPrefsAction(visitorId),
        listSavedSearchesAction(visitorId),
      ]);
      if (cancelled) return;
      setPrefs(visitorPrefs);
      setSearches(savedSearches);

      if (pushSupported) {
        const registration = await navigator.serviceWorker.ready.catch(() => null);
        const subscription = await registration?.pushManager.getSubscription();
        if (!cancelled) setPushOn(!!subscription);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [visitorId, pushSupported]);

  if (!visitorId) return null;

  async function togglePush(enabled: boolean) {
    setPushOn(enabled);
    if (enabled) {
      const subscription = await subscribeToPush();
      if (subscription?.endpoint && subscription.keys) {
        await subscribePushAction(
          visitorId!,
          { endpoint: subscription.endpoint, p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
          navigator.userAgent
        );
        await updateVisitorPrefsAction(visitorId!, { pushEnabled: true });
      } else {
        setPushOn(false);
        toast.error(t("alerts.pushDenied"));
      }
    } else {
      const endpoint = await unsubscribeFromPush();
      if (endpoint) await unsubscribePushAction(endpoint);
      await updateVisitorPrefsAction(visitorId!, { pushEnabled: false });
    }
  }

  function toggleCategory(category: NotificationCategory, channel: "push" | "email") {
    if (!prefs) return;
    const next: VisitorPrefs = {
      ...prefs,
      categories: {
        ...prefs.categories,
        [category]: { ...prefs.categories[category], [channel]: !prefs.categories[category][channel] },
      },
    };
    setPrefs(next);
    startTransition(() => {
      void updateVisitorPrefsAction(visitorId!, { categories: next.categories });
    });
  }

  async function removeSearch(id: string) {
    setSearches((prev) => prev.filter((s) => s.id !== id));
    await deleteSavedSearchAction(visitorId!, id);
  }

  async function toggleSearchActive(id: string, active: boolean) {
    setSearches((prev) => prev.map((s) => (s.id === id ? { ...s, active } : s)));
    await setSavedSearchActiveAction(visitorId!, id, active);
  }

  return (
    <>
      <div className="mt-[22px] mb-2.5 text-[11.5px] font-extrabold uppercase tracking-wide text-muted-foreground">
        {t("alerts.title")}
      </div>

      {pushSupported && (
        <label className="mb-2.5 flex items-center justify-between rounded-2xl bg-card px-4 py-3.5 text-[13.5px] font-bold">
          <span>{t("alerts.pushToggle")}</span>
          <input
            type="checkbox"
            checked={pushOn}
            onChange={(e) => togglePush(e.target.checked)}
            className="size-4 accent-[var(--weeggo-orange)]"
          />
        </label>
      )}

      {searches.length === 0 ? (
        <p className="mb-2.5 rounded-2xl bg-card px-4 py-3.5 text-[12.5px] text-muted-foreground">
          {t("alerts.noSearches")}
        </p>
      ) : (
        searches.map((search) => (
          <div key={search.id} className="mb-2.5 flex items-center justify-between rounded-2xl bg-card px-4 py-3.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-bold">{search.label}</p>
              <label className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                <input
                  type="checkbox"
                  checked={search.active}
                  onChange={(e) => toggleSearchActive(search.id, e.target.checked)}
                  className="size-3.5 accent-[var(--weeggo-orange)]"
                />
                {t("alerts.searchActive")}
              </label>
            </div>
            <button type="button" onClick={() => removeSearch(search.id)} aria-label={t("alerts.deleteSearch")}>
              <Trash2 className="size-4 text-muted-foreground" />
            </button>
          </div>
        ))
      )}

      {prefs && (
        <div className="mb-2.5 rounded-2xl bg-card px-4 py-3.5">
          <p className="mb-2.5 text-[11.5px] font-extrabold uppercase tracking-wide text-muted-foreground">
            {t("alerts.categoriesTitle")}
          </p>
          {CATEGORIES.map((category) => (
            <div key={category} className="mb-2 flex items-center justify-between last:mb-0">
              <span className="text-[12.5px] font-bold">{t(CATEGORY_LABEL[category])}</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={prefs.categories[category].push}
                    onChange={() => toggleCategory(category, "push")}
                    className="size-3.5 accent-[var(--weeggo-orange)]"
                  />
                  <Bell className="size-3" />
                </label>
                <label className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={prefs.categories[category].email}
                    onChange={() => toggleCategory(category, "email")}
                    className="size-3.5 accent-[var(--weeggo-orange)]"
                  />
                  <Mail className="size-3" />
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
