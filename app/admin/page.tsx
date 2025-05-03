import { AppSidebar } from "@/components/app-sidebar"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function Page() {

  const articles = [
    { id: 1, title: "Tips Memasak BBQ", tag: "BBQ", author: "Admin", date: "2025-04-28" },
    { id: 2, title: "Cara Membersihkan Alat", tag: "Kebersihan", author: "Admin", date: "2025-04-25" },
  ]

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <SectionCards />
              </div>
                <div className="overflow-auto rounded-lg border">
                
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-[#3528AB] text-white [&_th]:text-white">
                      <TableRow>
                        <TableHead>Judul</TableHead>
                        <TableHead>Tag</TableHead>
                        <TableHead>Tanggal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {articles.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell>{a.title}</TableCell>
                          <TableCell>{a.tag}</TableCell>
                          <TableCell>{a.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
