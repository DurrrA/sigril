"use client";

import { useState, useEffect } from "react";
import { PencilIcon, TrashIcon, PlusIcon, Loader2 } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { FormBuatKategori } from "./form-buat-kategori";
import { FormEditKategori } from "./form-edit-kategori";
import { Kategori } from "@/interfaces/kategori.interfaces";
import { toast } from "sonner";
import { DialogTitle } from "@radix-ui/react-dialog";

export default function PageKategori() {
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTambahOpen, setIsTambahOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedKategori, setSelectedKategori] = useState<Kategori | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Fetch categories from API
  useEffect(() => {
    fetchKategori();
  }, []);

  const fetchKategori = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/kategori");
      const data = await res.json();
      if (!res.ok) {
        throw new Error("Gagal memuat data kategori.");
      }
      setKategoriList(data.data || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Gagal memuat data kategori.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Delete Category
  const handleDelete = async () => {
    if (!selectedId) return;

    try {
      const res = await fetch(`/api/kategori/${selectedId}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400) {
          toast.error(data.message || "Kategori masih digunakan oleh barang.");
        } else {
          toast.error("Gagal menghapus kategori.");
        }
        return;
      }

      toast.success("Kategori berhasil dihapus.");
      fetchKategori(); // Refresh the categories
      setSelectedId(null); // Reset selectedId after deletion
    } catch (error) {
      toast.error("Terjadi kesalahan saat menghapus kategori.");
    }
  };

  // Handle Edit Category
  const handleEdit = (kategori: Kategori) => {
    setSelectedKategori(kategori);
    setIsEditOpen(true);
  };

  // Filter categories based on search input
  const filteredKategori = kategoriList.filter((k) =>
    k.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main className="p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h1 className="text-2xl font-bold">Manajemen Kategori</h1>

            <div className="flex gap-2">
              <Input
                placeholder="Cari kategori..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-[200px]"
              />
              <Dialog open={isTambahOpen} onOpenChange={setIsTambahOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#3528AB] text-white hover:bg-[#2e2397]">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Tambah
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <FormBuatKategori
                    onSubmitSuccess={() => {
                      setIsTambahOpen(false);
                      fetchKategori();
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-[#3528AB]">
                <TableRow>
                  <TableHead className="w-12 text-white">No</TableHead>
                  <TableHead className="text-white">Nama</TableHead>
                  <TableHead className="text-center text-white">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6">
                      <Loader2 className="animate-spin inline-block mr-2" />
                      Memuat...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-red-500">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : filteredKategori.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      Tidak ada kategori ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredKategori.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.nama}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            size="icon"
                            className="bg-yellow-500 hover:bg-yellow-600 text-white"
                            onClick={() => handleEdit(item)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="icon"
                                className="bg-red-500 hover:bg-red-600 text-white"
                                onClick={() => setSelectedId(item.id)} // Set selected ID for deletion
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Konfirmasi Hapus
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Yakin ingin menghapus kategori ini?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500 hover:bg-red-600 text-white"
                                  onClick={handleDelete} // Execute delete when confirmed
                                >
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTitle>
              <DialogContent className="max-w-md">
                {selectedKategori && (
                  <FormEditKategori
                    kategori={selectedKategori}
                    onSuccess={() => {
                      setIsEditOpen(false);
                      fetchKategori();
                    }}
                  />
                )}
              </DialogContent>
            </DialogTitle>
          </Dialog>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
