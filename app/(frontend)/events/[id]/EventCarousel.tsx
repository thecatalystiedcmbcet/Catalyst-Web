"use client";

import { useState } from "react";
import Image from "next/image";
import { getValidImageUrl } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const EventCarousel = ({ images = [] }: { images?: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      <div className="relative w-full h-[50vh] md:h-[70vh] rounded-xl overflow-hidden shadow-2xl group">
        <Image 
          src={getValidImageUrl(images[currentIndex])} 
          fill
          className="object-cover transition-opacity duration-500" 
          alt={`Gallery image ${currentIndex + 1}`}
          sizes="(max-width: 768px) 100vw, 80vw"
          priority
        />
        
        {images.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto w-full justify-start md:justify-center py-2 px-1">
          {images.map((img, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative flex-shrink-0 w-24 h-16 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                idx === currentIndex ? 'border-white scale-105' : 'border-transparent opacity-50 hover:opacity-100'
              }`}
              aria-label={`View gallery image ${idx + 1}`}
            >
              <Image 
                src={getValidImageUrl(img)} 
                fill
                sizes="96px"
                className="object-cover" 
                alt={`Thumbnail ${idx + 1}`} 
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
