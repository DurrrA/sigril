"use client"

import { useEffect, useState } from "react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import type { CarouselApi } from "@/components/ui/carousel"
import ReviewCard from "./ReviewCard"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ReviewCarouselProps {
  reviews: { profileImage?: string; name: string; review: string }[]
}

export default function ReviewCarousel({ reviews }: ReviewCarouselProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  return (
    <div className="relative w-full">
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true, // Enable infinite looping
        }}
        className="w-full"
      >
        <div className="flex items-center">
          <CarouselPrevious className="relative inset-0 translate-y-0 bg-gray-200 hover:bg-[#3528AB] hover:text-white active:bg-[#3528AB] active:text-white rounded-full w-12 h-12 flex items-center justify-center shadow-md">
            <ChevronLeft className="h-5 w-5" />
          </CarouselPrevious>

          <CarouselContent className="px-4 w-full">
            {reviews.map((review, index) => (
              <CarouselItem key={index} className="basis-full md:basis-1/2">
                <ReviewCard profileImage={review.profileImage} name={review.name} review={review.review} />
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselNext className="relative inset-0 translate-y-0 bg-gray-200 hover:bg-[#3528AB] hover:text-white active:bg-[#3528AB] active:text-white rounded-full w-12 h-12 flex items-center justify-center shadow-md">
            <ChevronRight className="h-5 w-5" />
          </CarouselNext>
        </div>

        {/* Optional: Add a counter to show current position */}
        <div className="flex justify-center mt-4">
          <span className="text-sm text-muted-foreground">
            {current} / {count}
          </span>
        </div>
      </Carousel>
    </div>
  )
}
