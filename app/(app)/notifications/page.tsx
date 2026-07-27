"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BellRing } from "lucide-react";

import { useDiscover } from "@/lib/discover/filters-context";
import { useVisitorId } from "@/lib/notifications/visitor";
import { listNotificationsAction, markNotificationsReadAction } from "@/app/(app)/_lib/actions/notifications";
import { useTranslation, type TranslationKey } from "@/lib/i18n/useTranslation";

interface FeedItem {
  id: string;
  message: string;
  body?: string;
  createdAt: number;
  read: boolean;
  /** Saved-search alerts link into the mini swipe session for the listing(s) that matched. */
  href?: string;
}

export default function NotificationsPage() {
  const { notifications: localNotifications, markNotificationsRead } = useDiscover();
  const visitorId = useVisitorId();
  const { t } = useTranslation();
  const [serverItems, setServerItems] = useState<FeedItem[]>([]);

  useEffect(() => {
    markNotificationsRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mark-read once on mount only
  }, []);

  useEffect(() => {
    if (!visitorId) return;
    (async () => {
      const entries = await listNotificationsAction(visitorId);
      setServerItems(
        entries.map((entry) => ({
          id: entry.id,
          message: entry.title,
          body: entry.body,
          createdAt: entry.createdAt,
          read: entry.readAt !== null,
          href: entry.listingIds.length > 0 ? `/matches?ids=${entry.listingIds.join(",")}` : undefined,
        }))
      );
      await markNotificationsReadAction(visitorId);
    })();
  }, [visitorId]);

  const feed: FeedItem[] = [
    ...serverItems,
    ...localNotifications.map((n) => ({ id: n.id, message: n.message, createdAt: n.createdAt, read: n.read })),
  ].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-[26px] pb-[18px]" style={{ background: "var(--weeggo-paper-dim)" }}>
      <div className="mb-0.5 text-[23px] font-extrabold">{t("notifications.title")}</div>
      <div className="mb-5 text-[12.5px] text-muted-foreground">{t("notifications.subtitle")}</div>

      {feed.length === 0 ? (
        <div className="flex flex-col items-center pt-16 text-center">
          <span
            className="mb-4 flex size-14 items-center justify-center rounded-full"
            style={{ background: "var(--weeggo-blue-tint)", color: "var(--weeggo-blue)" }}
          >
            <BellRing className="size-6" />
          </span>
          <p className="max-w-[240px] text-[13.5px] leading-relaxed text-muted-foreground">
            {t("notifications.emptyBody")}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {feed.map((n) => (
            <NotificationRow key={n.id} item={n} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationRow({
  item,
  t,
}: {
  item: FeedItem;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}) {
  const content = (
    <div className="flex items-start gap-3 rounded-2xl bg-card px-4 py-3.5">
      {!item.read && <span className="mt-1.5 size-2 shrink-0 rounded-full" style={{ background: "var(--weeggo-orange)" }} />}
      <div className={item.read ? "ml-5" : ""}>
        <p className="text-[13.5px] font-bold">{item.message}</p>
        {item.body && <p className="mt-0.5 text-[12px] text-muted-foreground">{item.body}</p>}
        <p className="font-weeggo-mono mt-0.5 text-[11px] text-muted-foreground">{timeAgo(item.createdAt, t)}</p>
      </div>
    </div>
  );

  return item.href ? <Link href={item.href}>{content}</Link> : content;
}

function timeAgo(timestamp: number, t: (key: TranslationKey, vars?: Record<string, string | number>) => string): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return t("notifications.justNow");
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t("notifications.minutesAgo", { n: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("notifications.hoursAgo", { n: hours });
  const days = Math.floor(hours / 24);
  return t("notifications.daysAgo", { n: days });
}
