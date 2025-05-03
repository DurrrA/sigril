import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { useEffect } from "react"

const formSchema = z.object({
  judul: z.string().min(1, { message: "Judul wajib diisi" }),
  id_tags: z.string().optional(),
  konten: z.string().min(1, { message: "Konten wajib diisi" }),
  publish_date: z.preprocess(
    (val) => (typeof val === "string" ? new Date(val) : val),
    z.date({ required_error: "Tanggal wajib diisi" })
  ),
  foto: z.any().refine((file) => file instanceof File || file?.length > 0, {
    message: "Foto wajib diunggah",
  }),
})

type FormBuatArtikelProps = {
  defaultValues?: {
    judul: string;
    tags?: string;
    konten: string;
    publish_date: Date;
    foto?: File | null;
  };
  onSubmitSuccess?: (data: any) => void;
}

export function FormBuatArtikel({ defaultValues, onSubmitSuccess }: FormBuatArtikelProps) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      judul: defaultValues?.judul ?? "",
      tags: defaultValues?.tags ?? "",
      konten: defaultValues?.konten ?? "",
      publish_date: defaultValues?.publish_date ?? new Date(),
      foto: undefined,
    },
  })

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        ...defaultValues,
        foto: undefined, // Reset file input saat edit
      })
    }
  }, [defaultValues, form])

  const onSubmit = (data: any) => {
    console.log("Submitted:", data)
    onSubmitSuccess?.(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Judul */}
        <FormField
          control={form.control}
          name="judul"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan judul artikel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tags */}
        <FormField
          control={form.control}
          name="id_tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tag</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Tag" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2">Loading tags...</span>
                    </div>
                  ) : (
                    tags.map((tag) => (
                      <SelectItem key={tag.id} value={tag.id.toString()}>
                        {tag.nama}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Konten */}
        <FormField
          control={form.control}
          name="konten"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Konten</FormLabel>
              <FormControl>
                <Textarea rows={5} placeholder="Tulis isi artikel di sini..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Publish Date */}
        <FormField
          control={form.control}
          name="publish_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Tanggal Publikasi</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value instanceof Date ? format(field.value, "PPP") : <span>Pilih tanggal</span>}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value as Date | undefined}
                    onSelect={field.onChange}
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Foto Upload */}
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
          <Button 
            type="submit" 
            className="bg-[#3528AB] text-white hover:bg-[#2e2397]"
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>

      </form>
    </Form>
  )
}
