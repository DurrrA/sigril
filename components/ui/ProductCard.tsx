"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import type React from "react"
import { ShoppingCart } from "lucide-react"

interface ProductCardProps {
  id: string // ID produk
  image: string
  name: string // Nama produk
  price: string
  description: string
}

const ProductCard: React.FC<ProductCardProps> = ({ id, image, name, price, description }) => {
  const router = useRouter() // Inisialisasi router

  // Fungsi untuk memotong deskripsi menjadi 10 kata pertama
  const truncateDescription = (text: string, wordLimit: number) => {
    const words = text.split(" ")
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + "..."
    }
    return text
  }

  // Fungsi untuk menangani klik tombol keranjang
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation() // Mencegah event bubbling ke parent div
    // Implementasi logika tambah ke keranjang di sini
    console.log(`Produk ${id} ditambahkan ke keranjang`)
  }

  return (
    <div
      className="bg-white shadow-md rounded-lg overflow-hidden cursor-pointer flex flex-col"
      onClick={() => router.push(`/detailproduk/${id}`)} // Navigasi ke halaman detail produk
    >
      {/* Gambar Produk */}
      <div className="relative w-full aspect-square">
        <Image
          src={image || "/placeholder.svg"}
          alt={name} // Gunakan nama produk sebagai alt
          fill
          style={{ objectFit: "cover" }}
          className="rounded-t-lg"
        />
      </div>
      {/* Informasi Produk */}
      <div className="p-4 flex-grow">
        {/* Nama Produk */}
        <p className="text-lg font-bold text-gray-800 mb-2 text-center">{name}</p>
        {/* Harga Produk */}
        <p className="text-lg font-bold text-orange-400 mb-2">{price}</p>
        {/* Deskripsi Produk */}
        <p className="text-sm text-gray-600 text-center">{truncateDescription(description, 10)}</p>
      </div>
      {/* Tombol Masukkan ke Keranjang */}
      <button
        onClick={handleAddToCart}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <ShoppingCart size={18} />
        Masukkan ke Keranjang
      </button>
    </div>
  )
}

export default ProductCard
