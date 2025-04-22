"use client";

import React, { useRef, useState, useEffect } from "react";
import ProductCard from "./ProductCard";

interface Product {
  id: string; // ID produk
  image: string;
  name: string; // Nama produk
  price: string;
  description: string;
}

interface ProductCarouselProps {
  category: string;
  products: Product[];
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ category, products }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    const el = carouselRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth);
    }
  };

  const scrollLeft = () => {
    const el = carouselRef.current;
    if (el && typeof el.scrollBy === "function") {
      el.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    const el = carouselRef.current;
    if (el && typeof el.scrollBy === "function") {
      el.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const el = carouselRef.current;
    if (el) {
      updateScrollButtons();
      el.addEventListener("scroll", updateScrollButtons);
      window.addEventListener("resize", updateScrollButtons);
    }

    return () => {
      if (el) el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, []);

  return (
    <>
      {/* Header Kategori dan Tombol Scroll */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{category}</h2>
        <div className="flex gap-2">
          <button
            onClick={scrollLeft}
            className={`bg-gray-200 hover:bg-[#3528AB] hover:text-white active:bg-[#3528AB] active:text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md ${
              !canScrollLeft ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!canScrollLeft}
          >
            {"<"}
          </button>
          <button
            onClick={scrollRight}
            className={`bg-gray-200 hover:bg-[#3528AB] hover:text-white active:bg-[#3528AB] active:text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md ${
              !canScrollRight ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!canScrollRight}
          >
            {">"}
          </button>
        </div>
      </div>

      {/* Daftar Produk */}
      <div
        ref={carouselRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
      >
        {products && products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-64">
              <ProductCard
                id={product.id} // Kirim ID produk
                image={product.image}
                name={product.name} // Kirim nama produk
                price={product.price}
                description={product.description}
              />
            </div>
          ))
        ) : (
          <p className="text-gray-500">Tidak ada produk untuk kategori ini.</p>
        )}
      </div>
    </>
  );
};

export default ProductCarousel;
