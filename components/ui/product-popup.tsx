"use client"

import React, { useState, useEffect } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import {
  Calendar,
  CheckCircle2,
  Info,
  Loader2,
  ShoppingBag,
  ShoppingCart,
  X,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface ProductPopupProps {
  isOpen: boolean
  onClose: (e: MouseEvent | React.MouseEvent) => void
  id: string
  name: string
  price: string
  description: string
}

const ProductPopup: React.FC<ProductPopupProps> = ({
  isOpen,
  onClose,
  id,
  name,
  price,
  description,
}) => {
  const router = useRouter()

  const [quantity, setQuantity] = useState(1)
  const [rentalStartDate, setRentalStartDate] = useState<Date>(new Date())
  const [rentalEndDate, setRentalEndDate] = useState<Date>(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow
  })
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const rentalDays = Math.ceil(
    (rentalEndDate.getTime() - rentalStartDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  const priceNumber = parseInt(price.replace(/\D/g, ""))
  const totalPrice = priceNumber * quantity * rentalDays
  const stock = 10

  const handleIncrease = () => {
    if (quantity < stock) setQuantity((prev) => prev + 1)
  }

  const handleDecrease = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1)
  }

  const confirmAddToCart = async () => {
    setIsAddingToCart(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    alert(`${quantity} unit "${name}" berhasil ditambahkan ke keranjang!`)
    setIsAddingToCart(false)
    onClose(new MouseEvent("click"))
    const toCart = window.confirm("Lihat keranjang sekarang?")
    if (toCart) router.push("/keranjang")
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center overflow-y-auto py-10"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-2xl mx-auto rounded-xl shadow-xl p-6 relative animate-fade-in"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-red-600"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-bold mb-2">{name}</h2>
        <p className="text-sm text-gray-600 mb-3">{description}</p>
        <p className="text-orange-500 font-semibold mb-4">{price} / hari</p>

        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium">Jumlah:</label>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDecrease}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-indigo-500 hover:text-white"
            >
              -
            </button>
            <span className="font-bold text-lg">{quantity}</span>
            <button
              onClick={handleIncrease}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-indigo-500 hover:text-white"
            >
              +
            </button>
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Tanggal Mulai:</label>
          <DatePicker
            selected={rentalStartDate}
            onChange={(date) => date && setRentalStartDate(date)}
            minDate={new Date()}
            className="w-full border rounded p-2 text-sm"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Tanggal Selesai:</label>
          <DatePicker
            selected={rentalEndDate}
            onChange={(date) => date && setRentalEndDate(date)}
            minDate={new Date(rentalStartDate.getTime() + 86400000)}
            className="w-full border rounded p-2 text-sm"
          />
        </div>

        <div className="text-sm mb-3 text-gray-600">
          <p>
            <Info className="inline-block w-4 h-4 mr-1 text-yellow-500" />
            Durasi Sewa: <b>{rentalDays} hari</b>
          </p>
        </div>

        <p className="text-center font-semibold mb-4">
          Total: Rp {totalPrice.toLocaleString("id-ID")}
        </p>

        {/* Tambah ke keranjang langsung */}
        <button
          onClick={confirmAddToCart}
          disabled={isAddingToCart}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
        >
          {isAddingToCart ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Menambahkan...
            </>
          ) : (
            <>
              <ShoppingBag className="h-5 w-5" />
              Masukkan Keranjang
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default ProductPopup
