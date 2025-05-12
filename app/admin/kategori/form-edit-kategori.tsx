"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { Kategori } from "@/interfaces/kategori.interfaces"
import { toast } from "sonner"

interface FormEditKategoriProps {
  kategori: Kategori;
  onSuccess?: () => void;
}

export function FormEditKategori({ kategori, onSuccess }: FormEditKategoriProps) {
  const [nama, setNama] = useState(kategori.nama)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/kategori/${kategori.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error?.error || "Gagal mengedit kategori")
      }

      toast.success("Kategori berhasil diperbarui")
      if (onSuccess) onSuccess()
    } catch (err) {
      console.error(err)
      toast.error((err as Error).message || "Terjadi kesalahan saat mengedit kategori")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">Edit Kategori</h2>
      <Input
        placeholder="Nama kategori"
        value={nama}
        onChange={(e) => setNama(e.target.value)}
        required
      />
      <Button type="submit" disabled={loading} className="w-full bg-[#3528AB] text-white hover:bg-[#2e2397]">
        {loading && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
        Simpan Perubahan
      </Button>
    </form>
  )
}
