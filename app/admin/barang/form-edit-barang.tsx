"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Barang, kategori } from "@/interfaces/barang.interfaces"
import Image from "next/image"

const formSchema = z.object({
  nama: z.string().min(1, { message: "Nama barang wajib diisi" }),
  kategori_id: z.string().min(1, { message: "Kategori wajib dipilih" }),
  harga: z.string().min(1, { message: "Harga wajib diisi" }),
  stok: z.string().min(1, { message: "Stok wajib diisi" }),
  deskripsi: z.string().min(1, { message: "Deskripsi wajib diisi" }),
  harga_pinalti_per_jam: z.string().min(1, { message: "Harga penalti wajib diisi" }),
})

type FormData = z.infer<typeof formSchema>

interface FormEditBarangProps {
  barang: Barang;
  onSuccess: () => void;
}

// Helper function to safely handle image paths
const getImagePath = (path: string | null | undefined): string => {
  if (!path) return '/placeholder-image.png';
  if (path.startsWith('/') || path.startsWith('http')) return path;
  return `/${path}`;
};

export function FormEditBarang({ barang, onSuccess }: FormEditBarangProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(barang.foto);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingKategori, setLoadingKategori] = useState(true);
  const [kategoriList, setKategoriList] = useState<kategori[]>([]);
  
  // Set up form with default values from barang
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama: barang.nama,
      kategori_id: barang.kategori_id.toString(),
      harga: barang.harga.toString(),
      stok: barang.stok.toString(),
      deskripsi: barang.deskripsi,
      harga_pinalti_per_jam: barang.harga_pinalti_per_jam.toString(),
    },
  });

  // Fetch categories
  useEffect(() => {
    fetchKategori();
  }, []);
  
  const fetchKategori = async () => {
    try {
      const response = await fetch('/api/kategori');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setKategoriList(data.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('Failed to load categories');
    } finally {
      setLoadingKategori(false);
    }
  };

  const onSubmit = async (values: FormData) => {
    try {
      setIsSubmitting(true);
      
      // Handle file upload first if there's a new image
      let imagePath = barang.foto; // Keep existing image by default
      
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image");
        }
        
        const uploadData = await uploadResponse.json();
        imagePath = uploadData.url; // This will be a relative path like /uploads/image.jpg
      }
      
      // Then update the barang 
      const barangData = {
        nama: values.nama,
        kategori_id: parseInt(values.kategori_id),
        harga: parseInt(values.harga),
        stok: parseInt(values.stok),
        deskripsi: values.deskripsi,
        harga_pinalti_per_jam: parseInt(values.harga_pinalti_per_jam),
        foto: imagePath,
      };
      
      const response = await fetch(`/api/barang/${barang.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(barangData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update item");
      }

      onSuccess();
    } catch (err) {
      console.error("Error updating item:", err);
      toast.error((err as Error).message || "Failed to update item");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file selection with preview
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
      
      // Clean up URL when component unmounts
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nama"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Barang</FormLabel>
              <FormControl>
                <Input placeholder="Nama barang" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="kategori_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategori</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {loadingKategori ? (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2">Loading...</span>
                    </div>
                  ) : (
                    kategoriList.map((kategori) => (
                      <SelectItem key={kategori.id} value={kategori.id.toString()}>
                        {kategori.nama}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="deskripsi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea placeholder="Deskripsi barang" rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="harga"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga</FormLabel>
                <FormControl>
                  <Input placeholder="Rp" type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stok"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stok</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="harga_pinalti_per_jam"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Harga Penalti (per jam)</FormLabel>
              <FormControl>
                <Input placeholder="Rp" type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Current image and file upload */}
        <div className="space-y-4">
          {previewImage && (
            <div className="space-y-2">
              <FormLabel>Foto Saat Ini</FormLabel>
              <div className="relative h-40 w-full border rounded">
                <Image 
                  src={getImagePath(previewImage)}
                  alt="Barang preview"
                  fill
                  className="object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-image.png';
                  }}
                />
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <FormLabel htmlFor="foto">Ganti Foto (opsional)</FormLabel>
            <Input 
              id="foto" 
              type="file" 
              accept="image/*"
              onChange={handleFileSelect}
            />
          </div>
        </div>
        
        <div className="pt-2 flex justify-end gap-2">
          <Button 
            type="submit" 
            className="bg-[#3528AB] hover:bg-[#2e2397] text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}