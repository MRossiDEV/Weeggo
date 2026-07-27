"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Bot,
  Building2,
  Handshake,
  LayoutDashboard,
  LogOut,
  Mail,
  Settings,
  UserCog,
  Users,
} from "lucide-react";

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
import { signOutAdminAction } from "@/app/admin/_lib/actions/auth";
import { Logo } from "@/components/Logo";

const navItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Propiedades", href: "/admin/properties", icon: Building2 },
  { title: "Leads", href: "/admin/leads", icon: Users },
  { title: "Agentes", href: "/admin/agents", icon: UserCog },
  { title: "Partners", href: "/admin/partners", icon: Handshake },
  { title: "Asistente", href: "/admin/wizard", icon: Bot },
  { title: "Emails", href: "/admin/emails", icon: Mail },
  { title: "Configuración", href: "/admin/settings", icon: Settings },
];

export function AppSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-between px-2 py-1.5">
          <Link href="/admin" className="flex items-center">
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
            Admin
          </Badge>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{adminName}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);

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
        <form action={signOutAdminAction}>
          <SidebarMenuButton type="submit">
            <LogOut />
            <span>Sign out</span>
          </SidebarMenuButton>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}
