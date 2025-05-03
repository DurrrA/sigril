import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

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
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select"

// Define tag interface
interface Tag {
  id: number;
  nama: string;
}

// Define our form schema
const formSchema = z.object({
  judul: z.string().min(1, { message: "Judul wajib diisi" }),
  id_tags: z.string().optional(),
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
  
  // Mock loading state and tags data (these need to be defined or fetched from somewhere)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [tags, setTags] = useState<Tag[]>([])

  // Setup the form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      judul: defaultValues?.judul || "",
      id_tags: defaultValues?.id_tags || "",
      konten: defaultValues?.konten || "",
      publish_date: defaultValues?.publish_date || new Date(),
    },
  })

  // Fetch tags (mock implementation)
  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true)
      try {
        // Replace with actual API call
        const mockTags = [
          { id: 1, nama: "Technology" },
          { id: 2, nama: "Health" },
          { id: 3, nama: "Education" }
        ]
        setTags(mockTags)
      } catch (error) {
        console.error("Error fetching tags:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTags()
  }, [])

  // Reset form when defaultValues change
  useEffect(() => {
    if (defaultValues) {
      form.reset({
        judul: defaultValues.judul || "",
        id_tags: defaultValues.id_tags || "",
        konten: defaultValues.konten || "",
        publish_date: defaultValues.publish_date || new Date(),
      })
      setSelectedFile(null)
    }
  }, [defaultValues, form])

  // Form submission handler
  const onSubmit = (data: FormData) => {
    setIsSubmitting(true)
    // Combine form data with the file
    const completeData: CompleteFormData = {
      ...data,
      foto: selectedFile
    }
    
    console.log("Submitted:", completeData)
    onSubmitSuccess?.(completeData)
    setIsSubmitting(false)
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