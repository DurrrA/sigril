"use client";

import React from "react";
import ProductCard from "./ProductCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface Product {
  id: string;
  image: string;
  name: string;
  price: string;
  description: string;
}

interface ProductCarouselProps {
  category: string;
  products: Product[];
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ category, products }) => {
  return (
    <div className="space-y-4 w-full"> {/* Full width */}
      {/* Judul Kategori */}
      <h2 className="text-2xl font-bold text-gray-800">{category}</h2>

      {/* Carousel Produk */}
      <Carousel>
        <CarouselContent>
          {products && products.length > 0 ? (
            products.map((product) => (
              <CarouselItem
                key={product.id}
                className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
              >
                <ProductCard
                  id={product.id}
                  image={product.image}
                  name={product.name}
                  price={product.price}
                  description={product.description}
                />
              </CarouselItem>
            ))
          ) : (
            <p className="text-gray-500">Tidak ada produk untuk kategori ini.</p>
          )}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default ProductCarousel;
