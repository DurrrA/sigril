"use client"
import { Calendar, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"

export default function BookingStepTwo() {
  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      {/* Progress Bar */}
      <div className="flex justify-center mb-12">
        <div className="flex items-center w-full max-w-md">
          <div className="relative flex flex-col items-center">
            <div className="rounded-full bg-primary text-white flex items-center justify-center w-8 h-8 z-10">1</div>
            <div className="text-xs mt-2 text-primary">Booking Details</div>
          </div>
          <div className="flex-1 h-0.5 bg-primary"></div>
          <div className="relative flex flex-col items-center">
            <div className="rounded-full bg-primary text-white flex items-center justify-center w-8 h-8 z-10">2</div>
            <div className="text-xs mt-2 font-medium text-primary">Your Details</div>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200"></div>
          <div className="relative flex flex-col items-center">
            <div className="rounded-full bg-gray-200 text-gray-600 flex items-center justify-center w-8 h-8 z-10">
              3
            </div>
            <div className="text-xs mt-2 text-gray-600">Payment</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side: Form Input */}
        <div className="md:col-span-2">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-medium mb-6">Identitas Pemesan</h2>

            <div className="space-y-4">
              <div>
                <label className="font-medium block mb-2">Nama Lengkap</label>
                <Input placeholder="Masukkan nama lengkap" className="w-full" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-medium block mb-2">Nomor Telepon</label>
                  <Input placeholder="Masukkan nomor telepon" />
                </div>
                <div>
                  <label className="font-medium block mb-2">Email</label>
                  <Input placeholder="Masukkan alamat email" />
                </div>
              </div>

              <div>
                <label className="font-medium block mb-2">Alamat</label>
                <Textarea placeholder="Masukkan alamat lengkap" rows={4} />
              </div>

              <div className="bg-gray-100 p-4 rounded-md text-sm text-gray-700">
                <h3 className="font-medium mb-2">Ketentuan:</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Bersedia menyerahkan identitas pribadi (KTP/SIM) sebagai jaminan.</li>
                  <li>Jika tidak mau menyerahkan, maka bersedia membayar uang deposit sebagai jaminan peminjaman.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Ringkasan Pesanan */}
        <div className="md:col-span-1">
          <Card className="border">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-medium mb-4">Pemesanan</h3>

              {[1, 2, 3].map((item) => (
                <div key={item} className="flex gap-4 mb-4 pb-4 border-b last:border-b-0 last:pb-0 last:mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center overflow-hidden">
                    <Image src="/placeholder.svg?height=64&width=64" alt="Package" width={64} height={64} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Big Family Packages</h4>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      <span>Sabtu, 12 April 2025</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      <span>14:00 WIB</span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center font-medium">
                <span>Total Price</span>
                <span className="text-orange-500">Rp 75.000</span>
              </div>

              <Link href="/payment">
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">Lanjutkan ke Pembayaran</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
