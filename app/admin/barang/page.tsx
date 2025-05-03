"use client"

import { PencilIcon, TrashIcon, PlusIcon } from "lucide-react";
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
import { Dialog, DialogContent,  DialogTrigger} from "@/components/ui/dialog"
import { FormTambahBarang } from "@/app/admin/barang/form-barang"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"
import { SiteHeader } from "@/components/site-header"
import { Tabs, TabsContent, } from "@/components/ui/tabs"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useState } from "react";

const dummyBarang = [
  {
    id: 1,
    nama: "Capit",
    kategori: "Grill",
    harga: 20000,
    stok: 30,
    hargaPenalti: 5000,
  },
]

export default function PageBarang() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const handleDelete = () => {
    console.log(`Hapus item: $itemName`)
    setSelectedItem(null)
  }

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
                      <Dialog>
                        
                        <DialogTrigger asChild>
                          <Button variant="default" size="default" className="text-white bg-[#3528AB] hover:bg-[#2e2397]">
                            <PlusIcon className="h-4 w-4" />
                            <span className="hidden lg:inline">Tambah Barang</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <FormTambahBarang />
                        </DialogContent>
                      </Dialog>
                    </div>
                    <TabsContent
                      value="outline"
                      className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
                    >
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
                              {dummyBarang.map((data, index) => (
                                <TableRow key={data.id}>
                                  <TableCell>{index + 1}</TableCell>
                                  <TableCell>{data.nama}</TableCell>
                                  <TableCell>{data.kategori}</TableCell>
                                  <TableCell>Rp{data.harga.toLocaleString()}</TableCell>
                                  <TableCell>{data.stok}</TableCell>
                                  <TableCell>Rp{data.hargaPenalti.toLocaleString()}</TableCell>
                                  <TableCell><Image src="/images/logo_kenamplan.png"
                                  alt="Foto Capit"
                                  width={50}
                                  height={50}
                                  className="rounded-md object-cover inline-block"/></TableCell>
                                  <TableCell className="flex justify-center gap-2 py-2">
                                    <Button variant="default" size="icon" className="text-white bg-yellow-500 hover:bg-yellow-600">
                                      <PencilIcon className="h-4 w-4" />
                                    </Button>
                                    
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          size="icon"
                                          className="bg-red-500 hover:bg-red-600 text-white"
                                          onClick={() => setSelectedItem("Capit")}
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
                                            onClick={() => handleDelete()}
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
                      
                    </TabsContent>
                  </Tabs>  
                </div>
            </div>
        </div>
    
      </SidebarInset>
    </SidebarProvider>
  )
}