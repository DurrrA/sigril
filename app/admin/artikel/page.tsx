"use client"

import { PencilIcon, TrashIcon, PlusIcon, Loader2  } from "lucide-react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SiteHeader } from "@/components/site-header"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useState, useEffect } from "react";
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
import { Artikel } from "@/interfaces/artikel.interfaces";
import { FormEditArtikel } from "./form-edit-artikel";

export default function PageArtikel() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [isTambahOpen, setIsTambahOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editData, setEditData] = useState<Artikel | null>(null)

  // Data fetching states
  const [articles, setArticles] = useState<Artikel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtering states
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [filterValue, setFilterValue] = useState("");
  
  // Fetch articles
  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/artikel');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const result = await response.json();
      setArticles(result.data || []);
    } catch (err) {
      setError('Failed to load articles');
      console.error('Error fetching articles:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchArticles();
  }, []);
  
  // Filter articles
  const filteredData = articles.filter((data) => {
    const keywordMatch = searchKeyword 
      ? data.judul.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (data.tags?.nama?.toLowerCase().includes(searchKeyword.toLowerCase()) ?? false)
      : true;
      
    let filterMatch = true;
  
    if (selectedFilter === "tag" && filterValue) {
      filterMatch = data.tags?.id.toString() === filterValue;
    }
  
    if (selectedFilter === "bulan" && filterValue) {
      const bulan = new Date(data.publishAt).getMonth() + 1;
      filterMatch = bulan.toString().padStart(2, '0') === filterValue;
    }
  
    return keywordMatch && filterMatch;
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  // Ensure current page is valid when data changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [totalPages, currentPage]);

  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedId) return;
    
    try {
      const response = await fetch(`/api/artikel/${selectedId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete article');
      }
      
      // Refresh the articles list
      fetchArticles();
      
      // Reset states
      setSelectedItem(null);
      setSelectedId(null);
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  }

  const handleEditClick = (artikel: Artikel) => {
    setEditData(artikel);
    setIsEditOpen(true);
  }

  // Handle successful form submissions
  const handleCreateSuccess = () => {
    setIsTambahOpen(false);
    fetchArticles();
  }

  const handleEditSuccess = () => {
    setIsEditOpen(false);
    fetchArticles();
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
                      <FormBuatArtikel onSubmitSuccess={handleCreateSuccess} />
                    </DialogContent>
                  </Dialog>

                  {/* Dialog Edit Artikel */}
                  <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="max-w-md">
                      {editData && (
                        <FormEditArtikel
                          article={editData}
                          onSuccess={handleEditSuccess}
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
                          {/* Dynamically list all unique tags from articles */}
                          {Array.from(new Set(articles.map(a => a.tags?.id)))
                            .filter(id => id !== undefined)
                            .map(id => {
                              const tag = articles.find(a => a.tags?.id === id)?.tags;
                              return tag ? (
                                <SelectItem key={tag.id} value={tag.id.toString()}>
                                  {tag.nama}
                                </SelectItem>
                              ) : null;
                            })}
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
                      <TableHeader className="sticky top-0 z-10 bg-[#3528AB] text-white [&_th]:text-white">
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
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                              <div className="flex justify-center items-center">
                                <Loader2 className="h-8 w-8 animate-spin text-[#3528AB]" />
                                <span className="ml-2">Memuat artikel...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : error ? (
                          <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center text-red-500">
                              {error} - <Button variant="link" onClick={fetchArticles}>Coba lagi</Button>
                            </TableCell>
                          </TableRow>
                        ) : currentData.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                              Tidak ada artikel ditemukan
                            </TableCell>
                          </TableRow>
                        ) : (
                          currentData.map((data, index) => (
                            <TableRow className="break-words whitespace-normal" key={data.id}>
                              <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                              <TableCell>{data.judul}</TableCell>
                              <TableCell>{data.tags?.nama || 'No Tag'}</TableCell>
                              <TableCell className="max-w-xs truncate">
                                {data.konten.length > 100 ? `${data.konten.substring(0, 100)}...` : data.konten}
                              </TableCell>
                              <TableCell>{new Date(data.publishAt).toLocaleDateString('id-ID')}</TableCell>
                              <TableCell>
                                {(() => {
                                    // Default placeholder path
                                    const placeholderImage = "/image.png"; // Update with your actual path
                                    
                                    // If no image data at all, show placeholder
                                    if (!data.foto) {
                                    return (
                                        <Image 
                                        src={placeholderImage}
                                        alt="Default Image"
                                        width={50}
                                        height={50}
                                        className="rounded-md object-cover inline-block opacity-70"
                                        />
                                    );
                                    }
                                    
                                    // Try to display the actual image, with error handling
                                    return (
                                    <Image 
                                        src={data.foto}
                                        alt="Foto Artikel"
                                        width={50}
                                        height={50}
                                        className="rounded-md object-cover inline-block"
                                        unoptimized={!data.foto.endsWith('.png')||!data.foto.endsWith('.jpg')} 
                                        onError={(e) => {
                                        // If image fails to load, replace with placeholder
                                        e.currentTarget.src = placeholderImage;
                                        e.currentTarget.classList.add('opacity-70');
                                        }}
                                    />
                                    );
                                })()}
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
                                      onClick={() => {
                                        setSelectedItem(data.judul);
                                        setSelectedId(data.id);
                                      }}
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
                                        onClick={handleDelete}
                                      >
                                        Ya, Hapus
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {!isLoading && !error && filteredData.length > 0 && (
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

                            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                              // Show pagination differently if many pages
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else {
                                // For many pages, show current page and neighbors
                                if (currentPage <= 3) {
                                  pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                  pageNum = totalPages - 4 + i;
                                } else {
                                  pageNum = currentPage - 2 + i;
                                }
                              }
                              
                              return (
                                <PaginationItem key={i}>
                                  <PaginationLink
                                    isActive={currentPage === pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                  >
                                    {pageNum}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            })}

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
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}