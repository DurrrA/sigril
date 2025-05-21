"use client"

import { AppSidebar } from "@/components/app-sidebar";
import { useEffect, useState } from "react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Clock, FileText, Loader2, Receipt } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { 
  Pagination, PaginationContent, PaginationItem, PaginationPrevious, 
  PaginationNext, PaginationLink 
} from "@/components/ui/pagination";
import { SiteHeader } from "@/components/site-header";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm, SubmitHandler } from "react-hook-form";

// Define rental item type
interface RentalItem {
  id: number;
  id_barang: number;
  name: string;
  quantity: number;
  price: number;
  jumlah: number;
  subtotal: number;
  harga_pinalti_per_jam: number;
}

// Define rental type
interface Rental {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    phone: string;
    address: string;
  };
  id_user: number;
  tanggal_transaksi: string;
  start_date: string;
  end_date: string;
  status: string;
  totalAmount: number;
  items: RentalItem[];
  id_transaksi?: number;
}

// Define penalty type for each item
interface PenaltyItem {
  barangId: number;
  itemName: string;
  quantity: number;
  amount: number;
  reason: string;
  applyPenalty: boolean;
}

// Define form values type without Zod
interface ReturnFormValues {
  returnCondition: string;
  receiptNumber: string;
  paymentMethod: string;
  notes: string;
  payNow: boolean;
}

function StatusBadge({ status }: { status: string }) {
  const statusColorMap: Record<string, string> = {
    pending: "bg-yellow-200 text-yellow-800",
    confirmed: "bg-blue-200 text-blue-800",
    completed: "bg-green-200 text-green-800",
    cancelled: "bg-red-200 text-red-800",
    active: "bg-purple-200 text-purple-800"
  }

  const statusTextMap: Record<string, string> = {
    pending: "Menunggu",
    confirmed: "Dikonfirmasi",
    completed: "Selesai",
    cancelled: "Dibatalkan",
    active: "Aktif"
  }

  return (
    <Badge className={statusColorMap[status] || "bg-gray-200 text-gray-800"}>
      {statusTextMap[status] || status}
    </Badge>
  )
}

