"use client"

import { motion } from "framer-motion"

import { priceFor, propertyTypeLabel } from "@/lib/discover/scoring"
import type { Listing, Mode } from "@/lib/discover/types"
import type { TranslationKey } from "@/lib/i18n/useTranslation"

type T = (key: TranslationKey, vars?: Record<string, string | number>) => string

/**
 * A single small "here's your top match" card shown right after the wizard's
 * last question — a preview of curatedDeck[0] (see lib/discover/deck.ts),
 * so it's exactly the same listing "Ver mi selección" will land on first.
 */
export default function MatchPreviewCard({ listing, mode, t }: { listing: Listing; mode: Mode; t: T }) {
  const locationLabel = listing.locality ? `${listing.city}, ${listing.locality}` : listing.city

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="pl-[46px]"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-2.5 shadow-[0_10px_24px_-14px_rgba(24,24,27,0.25)]">
        {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary Supabase-stored URL */}
        <img src={listing.image} alt={listing.title} className="size-[64px] shrink-0 rounded-xl object-cover" />

        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-bold">{listing.title}</div>
          <div className="truncate text-[11px] text-muted-foreground">
            {locationLabel} · {propertyTypeLabel(listing.propertyType, t)}
          </div>
          <div className="font-weeggo-mono mt-1 flex items-center gap-2.5 text-[10.5px] text-muted-foreground">
            <span>{t("discover.bedsLabel", { n: listing.bedrooms })}</span>
            <span>{t("discover.bathsLabel", { n: listing.bathrooms })}</span>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div className="text-[14px] font-extrabold">{priceFor(listing, mode, t)}</div>
          {listing.badges[0] && (
            <span
              className="mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white"
              style={{ background: "var(--weeggo-orange)" }}
            >
              {listing.badges[0]}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
