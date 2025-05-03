"use client"

import { PencilIcon, TrashIcon, PlusIcon, Loader2 } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog"
import { FormTambahBarang } from "@/app/admin/barang/form-barang"
import { FormEditBarang } from "@/app/admin/barang/form-edit-barang"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"
import { SiteHeader } from "@/components/site-header"
import { Tabs, TabsContent, } from "@/components/ui/tabs"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Barang, BarangResponse } from "@/interfaces/barang.interfaces";

export default function PageBarang() {
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBarang, setSelectedBarang] = useState<Barang | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; barang: Barang | null }>({
    open: false, 
    barang: null
  });

  // Fetch barang data on component mount
  useEffect(() => {
    fetchBarangData();
  }, []);

  const fetchBarangData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/barang');
      
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      
      const data: BarangResponse = await response.json();
      setBarangList(data.data || []);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Failed to load items. Please try again later.');
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.barang) return;
    
    try {
      const response = await fetch(`/api/barang/${deleteDialog.barang.id}`, {
        method: 'DELETE',
      });
      
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

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    fetchBarangData();
    toast.success('Item berhasil ditambahkan');
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setSelectedBarang(null);
    fetchBarangData();
    toast.success('Item berhasil diperbarui');
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset className="bg-white rounded-l-xl">
        <SiteHeader />
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                  <Tabs
                    defaultValue="outline"
                    className="flex w-full flex-col justify-start gap-6"
                  >
                    <h1 className="text-2xl font-bold lg:px-6">Manajemen Barang</h1>
                    <div className="realtive flex items-center gap-4 px-4 lg:px-6">
                      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="default" size="default" className="text-white bg-[#3528AB] hover:bg-[#2e2397]">
                            <PlusIcon className="h-4 w-4" />
                            <span className="hidden lg:inline">Tambah Barang</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Tambah Barang Baru</DialogTitle>
                          </DialogHeader>
                          <FormTambahBarang onSuccess={handleCreateSuccess} />
                        </DialogContent>
                      </Dialog>
                    </div>
                    <TabsContent
                      value="outline"
                      className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
                    >
                      {loading ? (
                        <div className="flex justify-center items-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <p className="ml-2 text-lg text-muted-foreground">Memuat data barang...</p>
                        </div>
                      ) : error ? (
                        <div className="flex justify-center items-center py-12">
                          <p className="text-lg text-red-500">{error}</p>
                          <Button onClick={fetchBarangData} variant="outline" className="ml-4">
                            Coba lagi
                          </Button>
                        </div>
                      ) : (
                        <div className="overflow-auto rounded-lg border">
                          <Table>
                            <TableHeader className="sticky top-0 z-10 bg-muted text-white [&_th]:text-white">
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
                              {barangList.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={8} className="text-center py-8">
                                    Tidak ada barang ditemukan
                                  </TableCell>
                                </TableRow>
                              ) : (
                                barangList.map((barang, index) => (
                                  <TableRow key={barang.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{barang.nama}</TableCell>
                                    <TableCell>{barang.kategori?.nama || '-'}</TableCell>
                                    <TableCell>Rp{barang.harga.toLocaleString()}</TableCell>
                                    <TableCell>{barang.stok}</TableCell>
                                    <TableCell>Rp{barang.harga_pinalti_per_jam.toLocaleString()}</TableCell>
                                    <TableCell>
                                      {barang.foto ? (
                                        <Image 
                                          src={barang.foto}
                                          alt={barang.nama}
                                          width={50}
                                          height={50}
                                          className="rounded-md object-cover inline-block"
                                        />
                                      ) : (
                                        <div className="w-[50px] h-[50px] bg-gray-200 rounded-md flex items-center justify-center">
                                          <span className="text-xs text-gray-500">No image</span>
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
                                      
                                      <AlertDialog
                                        open={deleteDialog.open && deleteDialog.barang?.id === barang.id}
                                        onOpenChange={(open) => {
                                            setDeleteDialog({
                                            open: open,
                                            barang: open ? barang : null
                                            });
                                        }}
                                        >
                                        <AlertDialogTrigger asChild>
                                          <Button
                                            size="icon"
                                            className="bg-red-500 hover:bg-red-600 text-white"
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
                                              Data barang <strong>{barang.nama}</strong> akan dihapus secara permanen.
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
      </SidebarInset>
    </SidebarProvider>
  )
}