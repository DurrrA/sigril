import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

// Import UI components
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

// Define our form schema
const formSchema = z.object({
  judul: z.string().min(1, { message: "Judul wajib diisi" }),
  tags: z.string().optional(),
  konten: z.string().min(1, { message: "Konten wajib diisi" }),
  publish_date: z.date({ required_error: "Tanggal wajib diisi" }),
})

// Form data type based on schema
type FormData = z.infer<typeof formSchema>

// Complete data type including file
interface CompleteFormData extends FormData {
  foto: File | null
}

// Define types for our component props
type FormBuatArtikelProps = {
  defaultValues?: Partial<FormData>
  onSubmitSuccess?: (data: CompleteFormData) => void
}

export function FormBuatArtikel({
  defaultValues,
  onSubmitSuccess,
}: FormBuatArtikelProps) {
  // State for file upload (handled separately from the form)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  // Setup the form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      judul: defaultValues?.judul || "",
      tags: defaultValues?.tags || "",
      konten: defaultValues?.konten || "",
      publish_date: defaultValues?.publish_date || new Date(),
    },
  })

  // Reset form when defaultValues change
  useEffect(() => {
    if (defaultValues) {
      form.reset({
        judul: defaultValues.judul || "",
        tags: defaultValues.tags || "",
        konten: defaultValues.konten || "",
        publish_date: defaultValues.publish_date || new Date(),
      })
      setSelectedFile(null)
    }
  }, [defaultValues, form])

  // Form submission handler
  const onSubmit = (data: FormData) => {
    // Combine form data with the file
    const completeData: CompleteFormData = {
      ...data,
      foto: selectedFile
    }
    
    console.log("Submitted:", completeData)
    onSubmitSuccess?.(completeData)
  }

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)
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
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input placeholder="Pisahkan dengan koma" {...field} />
              </FormControl>
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
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP") : <span>Pilih tanggal</span>}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Foto Upload - Handled outside the form control */}
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
          <Button type="submit" className="bg-[#3528AB] text-white hover:bg-[#2e2397]">
            Simpan
          </Button>
        </div>
      </form>
    </Form>
  )
}