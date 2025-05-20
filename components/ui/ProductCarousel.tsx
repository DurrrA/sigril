"use client"

import React, { useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import ProductCard from "./ProductCard"
import ProductPopup from "./product-popup"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"

interface Product {
  id: string
  image: string
  name: string
  price: string
  description: string
}

interface ProductCarouselProps {
  category: string
  products: Product[]
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ category, products }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const carouselRef = useRef<HTMLDivElement>(null)

  const scrollNext = () => {
    const container = carouselRef.current?.querySelector("[data-carousel-content]")
    if (container) {
      container.scrollBy({ left: 300, behavior: "smooth" })
    }
  }

  const scrollPrev = () => {
    const container = carouselRef.current?.querySelector("[data-carousel-content]")
    if (container) {
      container.scrollBy({ left: -300, behavior: "smooth" })
    }
  }

  return (
    <div className="space-y-4 w-full relative">
      {/* Kategori dan Tombol Navigasi */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">{category}</h2>
        <div className="space-x-2">
          <Button variant="outline" size="icon" onClick={scrollPrev}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={scrollNext}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Carousel Produk */}
      <Carousel ref={carouselRef} opts={{ align: "start" }}>
        <CarouselContent data-carousel-content>
          {products && products.length > 0 ? (
            products.map((product) => (
              <CarouselItem
                key={product.id}
                className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
              >
                <ProductCard
                  {...product}
                  onAddToCartClick={() => setSelectedProduct(product)}
                />
              </CarouselItem>
            ))
          ) : (
            <p className="text-gray-500">Tidak ada produk untuk kategori ini.</p>
          )}
        </CarouselContent>
      </Carousel>

      {/* Popup Produk */}
      {selectedProduct && (
        <ProductPopup
          isOpen={true}
          onClose={() => setSelectedProduct(null)}
          id={selectedProduct.id}
          name={selectedProduct.name}
          price={selectedProduct.price}
          description={selectedProduct.description}
        />
      )}
    </div>
  )
}

export default ProductCarousel
