"use client";

import Link from "next/link";
import { CircleUserRound } from "lucide-react";

import { useDiscover } from "@/lib/discover/filters-context";
import type { Mode } from "@/lib/discover/types";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n/useTranslation";

const MODES: Mode[] = ["buy", "rent", "invest"];

export function AppHeader() {
  const { mode, setMode } = useDiscover();
  const { t } = useTranslation();

  return (
    <header className="shrink-0 border-b border-border bg-card py-2 px-4">
      <div className="mt-2 mb-2 flex items-center h-4 justify-between">
        <Link href="/" className="flex items-center">
          <Logo height={27} />
        </Link>
        <span className="text-md text-[var(--weeggo-orange)]">HOME</span>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          <Link
            href="/profile"
            aria-label={t("nav.profile")}
            className="flex size-[38px] items-center justify-center rounded-full bg-secondary text-foreground"
          >
            <CircleUserRound className="size-[18px]" />
          </Link>
        </div>
      </div>

      {/* <div className="flex gap-0.5 rounded-full bg-secondary p-1">
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex-1 rounded-full px-1 py-2.5 text-[12.5px] font-bold tracking-wide transition-colors ${
              mode === m
                ? "bg-card text-primary shadow-[0_3px_10px_-3px_rgba(79,70,229,0.35)]"
                : "text-muted-foreground"
            }`}
          >
            {t(`common.${m}`)}
          </button>
        ))}
      </div> */}
    </header>
  );
}
