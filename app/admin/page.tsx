"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function Page() {

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-3">Dashboard Overview</h2>
                    <p>Welcome to your admin dashboard.</p>
                  </div>
                </div>
              </div>

              
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}