"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import WatermarkHeader from "@/components/home/WatermarkHeader";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryItem {
  id: string;
  img: string;
  url: string;
  height: number;
}

export default function GalleryClient({ items, enigmaClassName }: { items: GalleryItem[], enigmaClassName: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Bento classes pattern generator
  const getBentoClasses = (index: number) => {
    const patterns = [
      // 0: Big card (col: 2, row: 2)
      "md:col-span-2 md:row-span-2",
      // 1: Small card (col: 1, row: 1)
      "md:col-span-1 md:row-span-1",
      // 2: Small card (col: 1, row: 1)
      "md:col-span-1 md:row-span-1",
      // 3: Tall card (col: 1, row: 2)
      "md:col-span-1 md:row-span-2",
      // 4: Wide card (col: 2, row: 1)
      "md:col-span-2 md:row-span-1",
      // 5: Small card (col: 1, row: 1)
      "md:col-span-1 md:row-span-1",
      // 6: Small card (col: 1, row: 1)
      "md:col-span-1 md:row-span-1",
    ];
    return patterns[index % patterns.length];
  };

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        start: "top 85%",
        once: true,
      },
    });

    tl.fromTo(
      ".nh-watermark",
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    ).fromTo(
      ".nh-title",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
      "-=0.6"
    );

    // Stagger animation for bento cards
    if (items.length > 0) {
      tl.fromTo(
        ".bento-card",
        { y: 50, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.05,
          ease: "power3.out",
        },
        "-=0.4"
      );
    }
  }, { scope: container, dependencies: [items] });

  // Lightbox handlers
  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, items.length]);

  return (
    <div ref={container} className="mb-5 w-full pb-20 selection:bg-white selection:text-black">
      {/* Watermark Title Header */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 pt-28 md:pt-40">
        <WatermarkHeader 
          title="GALLERY"
          watermark="CATALYST"
          titleClassName={`${enigmaClassName} nh-title drop-shadow-lg !text-[4vw] md:text-4xl lg:text-5xl`}
          watermarkClassName="nh-watermark"
        />
      </div>
      
      {/* Bento Grid */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 mt-12">
        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 auto-rows-[260px] md:auto-rows-[310px]">
            {items.map((item, index) => {
              const bentoColClass = getBentoClasses(index);
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setLightboxIndex(index);
                    setLightboxOpen(true);
                  }}
                  className={`bento-card opacity-0 relative rounded-3xl overflow-hidden border border-white/10 group cursor-pointer shadow-xl bg-zinc-950/20 backdrop-blur-sm transition-all duration-300 hover:border-white/20 ${bentoColClass}`}
                >
                  {/* Image */}
                  <Image
                    src={item.img}
                    alt={`Gallery image ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Gradient bottom overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80 group-hover:opacity-60 transition-opacity duration-300" />
                  
                  {/* Zoom indicator on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30 backdrop-blur-[2px]">
                    <span className="bg-white/10 text-white border border-white/20 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-350">
                      View Image 🔍
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-white/50">No images in gallery.</p>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl transition-opacity duration-300"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer hover:scale-105 duration-200"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            className="absolute left-6 z-50 p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer hover:scale-105 duration-200"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Image container */}
          <div 
            className="relative w-full h-full max-w-[85vw] max-h-[80vh] flex items-center justify-center select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={items[lightboxIndex].img}
              alt={`Gallery preview`}
              fill
              className="object-contain animate-fade-in"
              sizes="85vw"
              priority
            />
            {/* Image index indicator */}
            <div className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 text-zinc-400 text-sm font-semibold tracking-widest font-mono">
              {lightboxIndex + 1} / {items.length}
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            className="absolute right-6 z-50 p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer hover:scale-105 duration-200"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
