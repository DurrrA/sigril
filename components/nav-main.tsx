"use client"

import { MailIcon, PlusCircleIcon, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"


import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url
            return (
            <SidebarMenuItem key={item.title} className="mb-2">
                <Link href={item.url} passHref>
                <SidebarMenuButton asChild tooltip={item.title} isActive={isActive} className={isActive ? "!bg-[#3528ab]/15 text-[#3528ab] px-4 py-5 rounded-lg shadow-sm" : "px-4 py-3 rounded-lg"}>
                  <div className="flex items-center gap-2">
                    {item.icon && <item.icon className={isActive ? "text-[#3528ab]" : ""}/>}
                    <span className={`text-md font-base ${isActive ? "text-[#3528ab]" : "text-muted-foregroud"}`}>{item.title}</span>
                  </div>
                </SidebarMenuButton>

                </Link>
            </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
