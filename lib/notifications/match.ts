import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send-email";
import { siteConfig } from "@/lib/seo";
import { passesFilters } from "@/lib/discover/scoring";
import type { Filters, Listing, Mode } from "@/lib/discover/types";
import type { Property } from "@/app/admin/_lib/types";
import { sendPush } from "./push";
import { DEFAULT_CATEGORY_PREFS, type CategoryPrefs } from "./types";

/** Max "new match" pushes/emails sent to a single visitor per rolling 24h — PRD section 7 frequency capping. */
const NEW_MATCH_DAILY_CAP = 3;

const QUIET_HOURS_TZ = "America/Montevideo";
const QUIET_HOURS_START = 8;
const QUIET_HOURS_END = 21;

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.NODE_ENV !== "production") return "http://localhost:3000";
  return siteConfig.url;
}

/** PRD section 7 "quiet hours" — push only during reasonable local hours for Weeggo's Uruguay market. */
function isWithinQuietHours(): boolean {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: QUIET_HOURS_TZ }).format(new Date())
  );
  return hour >= QUIET_HOURS_START && hour < QUIET_HOURS_END;
}

export function propertyToListing(property: Property): Listing {
  return {
    id: property.id,
    title: property.title,
    city: property.city,
    locality: property.locality,
    department: property.department,
    description: property.description,
    price: property.price,
    rentPrice: property.rentPrice,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    areaM2: property.areaM2,
    propertyType: property.propertyType,
    tags: property.tags,
    image: property.image,
    images: property.images,
    badges: property.badges,
    featured: property.featured,
  };
}

type SavedSearchRow = {
  id: string;
  visitor_id: string;
  mode: string;
  filters: Filters;
};

type VisitorRow = {
  id: string;
  email: string | null;
  push_enabled: boolean;
  email_enabled: boolean;
  categories: CategoryPrefs;
};

type PushSubscriptionRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

async function logNotification(params: {
  visitorId: string;
  channel: "push" | "email";
  title: string;
  body: string;
  savedSearchId: string;
  listingIds: string[];
  status: "sent" | "failed" | "skipped_quiet_hours" | "skipped_cap";
}): Promise<void> {
  const { error } = await supabaseAdmin.from("weeggo_notifications").insert({
    visitor_id: params.visitorId,
    category: "new_match",
    channel: params.channel,
    title: params.title,
    body: params.body,
    saved_search_id: params.savedSearchId,
    listing_ids: params.listingIds,
    status: params.status,
  });
  if (error) console.error("[notifications] failed to log notification", error);
}

/**
 * Matches newly-published listings against every active saved search and
 * sends push/email alerts (PRD 6.1). Called from the admin publish actions
 * right after a property's status flips to "published" — there's no
 * background worker in this app, so this runs inline in the request that
 * published the listing rather than on a queue.
 *
 * Takes an array (not a single listing) so a future bulk-publish path can
 * still produce one batched notification per visitor instead of one per
 * listing, per the PRD's frequency-capping/batching requirement.
 */
