"use client"

import { useEffect, useState } from "react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import type { CarouselApi } from "@/components/ui/carousel"
import NewsCard from "./NewsCard"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface NewsCarouselProps {
  news: { image: string }[]
}

export default function NewsCarousel({ news }: NewsCarouselProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!api) {
      return
    }

    setCurrent(api.selectedScrollSnap())

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  return (
    <div className="relative w-full">
      <Carousel
        setApi={setApi}
        opts={{
          align: "center",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {news.map((item, index) => (
            <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/3 md:basis-1/3">
              <div className={`transition-all duration-300 ${index === current ? "scale-100" : "scale-90 opacity-70"}`}>
                <NewsCard image={item.image} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-200 hover:bg-[#3528AB] text-black hover:text-white w-10 h-10 flex items-center justify-center rounded-full shadow-md z-10 transition-colors duration-300">
          <ChevronLeft className="h-5 w-5" />
        </CarouselPrevious>
        <CarouselNext className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-200 hover:bg-[#3528AB] text-black hover:text-white w-10 h-10 flex items-center justify-center rounded-full shadow-md z-10 transition-colors duration-300">
          <ChevronRight className="h-5 w-5" />
        </CarouselNext>
      </Carousel>
    </div>
  )
}
