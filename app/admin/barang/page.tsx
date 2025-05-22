"use client"

import { PencilIcon, TrashIcon, PlusIcon, Loader2, Calendar, CheckCircle2, XCircle, Eye } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FormTambahBarang } from "./form-barang"
import { FormEditBarang } from "./form-edit-barang"
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
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink } from "@/components/ui/pagination";
import { toast } from "sonner";
import { Barang, BarangResponse, kategori } from "@/interfaces/barang.interfaces";
import AdminProtection from "@/components/admin-protection";
// Import DatePicker
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// Helper function to safely handle image paths
const getImagePath = (path: string | null | undefined): string => {
  if (!path) return '/placeholder-image.png';
  if (path.startsWith('/') || path.startsWith('http')) return path;
  return `/${path}`;
};

export default function PageBarang() {
  // State
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [kategoriList, setKategoriList] = useState<kategori[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState<Barang | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; barang: Barang | null }>({
    open: false, 
    barang: null
  });
  const [loading, setLoading] = useState(true);
  
  // Search/filter states
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [filterValue, setFilterValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  // Availability states
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [availabilityData, setAvailabilityData] = useState<Record<string | number, {
    available: boolean;
    availableQuantity: number;
    totalStock: number;
  }>>({});
  const [showAvailability, setShowAvailability] = useState(false);
  
  // Client-side formatting state to prevent hydration errors
  const [formattedPrices, setFormattedPrices] = useState<Record<string, string>>({});

  // Fetch barang and kategori data on component mount
  useEffect(() => {
    fetchKategori();
    fetchBarang();
  }, []);
  
  // Update formatted prices when barang list changes
  useEffect(() => {
    const formatted: Record<string, string> = {};
    barangList.forEach(barang => {
      formatted[`${barang.id}-price`] = formatCurrency(barang.harga);
      formatted[`${barang.id}-penalty`] = formatCurrency(barang.harga_pinalti_per_jam);
    });
    setFormattedPrices(formatted);
  }, [barangList]);

  const fetchBarang = async () => {
    try {
      setLoading(true);
      
      // Build query params based on filters
      let url = '/api/barang';
      const params = new URLSearchParams();
      
      if (selectedFilter === "kategori" && filterValue) {
        params.append('kategori', filterValue);
      }
      
      if (searchKeyword) {
        params.append('search', searchKeyword);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.redirected) {
        // If redirected to /forbidden or /login, handle it
        window.location.href = response.url;
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      
      const data: BarangResponse = await response.json();
      setBarangList(data.data || []);
      setTotalItems(data.data?.length || 0);
    } catch (err) {
      console.error('Error fetching items:', err);
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };
  

  const fetchKategori = async () => {
    try {
      const response = await fetch('/api/kategori', {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.redirected) {
        // If redirected to /forbidden or /login, handle it
        window.location.href = response.url;
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const data = await response.json();
      setKategoriList(data.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('Failed to load categories');
    }
  };

// Define interface for availability data
interface AvailabilityItem {
  available: boolean;
  availableQuantity: number;
  totalStock: number;
  error?: boolean;
}

// New function to check availability
// Modify the checkAvailability function in your admin/barang/page.tsx
const checkAvailability = async () => {
  try {
    setCheckingAvailability(true);
    
    // Create an object to store all availability data
    const availability: Record<string | number, AvailabilityItem> = {};
    
    // Check availability for each item in the current page
    for (const barang of paginatedData) {
      try {
        const response = await fetch(
          `/api/sewa/availability?itemId=${barang.id}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Error checking availability for ${barang.nama}:`, errorData);
          availability[barang.id] = {
            available: false,
            availableQuantity: 0,
            totalStock: barang.stok,
            error: true
          };
          continue;
        }
        
        const data = await response.json();
        availability[barang.id] = {
          available: data.available,
          availableQuantity: data.availableQuantity,
          totalStock: data.totalStock
        };
      } catch (itemError) {
        console.error(`Error processing item ${barang.id}:`, itemError);
        availability[barang.id] = {
          available: false,
          availableQuantity: 0,
          totalStock: barang.stok,
          error: true
        };
      }
    }
    
    setAvailabilityData(availability);
    setShowAvailability(true);
  } catch (error) {
    console.error("Error checking availability:", error);
    toast.error("Gagal memeriksa ketersediaan barang");
  } finally {
    setCheckingAvailability(false);
  }
};
  
  // Function to toggle availability view
  const toggleAvailabilityView = () => {
    if (!showAvailability) {
      checkAvailability();
    } else {
      setShowAvailability(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.barang) return;
    
    try {
      const response = await fetch(`/api/barang/${deleteDialog.barang.id}`, {
        method: 'DELETE',
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.redirected) {
        // If redirected to /forbidden or /login, handle it
        window.location.href = response.url;
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to delete item');
      }
      
      // Remove the deleted item from the state
      setBarangList(prevBarang => 
        prevBarang.filter(item => item.id !== deleteDialog.barang?.id)
      );
      
      toast.success('Item berhasil dihapus');
    } catch (err) {
      console.error('Error deleting item:', err);
      toast.error('Gagal menghapus item');
    } finally {
      setDeleteDialog({ open: false, barang: null });
    }
  };
  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page on new search
    fetchBarang();
  };
  
  const handleResetFilters = () => {
    setSearchKeyword("");
    setSelectedFilter("all");
    setFilterValue("");
    setCurrentPage(1);
    fetchBarang();
  };
  
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('id-ID').format(value);
  };

  // Pagination
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const paginatedData = barangList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    fetchBarang();
    toast.success('Item berhasil ditambahkan');
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setSelectedBarang(null);
    fetchBarang();
    toast.success('Item berhasil diperbarui');
  };

  // Calculate min end date
  const minEndDate = new Date(startDate);
  minEndDate.setDate(minEndDate.getDate() + 1);

  return (
    <AdminProtection>
      <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset className="bg-white rounded-l-xl">
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <Tabs defaultValue="outline" className="flex w-full flex-col justify-start gap-6">
                <TabsContent value="outline" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
                  <h1 className="text-2xl font-bold">Manajemen Barang</h1>

                  {/* Button and Filters */}
                  <div className="relative flex flex-col md:flex-row gap-4 items-start md:items-center md:justify-between">
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="default" size="default" className="text-white bg-[#3528AB] hover:bg-[#2e2397]">
                          <PlusIcon className="h-4 w-4 mr-2" />
                          <span>Tambah Barang</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Tambah Barang Baru</DialogTitle>
                        </DialogHeader>
                        <FormTambahBarang onSuccess={handleCreateSuccess} kategoris={kategoriList} />
                      </DialogContent>
                    </Dialog>

                    {/* Search and Filters */}
                    <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
                      <Select
                        value={selectedFilter}
                        onValueChange={(value) => {
                          setSelectedFilter(value);
                          setFilterValue("");
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
                          onValueChange={setFilterValue}
                          value={filterValue}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Pilih Kategori" />
                          </SelectTrigger>
                          <SelectContent>
                            {kategoriList.map((kategori) => (
                              <SelectItem key={kategori.id} value={kategori.id.toString()}>
                                {kategori.nama}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      <div className="flex gap-2">
                        <Input
                          placeholder="Cari nama barang..."
                          value={searchKeyword}
                          onChange={(e) => setSearchKeyword(e.target.value)}
                          className="w-[200px] text-sm"
                        />
                        <Button onClick={handleSearch} className="bg-gray-200 hover:bg-gray-300 text-gray-800">
                          Cari
                        </Button>
                        <Button onClick={handleResetFilters} variant="outline">
                          Reset
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Add availability check section */}
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="font-medium flex items-center text-lg mb-3">
                      <Calendar className="mr-2 h-5 w-5" /> Cek Ketersediaan Barang
                    </h3>
                    <div className="flex flex-wrap gap-3 items-center">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium block mb-1">Tanggal Mulai:</label>
                          <DatePicker
                            selected={startDate}
                            onChange={(date: Date | null) => date && setStartDate(date)}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            minDate={new Date()}
                            dateFormat="dd/MM/yyyy"
                            className="w-full border p-2 rounded text-sm"
                            placeholderText="Pilih tanggal mulai"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium block mb-1">Tanggal Selesai:</label>
                          <DatePicker
                            selected={endDate}
                            onChange={(date: Date | null) => date && setEndDate(date)}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={minEndDate}
                            dateFormat="dd/MM/yyyy"
                            className="w-full border p-2 rounded text-sm"
                            placeholderText="Pilih tanggal selesai"
                          />
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0">
                        <Button 
                          onClick={toggleAvailabilityView}
                          className={`${showAvailability ? 'bg-gray-600' : 'bg-[#3528AB]'} text-white`}
                          disabled={checkingAvailability}
                        >
                          {checkingAvailability ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Memeriksa...
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              {showAvailability ? 'Sembunyikan Ketersediaan' : 'Lihat Ketersediaan'}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-auto rounded-lg border">
                    <Table>
                      <TableHeader className="sticky top-0 z-10 bg-[#3528AB] text-white [&_th]:text-white">
                        <TableRow>
                          <TableHead>No</TableHead>
                          <TableHead>Nama</TableHead>
                          <TableHead>Kategori</TableHead>
                          <TableHead>Harga</TableHead>
                          <TableHead>Stok</TableHead>
                          {showAvailability && <TableHead>Ketersediaan</TableHead>}
                          <TableHead>Harga Penalti</TableHead>
                          <TableHead>Foto</TableHead>
                          <TableHead className="text-center">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={showAvailability ? 9 : 8} className="text-center h-32">
                              <div className="flex justify-center items-center">
                                <Loader2 className="h-8 w-8 animate-spin text-[#3528AB]" />
                                <span className="ml-2">Memuat data...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : paginatedData.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={showAvailability ? 9 : 8} className="text-center py-8">
                              Tidak ada barang ditemukan
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedData.map((barang, index) => (
                            <TableRow key={barang.id}>
                              <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                              <TableCell>{barang.nama}</TableCell>
                              <TableCell>{barang.kategori?.nama || "-"}</TableCell>
                              <TableCell suppressHydrationWarning>
                                Rp{formattedPrices[`${barang.id}-price`] || barang.harga}
                              </TableCell>
                              <TableCell>{barang.stok}</TableCell>
                              
                                                            {/* Availability column */}
                              {showAvailability && (
                                <TableCell>
                                  {availabilityData[barang.id] ? (
                                    <div className="flex items-center">
                                      {availabilityData[barang.id].available ? (
                                        <div className="text-green-600 flex items-center">
                                          <CheckCircle2 className="h-4 w-4 mr-2" />
                                          <span>
                                            Tersedia: {availabilityData[barang.id].availableQuantity} unit
                                          </span>
                                        </div>
                                      ) : (
                                        <div className="text-red-600 flex items-center">
                                          <XCircle className="h-4 w-4 mr-2" />
                                          <span>Tidak tersedia untuk tanggal tersebut</span>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="flex items-center text-gray-400">
                                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                      <span>Memeriksa...</span>
                                    </div>
                                  )}
                                </TableCell>
                              )}
                              
                              <TableCell suppressHydrationWarning>
                                Rp{formattedPrices[`${barang.id}-penalty`] || barang.harga_pinalti_per_jam}
                              </TableCell>
                              <TableCell>
                                {barang.foto ? (
                                  <Image 
                                    src={getImagePath(barang.foto)}
                                    alt={barang.nama} 
                                    width={50} 
                                    height={50} 
                                    className="rounded-md object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/placeholder-image.png';
                                    }}
                                  />
                                ) : (
                                  <div className="w-[50px] h-[50px] bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                                    No img
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="flex justify-center gap-2 py-2">
                                <Button
                                  variant="default"
                                  size="icon"
                                  className="text-white bg-yellow-500 hover:bg-yellow-600"
                                  onClick={() => {
                                    setSelectedBarang(barang);
                                    setIsEditDialogOpen(true);
                                  }}
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </Button>

                                <Button
                                  size="icon"
                                  className="bg-red-500 hover:bg-red-600 text-white"
                                  onClick={() => {
                                    setDeleteDialog({
                                      open: true,
                                      barang: barang
                                    });
                                  }}
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {!loading && totalItems > 0 && (
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Menampilkan {paginatedData.length} dari {totalItems} barang
                      </div>
                      
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
                                onClick={() => handlePageChange(currentPage - 1)}
                                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                              />
                            </PaginationItem>

                            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                              const pageNum = i + 1;
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
                                className={currentPage === totalPages || totalPages === 0 ? "pointer-events-none opacity-50" : ""}
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

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Barang</DialogTitle>
            </DialogHeader>
            {selectedBarang && (
              <FormEditBarang 
                barang={selectedBarang} 
                onSuccess={handleEditSuccess} 
              />
            )}
          </DialogContent>
        </Dialog>
        
        {/* Delete Dialog */}
        <AlertDialog 
          open={deleteDialog.open} 
          onOpenChange={(isOpen) => {
            setDeleteDialog(prev => ({ ...prev, open: isOpen }));
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Yakin ingin menghapus barang ini?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Data barang <strong>{deleteDialog.barang?.nama}</strong> akan dihapus secara permanen.
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
      </SidebarInset>
    </SidebarProvider>
    </AdminProtection>
  );
}