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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"

interface Tag {
  id: number;
  nama: string;
}

interface Article {
  id: number;
  judul: string;
  konten: string;
  foto: string;
  publishAt: string;
  is_published: boolean;
  id_tags: number | null;
  tags: {
    id: number;
    nama: string;
  } | null;
}

const formSchema = z.object({
  judul: z.string().min(1, { message: "Judul wajib diisi" }),
  id_tags: z.string().optional(),
  konten: z.string().min(1, { message: "Konten wajib diisi" }),
  publish_date: z.date({ required_error: "Tanggal wajib diisi" }),
  foto: z.union([z.instanceof(File), z.string()]).optional(),
});

interface FormEditArtikelProps {
  article: Article;
  onSuccess: () => void;
}

export function FormEditArtikel({ article, onSuccess }: FormEditArtikelProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewImage, ] = useState<string | null>(article.foto || null);

  // Fetch tags on component mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags');
        if (response.ok) {
          const data = await response.json();
          setTags(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching tags:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      judul: article.judul,
      id_tags: article.id_tags?.toString() || "",
      konten: article.konten,
      publish_date: new Date(article.publishAt),
      foto: article.foto,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Handle image upload if it's a new file
      let imageUrl = typeof values.foto === "string" ? values.foto : "";
      
      if (values.foto instanceof File) {
        const formData = new FormData();
        formData.append("file", values.foto);
        
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image");
        }
        
        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.url;
      }
      
      // Update article
      const articleData = {
        judul: values.judul,
        konten: values.konten,
        id_tags: values.id_tags ? parseInt(values.id_tags) : null,
        publishAt: values.publish_date.toISOString(),
        is_published: article.is_published,
        foto: imageUrl,
      };
      
      const response = await fetch(`/api/artikel/${article.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(articleData),
      });

      if (!response.ok) {
        throw new Error("Failed to update article");
      }

      onSuccess();
    } catch (error) {
      console.error("Error updating article:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                value={field.value}
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
                  selected={field.value}
                  onSelect={field.onChange}
                />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Current Image Preview */}
        {previewImage && (
          <div className="space-y-2">
            <FormLabel>Foto Saat Ini</FormLabel>
            <div className="relative h-40 w-full border rounded">
              <Image 
                src={previewImage}
                alt="Article preview"
                fill
                className="object-contain"
              />
            </div>
          </div>
        )}

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
            {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}