export async function notifyNewListings(listings: Listing[]): Promise<void> {
  if (listings.length === 0) return;

  const { data: searches, error: searchesError } = await supabaseAdmin
    .from("weeggo_saved_searches")
    .select("id, visitor_id, mode, filters")
    .eq("active", true);
  if (searchesError) throw new Error(searchesError.message);
  if (!searches || searches.length === 0) return;

  const matchesByVisitor = new Map<string, { listingIds: Set<string>; savedSearchId: string }>();
  for (const search of searches as SavedSearchRow[]) {
    for (const listing of listings) {
      if (passesFilters(listing, search.filters, search.mode as Mode, [])) {
        const bucket = matchesByVisitor.get(search.visitor_id) ?? {
          listingIds: new Set<string>(),
          savedSearchId: search.id,
        };
        bucket.listingIds.add(listing.id);
        matchesByVisitor.set(search.visitor_id, bucket);
      }
    }
  }
  if (matchesByVisitor.size === 0) return;

  const { data: visitors, error: visitorsError } = await supabaseAdmin
    .from("weeggo_visitors")
    .select("*")
    .in("id", [...matchesByVisitor.keys()]);
  if (visitorsError) throw new Error(visitorsError.message);
  const visitorById = new Map((visitors as VisitorRow[]).map((v) => [v.id, v]));

  const quietOk = isWithinQuietHours();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const baseUrl = getBaseUrl();

  for (const [visitorId, { listingIds, savedSearchId }] of matchesByVisitor) {
    const visitor = visitorById.get(visitorId);
    if (!visitor) continue;

    const catPrefs = visitor.categories?.new_match ?? DEFAULT_CATEGORY_PREFS.new_match;
    const n = listingIds.size;
    const title = n === 1 ? "Nuevo match para tu búsqueda guardada" : `${n} nuevos matches para tu búsqueda guardada`;
    const body =
      n === 1
        ? "Una propiedad nueva coincide con tu búsqueda guardada en WEEGGO."
        : `${n} propiedades nuevas coinciden con tu búsqueda guardada en WEEGGO.`;
    const listingIdList = [...listingIds];

    const { count, error: countError } = await supabaseAdmin
      .from("weeggo_notifications")
      .select("id", { count: "exact", head: true })
      .eq("visitor_id", visitorId)
      .eq("category", "new_match")
      .eq("status", "sent")
      .gte("created_at", since);
    if (countError) console.error("[notifications] frequency cap check failed", countError);

    if ((count ?? 0) >= NEW_MATCH_DAILY_CAP) {
      await logNotification({
        visitorId,
        channel: "push",
        title,
        body,
        savedSearchId,
        listingIds: listingIdList,
        status: "skipped_cap",
      });
      continue;
    }

    if (visitor.push_enabled && catPrefs.push) {
      const { data: subs } = await supabaseAdmin
        .from("weeggo_push_subscriptions")
        .select("id, endpoint, p256dh, auth")
        .eq("visitor_id", visitorId);

      if (subs && subs.length > 0) {
        if (!quietOk) {
          await logNotification({
            visitorId,
            channel: "push",
            title,
            body,
            savedSearchId,
            listingIds: listingIdList,
            status: "skipped_quiet_hours",
          });
        } else {
          let anySent = false;
          for (const sub of subs as PushSubscriptionRow[]) {
            const result = await sendPush(sub, {
              title,
              body,
              url: `/matches?ids=${listingIdList.join(",")}`,
            });
            if (result.ok) anySent = true;
            if (!result.ok && result.gone) {
              await supabaseAdmin.from("weeggo_push_subscriptions").delete().eq("id", sub.id);
            }
          }
          await logNotification({
            visitorId,
            channel: "push",
            title,
            body,
            savedSearchId,
            listingIds: listingIdList,
            status: anySent ? "sent" : "failed",
          });
        }
      }
    }

    if (visitor.email && visitor.email_enabled && catPrefs.email) {
      const url = `${baseUrl}/matches?ids=${listingIdList.join(",")}`;
      try {
        await sendEmail({
          to: visitor.email,
          subject: title,
          text: `${body}\n\n${url}`,
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
              <h2 style="color: #18181B;">${title}</h2>
              <p>${body}</p>
              <p style="margin: 24px 0;">
                <a href="${url}" style="background: #4F46E5; color: #fff; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: bold;">
                  Ver en WEEGGO
                </a>
              </p>
            </div>
          `,
        });
        await logNotification({
          visitorId,
          channel: "email",
          title,
          body,
          savedSearchId,
          listingIds: listingIdList,
          status: "sent",
        });
      } catch (err) {
        console.error("[notifications] email send failed", err);
        await logNotification({
          visitorId,
          channel: "email",
          title,
          body,
          savedSearchId,
          listingIds: listingIdList,
          status: "failed",
        });
      }
    }

    await supabaseAdmin
      .from("weeggo_saved_searches")
      .update({ last_matched_at: new Date().toISOString() })
      .eq("id", savedSearchId);
  }
}
