"use client";

import { useMemo, useState } from "react";
import { Heart, SlidersHorizontal, Sparkles, Star, X } from "lucide-react";

import { useDiscover } from "@/lib/discover/filters-context";
import { buildDeck } from "@/lib/discover/deck";
import { matchScore, yieldPct } from "@/lib/discover/scoring";
import type { Listing } from "@/lib/discover/types";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { SwipeCard, type SwipeAction } from "./SwipeCard";
import { MatchCelebration } from "./MatchCelebration";

/** Rare on purpose — only the top slice of the 45-99 score range triggers the "it's a match" interrupt. */
const MATCH_THRESHOLD = 90;

export function DiscoverDeck({ listings }: { listings: Listing[] }) {
  const { t } = useTranslation();
  const { mode, filters, liked, passed, like, superlike, pass, openListing, openFilterPanel, resetSeen } =
    useDiscover();
  const [pendingAction, setPendingAction] = useState<SwipeAction | null>(null);
  const [matchListing, setMatchListing] = useState<Listing | null>(null);

  const { deck, relaxedLevel } = useMemo(() => {
    const excludeIds = [...liked, ...passed];
    return buildDeck(listings, filters, mode, excludeIds);
  }, [listings, filters, mode, liked, passed]);

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

  const filterPill = (
    <button
      type="button"
      onClick={openFilterPanel}
      className="absolute right-4 top-3.5 z-20 flex items-center gap-1.5 rounded-full bg-[rgba(24,24,27,0.82)] px-3.5 py-2.5 text-xs font-bold text-white backdrop-blur-sm"
    >
      <SlidersHorizontal className="size-3.5" />
      {t("discover.filters")}
    </button>
  );

  const relaxedBanner = relaxedLevel > 0 && visible.length > 0 && (
    <div className="absolute inset-x-4 top-3.5 z-20 flex max-w-[calc(100%-90px)] items-center gap-1.5 rounded-full bg-[var(--weeggo-blue-tint)] px-3.5 py-2.5 text-xs font-bold text-primary">
      <Sparkles className="size-3.5 shrink-0" />
      <span className="truncate">{t("discover.widenedSearch")}</span>
    </div>
  );

  if (visible.length === 0) {
    return (
      <div className="relative flex min-h-0 flex-1 flex-col" style={{ background: "var(--weeggo-paper-dim)" }}>
        {filterPill}
        <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
          <div className="text-[38px]">🏁</div>
          <h3 className="mt-3.5 mb-1.5 text-[21px] font-extrabold">{t("discover.emptyTitle")}</h3>
          <p className="mb-4.5 text-[13.5px] leading-relaxed text-muted-foreground">
            {t("discover.emptyBody1")}
            <br />
            {t("discover.emptyBody2")}
          </p>
          <button
            type="button"
            onClick={resetSeen}
            className="rounded-[var(--weeggo-radius-md)] px-[22px] py-[13px] text-[13.5px] font-bold text-white"
            style={{ background: "var(--weeggo-blue)" }}
          >
            {t("discover.resetSeen")}
          </button>
        </div>

        <MatchCelebration
          listing={matchListing}
          mode={mode}
          score={matchListing ? matchScore(matchListing, filters, mode) : 0}
          onDismiss={() => setMatchListing(null)}
        />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col" style={{ background: "var(--weeggo-paper-dim)" }}>
      {filterPill}
      {relaxedBanner}
      <div className="relative mt-12 min-h-0 flex-1 p-4">
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

      <MatchCelebration
        listing={matchListing}
        mode={mode}
        score={matchListing ? matchScore(matchListing, filters, mode) : 0}
        onDismiss={() => setMatchListing(null)}
      />
    </div>
  );
}
