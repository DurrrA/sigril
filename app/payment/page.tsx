"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Calendar, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

export default function PaymentPage() {
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState<"qris" | "cod">("qris")
  const [showQRCode, setShowQRCode] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value as "qris" | "cod")
    setShowQRCode(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (paymentMethod === "qris") {
      setShowQRCode(true)
    } else {
      // Handle COD payment process
      handlePaymentCompletion()
    }
  }

  const handlePaymentCompletion = () => {
    setIsProcessing(true)
    // Simulate payment processing
    setTimeout(() => {
      router.push("/payment/success")
    }, 1500)
  }

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <Link href="/booking/details" className="flex items-center text-sm mb-8">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Link>

      {/* Progress Steps */}
      <div className="flex justify-center mb-12">
        <div className="flex items-center w-full max-w-md">
          <div className="relative flex flex-col items-center">
            <div className="rounded-full bg-primary text-white flex items-center justify-center w-8 h-8 z-10">1</div>
            <div className="text-xs mt-2 text-primary">Booking Details</div>
          </div>
          <div className="flex-1 h-0.5 bg-primary"></div>
          <div className="relative flex flex-col items-center">
            <div className="rounded-full bg-primary text-white flex items-center justify-center w-8 h-8 z-10">2</div>
            <div className="text-xs mt-2 text-primary">Your Details</div>
          </div>
          <div className="flex-1 h-0.5 bg-primary"></div>
          <div className="relative flex flex-col items-center">
            <div className="rounded-full bg-primary text-white flex items-center justify-center w-8 h-8 z-10">3</div>
            <div className="text-xs mt-2 font-medium text-primary">Payment</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-xl font-medium mb-6">Pilih Metode Pembayaran</h2>

          {showQRCode ? (
            <div className="border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium mb-4">QRIS Payment</h3>
              <div className="flex flex-col items-center">
                <div className="border border-gray-200 p-4 rounded-lg mb-4">
                  <Image src="/images/qris-code.png" alt="QRIS Code" width={300} height={400} className="mx-auto" />
                </div>
                <p className="text-sm text-gray-500 mb-4 text-center">
                  Scan QRIS code above using your mobile banking or e-wallet app to complete payment for PERKAKASKU
                </p>
                <div className="flex gap-4 w-full">
                  <Button variant="outline" onClick={() => setShowQRCode(false)} className="flex-1">
                    Change Payment Method
                  </Button>
                  <Button onClick={handlePaymentCompletion} className="flex-1" disabled={isProcessing}>
                    {isProcessing ? "Processing..." : "Payment Complete"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <RadioGroup value={paymentMethod} onValueChange={handlePaymentMethodChange} className="space-y-4">
                <div className="border rounded-lg p-4 transition-all hover:border-primary">
                  <div className="flex items-start">
                    <RadioGroupItem value="qris" id="qris" className="mt-1" />
                    <div className="ml-3 w-full">
                      <Label htmlFor="qris" className="font-medium flex items-center">
                        <span>QRIS</span>
                      </Label>
                      <p className="text-sm text-gray-500 mt-1">
                        You will be redirected to the QRIS website after submitting your order
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4 transition-all hover:border-primary">
                  <div className="flex items-start">
                    <RadioGroupItem value="cod" id="cod" className="mt-1" />
                    <div className="ml-3 w-full">
                      <Label htmlFor="cod" className="font-medium flex items-center">
                        <span>Cash on Delivery (COD)</span>
                      </Label>
                      <p className="text-sm text-gray-500 mt-1">Pay with cash when your order is delivered</p>
                    </div>
                  </div>
                </div>
              </RadioGroup>

              <Button type="submit" className="w-full mt-6" disabled={isProcessing}>
                {isProcessing
                  ? "Processing..."
                  : paymentMethod === "qris"
                    ? "Lanjutkan ke Pembayaran"
                    : "Bayar Sekarang"}
              </Button>
            </form>
          )}
        </div>

        <div className="md:col-span-1">
          <div className="border rounded-lg p-6">
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

            <Button
              className="w-full mt-6 bg-orange-500 hover:bg-orange-600"
              disabled={isProcessing}
              onClick={handlePaymentCompletion}
            >
              {isProcessing ? "Processing..." : "Bayar Sekarang"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
