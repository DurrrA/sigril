"use client"

import { ArrowLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PaymentSuccessPage() {
  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <div className="flex items-center text-sm mb-8">
        <Link href="/payment" className="flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Link>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center">
        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-6">
          <Check className="h-10 w-10 text-white" />
        </div>

        <h1 className="text-2xl font-bold mb-2">Pemesanan Kamu Sudah Berhasil!</h1>
        <p className="text-gray-500 mb-8">Tunggu dan kami akan segera memprosesnya</p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/">
            <Button variant="outline" className="rounded-full px-6">
              Kembali ke Halaman Utama
            </Button>
          </Link>
          <Link href="/pesanan-saya">
            <Button className="rounded-full px-6">Lihat Pesanan Saya</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
