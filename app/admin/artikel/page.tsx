"use client"

import { PencilIcon, TrashIcon, PlusIcon, Loader2 } from "lucide-react";
import Image from "next/image"
import { AppSidebar } from "@/components/app-sidebar"
import {
  AlertDialog,
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
import { FormBuatArtikel } from "./form-artikel";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink } from "@/components/ui/pagination";

const dummyArtikel = [
  {
    id: 1,
    judul: "Alat Terbaru Super Canggih",
    tag: "Alat Grill",
    konten: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    tglPublish: "2025-03-12",
    foto: '/images/logo_kenamplan.png',
  },
]

export default function PageArtikel() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [isTambahOpen, setIsTambahOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editData, setEditData] = useState<any>(null)

  const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("");
    const [filterValue, setFilterValue] = useState("");
  
    const filteredData = dummyArtikel.filter((data) => {
      const keywordMatch =
        data.judul.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        data.tag.toLowerCase().includes(searchKeyword.toLowerCase());
        
    
      let filterMatch = true;
    
      if (selectedFilter === "tag" && filterValue) {
        filterMatch = data.tag.toLowerCase() === filterValue.toLowerCase();
      }
    
      if (selectedFilter === "bulan" && filterValue) {
        const bulan = data.tglPublish.split("-")[1]; // Ambil bulan dari tgl
        filterMatch = bulan === filterValue;
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
    console.log(`Hapus item: ${itemName}`)
    setSelectedItem(null)
  }

  const handleEditClick = (artikel: any) => {
    setEditData({
      judul: artikel.judul,
      tags: artikel.tag,
      konten: artikel.konten,
      publish_date: new Date(artikel.tglPublish),
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
                <h1 className="text-2xl font-bold">Manajemen Artikel</h1>

                <div className="relative flex items-center justify-between">
                  {/* Dialog Buat Artikel */}
                  <Dialog open={isTambahOpen} onOpenChange={setIsTambahOpen}>
                    <DialogTrigger asChild>
                      <Button variant="default" size="default" className="text-white bg-[#3528AB] hover:bg-[#2e2397]">
                        <PlusIcon className="h-4 w-4" />
                        <span className="hidden lg:inline">Buat Artikel</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <FormBuatArtikel onSubmitSuccess={() => setIsTambahOpen(false)} />
                    </DialogContent>
                  </Dialog>

                  {/* Dialog Edit Artikel */}
                  <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="max-w-md">
                      {editData && (
                        <FormBuatArtikel
                          defaultValues={editData}
                          onSubmitSuccess={() => setIsEditOpen(false)}
                        />
                      )}
                    </DialogContent>
                  </Dialog>

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
                        <SelectItem value="tag">Tag</SelectItem>
                        <SelectItem value="bulan">Bulan</SelectItem>
                      </SelectContent>
                    </Select>


                    {/* Filter value berdasarkan kategori */}
                    {selectedFilter === "tag" && (
                      <Select
                        onValueChange={(value) => {
                          setFilterValue(value);
                          setCurrentPage(1);
                        }}
                        value={filterValue}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Pilih Tag" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="adventure">Adventure</SelectItem>
                          <SelectItem value="kesehatan">Kesehatan</SelectItem>
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
                      placeholder="Cari judul..."
                      value={searchKeyword}
                      onChange={(e) => {
                        setSearchKeyword(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-[200px] text-sm"
                    />
                  </div>

                </div>
                  <div className="overflow-auto rounded-lg border">
                    <Table>
                      <TableHeader className="sticky top-0 z-10 bg-muted bg-[#3528AB] text-white [&_th]:text-white">
                        <TableRow className="break-words whitespace-normal">
                          <TableHead>No</TableHead>
                          <TableHead>Judul</TableHead>
                          <TableHead>Tag</TableHead>
                          <TableHead>Konten</TableHead>
                          <TableHead>Tanggal Publish</TableHead>
                          <TableHead>Foto</TableHead>
                          <TableHead className="text-center">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="**:data-[slot=table-cell]:first:w-8">
                        {currentData.map((data, index) => (
                          <TableRow className="break-words whitespace-normal" key={data.id}>
                            <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                            <TableCell>{data.judul}</TableCell>
                            <TableCell>{data.tag}</TableCell>
                            <TableCell>{data.konten}</TableCell>
                            <TableCell>{new Date(data.tglPublish).toLocaleDateString('id-ID')}</TableCell>
                            <TableCell>
                              <Image src={data.foto}
                                alt="Foto Artikel"
                                width={50}
                                height={50}
                                className="rounded-md object-cover inline-block"
                              />
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
                                    onClick={() => setSelectedItem(data.judul)}
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Yakin ingin menghapus artikel ini?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Data artikel <strong>{selectedItem}</strong> akan dihapus secara permanen.
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
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
