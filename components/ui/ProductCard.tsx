"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ShoppingCart } from "lucide-react"
import ProductPopup from "./product-popup"

interface ProductCardProps {
  id: string
  image: string
  name: string
  price: string
  description: string
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  image,
  name,
  price,
  description,
}) => {
  const router = useRouter()
  const [showPopup, setShowPopup] = useState(false)

  const truncateDescription = (text: string, wordLimit: number) => {
    const words = text.split(" ")
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + "..."
    }
    return text
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowPopup(true)
  }

  const closePopup = () => {
    setShowPopup(false)
  }

  return (
    <>
      <div
        className="bg-white shadow-md rounded-lg overflow-hidden cursor-pointer flex flex-col"
        onClick={() => router.push(`/detailproduk/${id}`)}
      >
        <div className="relative w-full aspect-square">
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            fill
            style={{ objectFit: "cover" }}
            className="rounded-t-lg"
          />
        </div>

        <div className="p-4 flex-grow">
          <p className="text-lg font-bold text-gray-800 mb-2 text-center">{name}</p>
          <p className="text-lg font-bold text-orange-400 mb-2">{price}</p>
          <p className="text-sm text-gray-600 text-center">
            {truncateDescription(description, 10)}
          </p>
        </div>

        <button
          onClick={handleAddToCart}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <ShoppingCart size={18} />
          Masukkan ke Keranjang
        </button>
      </div>

      <ProductPopup
        isOpen={showPopup}
        onClose={closePopup}
        id={id}
        name={name}
        price={price}
        description={description}
      />
    </>
  )
}

export default ProductCard
