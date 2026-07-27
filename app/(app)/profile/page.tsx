"use client";

import { useRouter } from "next/navigation";

import { useDiscover } from "@/lib/discover/filters-context";
import { fmtUSD, propertyTypeLabel } from "@/lib/discover/scoring";
import { LIFESTYLES } from "@/lib/discover/constants";
import { useTranslation, type TranslationKey } from "@/lib/i18n/useTranslation";
import { AlertsSection } from "@/components/discover/AlertsSection";

export default function ProfilePage() {
  const router = useRouter();
  const { mode, filters, liked, passed, reset, visitorName, openFilterPanel } = useDiscover();
  const { t } = useTranslation();
  const initials = visitorName ? visitorName.slice(0, 2).toUpperCase() : "GE";

  const MODE_LABEL: Record<string, TranslationKey> = {
    buy: "profile.modeBuying",
    rent: "profile.modeRenting",
    invest: "profile.modeInvesting",
  };

  const prioritiesLabel = filters.lifestyles.length
    ? filters.lifestyles.map((v) => LIFESTYLES.find((l) => l.value === v)?.label ?? v).join(", ")
    : t("profile.noPreference");
  const hoodsLabel = filters.hoods.length ? filters.hoods.join(", ") : t("profile.anywhere");
  const budgetLabel = filters.budgetMax
    ? mode === "rent"
      ? `$${filters.budgetMax}${t("discover.perMonth")}`
      : fmtUSD(filters.budgetMax)
    : t("profile.noLimit");
  const typeLabel =
    (filters.propertyTypes.length
      ? filters.propertyTypes.map((type) => propertyTypeLabel(type, t)).join("/")
      : t("profile.anyType")) +
    " · " +
    (filters.minBeds ? t("profile.bedsSuffix", { n: filters.minBeds }) : t("profile.anyBeds")) +
    " · " +
    (filters.minBaths ? t("profile.bathsSuffix", { n: filters.minBaths }) : t("profile.anyBath"));
  const amenitiesLabel = filters.amenities.length
    ? filters.amenities.join(", ") + (filters.amenitiesRequired ? ` ${t("profile.required")}` : "")
    : t("profile.none");

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-[26px] pb-[18px]" style={{ background: "var(--weeggo-paper-dim)" }}>
      <div
        className="flex size-16 items-center justify-center rounded-full text-[22px] font-extrabold text-white"
        style={{ background: "var(--weeggo-blue)" }}
      >
        {initials}
      </div>
      <div className="mt-3 mb-0.5 text-[19px] font-extrabold">{visitorName || t("profile.guestExplorer")}</div>
      <div className="mb-5 text-[12.5px] text-muted-foreground">{t(MODE_LABEL[mode])} · Montevideo</div>

      <SectionTitle>{t("profile.yourFilters")}</SectionTitle>
      <ProfileRow label={t("profile.priorities")} value={prioritiesLabel} />
      <ProfileRow label={t("profile.neighborhoods")} value={hoodsLabel} />
      <ProfileRow label={t("profile.budget")} value={budgetLabel} />
      <ProfileRow label={t("profile.typeAndSize")} value={typeLabel} />
      <ProfileRow label={t("profile.amenities")} value={amenitiesLabel} />
      <button
        type="button"
        onClick={openFilterPanel}
        className="mt-3.5 w-full rounded-[var(--weeggo-radius-md)] py-[13px] text-[13.5px] font-bold text-white"
        style={{ background: "var(--weeggo-blue)" }}
      >
        {t("profile.editFilters")}
      </button>

      <SectionTitle>{t("profile.activity")}</SectionTitle>
      <ProfileRow label={t("profile.shortlisted")} value={String(liked.length)} />
      <ProfileRow label={t("profile.passed")} value={String(passed.length)} />

      <AlertsSection />

      <button
        type="button"
        onClick={() => {
          reset();
          router.push("/wizard");
        }}
        className="mx-auto mt-3.5 block text-xs text-muted-foreground underline"
      >
        {t("profile.startOver")}
      </button>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-[22px] mb-2.5 text-[11.5px] font-extrabold uppercase tracking-wide text-muted-foreground">
      {children}
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-2.5 flex items-center justify-between rounded-2xl bg-card px-4 py-3.5 text-[13.5px] font-bold">
      <span>{label}</span>
      <span className="font-weeggo-mono text-xs font-semibold text-muted-foreground">{value}</span>
    </div>
  );
}
