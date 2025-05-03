"use client"

import { useState, useEffect } from "react"
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
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"

const formSchema = z.object({
  nama: z.string().min(1, { message: "Nama barang wajib diisi" }),
  kategori_id: z.string().min(1, { message: "Kategori wajib dipilih" }),
  harga: z.string().min(1, { message: "Harga wajib diisi" }),
  stok: z.string().min(1, { message: "Stok wajib diisi" }),
  deskripsi: z.string().min(1, { message: "Deskripsi wajib diisi" }),
  harga_pinalti_per_jam: z.string().min(1, { message: "Harga penalti wajib diisi" }),
  foto: z.instanceof(File).optional(),
})

type FormBarangProps = {
  defaultValues?: {
    nama: string;
    kategori: string;
    harga: string;
    stok: string;
    penalti: string;
    foto?: any;
  };
}

export function FormTambahBarang({ defaultValues }: FormBarangProps) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama: "",
      kategori_id: "",
      harga: "",
      stok: "",
      deskripsi: "",
      harga_pinalti_per_jam: "",
      foto: undefined,
      ...defaultValues, // <-- kalau ada defaultValues, override
    },
  })

  // Supaya kalau defaultValues berubah (pas klik edit barang baru), form ikut update
  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  const onSubmit = (values: any) => {
    if (defaultValues) {
      console.log("Edit barang:", values)
    } else {
      console.log("Barang baru:", values)
    }
  }

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
        <FormField
          control={form.control}
          name="foto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Foto</FormLabel>
              <FormControl>
                <Input 
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      field.onChange(file);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="pt-2 flex justify-end gap-2">
          <Button type="submit" className="bg-[#3528AB] hover:bg-[#2e2397] text-white">
            {defaultValues ? "Update" : "Simpan"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
