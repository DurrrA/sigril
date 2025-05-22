"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { ShoppingCart } from "lucide-react"

// ProductCard.tsx
interface ProductCardProps {
  id: string
  image: string
  name: string
  price: string
  description: string



  onAddToCartClick: () => void  // 🔥 Tambahkan prop trigger popup

}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  image,
  name,
  price,
  description,
  onAddToCartClick,
}) => {
  const router = useRouter()


  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    onAddToCartClick()
  }

  // ✅ Format harga menjadi 5.000
  const formatPrice = (price: string) => {
    const numericPrice = parseInt(price.replace(/\D/g, ""), 10) || 0
    return new Intl.NumberFormat("id-ID").format(numericPrice)
  }

  // Batasi hanya 7 kalimat jika diperlukan
  const truncateDescription = (text: string, maxSentences: number) => {
    const sentences = text
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0)

    if (sentences.length > maxSentences) {
      return sentences.slice(0, maxSentences).join(" ") + "..."
    }

    return text

  }

  return (
    <div

      className="bg-white shadow-md rounded-lg overflow-hidden cursor-pointer flex flex-col justify-between h-full"
      onClick={() => router.push(`/detailproduk/${id}`)}
    >
      <div>
        <div className="relative w-full aspect-square">
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            fill
            style={{ objectFit: "cover" }}
            className="rounded-t-lg"
            priority
          />
        </div>

        <div className="p-4">
          <p className="text-lg font-bold text-gray-800 mb-1 text-center">{name}</p>
          <p className="text-lg font-bold text-orange-400 mb-2 text-center">
            Rp {formatPrice(price)}
          </p>
          <p className="text-sm text-gray-600 text-center line-clamp-3">
            {truncateDescription(description, 7)}
          </p>
        </div>
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
  )
}


export default ProductCard
