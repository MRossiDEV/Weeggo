"use client";

import { useState } from "react";
import { Bell, Minus, Plus } from "lucide-react";

import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useDiscover } from "@/lib/discover/filters-context";
import { AMENITIES, BUDGET_MAX_BUY, BUDGET_MAX_RENT, NEIGHBORHOODS, PROPERTY_TYPES } from "@/lib/discover/constants";
import { fmtUSD, passesFilters, propertyTypeLabel } from "@/lib/discover/scoring";
import { createEmptyFilters } from "@/lib/discover/types";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { SaveSearchSheet } from "./SaveSearchSheet";
import type { Listing } from "@/lib/discover/types";

const chipClass = (active: boolean) =>
  `rounded-full border px-4 py-2.5 text-[13.5px] font-bold transition-colors ${
    active
      ? "border-[var(--weeggo-orange)] bg-[var(--weeggo-orange-tint)] text-foreground"
      : "border-border bg-secondary text-foreground"
  }`;

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="mb-2.5 text-[11.5px] font-extrabold uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      {children}
    </div>
  );
}

function Stepper({ value, onChange, min = 0, max = 5 }: { value: number; onChange: (n: number) => void; min?: number; max?: number }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="flex size-9 items-center justify-center rounded-full border border-border bg-secondary disabled:opacity-40"
      >
        <Minus className="size-4" />
      </button>
      <span className="font-weeggo-mono w-6 text-center text-sm font-bold">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="flex size-9 items-center justify-center rounded-full border border-border bg-secondary disabled:opacity-40"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

/**
 * Every control here writes straight to the shared `filters` context (no
 * local draft + separate "apply" step) — a two-step draft/commit version
 * shipped first and silently did nothing when someone toggled a chip (or hit
 * "clear") without also tapping a final apply button, since only the apply
 * button read the draft back into context.
 */
export function FilterPanel({ listings }: { listings: Listing[] }) {
  const { mode, filters, setFilters, filterPanelOpen, closeFilterPanel } = useDiscover();
  const { t } = useTranslation();
  const [saveSearchOpen, setSaveSearchOpen] = useState(false);

  const budgetMax = mode === "rent" ? BUDGET_MAX_RENT : BUDGET_MAX_BUY;
  const resultCount = listings.filter((listing) => passesFilters(listing, filters, mode, [])).length;

  return (
    <>
    <Drawer open={filterPanelOpen} onOpenChange={(open) => !open && closeFilterPanel()} showSwipeHandle>
      <DrawerContent className="h-[86dvh] max-h-[86dvh]">
        <div className="theme-weeggo flex min-h-0 flex-1 flex-col bg-card text-foreground">
          <div className="shrink-0 px-[22px] pt-4 pb-3">
            <h2 className="mb-0.5 text-[22px] font-extrabold">{t("filterPanel.title")}</h2>
            <p className="text-[12.5px] text-muted-foreground">{t("filterPanel.subtitle")}</p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-4">
            <Section title={t("filterPanel.neighborhoods")}>
              <div className="flex flex-wrap gap-2">
                {NEIGHBORHOODS.map((hood) => (
                  <button
                    key={hood}
                    type="button"
                    className={chipClass(filters.hoods.includes(hood))}
                    onClick={() => setFilters({ ...filters, hoods: toggleValue(filters.hoods, hood) })}
                  >
                    {hood}
                  </button>
                ))}
              </div>
            </Section>

            <Section title={t("filterPanel.propertyType")}>
              <div className="flex flex-wrap gap-2">
                {PROPERTY_TYPES.map((pt) => (
                  <button
                    key={pt.value}
                    type="button"
                    className={chipClass(filters.propertyTypes.includes(pt.value))}
                    onClick={() =>
                      setFilters({ ...filters, propertyTypes: toggleValue(filters.propertyTypes, pt.value) })
                    }
                  >
                    {propertyTypeLabel(pt.value, t)}
                  </button>
                ))}
              </div>
            </Section>

            <Section title={mode === "rent" ? t("filterPanel.budgetRent") : t("filterPanel.budgetBuy")}>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={budgetMax}
                  step={mode === "rent" ? 50 : 5000}
                  value={filters.budgetMax ?? budgetMax}
                  onChange={(e) => setFilters({ ...filters, budgetMax: Number(e.target.value) })}
                  className="h-1.5 flex-1 accent-[var(--weeggo-orange)]"
                />
                <span className="font-weeggo-mono w-24 shrink-0 text-right text-xs font-semibold text-muted-foreground">
                  {filters.budgetMax ? fmtUSD(filters.budgetMax) : t("filterPanel.noLimit")}
                </span>
              </div>
              {filters.budgetMax !== null && (
                <button
                  type="button"
                  onClick={() => setFilters({ ...filters, budgetMax: null })}
                  className="mt-2 text-xs font-bold text-muted-foreground underline"
                >
                  {t("filterPanel.noLimit")}
                </button>
              )}
            </Section>

            <Section title={t("filterPanel.minBeds")}>
              <Stepper value={filters.minBeds} onChange={(n) => setFilters({ ...filters, minBeds: n })} />
            </Section>

            <Section title={t("filterPanel.minBaths")}>
              <Stepper value={filters.minBaths} onChange={(n) => setFilters({ ...filters, minBaths: n })} />
            </Section>

            <Section title={t("filterPanel.amenities")}>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    className={chipClass(filters.amenities.includes(amenity))}
                    onClick={() => setFilters({ ...filters, amenities: toggleValue(filters.amenities, amenity) })}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
              {filters.amenities.length > 0 && (
                <label className="mt-2.5 flex items-center gap-2 text-[12.5px] font-semibold text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={filters.amenitiesRequired}
                    onChange={(e) => setFilters({ ...filters, amenitiesRequired: e.target.checked })}
                    className="size-4 accent-[var(--weeggo-orange)]"
                  />
                  {t("filterPanel.amenitiesRequiredLabel")}
                </label>
              )}
            </Section>

            <Section title={t("filterPanel.parking")}>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={chipClass(!filters.parkingRequired && !filters.parkingPreferred)}
                  onClick={() => setFilters({ ...filters, parkingRequired: false, parkingPreferred: false })}
                >
                  {t("filterPanel.parkingAny")}
                </button>
                <button
                  type="button"
                  className={chipClass(!filters.parkingRequired && filters.parkingPreferred)}
                  onClick={() => setFilters({ ...filters, parkingRequired: false, parkingPreferred: true })}
                >
                  {t("filterPanel.parkingPreferred")}
                </button>
                <button
                  type="button"
                  className={chipClass(filters.parkingRequired)}
                  onClick={() => setFilters({ ...filters, parkingRequired: true, parkingPreferred: false })}
                >
                  {t("filterPanel.parkingRequired")}
                </button>
              </div>
            </Section>

            {mode === "invest" && (
              <Section title={t("filterPanel.targetYield")}>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFilters({ ...filters, targetYield: Math.max(0, filters.targetYield - 0.5) })}
                    disabled={filters.targetYield <= 0}
                    className="flex size-9 items-center justify-center rounded-full border border-border bg-secondary disabled:opacity-40"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="font-weeggo-mono w-16 text-center text-sm font-bold">
                    {filters.targetYield > 0 ? `${filters.targetYield}%` : t("filterPanel.targetYieldAny")}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFilters({ ...filters, targetYield: Math.min(15, filters.targetYield + 0.5) })}
                    disabled={filters.targetYield >= 15}
                    className="flex size-9 items-center justify-center rounded-full border border-border bg-secondary disabled:opacity-40"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </Section>
            )}
          </div>

          <div className="shrink-0 border-t border-border px-[22px] pt-3">
            <button
              type="button"
              onClick={() => setSaveSearchOpen(true)}
              className="mb-3 flex w-full items-center justify-center gap-1.5 text-[12.5px] font-bold text-primary"
            >
              <Bell className="size-3.5" />
              {t("filterPanel.saveSearch")}
            </button>
            <div className="flex items-center gap-2.5 pb-3.5">
              <button
                type="button"
                onClick={() => setFilters(createEmptyFilters())}
                className="rounded-[var(--weeggo-radius-md)] bg-secondary px-4 py-[13px] text-[13.5px] font-bold text-foreground"
              >
                {t("filterPanel.clear")}
              </button>
              <button
                type="button"
                onClick={closeFilterPanel}
                className="flex-1 rounded-[var(--weeggo-radius-md)] py-[13px] text-[13.5px] font-bold text-white"
                style={{ background: "var(--weeggo-orange)" }}
              >
                {t("filterPanel.applyLabel", { n: resultCount })}
              </button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
    <SaveSearchSheet open={saveSearchOpen} onOpenChange={setSaveSearchOpen} />
    </>
  );
}
