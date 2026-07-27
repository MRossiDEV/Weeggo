"use client";

import { useMemo, useState } from "react";
import { Heart, Star, X } from "lucide-react";
import Link from "next/link";

import { useDiscover } from "@/lib/discover/filters-context";
import { matchScore, yieldPct } from "@/lib/discover/scoring";
import type { Listing } from "@/lib/discover/types";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { SwipeCard, type SwipeAction } from "./SwipeCard";
import { MatchCelebration } from "./MatchCelebration";

/** Same threshold DiscoverDeck uses for the "it's a match" interrupt. */
const MATCH_THRESHOLD = 90;

/**
 * The "mini swipe session" a saved-search alert opens (PRD 6.1) — same
 * card/gesture as the main Discover deck, but scoped to just the listing(s)
 * that triggered the alert instead of the full catalog.
 */
export function MatchesView({ listings }: { listings: Listing[] }) {
  const { t } = useTranslation();
  const { mode, filters, liked, passed, like, superlike, pass, openListing } = useDiscover();
  const [pendingAction, setPendingAction] = useState<SwipeAction | null>(null);
  const [matchListing, setMatchListing] = useState<Listing | null>(null);

  const deck = useMemo(
    () => listings.filter((listing) => !liked.includes(listing.id) && !passed.includes(listing.id)),
    [listings, liked, passed]
  );
  const visible = deck.slice(0, 3);

  function commit(listing: Listing, action: SwipeAction) {
    if (action === "pass") {
      pass(listing.id);
      return;
    }
    if (action === "like") like(listing.id);
    else superlike(listing.id);

    if (matchScore(listing, filters, mode) >= MATCH_THRESHOLD) {
      setMatchListing(listing);
    }
  }

  function triggerTopAction(action: SwipeAction) {
    if (!visible[0]) return;
    setPendingAction(action);
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col" style={{ background: "var(--weeggo-paper-dim)" }}>
      <div className="shrink-0 px-5 pt-4 pb-1 text-center">
        <div className="text-[19px] font-extrabold">{t("matches.title")}</div>
        <div className="text-[12.5px] text-muted-foreground">{t("matches.subtitle")}</div>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
          <div className="text-[38px]">🎉</div>
          <h3 className="mt-3.5 mb-1.5 text-[21px] font-extrabold">{t("matches.doneTitle")}</h3>
          <p className="mb-4.5 text-[13.5px] leading-relaxed text-muted-foreground">{t("matches.doneBody")}</p>
          <Link
            href="/"
            className="rounded-[var(--weeggo-radius-md)] px-[22px] py-[13px] text-[13.5px] font-bold text-white"
            style={{ background: "var(--weeggo-blue)" }}
          >
            {t("matches.backToDiscover")}
          </Link>
        </div>
      ) : (
        <>
          <div className="relative mt-3 min-h-0 flex-1 p-4">
            <div className="relative size-full">
              {visible
                .slice()
                .reverse()
                .map((listing, i) => {
                  const depth = visible.length - 1 - i;
                  return (
                    <SwipeCard
                      key={listing.id}
                      listing={listing}
                      mode={mode}
                      t={t}
                      score={matchScore(listing, filters, mode)}
                      yieldPct={yieldPct(listing)}
                      depth={depth}
                      onCommit={(action) => commit(listing, action)}
                      onOpenDetail={() => openListing(listing.id)}
                      onQuickLike={() => commit(listing, "like")}
                      externalTrigger={depth === 0 ? pendingAction : null}
                      onExternalTriggerHandled={() => setPendingAction(null)}
                    />
                  );
                })}
            </div>
          </div>

          <div className="flex items-center justify-center gap-[18px] pt-1.5 pb-[18px]">
            <button
              type="button"
              aria-label={t("discover.passAria")}
              onClick={() => triggerTopAction("pass")}
              className="flex size-14 items-center justify-center rounded-full border border-border bg-card text-primary shadow-[0_10px_20px_-8px_rgba(24,24,27,0.18)]"
            >
              <X className="size-[22px]" />
            </button>
            <button
              type="button"
              aria-label={t("discover.topPickAria")}
              onClick={() => triggerTopAction("super")}
              className="flex size-[46px] items-center justify-center rounded-full border border-border bg-card shadow-[0_10px_20px_-8px_rgba(24,24,27,0.18)]"
              style={{ color: "var(--weeggo-green)" }}
            >
              <Star className="size-[18px]" />
            </button>
            <button
              type="button"
              aria-label={t("discover.shortlistAria")}
              onClick={() => triggerTopAction("like")}
              className="flex size-14 items-center justify-center rounded-full text-white shadow-[0_10px_20px_-8px_rgba(24,24,27,0.18)]"
              style={{ background: "var(--weeggo-orange)" }}
            >
              <Heart className="size-[22px]" />
            </button>
          </div>
        </>
      )}

      <MatchCelebration
        listing={matchListing}
        mode={mode}
        score={matchListing ? matchScore(matchListing, filters, mode) : 0}
        onDismiss={() => setMatchListing(null)}
      />
    </div>
  );
}
