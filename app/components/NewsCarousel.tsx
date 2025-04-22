"use client";

import React, { useRef, useState, useEffect } from "react";
import NewsCard from "./NewsCard";

interface NewsCarouselProps {
  news: { image: string }[];
}

const NewsCarousel: React.FC<NewsCarouselProps> = ({ news }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const handleScroll = () => {
      const scrollLeft = el.scrollLeft;
      const cardWidth = el.offsetWidth / 3;
      const center = scrollLeft + el.offsetWidth / 2;

      const newIndex = Math.round(center / cardWidth - 0.5);
      setActiveIndex(newIndex);
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollLeft = () => {
    const el = carouselRef.current;
    if (el) {
      const cardWidth = el.offsetWidth / 3;
      el.scrollBy({ left: -cardWidth, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    const el = carouselRef.current;
    if (el) {
      const cardWidth = el.offsetWidth / 3;
      el.scrollBy({ left: cardWidth, behavior: "smooth" });
    }
  };

  return (
    <div className="relative w-full overflow-hidden">
        {/* Tombol Navigasi */}
        <button
            onClick={scrollLeft}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-200 hover:bg-[#3528AB] text-black hover:text-white w-10 h-10 flex items-center justify-center rounded-full shadow-md z-10 transition-colors duration-300"
        >
            {"<"}
        </button>
        <button
            onClick={scrollRight}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-200 hover:bg-[#3528AB] text-black hover:text-white w-10 h-10 flex items-center justify-center rounded-full shadow-md z-10 transition-colors duration-300"
        >
            {">"}
        </button>


      {/* Carousel */}
      <div
        ref={carouselRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-4"
        style={{
          scrollSnapType: "x mandatory",
        }}
      >
        {news.map((item, index) => (
          <div
            key={index}
            className={`flex-shrink-0 w-1/3 transition-transform duration-300 ${
              index === activeIndex
                ? "scale-100" // Tengah
                : "scale-90 opacity-70" // Kiri/kanan
            }`}
            style={{ scrollSnapAlign: "center" }}
          >
            <NewsCard image={item.image} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsCarousel;
