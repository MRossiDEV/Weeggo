"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useDiscover } from "@/lib/discover/filters-context";
import { useVisitorId } from "@/lib/notifications/visitor";
import { isPushSupported, subscribeToPush } from "@/lib/notifications/push-client";
import { saveSearchAction, subscribePushAction } from "@/app/(app)/_lib/actions/notifications";
import { fmtUSD, propertyTypeLabel } from "@/lib/discover/scoring";
import { useTranslation, type TranslationKey } from "@/lib/i18n/useTranslation";
import type { Filters, Mode } from "@/lib/discover/types";

function buildLabel(mode: Mode, filters: Filters, t: (key: TranslationKey) => string): string {
  const parts: string[] = [];
  if (filters.hoods.length) parts.push(filters.hoods.join(", "));
  if (filters.propertyTypes.length) parts.push(filters.propertyTypes.map((pt) => propertyTypeLabel(pt, t)).join("/"));
  if (filters.budgetMax) parts.push(`< ${fmtUSD(filters.budgetMax)}`);
  if (parts.length === 0) {
    parts.push(mode === "rent" ? t("common.rent") : mode === "invest" ? t("common.invest") : t("common.buy"));
  }
  return parts.join(" · ");
}

export function SaveSearchSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { mode, filters } = useDiscover();
  const visitorId = useVisitorId();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [wantsPush, setWantsPush] = useState(true);
  const [pending, startTransition] = useTransition();
  const pushSupported = isPushSupported();

  function submit() {
    if (!visitorId) return;
    startTransition(async () => {
      const label = buildLabel(mode, filters, t);
      const result = await saveSearchAction(visitorId, { mode, filters, label, email: email || undefined });
      if (!result.ok) {
        toast.error(t("saveSearch.error"));
        return;
      }

      if (wantsPush && pushSupported) {
        const subscription = await subscribeToPush();
        if (subscription?.endpoint && subscription.keys) {
          await subscribePushAction(
            visitorId,
            { endpoint: subscription.endpoint, p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
            navigator.userAgent
          );
        }
      }

      toast.success(t("saveSearch.success"));
      setEmail("");
      onOpenChange(false);
    });
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
      <DrawerContent className="max-h-[70dvh]">
        <div className="theme-weeggo flex min-h-0 flex-1 flex-col bg-card px-[22px] pt-4 pb-5 text-foreground">
          <h2 className="mb-1 text-[19px] font-extrabold">{t("saveSearch.title")}</h2>
          <p className="mb-4 text-[12.5px] text-muted-foreground">{t("saveSearch.subtitle")}</p>

          <label className="mb-1.5 text-[11.5px] font-extrabold uppercase tracking-wide text-muted-foreground">
            {t("saveSearch.emailLabel")}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("saveSearch.emailPlaceholder")}
            className="mb-4 rounded-xl border border-border bg-secondary px-3.5 py-3 text-sm font-semibold outline-none focus:border-primary"
          />

          {pushSupported && (
            <label className="mb-5 flex items-center gap-2 text-[12.5px] font-semibold text-muted-foreground">
              <input
                type="checkbox"
                checked={wantsPush}
                onChange={(e) => setWantsPush(e.target.checked)}
                className="size-4 accent-[var(--weeggo-orange)]"
              />
              {t("saveSearch.pushLabel")}
            </label>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={pending || !visitorId}
            className="rounded-[var(--weeggo-radius-md)] py-[13px] text-[13.5px] font-bold text-white disabled:opacity-60"
            style={{ background: "var(--weeggo-orange)" }}
          >
            {pending ? t("saveSearch.saving") : t("saveSearch.save")}
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
