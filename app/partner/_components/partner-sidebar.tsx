"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, User } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/Logo";
import { signOutPartnerAction } from "@/app/partner/_lib/actions/auth";

const navItems = [
  { title: "Dashboard", href: "/partner", icon: LayoutDashboard },
  { title: "Mi Perfil", href: "/partner/profile", icon: User },
];

export function PartnerSidebar({ partnerName }: { partnerName: string }) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-between px-2 py-1.5">
          <Link href="/partner" className="flex items-center">
            <Logo height={20} className="group-data-[collapsible=icon]:hidden" />
            <Image
              src="/images/brand/weeggo-icon.svg"
              alt="WEEGGO"
              width={20}
              height={20}
              className="hidden group-data-[collapsible=icon]:block"
            />
          </Link>
          <Badge variant="outline" className="group-data-[collapsible=icon]:hidden">
            Partner
          </Badge>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{partnerName}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.href === "/partner" ? pathname === "/partner" : pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      render={<Link href={item.href} />}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
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
