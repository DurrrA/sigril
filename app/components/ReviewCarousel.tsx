"use client";

import React, { useRef, useState, useEffect } from "react";
import ReviewCard from "./ReviewCard";

interface ReviewCarouselProps {
  reviews: { profileImage?: string; name: string; review: string }[];
}

const ReviewCarousel: React.FC<ReviewCarouselProps> = ({ reviews }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const el = carouselRef.current;
    if (el) {
      const updateScrollState = () => {
        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(el.scrollLeft + el.offsetWidth < el.scrollWidth);
      };
      updateScrollState();
      el.addEventListener("scroll", updateScrollState);
      return () => el.removeEventListener("scroll", updateScrollState);
    }
  }, []);

  const scrollLeft = () => {
    const el = carouselRef.current;
    if (el) {
      const cardWidth = el.offsetWidth / 2; // Lebar satu ulasan
      el.scrollBy({ left: -cardWidth, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    const el = carouselRef.current;
    if (el) {
      const cardWidth = el.offsetWidth / 2; // Lebar satu ulasan
      el.scrollBy({ left: cardWidth, behavior: "smooth" });
    }
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* Wrapper untuk Carousel dan Tombol */}
      <div className="flex items-center">
        {/* Tombol Scroll Kiri */}
        <button
          onClick={scrollLeft}
          className={`bg-gray-200 hover:bg-[#3528AB] hover:text-white active:bg-[#3528AB] active:text-white rounded-full w-12 h-12 flex items-center justify-center shadow-md ${
            !canScrollLeft ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={!canScrollLeft}
        >
          {"<"}
        </button>

        {/* Carousel */}
        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-4 w-full align-center"
          style={{
            scrollSnapType: "x mandatory",
          }}
        >
          {reviews.map((review, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-1/2"
              style={{ scrollSnapAlign: "start" }}
            >
              <ReviewCard
                profileImage={review.profileImage}
                name={review.name}
                review={review.review}
              />
            </div>
          ))}
        </div>

        {/* Tombol Scroll Kanan */}
        <button
          onClick={scrollRight}
          className={`bg-gray-200 hover:bg-[#3528AB] hover:text-white active:bg-[#3528AB] active:text-white rounded-full w-12 h-12 flex items-center justify-center shadow-md ${
            !canScrollRight ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={!canScrollRight}
        >
          {">"}
        </button>
      </div>
    </div>
  );
};

export default ReviewCarousel;