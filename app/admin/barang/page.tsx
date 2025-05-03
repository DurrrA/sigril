"use client"

import { PencilIcon, TrashIcon, PlusIcon} from "lucide-react";
import Image from "next/image"
import { AppSidebar } from "@/components/app-sidebar"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FormTambahBarang } from "@/app/admin/barang/form-barang"
import { FormEditBarang } from "@/app/admin/barang/form-edit-barang"
import { SiteHeader } from "@/components/site-header"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink } from "@/components/ui/pagination";

// Define interfaces for our data structures
interface BarangData {
  id: number;
  nama: string;
  kategori: string;
  harga: number;
  stok: number;
  hargaPenalti: number;
  foto: string;
}

// This interface should match the form's expected structure
interface EditBarangData {
  nama: string;
  kategori: string;
  harga: string; // Changed to string to match the form's expected type
  stok: string;  // Changed to string to match the form's expected type
  hargaPenalti: string; // Changed to string to match the form's expected type
  foto: File | null;
}

const dummyBarang: BarangData[] = [
  {
    id: 1,
    nama: "Mesin Las Portable",
    kategori: "Elektronik",
    harga: 1250000,
    stok: 10,
    hargaPenalti: 150000,
    foto: '/images/mesin_las.png',
  },
]

export default function PageBarang() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [isTambahOpen, setIsTambahOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editData, setEditData] = useState<EditBarangData | null>(null)

  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [filterValue, setFilterValue] = useState("");

  const filteredData = dummyBarang.filter((data) => {
    const keywordMatch =
      data.nama.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      data.kategori.toLowerCase().includes(searchKeyword.toLowerCase());

    let filterMatch = true;

    if (selectedFilter === "kategori" && filterValue) {
      filterMatch = data.kategori.toLowerCase() === filterValue.toLowerCase();
    }

    return keywordMatch && filterMatch;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  const handleDelete = (itemName: string) => {
    console.log(`Hapus barang: ${itemName}`)
    setSelectedItem(null)
  }

  const handleEditClick = (barang: BarangData) => {
    setEditData({
      nama: barang.nama,
      kategori: barang.kategori,
      harga: barang.harga.toString(), // Convert number to string for the form
      stok: barang.stok.toString(),   // Convert number to string for the form
      hargaPenalti: barang.hargaPenalti.toString(), // Convert number to string for the form
      foto: null,
    })
    setIsEditOpen(true)
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <Tabs defaultValue="outline" className="flex w-full flex-col justify-start gap-6">
                <TabsContent value="outline" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
                  <h1 className="text-2xl font-bold">Manajemen Barang</h1>

                  <div className="relative flex items-center justify-between">
                    <Dialog open={isTambahOpen} onOpenChange={setIsTambahOpen}>
                      <DialogTrigger asChild>
                        <Button variant="default" size="default" className="text-white bg-[#3528AB] hover:bg-[#2e2397]">
                          <PlusIcon className="h-4 w-4" />
                          <span className="hidden lg:inline">Tambah Barang</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <FormTambahBarang onSubmitSuccess={() => setIsTambahOpen(false)} />
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                      <DialogContent className="max-w-md">
                        {editData && (
                          <FormTambahBarang
                            defaultValues={editData}
                            onSubmitSuccess={() => setIsEditOpen(false)}
                          />
                        )}
                      </DialogContent>
                    </Dialog>

                    {/* Filter dan Pencarian */}
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
                          <SelectItem value="kategori">Kategori</SelectItem>
                        </SelectContent>
                      </Select>

                      {selectedFilter === "kategori" && (
                        <Select
                          onValueChange={(value) => {
                            setFilterValue(value);
                            setCurrentPage(1);
                          }}
                          value={filterValue}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Pilih Kategori" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="elektronik">Elektronik</SelectItem>
                            <SelectItem value="perkakas">Perkakas</SelectItem>
                          </SelectContent>
                        </Select>
                      )}

                      <Input
                        placeholder="Cari nama barang..."
                        value={searchKeyword}
                        onChange={(e) => {
                          setSearchKeyword(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-[200px] text-sm"
                      />
                    </div>
                  </div>

                  {/* Tabel Data */}
                  <div className="overflow-auto rounded-lg border">
                    <Table>
                      <TableHeader className="sticky top-0 z-10 bg-[#3528AB] text-white [&_th]:text-white">
                        <TableRow>
                          <TableHead>No</TableHead>
                          <TableHead>Nama</TableHead>
                          <TableHead>Kategori</TableHead>
                          <TableHead>Harga</TableHead>
                          <TableHead>Stok</TableHead>
                          <TableHead>Harga Penalti</TableHead>
                          <TableHead>Foto</TableHead>
                          <TableHead className="text-center">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentData.map((data, index) => (
                          <TableRow key={data.id}>
                            <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                            <TableCell>{data.nama}</TableCell>
                            <TableCell>{data.kategori}</TableCell>
                            <TableCell>Rp{data.harga.toLocaleString()}</TableCell>
                            <TableCell>{data.stok}</TableCell>
                            <TableCell>Rp{data.hargaPenalti.toLocaleString()}</TableCell>
                            <TableCell>
                              <Image src={data.foto} alt="Foto Barang" width={50} height={50} className="rounded-md object-cover" />
                            </TableCell>
                            <TableCell className="flex justify-center gap-2 py-2">
                              <Button
                                variant="default"
                                size="icon"
                                className="text-white bg-yellow-500 hover:bg-yellow-600"
                                onClick={() => handleEditClick(data)}
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="icon"
                                    className="bg-red-500 hover:bg-red-600 text-white"
                                    onClick={() => setSelectedItem(data.nama)}
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Yakin ingin menghapus barang ini?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Data barang <strong>{selectedItem}</strong> akan dihapus secara permanen.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-500 hover:bg-red-600 text-white"
                                      onClick={() => handleDelete(selectedItem!)}
                                    >
                                      Ya, Hapus
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
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
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}