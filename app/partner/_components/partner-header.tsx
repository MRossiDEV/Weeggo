"use client";

import { usePathname } from "next/navigation";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

const titles: Record<string, string> = {
  "/partner": "Dashboard",
  "/partner/profile": "Mi Perfil",
};

export function PartnerHeader() {
  const pathname = usePathname();

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-5" />
      <span className="text-sm font-medium text-foreground">
        {titles[pathname] ?? "Portal de Partners"}
      </span>
    </header>
  );
}