export default function PagePengembalian() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openReturnDialog, setOpenReturnDialog] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Penalty state
  const [penalties, setPenalties] = useState<PenaltyItem[]>([]);
  const [isLateReturn, setIsLateReturn] = useState(false);
  const [lateHours, setLateHours] = useState(0);
  const [totalPenaltyAmount, setTotalPenaltyAmount] = useState(0);
  
  // Initialize the form with react-hook-form (without Zod)
  const form = useForm<ReturnFormValues>({
    defaultValues: {
      returnCondition: "Returned in good condition",
      receiptNumber: "",
      paymentMethod: "CASH",
      notes: "",
      payNow: true,
    }
  });

  const getItemPenaltyRate = (item: RentalItem): number => {
    console.log(`Getting penalty rate for item:`, item);
    
    if (typeof item.harga_pinalti_per_jam === 'number' && !isNaN(item.harga_pinalti_per_jam)) {
      return item.harga_pinalti_per_jam;
    }
    
    if (typeof item.price === 'number' && !isNaN(item.price)) {
      return item.price * 0.1;
    }
    
    console.error(`Missing penalty rate for item ${item.name}, using fallback calculation`);
    return 0;
  };
  console.log("item", rentals)
  const calculatePenalties = (rental: Rental) => {
    console.log("Full rental data:", rental);
    console.log("Rental items:", rental.items);
    
    const endDate = new Date(rental.end_date);
    const currentDate = new Date();
    
    let hoursLate = 0;
    if (currentDate > endDate) {
      const diffMs = currentDate.getTime() - endDate.getTime();
      hoursLate = Math.ceil(diffMs / (1000 * 60 * 60));
    }
    
    setLateHours(hoursLate);
    setIsLateReturn(hoursLate > 0);
    
    if (hoursLate > 0 && rental.items) {
      const penaltyItems: PenaltyItem[] = rental.items.map(item => {
        const penaltyRate = getItemPenaltyRate(item);
        console.log(`Item ${item.name} penalty rate: ${penaltyRate}`);
        
        return {
          barangId: item.id_barang,
          itemName: item.name,
          quantity: item.quantity || 1,
          amount: Math.round(penaltyRate * hoursLate * (item.quantity || 1)),
          reason: `Terlambat pengembalian ${hoursLate} jam`,
          applyPenalty: true
        };
      });
      
      console.log("Calculated penalty items:", penaltyItems);
      setPenalties(penaltyItems);
      
      const totalPenalty = penaltyItems.reduce((sum, item) => {
        return sum + (isNaN(item.amount) ? 0 : item.amount);
      }, 0);
      
      console.log("Total penalty amount:", totalPenalty);
      setTotalPenaltyAmount(totalPenalty);
    } else {
      setPenalties([]);
      setTotalPenaltyAmount(0);
    }
  };

  // Fetch rentals data
  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/sewa', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        setRentals(result.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching rentals:', error);
      toast.error('Failed to load rental data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRowClick = (rental: Rental) => {
    setSelectedRental(rental);
    setOpenDialog(true);
  }

  const isRowClick = (e: React.MouseEvent) => {
    const ignoreTags = ["BUTTON", "svg", "path"];
    const target = e.target as HTMLElement;
    return !ignoreTags.includes(target.tagName);
  };
  
  // Handle opening the return confirmation dialog
  const handleOpenReturnDialog = (rental: Rental) => {
    setSelectedRental(rental);
    calculatePenalties(rental);
    setOpenReturnDialog(true);
    
    // Reset form
    form.reset({
      returnCondition: "Returned in good condition",
      receiptNumber: "",
      paymentMethod: "CASH",
      notes: "",
      payNow: true,
    });
  };
  
  // Toggle penalty for an item
  const togglePenalty = (index: number) => {
    const updatedPenalties = [...penalties];
    updatedPenalties[index].applyPenalty = !updatedPenalties[index].applyPenalty;
    setPenalties(updatedPenalties);
    
    // Recalculate total
    const newTotal = updatedPenalties.reduce((sum, item) => 
      sum + (item.applyPenalty ? item.amount : 0), 0);
    setTotalPenaltyAmount(newTotal);
  };
  
  // Handle form submission for return with penalties
  const handleReturnSubmit: SubmitHandler<ReturnFormValues> = async (values) => {
    if (!selectedRental) return;
    
    // Simple validation
    if (!values.returnCondition.trim()) {
      toast.error('Kondisi pengembalian harus diisi');
      return;
    }

    if (!values.paymentMethod) {
      toast.error('Metode pembayaran harus dipilih');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Get applied penalties
      const appliedPenalties = penalties.filter(p => p.applyPenalty);
      
      const requestBody = {
        rentalId: selectedRental.id,
        condition: values.returnCondition,
        penalties: appliedPenalties,
        paymentInfo: {
          receiptNumber: values.receiptNumber || `P${Date.now()}`,
          paymentMethod: values.paymentMethod,
          notes: values.notes,
          payNow: values.payNow,
          amount: totalPenaltyAmount
        }
      };
      
      const response = await fetch('/api/sewa/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process return');
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Pengembalian berhasil dikonfirmasi');
        fetchRentals(); // Refresh data
        setOpenReturnDialog(false); // Close dialog
      } else {
        throw new Error(result.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error confirming return:', error);
      toast.error(`Failed to confirm return: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredData = rentals.filter((rental) => {
    const keywordMatch =
      (rental.user.username?.toLowerCase() || '').includes(searchKeyword.toLowerCase()) ||
      (rental.items?.map(item => item.name).join(", ").toLowerCase() || '').includes(searchKeyword.toLowerCase()) ||
      (rental.status?.toLowerCase() || '').includes(searchKeyword.toLowerCase());
  
    let filterMatch = true;
  
    if (selectedFilter === "status" && filterValue) {
      filterMatch = rental.status.toLowerCase() === filterValue.toLowerCase();
    }
  
    if (selectedFilter === "bulan" && filterValue) {
      const bulan = (new Date(rental.start_date)).getMonth() + 1;
      filterMatch = bulan.toString().padStart(2, '0') === filterValue;
    }
  
    return keywordMatch && filterMatch;
  });
  
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

  // Format date as YYYY-MM-DD
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader/>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#3528AB]" />
              <p className="mt-2 text-gray-600">Loading rentals data...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader/>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <Tabs defaultValue="outline" className="flex w-full flex-col justify-start gap-6">
                <TabsContent value="outline" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
                  <h1 className="text-2xl font-bold">Manajemen Pengembalian</h1>
                  
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
                        <SelectItem value="bulan">Bulan</SelectItem>
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
                          <SelectItem value="pending">Menunggu</SelectItem>
                          <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                          <SelectItem value="active">Aktif</SelectItem>
                          <SelectItem value="completed">Selesai</SelectItem>
                          <SelectItem value="cancelled">Dibatalkan</SelectItem>
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
                          {Array.from({ length: 12 }, (_, i) => {
                            const month = i + 1;
                            const monthStr = month.toString().padStart(2, '0');
                            const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", 
                                             "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
                            return (
                              <SelectItem key={monthStr} value={monthStr}>
                                {monthNames[i]}
                              </SelectItem>
                            );
                          })}
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
                          <TableHead className="text-center">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentData.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center text-gray-500">
                              Tidak ada data pengembalian yang tersedia
                            </TableCell>
                          </TableRow>
                        ) : currentData.map((rental, index) => (
                          <TableRow
                            key={rental.id}
                            onClick={(e) => {
                              if (isRowClick(e)) {
                                handleRowClick(rental);
                              }
                            }}
                            className="cursor-pointer hover:bg-gray-100"
                          >                                
                            <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                            <TableCell>{rental.user.username}</TableCell>
                            <TableCell>{formatDate(rental.start_date)}</TableCell>
                            <TableCell>{formatDate(rental.end_date)}</TableCell>
                            <TableCell>
                              {rental.items.map(item => item.name).join(", ")}
                            </TableCell>
                            <TableCell>{formatCurrency(rental.totalAmount)}</TableCell>
                            <TableCell>
                              <StatusBadge status={rental.status} />
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-center items-center gap-1">
                                {rental.status === "confirmed" || rental.status === "active" ? (
                                  <Button 
                                    variant="default" 
                                    size="sm" 
                                    className="text-white bg-blue-500 hover:bg-blue-600" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenReturnDialog(rental);
                                    }}
                                  >
                                    Konfirmasi Kembali
                                  </Button>
                                ) : (
                                  <span className="text-gray-400 text-sm italic">
                                    {rental.status === "completed" ? "Sudah Dikembalikan" : 
                                     rental.status === "pending" ? "Belum Dikonfirmasi" : 
                                     rental.status === "cancelled" ? "Dibatalkan" : ""}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Simple Rental Detail Dialog */}
                  <Dialog
                    open={openDialog}
                    onOpenChange={(isOpen) => {
                      if (!isOpen) {
                        setOpenDialog(false);
                      }
                    }}
                  >
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Detail Penyewaan</DialogTitle>
                      </DialogHeader>
                      {selectedRental && (
                        <div className="space-y-2">
                          <p><strong>Penyewa:</strong> {selectedRental.user.username}</p>
                          <p><strong>Email:</strong> {selectedRental.user.email || '-'}</p>
                          <p><strong>No. Telepon:</strong> {selectedRental.user.phone || '-'}</p>
                          <p><strong>Alamat:</strong> {selectedRental.user.address || '-'}</p>
                          <p><strong>Tanggal Sewa:</strong> {formatDate(selectedRental.start_date)}</p>
                          <p><strong>Tanggal Kembali:</strong> {formatDate(selectedRental.end_date)}</p>
                          <p><strong>Total Bayar:</strong> {formatCurrency(selectedRental.totalAmount)}</p>
                          <p><strong>Status:</strong> <StatusBadge status={selectedRental.status} /></p>
                          
                          <div className="mt-4">
                            <p><strong>Barang yang Disewa:</strong></p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                              {selectedRental.items.map(item => (
                                <li key={item.id}>
                                  {item.name} ({item.quantity}x) - {formatCurrency(item.price)}/hari
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  {/* Return with Penalty Form Dialog */}
                  <Dialog
                    open={openReturnDialog}
                    onOpenChange={(isOpen) => {
                      if (!isOpen) {
                        setOpenReturnDialog(false);
                      }
                    }}
                  >
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Konfirmasi Pengembalian Barang</DialogTitle>
                      </DialogHeader>
                      
                      {selectedRental && (
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(handleReturnSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                              {/* Basic rental info */}
                              <div className="p-4 border rounded-md bg-gray-50">
                                <h3 className="text-sm font-medium mb-2">Data Penyewaan</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <p><span className="font-medium">Penyewa:</span> {selectedRental.user.username}</p>
                                  <p><span className="font-medium">ID Transaksi:</span> #{selectedRental.id}</p>
                                  <p><span className="font-medium">Tanggal Sewa:</span> {formatDate(selectedRental.start_date)}</p>
                                  <p><span className="font-medium">Tanggal Kembali:</span> {formatDate(selectedRental.end_date)}</p>
                                </div>
                                <div className="mt-2">
                                  <p className="text-sm"><span className="font-medium">Barang:</span> {selectedRental.items.map(item => `${item.name} (${item.quantity}x)`).join(", ")}</p>
                                </div>
                              </div>
                              
                              {/* Late status */}
                              {isLateReturn ? (
                                <Card className="border-yellow-300 bg-yellow-50">
                                  <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center text-yellow-800 text-base">
                                      <Clock className="mr-2 h-5 w-5" /> 
                                      Pengembalian Terlambat
                                    </CardTitle>
                                    <CardDescription className="text-yellow-700">
                                      Pengembalian terlambat {lateHours} jam dari tenggat waktu
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent className="pb-2">
                                    <div className="space-y-2">
                                      <h4 className="text-sm font-medium">Daftar Denda per Item:</h4>
                                      <Table>
                                        <TableHeader className="bg-yellow-100/50">
                                          <TableRow>
                                            <TableHead className="w-[40px]">Pilih</TableHead>
                                            <TableHead>Barang</TableHead>
                                            <TableHead className="text-right">Jumlah</TableHead>
                                            <TableHead className="text-right">Tarif Denda/Jam</TableHead>
                                            <TableHead className="text-right">Total Denda</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {penalties.map((penaltyItem, idx) => (
                                            <TableRow key={idx}>
                                              <TableCell>
                                                <Checkbox 
                                                  checked={penaltyItem.applyPenalty}
                                                  onCheckedChange={() => togglePenalty(idx)}
                                                />
                                              </TableCell>
                                              <TableCell>{penaltyItem.itemName}</TableCell>
                                              <TableCell className="text-right">{penaltyItem.quantity}x</TableCell>
                                              <TableCell className="text-right">
                                                {formatCurrency(penaltyItem.amount / (lateHours * penaltyItem.quantity))}
                                              </TableCell>
                                              <TableCell className="text-right">
                                                {formatCurrency(penaltyItem.amount)}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                      <div className="flex justify-end font-medium">
                                        Total Denda: {formatCurrency(totalPenaltyAmount)}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ) : (
                                <div className="flex items-center p-3 border rounded text-green-600 bg-green-50 border-green-200">
                                  <Check className="h-5 w-5 mr-2" />
                                  <span>Pengembalian tepat waktu, tidak ada denda.</span>
                                </div>
                              )}
                              
                              {/* Return condition */}
                              <FormField
                                control={form.control}
                                name="returnCondition"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Kondisi Pengembalian</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="Masukkan kondisi barang saat dikembalikan"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              {isLateReturn && totalPenaltyAmount > 0 && (
                                <>
                                  <div className="flex items-center space-x-2">
                                    <FileText className="h-5 w-5 text-gray-500" />
                                    <h3 className="font-medium">Informasi Pembayaran Denda</h3>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    <FormField
                                      control={form.control}
                                      name="payNow"
                                      render={({ field }) => (
                                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value}
                                              onCheckedChange={field.onChange}
                                            />
                                          </FormControl>
                                          <FormLabel className="font-normal">
                                            Bayar denda sekarang
                                          </FormLabel>
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                  
                                  {form.watch('payNow') && (
                                    <>
                                      <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                          control={form.control}
                                          name="receiptNumber"
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Nomor Kuitansi</FormLabel>
                                              <FormControl>
                                                <Input placeholder="Mis. RCPT-0001" {...field} />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                        
                                        <FormField
                                          control={form.control}
                                          name="paymentMethod"
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Metode Pembayaran</FormLabel>
                                              <Select 
                                                onValueChange={field.onChange} 
                                                defaultValue={field.value}
                                              >
                                                <FormControl>
                                                  <SelectTrigger>
                                                    <SelectValue placeholder="Pilih metode" />
                                                  </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                  <SelectItem value="CASH">Tunai</SelectItem>
                                                  <SelectItem value="TRANSFER">Transfer Bank</SelectItem>
                                                  <SelectItem value="QRIS">QRIS</SelectItem>
                                                  <SelectItem value="OTHER">Lainnya</SelectItem>
                                                </SelectContent>
                                              </Select>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                      </div>
                                      
                                      <FormField
                                        control={form.control}
                                        name="notes"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Catatan Pembayaran</FormLabel>
                                            <FormControl>
                                              <Textarea 
                                                placeholder="Tambahkan catatan terkait pembayaran (opsional)" 
                                                {...field} 
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                            
                            <DialogFooter>
                              <Button
                                type="button"
                                variant="outline" 
                                onClick={() => setOpenReturnDialog(false)}
                              >
                                Batal
                              </Button>
                              
                              <Button 
                                type="submit"
                                disabled={isProcessing}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                {isProcessing ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Memproses
                                  </>
                                ) : (
                                  <>
                                    <Receipt className="mr-2 h-4 w-4" />
                                    {isLateReturn && totalPenaltyAmount > 0 
                                      ? 'Konfirmasi Kembali & Denda' 
                                      : 'Konfirmasi Pengembalian'
                                    }
                                  </>
                                )}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      )}
                    </DialogContent>
                  </Dialog>

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
                            const pageToShow = totalPages <= 5 ? 
                              i + 1 : 
                              currentPage <= 3 ?
                                i + 1 :
                                currentPage >= totalPages - 2 ?
                                  totalPages - 4 + i :
                                  currentPage - 2 + i;
                                  
                            return (
                              <PaginationItem key={i}>
                                <PaginationLink
                                  isActive={currentPage === pageToShow}
                                  onClick={() => handlePageChange(pageToShow)}
                                >
                                  {pageToShow}
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
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>        
  )
}