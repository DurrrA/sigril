"use client"

import { AppSidebar } from "@/components/app-sidebar";
import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsContent } from "@/components/ui/tabs"

const dummyPeminjaman = [
  {
    id: 1,
    user: "Andi",
    tanggal: {
      mulai: "2025-04-20",
      selesai: "2025-04-22",
    },
    barang: ["Capit BBQ", "Alat Grill"],
    total: 24000,
    status_sewa: "Disetujui",
    status_bayar: "Dibayar",
  },
]

function StatusBadge({ status }: { status: string }) {
  const statusColorMap: Record<string, string> = {
    Menunggu: "bg-gray-200 text-gray-800",
    Disetujui: "bg-blue-200 text-blue-800",
    Dibayar: "bg-green-200 text-green-800",
    Dibatalkan: "bg-red-200 text-red-800",
    Dikembalikan: "bg-purple-200 text-purple-800",
  }

  return (
    <Badge className={statusColorMap[status] || "bg-muted text-muted-foreground"}>
      {status}
    </Badge>
  )
}

export default function PagePenyewaan() {
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader/>
          <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                  <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <Tabs
                      defaultValue="outline"
                      className="flex w-full flex-col justify-start gap-6"
                    >
                      <TabsContent
                        value="outline"
                        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
                      >
                          <h1 className="text-2xl font-bold">Manajemen Peminjaman</h1>
                          <div className="rounded-lg border overflow-auto">
                            <Table>
                              <TableHeader className="sticky top-0 z-10 bg-muted bg-[#3528AB] text-white [&_th]:text-white">
                                <TableRow>
                                  <TableHead>No</TableHead>
                                  <TableHead>Peminjam</TableHead>
                                  <TableHead>Tgl Pinjam</TableHead>
                                  <TableHead>Tgl Kembali</TableHead>
                                  <TableHead>Barang</TableHead>
                                  <TableHead>Total</TableHead>
                                  <TableHead>Status Sewa</TableHead>
                                  <TableHead>Status Bayar</TableHead>
                                  <TableHead className="text-center">Aksi</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {dummyPeminjaman.map((data, index) => (
                                  <TableRow key={data.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{data.user}</TableCell>
                                    <TableCell>{data.tanggal.mulai}</TableCell>
                                    <TableCell>{data.tanggal.selesai}</TableCell>
                                    <TableCell>{data.barang.join(", ")}</TableCell>
                                    <TableCell>Rp{data.total.toLocaleString()}</TableCell>
                                    <TableCell>
                                      <StatusBadge status={data.status_sewa} />
                                    </TableCell>
                                    <TableCell>
                                    <StatusBadge status={data.status_bayar} />
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex gap-1">
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button size="sm" variant="outline">Detail</Button>
                                          </DialogTrigger>
                                          <DialogContent>
                                            <DialogHeader>
                                              <DialogTitle>Detail Peminjaman</DialogTitle>
                                            </DialogHeader>
                                            <p><strong>Peminjam:</strong> {data.user}</p>
                                            <p><strong>Barang:</strong> {data.barang.join(", ")}</p>
                                            <p><strong>Tanggal Pinjam:</strong> {data.tanggal.mulai}</p>
                                            <p><strong>Tanggal Kembali:</strong> {data.tanggal.selesai}</p>
                                            <p><strong>Total Bayar:</strong> Rp{data.total.toLocaleString()}</p>
                                          </DialogContent>
                                        </Dialog>

                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm">Batalkan</Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Yakin ingin membatalkan?</AlertDialogTitle>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Batal</AlertDialogCancel>
                                              <AlertDialogAction className="bg-red-500 hover:bg-red-600">Ya, Batalkan</AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>

                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button size="icon" variant="outline">
                                              <MoreVertical className="w-4 h-4" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => alert("Konfirmasi Peminjaman")}>Konfirmasi Peminjaman</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => alert("Konfirmasi Pembayaran")}>Konfirmasi Pembayaran</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => alert("Konfirmasi Pengembalian")}>Konfirmasi Pengembalian</DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </div>
            </SidebarInset>
          </SidebarProvider>        
  )
}
