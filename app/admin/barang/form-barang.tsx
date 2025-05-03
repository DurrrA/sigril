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

// Define our form schema
const formSchema = z.object({
  nama: z.string().min(1, { message: "Nama barang wajib diisi" }),
  kategori: z.string(),
  harga: z.string(),
  stok: z.string(),
  hargaPenalti: z.string(),
})

// Form data type based on schema
type FormData = z.infer<typeof formSchema>

// Complete data type including file
interface CompleteFormData extends FormData {
  foto: File | null
}

type FormBarangProps = {
  defaultValues?: Partial<FormData> & { foto?: File | null }
  onSubmitSuccess?: (data: CompleteFormData) => void
}

export function FormTambahBarang({ defaultValues, onSubmitSuccess }: FormBarangProps) {
  // State for file upload (handled separately from the form)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama: defaultValues?.nama || "",
      kategori: defaultValues?.kategori || "",
      harga: defaultValues?.harga || "",
      stok: defaultValues?.stok || "",
      hargaPenalti: defaultValues?.hargaPenalti || "",
    },
  })

  useEffect(() => {
    if (defaultValues?.foto) {
      setSelectedFile(defaultValues.foto)
    }
  }, [])

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        nama: defaultValues.nama || "",
        kategori: defaultValues.kategori || "",
        harga: defaultValues.harga || "",
        stok: defaultValues.stok || "",
        hargaPenalti: defaultValues.hargaPenalti || "",
      })

      if (defaultValues.foto) {
        setSelectedFile(defaultValues.foto)
      } else {
        setSelectedFile(null)
      }
    }
  }, [defaultValues, form])

  const onSubmit = (values: FormData) => {
    const completeData: CompleteFormData = {
      ...values,
      foto: selectedFile
    }
    
    if (defaultValues) {
      console.log("Edit barang:", completeData)
    } else {
      console.log("Barang baru:", completeData)
    }
    
    onSubmitSuccess?.(completeData)
  }
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)
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
          name="hargaPenalti"
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
        
        {/* Foto Upload - Handled separately from form validation */}
        <div className="space-y-2">
          <FormLabel htmlFor="foto">Foto</FormLabel>
          <Input 
            id="foto"
            type="file" 
            onChange={handleFileChange}
            accept="image/*" 
          />
        </div>
        
        <div className="pt-2 flex justify-end gap-2">
          <Button type="submit" className="bg-[#3528AB] hover:bg-[#2e2397] text-white">
            {defaultValues ? "Update" : "Simpan"}
          </Button>
        </div>
      </form>
    </Form>
  )
}