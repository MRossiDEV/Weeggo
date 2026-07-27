"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Heart } from "lucide-react";

import type { Listing, Mode } from "@/lib/discover/types";
import { priceFor, propertyTypeLabel } from "@/lib/discover/scoring";
import type { TranslationKey } from "@/lib/i18n/useTranslation";

const SWIPE_THRESHOLD = 110;

export type SwipeAction = "like" | "pass" | "super";

interface SwipeCardProps {
  listing: Listing;
  mode: Mode;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  score: number;
  yieldPct: number | null;
  depth: number;
  onCommit: (action: SwipeAction) => void;
  onOpenDetail: () => void;
  onQuickLike: () => void;
  /** Set by the parent's action-row buttons to fly the top card out programmatically. */
  externalTrigger?: SwipeAction | null;
  onExternalTriggerHandled?: () => void;
}

export function SwipeCard({
  listing,
  mode,
  t,
  score,
  yieldPct,
  depth,
  onCommit,
  onOpenDetail,
  onQuickLike,
  externalTrigger,
  onExternalTriggerHandled,
}: SwipeCardProps) {
  const isTop = depth === 0;
  const [photoIndex] = useState(0);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-18, 18]);
  const likeOpacity = useTransform(x, [30, 110], [0, 1]);
  const nopeOpacity = useTransform(x, [-110, -30], [1, 0]);
  const superOpacity = useTransform(y, [-120, -40], [1, 0]);

  function flyOut(action: SwipeAction) {
    if (action === "super") {
      void animate(y, -900, { duration: 0.22 }).then(() => onCommit("super"));
    } else if (action === "like") {
      void animate(x, 900, { duration: 0.22 }).then(() => onCommit("like"));
    } else {
      void animate(x, -900, { duration: 0.22 }).then(() => onCommit("pass"));
    }
  }

  function handleDragEnd(
    _event: unknown,
    info: { offset: { x: number; y: number } }
  ) {
    const { offset } = info;

    if (offset.y < -70 && Math.abs(offset.y) > Math.abs(offset.x)) {
      flyOut("super");
      return;
    }
    if (offset.x > SWIPE_THRESHOLD) {
      flyOut("like");
      return;
    }
    if (offset.x < -SWIPE_THRESHOLD) {
      flyOut("pass");
      return;
    }
    animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
    animate(y, 0, { type: "spring", stiffness: 400, damping: 30 });
  }

  useEffect(() => {
    if (!isTop || !externalTrigger) return;
    flyOut(externalTrigger);
    onExternalTriggerHandled?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- flyOut/onCommit intentionally excluded, only re-run when the trigger itself changes
  }, [externalTrigger, isTop]);

  const statsItems =
    mode === "invest"
      ? [
          yieldPct !== null ? t("discover.yieldLabel", { pct: yieldPct }) : t("discover.yieldNa"),
          t("discover.bedsLabel", { n: listing.bedrooms }),
          `${listing.areaM2} m²`,
        ]
      : [
          t("discover.bedsLabel", { n: listing.bedrooms }),
          `${listing.areaM2} m²`,
          propertyTypeLabel(listing.propertyType, t),
        ];

  return (
    <motion.div
      className="absolute inset-0 flex touch-none select-none flex-col overflow-hidden rounded-[var(--weeggo-radius-lg)] bg-card shadow-[0_20px_40px_-18px_rgba(24,24,27,0.25)]"
      style={
        isTop
          ? { x, y, rotate, zIndex: 10 - depth }
          : {
              zIndex: 10 - depth,
              transform: `translateY(${depth * 14}px) scale(${1 - depth * 0.035})`,
            }
      }
      drag={isTop}
      dragElastic={0.9}
      dragMomentum={false}
      onDragEnd={isTop ? handleDragEnd : undefined}
      onTap={() => {
        if (isTop) onOpenDetail();
      }}
    >
      <div className="relative min-h-0 flex-1 bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element -- listing photos are arbitrary Supabase-stored URLs */}
        <img src={listing.image} alt={listing.title} className="size-full object-cover" />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/70 to-transparent" />

        {isTop && (
          <>
            <motion.div
              className="pointer-events-none absolute left-5 top-8 -rotate-6 rounded-full px-4 py-1.5 text-[13px] font-bold uppercase tracking-wide text-white shadow-[0_6px_16px_-4px_rgba(0,0,0,0.35)]"
              style={{ opacity: likeOpacity, background: "var(--weeggo-orange)" }}
            >
              {t("discover.stampShortlist")}
            </motion.div>
            <motion.div
              className="pointer-events-none absolute right-5 top-8 rotate-6 rounded-full px-4 py-1.5 text-[13px] font-bold uppercase tracking-wide text-white shadow-[0_6px_16px_-4px_rgba(0,0,0,0.35)]"
              style={{ opacity: nopeOpacity, background: "var(--weeggo-blue)" }}
            >
              {t("discover.stampPass")}
            </motion.div>
            <motion.div
              className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 rounded-full px-4 py-1.5 text-[13px] font-bold uppercase tracking-wide text-white shadow-[0_6px_16px_-4px_rgba(0,0,0,0.35)]"
              style={{ opacity: superOpacity, background: "var(--weeggo-green)" }}
            >
              {t("discover.stampTopPick")}
            </motion.div>
          </>
        )}

        <div className="absolute inset-x-[18px] bottom-4 z-10 text-white">
          <div className="text-[29px] font-extrabold leading-none tracking-tight">
            {priceFor(listing, mode, t)}
          </div>
          <div className="mt-1 text-[13px] font-semibold opacity-90">
            {listing.title} · {listing.city}
          </div>
          <div className="font-weeggo-mono mt-2.5 flex gap-3.5 text-[11.5px]">
            {statsItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/30">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${score}%`,
                  background: "linear-gradient(90deg, var(--weeggo-blue), var(--weeggo-green))",
                }}
              />
            </div>
            <div className="whitespace-nowrap text-xl">
              {t("discover.matchLabel", { pct: score })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
