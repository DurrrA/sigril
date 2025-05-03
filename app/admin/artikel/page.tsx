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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"
import { SiteHeader } from "@/components/site-header"
import { Tabs, TabsContent, } from "@/components/ui/tabs"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useState, useEffect } from "react";
import { FormBuatArtikel } from "./form-artikel";
import { toast } from "sonner";
import { FormEditArtikel } from "./form-edit-artikel";
import { Artikel } from "@/interfaces/artikel.interfaces";
// Define the Article interface based on your API response


export default function PageArtikel() {
  const [articles, setArticles] = useState<Artikel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Artikel | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; article: Artikel | null }>({
    open: false, 
    article: null
  });

  // Fetch articles on component mount
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/artikel');
      
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      
      const data = await response.json();
      setArticles(data.data || []);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Failed to load articles. Please try again later.');
      toast.error('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.article) return;
    
    try {
      const response = await fetch(`/api/artikel/${deleteDialog.article.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete article');
      }
      
      // Remove the deleted article from the state
      setArticles(prevArticles => 
        prevArticles.filter(article => article.id !== deleteDialog.article?.id)
      );
      
      toast.success('Artikel berhasil dihapus');
    } catch (err) {
      console.error('Error deleting article:', err);
      toast.error('Gagal menghapus artikel');
    } finally {
      setDeleteDialog({ open: false, article: null });
    }
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    fetchArticles();
    toast.success('Artikel berhasil dibuat');
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setSelectedArticle(null);
    fetchArticles();
    toast.success('Artikel berhasil diperbarui');
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Truncate text for display
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                  <Tabs
                    defaultValue="outline"
                    className="flex w-full flex-col justify-start gap-6"
                  >
                    <h1 className="text-2xl font-bold lg:px-6">Manajemen Artikel</h1>
                    <div className="realtive flex items-center gap-4 px-4 lg:px-6">
                      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="default" size="default" className="text-white bg-[#3528AB] hover:bg-[#2e2397]">
                            <PlusIcon className="h-4 w-4" />
                            <span className="hidden lg:inline">Buat Artikel</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Buat Artikel Baru</DialogTitle>
                          </DialogHeader>
                          <FormBuatArtikel onSuccess={handleCreateSuccess} />
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
                          <p className="ml-2 text-lg text-muted-foreground">Memuat artikel...</p>
                        </div>
                      ) : error ? (
                        <div className="flex justify-center items-center py-12">
                          <p className="text-lg text-red-500">{error}</p>
                          <Button onClick={fetchArticles} variant="outline" className="ml-4">
                            Coba lagi
                          </Button>
                        </div>
                      ) : (
                        <div className="overflow-auto rounded-lg border">
                          <Table>
                            <TableHeader className="sticky top-0 z-10 bg-muted text-white [&_th]:text-white">
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
                              {articles.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={7} className="text-center py-8">
                                    Tidak ada artikel ditemukan
                                  </TableCell>
                                </TableRow>
                              ) : (
                                articles.map((article, index) => (
                                  <TableRow className="break-words whitespace-normal" key={article.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{article.judul}</TableCell>
                                    <TableCell>{article.tags?.nama || '-'}</TableCell>
                                    <TableCell>{truncateText(article.konten, 100)}</TableCell>
                                    <TableCell>{formatDate(article.publishAt)}</TableCell>
                                    <TableCell>
                                      {article.foto ? (
                                        <Image 
                                          src={article.foto}
                                          alt={article.judul}
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
                                          setSelectedArticle(article);
                                          setIsEditDialogOpen(true);
                                        }}
                                      >
                                        <PencilIcon className="h-4 w-4" />
                                      </Button>
                                      
                                      <Button
                                        size="icon"
                                        className="bg-red-500 hover:bg-red-600 text-white"
                                        onClick={() => setDeleteDialog({ open: true, article })}
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
              <DialogTitle>Edit Artikel</DialogTitle>
            </DialogHeader>
            {selectedArticle && (
              <FormEditArtikel 
                article={selectedArticle} 
                onSuccess={handleEditSuccess} 
              />
            )}
          </DialogContent>
        </Dialog>
        
        {/* Delete Dialog */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(isOpen) => 
          setDeleteDialog(prev => ({ ...prev, open: isOpen }))
        }>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Yakin ingin menghapus artikel ini?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Data artikel <strong>{deleteDialog.article?.judul}</strong> akan dihapus secara permanen.
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
  )
}