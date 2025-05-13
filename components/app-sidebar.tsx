"use client"

import * as React from "react"
import {
  CalendarPlusIcon,
  CalendarCheckIcon,
  HistoryIcon,
  LayoutDashboardIcon,
  NewspaperIcon,
  PackageIcon,
  SearchIcon,
  SettingsIcon,
  ListIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Admin 1",
    email: "admin1@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Barang",
      url: "/admin/barang",
      icon: PackageIcon,
    },
    {
      title: "Penyewaan",
      url: "/admin/penyewaan",
      icon: CalendarPlusIcon,
    },
    {
      title: "Pengembalian",
      url: "/admin/pengembalian",
      icon: CalendarCheckIcon,
    },
    {
      title: "Riwayat",
      url: "/admin/riwayat",
      icon: HistoryIcon,
    },
    {
      title: "Artikel",
      url: "/admin/artikel",
      icon: NewspaperIcon,
    },
    {
      title: "Kategori",
      url: "/admin/kategori",
      icon: ListIcon,
    },
  ],
  NavSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: SettingsIcon,
    },
    {
      title: "Search",
      url: "#",
      icon: SearchIcon,
    },
  ],

}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <img src="/logo_kenamplan.png" alt="Logo Kenam Plan" className="h-7 w-7"></img>
                <span className="text-xl font-semibold text-[#3528ab]">Kenam Plan</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <div className="px-2 pt-6 text-xs font-semibold text-muted-foreground tracking-wide">
          Main Menu
        </div>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
