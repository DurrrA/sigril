"use client"

import { useState } from "react"
import Image from "next/image"
import { Calendar, Clock, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

// Sample data for orders with only COD and QRIS payment methods
const initialOrders = [
  {
    id: 1,
    name: "Big Family Packages",
    date: "Sabtu, 12 April 2025",
    time: "14:00 WIB",
    paymentMethod: "QRIS",
    price: 75000,
    status: "upcoming",
    reviewed: false,
  },
  {
    id: 2,
    name: "Big Family Packages",
    date: "Sabtu, 12 April 2025",
    time: "14:00 WIB",
    paymentMethod: "COD",
    price: 25000,
    status: "ended",
    reviewed: false,
  },
  {
    id: 3,
    name: "Big Family Packages",
    date: "Sabtu, 12 April 2025",
    time: "14:00 WIB",
    paymentMethod: "QRIS",
    price: 25000,
    status: "ended",
    reviewed: true,
  },
]

export default function PesananSayaPage() {
  const [orders, setOrders] = useState(initialOrders)
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null)
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState("")

  const handleOpenReview = (orderId: number) => {
    setCurrentOrderId(orderId)
    setRating(0)
    setReviewText("")
    setIsReviewOpen(true)
  }

  const handleSubmitReview = () => {
    if (currentOrderId) {
      setOrders(
        orders.map((order) =>
          order.id === currentOrderId
            ? {
                ...order,
                reviewed: true,
              }
            : order,
        ),
      )
      setIsReviewOpen(false)
    }
  }

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Pesanan Saya</h1>
      </div>

      <div className="border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-5 bg-gray-50 p-4 border-b">
          <div className="col-span-1 font-medium">Package</div>
          <div className="col-span-1 font-medium">Payment Method</div>
          <div className="col-span-1 font-medium">Price</div>
          <div className="col-span-1 font-medium">Status</div>
          <div className="col-span-1 font-medium">Review</div>
        </div>

        {/* Order Items */}
        {orders.map((order) => (
          <div key={order.id} className="grid grid-cols-5 p-4 border-b items-center">
            <div className="col-span-1">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center overflow-hidden">
                  <Image src="/placeholder.svg?height=64&width=64" alt="Package" width={64} height={64} />
                </div>
                <div>
                  <h3 className="font-medium">{order.name}</h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    <span>{order.date}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    <span>{order.time}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-1">
              <div className="flex items-center gap-2">
                {order.paymentMethod === "QRIS" ? (
                  <div className="w-8 h-5 bg-gray-200 flex items-center justify-center rounded">
                    <span className="text-xs font-medium">QR</span>
                  </div>
                ) : (
                  <div className="w-8 h-5 bg-gray-200 flex items-center justify-center rounded">
                    <span className="text-xs font-medium">COD</span>
                  </div>
                )}
                <span>{order.paymentMethod}</span>
              </div>
            </div>

            <div className="col-span-1 font-medium">Rp {order.price.toLocaleString("id-ID")}</div>

            <div className="col-span-1">
              {order.status === "upcoming" ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-yellow-500">Upcoming</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-500">Ended</span>
                </div>
              )}
            </div>

            <div className="col-span-1">
              {order.status === "ended" && !order.reviewed ? (
                <Button
                  variant="ghost"
                  className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 flex items-center gap-1"
                  onClick={() => handleOpenReview(order.id)}
                >
                  <Star className="h-4 w-4" />
                  Beri Review
                </Button>
              ) : order.status === "ended" && order.reviewed ? (
                <div className="flex items-center gap-1 text-orange-500">
                  <Star className="h-4 w-4 fill-orange-500" />
                  <span>Review</span>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* Review Dialog */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Berikan Review</DialogTitle>
            <DialogDescription>
              Bagaimana pengalaman Anda dengan produk ini? Review Anda akan membantu pengguna lain.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="flex items-center justify-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none">
                  <Star className={`h-8 w-8 ${rating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="review">Komentar</Label>
              <Textarea
                id="review"
                placeholder="Tulis komentar Anda di sini..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmitReview} disabled={rating === 0}>
              Kirim Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
