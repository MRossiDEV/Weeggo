"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useDiscover } from "@/lib/discover/filters-context";
import type { Listing } from "@/lib/discover/types";
import { AppSplash } from "./AppSplash";
import { AppHeader } from "./AppHeader";
import { TabBar } from "./TabBar";
import { PropertyDrawer } from "./PropertyDrawer";
import { CompareDrawer } from "./CompareDrawer";
import { FilterPanel } from "./FilterPanel";

// DiscoverProvider now wraps the whole app from the root layout (not just
// this group) — /landing, /wizard, and /selection all read/write the same
// discover state (mode, filters, onboarded) that this shell does.
export function AppShellClient({ listings, children }: { listings: Listing[]; children: ReactNode }) {
  const router = useRouter();
  const { hydrated, onboarded } = useDiscover();
  const [splashDone, setSplashDone] = useState(false);

  // Splash plays on every full page load/reload of this group (this
  // component remounts then); it also waits for localStorage hydration so a
  // returning visitor doesn't flash a redirect before we know they're
  // onboarded.
  const ready = splashDone && hydrated;

  useEffect(() => {
    if (ready && !onboarded) {
      router.replace("/landing");
    }
  }, [ready, onboarded, router]);

  if (!ready || !onboarded) {
    return <AppSplash onComplete={() => setSplashDone(true)} />;
  }

  return (
    <div className="theme-weeggo weeggo-bg relative flex h-dvh min-h-0 flex-col overflow-hidden">
      <AppHeader />
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      <TabBar />
      <PropertyDrawer listings={listings} />
      <CompareDrawer listings={listings} />
      <FilterPanel listings={listings} />
    </div>
  );
}
