"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"
import { Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"

export default function BookingPage() {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = React.useState("14:00")
  const [pickupMethod, setPickupMethod] = React.useState("Ambil ke Toko")

  const items = [
    { id: 1, name: "Big Family Packages", date: selectedDate, time: selectedTime },
    { id: 2, name: "Big Family Packages", date: selectedDate, time: selectedTime },
    { id: 3, name: "Big Family Packages", date: selectedDate, time: selectedTime },
  ]

  const totalPrice = 75000

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      {/* Progress Bar */}
      <div className="flex justify-center mb-12">
        <div className="flex items-center w-full max-w-md">
          <div className="relative flex flex-col items-center">
            <div className="rounded-full bg-primary text-white flex items-center justify-center w-8 h-8 z-10">1</div>
            <div className="text-xs mt-2 font-medium text-primary">Booking Details</div>
          </div>
          <div className="flex-1 h-0.5 bg-primary"></div>
          <div className="relative flex flex-col items-center">
            <div className="rounded-full bg-gray-200 text-gray-600 flex items-center justify-center w-8 h-8 z-10">
              2
            </div>
            <div className="text-xs mt-2 text-gray-600">Your Details</div>
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

      {/* Main Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Booking Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-medium mb-6">Booking Details</h2>

            <div className="space-y-6">
              <div>
                <label className="font-medium block mb-2">Tanggal Peminjaman</label>
                <div className="border rounded-lg p-4">
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    modifiersClassNames={{
                      selected: "bg-primary text-white rounded-md",
                    }}
                    captionLayout="dropdown"
                    fromYear={2022}
                    toYear={2030}
                    className="mx-auto"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium block mb-2">Waktu</label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih waktu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10:00">10:00 WIB</SelectItem>
                    <SelectItem value="14:00">14:00 WIB</SelectItem>
                    <SelectItem value="18:00">18:00 WIB</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="font-medium block mb-2">Pengambilan Barang</label>
                <Select value={pickupMethod} onValueChange={setPickupMethod}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih metode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ambil ke Toko">Ambil ke Toko</SelectItem>
                    <SelectItem value="COD">COD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="md:col-span-1">
          <Card className="border">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-medium mb-4">Pemesanan</h3>

              {items.map((item) => (
                <div key={item.id} className="flex gap-4 mb-4 pb-4 border-b last:border-b-0 last:pb-0 last:mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center overflow-hidden">
                    <Image src="/placeholder.svg?height=64&width=64" alt="Package" width={64} height={64} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      <span>Sabtu, 12 April 2025</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      <span>{item.time} WIB</span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center font-medium">
                <span>Total Price</span>
                <span className="text-orange-500">Rp {totalPrice.toLocaleString("id-ID")}</span>
              </div>

              <Link href="/booking/details">
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">Lanjutkan</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
