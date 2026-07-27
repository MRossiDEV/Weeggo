"use client";

import { useRef, useState } from "react";

import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useDiscover } from "@/lib/discover/filters-context";
import { matchScore, priceFor, propertyTypeLabel, yieldPct } from "@/lib/discover/scoring";
import type { Listing } from "@/lib/discover/types";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { ViewingForm } from "./ViewingForm";

export function PropertyDrawer({ listings }: { listings: Listing[] }) {
  const { mode, filters, activeListingId, closeListing } = useDiscover();
  const listing = listings.find((l) => l.id === activeListingId) ?? null;

  return (
    <Drawer open={!!listing} onOpenChange={(open) => !open && closeListing()} showSwipeHandle>
      {/* Fixed to 70% of the viewport (not just a cap) so the deck behind it
          always stays partially visible, and the content column below
          scrolls independently of the photo gallery. */}
      <DrawerContent className="h-[80dvh] max-h-[80dvh]">
        <div className="theme-weeggo flex min-h-0 flex-1 flex-col bg-card text-foreground">
          {listing && <PropertyDetail listing={listing} mode={mode} filters={filters} onClose={closeListing} />}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function PhotoGallery({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el || el.clientWidth === 0) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  return (
    <div className="relative shrink-0">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex h-[220px] w-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary Supabase-stored URL
          <img key={i} src={src} alt={alt} className="h-full w-full shrink-0 snap-center object-cover" />
        ))}
      </div>

      {images.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-2.5 flex justify-center gap-1.5">
          {images.map((_, i) => (
            <span
              key={i}
              className="size-1.5 rounded-full transition-colors"
              style={{ background: i === index ? "white" : "rgba(255,255,255,0.5)" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PropertyDetail({
  listing,
  mode,
  filters,
  onClose,
}: {
  listing: Listing;
  mode: ReturnType<typeof useDiscover>["mode"];
  filters: ReturnType<typeof useDiscover>["filters"];
  onClose: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const { t } = useTranslation();
  const score = matchScore(listing, filters, mode);
  const y = yieldPct(listing);
  const locationLabel = listing.locality ? `${listing.city}, ${listing.locality}` : listing.city;

  return (
    <>
      <PhotoGallery images={listing.images.length > 0 ? listing.images : [listing.image]} alt={listing.title} />

      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-[26px]">
        <div className="mt-4 mb-0.5 flex items-start justify-between gap-2">
          <h2 className="text-[25px] font-extrabold">{priceFor(listing, mode, t)}</h2>
          {listing.badges.length > 0 && (
            <div className="flex flex-wrap justify-end gap-1.5 pt-1.5">
              {listing.badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
                  style={{ background: "var(--weeggo-orange)" }}
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="mb-3.5 text-[13px] font-semibold text-muted-foreground">
          {listing.title} · {locationLabel}
        </div>

        <div className="mb-4 flex flex-wrap gap-2.5">
          <Stat label={t("discover.bedsLabel", { n: listing.bedrooms })} />
          <Stat label={t("discover.bathsLabel", { n: listing.bathrooms })} />
          <Stat label={`${listing.areaM2} m²`} />
          <Stat label={propertyTypeLabel(listing.propertyType, t)} />
          {mode === "invest" ? (
            <Stat label={y !== null ? t("discover.grossYieldLabel", { pct: y }) : t("discover.yieldNa")} />
          ) : (
            <Stat label={t("discover.matchLabel", { pct: score })} />
          )}
        </div>

        <p className="mb-4 text-[13.5px] leading-relaxed text-muted-foreground">{listing.description}</p>

        {listing.tags.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2">
            {listing.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full px-3 py-1.5 text-[11.5px] font-bold"
                style={{ background: "var(--weeggo-green-tint)", color: "#065F46" }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {showForm ? (
          <ViewingForm listing={listing} onDone={onClose} />
        ) : (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="w-full rounded-[var(--weeggo-radius-md)] py-[13px] text-[13.5px] font-bold text-white"
            style={{ background: "var(--weeggo-blue)" }}
          >
            {t("discover.requestViewing")}
          </button>
        )}
      </div>
    </>
  );
}

function Stat({ label }: { label: string }) {
  return (
    <div className="font-weeggo-mono rounded-xl bg-secondary px-3.5 py-2.5 text-xs font-semibold">{label}</div>
  );
}
