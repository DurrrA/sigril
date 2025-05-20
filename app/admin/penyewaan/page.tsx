"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

function StatusBadge({ status }: { status: string }) {
  const statusColorMap: Record<string, string> = {
    UNPAID: "bg-red-200 text-red-800",
    pending: "bg-gray-200 text-gray-800",
    PAID: "bg-green-200 text-green-800",
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <Badge className={statusColorMap[status] || "bg-muted text-muted-foreground"}>
      {capitalize(status)}
    </Badge>
  );
}

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

export default function PagePenyewaan() {
  const [transaksiData, setTransaksiData] = useState<AdminTransaksi[]>([]);
  const [detailData, setDetailData] = useState<AdminTransaksi | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [filterValue, setFilterValue] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/transaksi/admin");
        const json = await res.json();
        if (!json.success) throw new Error("Gagal mengambil data");
        setTransaksiData(json.data);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchData();
  }, []);

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/sewa/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Gagal update status");
      const updated = await res.json();
      setTransaksiData((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: updated.status } : item
        )
      );
      toast.success(`Status berhasil diubah menjadi ${updated.status}`);
    } catch (err) {
      console.error("Update status error:", err);
      toast.error("Gagal mengubah status");
    }
  };

  const filteredData = transaksiData.filter((data) => {
    const keywordMatch =
      data.user.username.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (data.sewa_req?.items.map((i) => i.name).join(", ").toLowerCase() ?? "").includes(searchKeyword.toLowerCase()) ||
      data.status.toLowerCase().includes(searchKeyword.toLowerCase());

    let filterMatch = true;
    if (selectedFilter === "status" && filterValue) {
      filterMatch = data.status === filterValue;
    }
    return keywordMatch && filterMatch;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleRowClick = (data: AdminTransaksi) => {
    setDetailData(data);
    setOpenDialog(true);
  };

  const isRowClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    const ignoreTags = ["BUTTON", "svg", "path"];
    const target = e.target as HTMLElement;
    return !ignoreTags.includes(target.tagName);
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset className="bg-white rounded-l-xl">
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <Tabs defaultValue="outline" className="flex w-full flex-col justify-start gap-6">
                <TabsContent value="outline" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
                  <h1 className="text-2xl font-bold">Manajemen Penyewaan</h1>

                  {/* Filter bar */}
                  <div className="flex justify-end gap-2 items-center">
                    <Select
                      value={selectedFilter}
                      onValueChange={(value) => {
                        setSelectedFilter(value);
                        setFilterValue("");
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                      </SelectContent>
                    </Select>

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
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    )}

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

                  {/* Table */}
                  <div className="rounded-lg border overflow-auto">
                    <Table>
                      <TableHeader className="bg-[#3528AB] text-whitesticky top-0 z-10 bg-[#3528AB] text-white [&_th]:text-white">
                        <TableRow>
                          <TableHead>No</TableHead>
                          <TableHead>Penyewa</TableHead>
                          <TableHead>Tanggal Transaksi</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Barang Disewa</TableHead>
                          <TableHead className="text-center">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentData.map((data, index) => (
                          <TableRow
                            key={data.id}
                            onClick={(e) => {
                              if (isRowClick(e)) {
                                handleRowClick(data);
                              }
                            }}
                            className="cursor-pointer hover:bg-gray-100"
                          >
                            <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                            <TableCell>{data.user.username}</TableCell>
                            <TableCell>{data.tanggal_transaksi.split("T")[0]}</TableCell>
                            <TableCell><StatusBadge status={data.status} /></TableCell>
                            <TableCell>Rp{data.total.toLocaleString()}</TableCell>
                            <TableCell>
                              {data.sewa_req ? (
                                <ul>
                                  {data.sewa_req.items.map((item) => (
                                    <li key={item.id}>
                                      {item.name} ({item.quantity} x Rp{item.price.toLocaleString()}) = Rp{item.subtotal.toLocaleString()}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="italic text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {data.status === "pending" ? (
                                <div className="flex justify-center gap-1">
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="default" size="sm" className="text-white bg-red-500 hover:bg-red-800">Batalkan</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Yakin ingin membatalkan?</AlertDialogTitle>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => updateStatus(data.id, "cancelled")} className="text-white bg-red-500 hover:bg-red-800">
                                          Ya, Batalkan
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>

                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="default" size="sm" className="text-white bg-blue-500 hover:bg-blue-800">Konfirmasi</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Yakin ingin konfirmasi?</AlertDialogTitle>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => updateStatus(data.id, "confirmed")} className="text-white bg-blue-500 hover:bg-blue-800">
                                          Ya, Konfirmasi
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              ) : (
                                <span className="text-gray-500 italic">Pesanan selesai</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm whitespace-nowrap">Baris per Halaman</span>
                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={(value) => {
                        setItemsPerPage(Number(value));
                        setCurrentPage(1);
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
                    <span className="text-sm whitespace-nowrap mx-4">
                      Halaman {currentPage} dari {Math.max(1, totalPages)}
                    </span>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage(currentPage - 1)}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPages }).map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink
                              isActive={currentPage === i + 1}
                              onClick={() => setCurrentPage(i + 1)}
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage(currentPage + 1)}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>

                  {/* Dialog Detail */}
                  <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Detail Penyewaan</DialogTitle>
                      </DialogHeader>
                      {detailData && (
                        <div className="space-y-2">
                          <p><strong>Nama Penyewa:</strong> {detailData.user.username}</p>
                          <p><strong>Email:</strong> {detailData.user.email}</p>
                          <p><strong>No. Telepon:</strong> {detailData.user.phone}</p>
                          <p><strong>Alamat:</strong> {detailData.user.address}</p>
                          <p><strong>Tanggal Transaksi:</strong> {detailData.tanggal_transaksi.split("T")[0]}</p>
                          <p><strong>Status:</strong> {detailData.status}</p>
                          <p><strong>Total Bayar:</strong> Rp{detailData.total.toLocaleString()}</p>
                          {detailData.sewa_req && (
                            <>
                              <p><strong>Periode Sewa:</strong> {detailData.sewa_req.start_date.split("T")[0]} - {detailData.sewa_req.end_date.split("T")[0]}</p>
                              <p><strong>Status Sewa:</strong> {detailData.sewa_req.status}</p>
                              <p><strong>Status Pembayaran:</strong> {detailData.sewa_req.payment_status}</p>
                              <p><strong>Barang Disewa:</strong></p>
                              <ul className="pl-4 list-disc">
                                {detailData.sewa_req.items.map((item) => (
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
  );
}