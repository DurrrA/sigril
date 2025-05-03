"use client"

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
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"

const formSchema = z.object({
  nama: z.string().min(1, { message: "Nama barang wajib diisi" }),
  kategori: z.string(),
  harga: z.string(),
  stok: z.string(),
  penalti: z.string(),
  foto: z.any(),
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
      kategori: "",
      harga: "",
      stok: "",
      penalti: "",
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
          name="kategori"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategori</FormLabel>
              <FormControl>
                <Input placeholder="Kategori" {...field} />
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
                  <Input placeholder="Rp" {...field} />
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
          name="penalti"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Harga Penalti</FormLabel>
              <FormControl>
                <Input placeholder="Rp" {...field} />
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
                <Input type="file" onChange={(e) => field.onChange(e.target.files?.[0])} />
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
