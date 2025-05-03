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
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink } from "@/components/ui/pagination";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input"
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
    status: "Disetujui",
  },
]

function StatusBadge({ status }: { status: string }) {
  const statusColorMap: Record<string, string> = {
    Menunggu: "bg-gray-200 text-gray-800",
    Disetujui: "bg-green-200 text-green-800",
    Dibatalkan: "bg-red-200 text-red-800",
    Dikembalikan: "bg-blue-200 text-blue-800",
  }

  return (
    <Badge className={statusColorMap[status] || "bg-muted text-muted-foreground"}>
      {status}
    </Badge>
  )
}

export default function PageRiwayat() {
  const [selectedData, setSelectedData] = useState<typeof dummyPeminjaman[0] | null>(null)
  const [openDialog, setOpenDialog] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [filterValue, setFilterValue] = useState("");

  const filteredData = dummyPeminjaman.filter((data) => {
    const keywordMatch =
      data.user.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      data.barang.join(", ").toLowerCase().includes(searchKeyword.toLowerCase()) ||
      data.status.toLowerCase().includes(searchKeyword.toLowerCase());
      
  
    let filterMatch = true;
  
    if (selectedFilter === "status" && filterValue) {
      filterMatch = data.status.toLowerCase() === filterValue.toLowerCase();
    }
  
    if (selectedFilter === "bulan" && filterValue) {
      const bulan = data.tanggal.mulai.split("-")[1]; // Ambil bulan dari tgl
      filterMatch = bulan === filterValue;
    }
  
    return keywordMatch && filterMatch;
  });

  const handleRowClick = (data: typeof dummyPeminjaman[0]) => {
    setSelectedData(data);
    setOpenDialog(true);
  }

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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
                          <h1 className="text-2xl font-bold">Manajemen Penyewaan</h1>

                          {/* Filter bar */}
                          <div className="flex justify-end gap-2 items-center">
                            {/* Dropdown Kategori Filter */}
                            <Select
                              value={selectedFilter}
                              onValueChange={(value) => {
                                setSelectedFilter(value);
                                setFilterValue(""); // Reset value filter saat kategori diganti
                                setCurrentPage(1);
                              }}
                            >
                              <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Filter" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Semua</SelectItem>
                                <SelectItem value="statussewa">Status Sewa</SelectItem>
                                <SelectItem value="statusbayar">Status Bayar</SelectItem>
                                <SelectItem value="bulan">Bulan</SelectItem>
                              </SelectContent>
                            </Select>


                            {/* Filter value berdasarkan kategori */}
                            {selectedFilter === "statussewa" && (
                              <Select
                                onValueChange={(value) => {
                                  setFilterValue(value);
                                  setCurrentPage(1);
                                }}
                                value={filterValue}
                              >
                                <SelectTrigger className="w-[150px]">
                                  <SelectValue placeholder="Pilih Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Menunggu">Menunggu</SelectItem>
                                  <SelectItem value="Disetujui">Disetujui</SelectItem>
                                  <SelectItem value="Dikembalikan">Dikembalikan</SelectItem>
                                  <SelectItem value="Dibatalkan">Dibatalkan</SelectItem>
                                </SelectContent>
                              </Select>
                            )}

                            {selectedFilter === "bulan" && (
                              <Select
                                onValueChange={(value) => {
                                  setFilterValue(value);
                                  setCurrentPage(1);
                                }}
                                value={filterValue}
                              >
                                <SelectTrigger className="w-[150px]">
                                  <SelectValue placeholder="Pilih Bulan" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="01">Januari</SelectItem>
                                  <SelectItem value="02">Februari</SelectItem>
                                  <SelectItem value="03">Maret</SelectItem>
                                  <SelectItem value="04">April</SelectItem>
                                  <SelectItem value="05">Mei</SelectItem>
                                  <SelectItem value="06">Juni</SelectItem>
                                  <SelectItem value="07">Juli</SelectItem>
                                  <SelectItem value="08">Agustus</SelectItem>
                                  <SelectItem value="09">September</SelectItem>
                                  <SelectItem value="10">Oktober</SelectItem>
                                  <SelectItem value="11">November</SelectItem>
                                  <SelectItem value="12">Desember</SelectItem>
                                </SelectContent>
                              </Select>
                            )}

                            {/* Search input */}
                            <Input
                              placeholder="Cari nama atau barang..."
                              value={searchKeyword}
                              onChange={(e) => {
                                setSearchKeyword(e.target.value);
                                setCurrentPage(1);
                              }}
                              className="w-[200px] text-sm"
                            />
                          </div>

                          <div className="rounded-lg border overflow-auto">
                            <Table>
                              <TableHeader className="sticky top-0 z-10 bg-muted bg-[#3528AB] text-white [&_th]:text-white">
                                <TableRow>
                                  <TableHead>No</TableHead>
                                  <TableHead>Penyewa</TableHead>
                                  <TableHead>Tgl Sewa</TableHead>
                                  <TableHead>Tgl Kembali</TableHead>
                                  <TableHead>Barang</TableHead>
                                  <TableHead>Total</TableHead>
                                  <TableHead>Status</TableHead>
                                  
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {currentData.map((data, index) => (
                                  <TableRow key={data.id} onClick={() => handleRowClick(data)}
                                  className="cursor-pointer hover:bg-gray-200">
                                    <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                                    <TableCell>{data.user}</TableCell>
                                    <TableCell>{data.tanggal.mulai}</TableCell>
                                    <TableCell>{data.tanggal.selesai}</TableCell>
                                    <TableCell>{data.barang.join(", ")}</TableCell>
                                    <TableCell>Rp{data.total.toLocaleString()}</TableCell>
                                    <TableCell>
                                      <StatusBadge status={data.status} />
                                    </TableCell>
                                    
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                          
                          {/* Pagination */}
                          <div className="mt-4 flex justify-end">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm whitespace-nowrap">Baris per Halaman</span>
                              <Select
                                value={itemsPerPage.toString()}
                                onValueChange={(value) => {
                                  setItemsPerPage(Number(value));
                                  setCurrentPage(1); // reset ke halaman 1
                                }}
                              >
                                <SelectTrigger className="w-[70px] h-8">
                                  <SelectValue placeholder="Jumlah" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="10">10</SelectItem>
                                  <SelectItem value="20">20</SelectItem>
                                  <SelectItem value="20">30</SelectItem>
                                </SelectContent>
                              </Select>

                              <span className="text-sm item-center whitespace-nowrap mr-4 ml-4">
                                Halaman {currentPage} dari {totalPages}
                              </span>
                              <Pagination>
                                <PaginationContent>
                                  <PaginationItem>
                                    <PaginationPrevious
                                      onClick={() => handlePageChange(currentPage - 1)}
                                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                                    />
                                  </PaginationItem>

                                  {Array.from({ length: totalPages }).map((_, i) => (
                                    <PaginationItem key={i}>
                                      <PaginationLink
                                        isActive={currentPage === i + 1}
                                        onClick={() => handlePageChange(i + 1)}
                                      >
                                        {i + 1}
                                      </PaginationLink>
                                    </PaginationItem>
                                  ))}

                                  <PaginationItem>
                                    <PaginationNext
                                      onClick={() => handlePageChange(currentPage + 1)}
                                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                                    />
                                  </PaginationItem>
                                </PaginationContent>
                              </Pagination>
                            </div>
                          </div>

                          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Detail Penyewaan</DialogTitle>
                              </DialogHeader>
                              {selectedData && (
                                <div className="space-y-2">
                                  <p><strong>Penyewa:</strong> {selectedData.user}</p>
                                  <p><strong>Barang:</strong> {selectedData.barang.join(", ")}</p>
                                  <p><strong>Tanggal Sewa:</strong> {selectedData.tanggal.mulai}</p>
                                  <p><strong>Tanggal Kembali:</strong> {selectedData.tanggal.selesai}</p>
                                  <p><strong>Total Bayar:</strong> Rp{selectedData.total.toLocaleString()}</p>
                                </div>
                              )}
                              
                            </DialogContent>
                          </Dialog>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </div>
            </SidebarInset>
          </SidebarProvider>        
  )
}
