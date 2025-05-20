"use client"

import { AppSidebar } from "@/components/app-sidebar";
import { useEffect, useState } from "react"
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

type AdminTransaksi = {
  id: number;
  user: {
    username: string;
    email: string;
    phone: string;
    address: string;
  };
  tanggal_transaksi: string;
  status: string;
  total: number;
  sewa_req: null | {
    id: number;
    start_date: string;
    end_date: string;
    status: string;
    payment_status: string;
    items: {
      id: number;
      name: string;
      quantity: number;
      price: number;
      subtotal: number;
    }[];
  };
};

function StatusBadge({ status }: { status: string }) {
  const statusColorMap: Record<string, string> = {
    
    cancelled: "bg-red-200 text-red-800",
    confirmed: "bg-green-200 text-green-800",
    returned: "bg-blue-200 text-blue-800",
  }

  return (
    <Badge className={statusColorMap[status] || "bg-muted text-muted-foreground"}>
      {status}
    </Badge>
  )
}

export default function PageRiwayat() {
  const [riwayat, setRiwayat] = useState<AdminTransaksi[]>([]);
  const [selectedData, setSelectedData] = useState<AdminTransaksi | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [filterValue, setFilterValue] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/transaksi/admin");
        const json = await res.json();
        if (!json.success) throw new Error("Gagal mengambil data");

        // Filter hanya transaksi yang sudah selesai atau dibatalkan
        const filtered = json.data.filter((trx: AdminTransaksi) => {
          const sewaStatus = trx.sewa_req?.status || "";
          return ["returned", "cancelled", "confirmed"].includes(sewaStatus);
        });

        setRiwayat(filtered);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchData();
  }, []);

  const filteredData = riwayat.filter((data) => {
    if (!data.sewa_req) return false;

    const keywordMatch =
      data.user.username.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      data.sewa_req.items.some(item =>
        item.name.toLowerCase().includes(searchKeyword.toLowerCase())
      ) ||
      data.sewa_req.status.toLowerCase().includes(searchKeyword.toLowerCase());

    let filterMatch = true;

    if (selectedFilter === "status" && filterValue) {
      filterMatch = data.sewa_req.status.toLowerCase() === filterValue.toLowerCase();
    }

    if (selectedFilter === "bulan" && filterValue) {
      const bulan = data.sewa_req.start_date.split("-")[1];
      filterMatch = bulan === filterValue;
    }

    return keywordMatch && filterMatch;
  });

  const handleRowClick = (data: AdminTransaksi) => {
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
                          <h1 className="text-2xl font-bold">Riwayat Penyewaan</h1>

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
                                <SelectItem value="status">Status</SelectItem>
                                <SelectItem value="bulan">Bulan</SelectItem>
                              </SelectContent>
                            </Select>


                            {/* Filter value berdasarkan kategori */}
                            {selectedFilter === "status" && (
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
                                  <SelectItem value="cancelled">cancelled</SelectItem>
                                  <SelectItem value="returned">ceturned</SelectItem>
                                  <SelectItem value="confirmed">confirmed</SelectItem>
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
                                    <TableCell>{data.user.username}</TableCell>
                                    <TableCell>{data.sewa_req?.start_date.split("T")[0]}</TableCell>
                                    <TableCell>{data.sewa_req?.end_date.split("T")[0]}</TableCell>
                                    <TableCell>{data.sewa_req?.items.map(item => item.name).join(", ")}</TableCell>
                                    <TableCell>Rp{data.total.toLocaleString()}</TableCell>
                                    <TableCell>
                                      <StatusBadge status={data.sewa_req?.status || "-"} />
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
                                  <SelectItem value="30">30</SelectItem>
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
                                  <p><strong>Nama Penyewa:</strong> {selectedData.user.username}</p>
                                  <p><strong>Email:</strong> {selectedData.user.email}</p>
                                  <p><strong>No. Telepon:</strong> {selectedData.user.phone}</p>
                                  <p><strong>Alamat:</strong> {selectedData.user.address}</p>
                                  <p><strong>Tanggal Transaksi:</strong> {selectedData.tanggal_transaksi.split("T")[0]}</p>
                                  <p><strong>Status:</strong> {selectedData.status}</p>
                                  <p><strong>Total Bayar:</strong> Rp{selectedData.total.toLocaleString()}</p>
                                  {selectedData.sewa_req && (
                                    <>
                                      <p><strong>Periode Sewa:</strong> {selectedData.sewa_req.start_date.split("T")[0]} - {selectedData.sewa_req.end_date.split("T")[0]}</p>
                                      <p><strong>Status Sewa:</strong> {selectedData.sewa_req.status}</p>
                                      <p><strong>Status Pembayaran:</strong> {selectedData.sewa_req.payment_status}</p>
                                      <p><strong>Barang Disewa:</strong></p>
                                      <ul className="pl-4 list-disc">
                                        {selectedData.sewa_req.items.map((item) => (
                                          <li key={item.id}>
                                            {item.name} - {item.quantity} x Rp{item.price.toLocaleString()} = Rp{item.subtotal.toLocaleString()}
                                          </li>
                                        ))}
                                      </ul>
                                    </>
                                  )}
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
