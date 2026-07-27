"use client";

import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, LogOut } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/Logo";
import { signOutPartnerAction } from "@/app/partner/_lib/actions/auth";

export function PartnerSidebar({ partnerName }: { partnerName: string }) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href="/partner" className="flex items-center px-2 py-1.5">
          <Logo height={20} className="group-data-[collapsible=icon]:hidden" />
          <Image
            src="/images/brand/weeggo-icon.svg"
            alt="WEEGGO"
            width={20}
            height={20}
            className="hidden group-data-[collapsible=icon]:block"
          />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{partnerName}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive tooltip="Dashboard" render={<Link href="/partner" />}>
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <form action={signOutPartnerAction}>
          <SidebarMenuButton type="submit">
            <LogOut />
            <span>Cerrar sesión</span>
          </SidebarMenuButton>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}
