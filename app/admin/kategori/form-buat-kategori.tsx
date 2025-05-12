"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FormBuatKategoriProps {
  onSubmitSuccess: () => void;
}

export function FormBuatKategori({ onSubmitSuccess }: FormBuatKategoriProps) {
  const [nama, setNama] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/kategori", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama }),
      });

      if (!res.ok) throw new Error("Gagal menambah kategori");

      toast.success("Kategori berhasil ditambahkan");
      setNama("");
      onSubmitSuccess();
    } catch {
      setError("Terjadi kesalahan saat menyimpan kategori.");
      toast.error("Gagal menyimpan kategori");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Tambah Kategori</h2>
      <Input
        placeholder="Nama kategori"
        value={nama}
        onChange={(e) => setNama(e.target.value)}
        required
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-[#3528AB] text-white hover:bg-[#2e2397]"
      >
        {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
        Simpan
      </Button>
    </form>
  );
}
