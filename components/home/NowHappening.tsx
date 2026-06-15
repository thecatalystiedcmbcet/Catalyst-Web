"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import WatermarkHeader from "./WatermarkHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* ---------------- IMAGE UTILS ---------------- */

function getValidImageUrl(url?: string) {
  if (!url) return "/log.png";
  if (url.includes("unsplash.com") || url.includes("appwrite.io")) return url;
  return "/log.png";
}

const NowHappening = () => {
  const container = useRef<HTMLDivElement>(null);
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        const res = await fetch("/api/v1/events?featured=true&limit=10");
        if (res.ok) {
          const data = await res.json();
          if (data.documents) {
            setFeaturedEvents(data.documents);
          }
        }
      } catch (error) {
        console.error("Failed to fetch featured events:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeaturedEvents();
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (featuredEvents.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % featuredEvents.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [featuredEvents.length]);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        start: "top 80%",
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
    ).fromTo(
      ".nh-card",
      { y: 40, opacity: 0, scale: 0.98 },
      { y: 0, opacity: 1, scale: 1, duration: 1, ease: "power3.out" },
      "-=0.4"
    );
  }, { scope: container });

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % featuredEvents.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + featuredEvents.length) % featuredEvents.length);
  };

  const headerTitle = !isLoading && featuredEvents.length === 0 ? "EVENTS" : "NOW HAPPENING";
  const currentEvent = featuredEvents[currentIndex];

  return (
    <div ref={container} className="relative w-full flex flex-col items-center justify-center pt-40">
      {/* Header & Watermark Container */}
      <WatermarkHeader 
        title={headerTitle}
        watermark="CATALYST" 
        titleClassName="nh-title" 
        watermarkClassName="nh-watermark" 
      />

      {/* Event Card */}
      {isLoading ? (
        <Skeleton className="nh-card h-[400px] w-full rounded-2xl bg-white/5" />
      ) : featuredEvents.length > 0 ? (
        <div 
          className="nh-card relative z-10 flex flex-col lg:flex-row w-full bg-[#080808] rounded-2xl md:rounded-[1.25rem] border border-zinc-800 overflow-hidden shadow-2xl cursor-pointer hover:border-zinc-600 transition-colors duration-300"
          onClick={() => router.push(`/events/${currentEvent.slug || currentEvent.$id}`)}
        >
          
          {/* Left Content */}
          <div className="flex flex-col items-start justify-center p-8 md:p-12 lg:p-16 w-full lg:w-[45%] bg-[#080808]">
            
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-[4px] mb-2 tracking-widest">
                <span className="font-primary text-[10px] md:text-xs text-white uppercase font-normal">CATALYST</span>
                <span className="font-secondary text-[10px] md:text-xs text-white uppercase font-bold">IEDC</span>
              </div>
              
              <div className="w-full h-[1px] bg-zinc-400 mb-2" /> 
              
              <h3 
                className="text-[2rem] sm:text-4xl md:text-5xl lg:text-[3.25rem] text-white leading-none tracking-wide" 
                style={{ fontFamily: '"Times New Roman", Times, serif' }}
              >
                {currentEvent.title}
              </h3>
              
              <div className="w-full h-[1px] bg-zinc-400 mt-2 mb-2" /> 
              
              <p 
                className="text-sm sm:text-base md:text-xl text-white uppercase tracking-[0.2em] mb-8" 
                style={{ fontFamily: '"Times New Roman", Times, serif' }}
              >
                {currentEvent.subtitle || "Dawn of Innovation"}
              </p>
            </div>
            
            <Button 
              className="bg-white text-black hover:bg-zinc-200 px-5 py-6 md:py-6 rounded-md flex items-center gap-1 font-secondary font-medium transition-all text-sm md:text-base group"
              onClick={(e) => {
                e.stopPropagation();
                if (currentEvent.register_link) {
                  window.open(currentEvent.register_link, "_blank");
                }
              }}
            >
              Register Now
              <svg 
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" 
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </Button>
          </div>

          {/* Right Image */}
          <div className="w-full lg:w-[55%] h-64 sm:h-80 lg:h-auto relative bg-[#080808] overflow-hidden">
            {/* Fading gradient edge for smooth blend on desktop */}
            <div className="hidden lg:block absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#080808] via-[#080808]/80 to-transparent z-10" />
            <Image 
              src={getValidImageUrl(currentEvent.cover_image)} 
              alt={currentEvent.title} 
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              unoptimized={getValidImageUrl(currentEvent.cover_image).includes('appwrite.io')}
              className="object-cover grayscale opacity-75"
            />
            
            {/* Carousel Navigation Buttons */}
            {featuredEvents.length > 1 && (
              <div className="absolute bottom-4 right-4 z-20 flex gap-2">
                <Button 
                  onClick={handlePrev}
                  size="icon"
                  className="bg-black/50 hover:bg-black text-white rounded-full backdrop-blur-sm border border-white/20 w-10 h-10 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button 
                  onClick={handleNext}
                  size="icon"
                  className="bg-black/50 hover:bg-black text-white rounded-full backdrop-blur-sm border border-white/20 w-10 h-10 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            )}
            
            {/* Pagination Indicators */}
            {featuredEvents.length > 1 && (
              <div className="absolute bottom-6 left-6 lg:left-32 z-20 flex gap-2">
                {featuredEvents.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-6 bg-white" : "w-1.5 bg-white/40"}`}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      ) : null}
    </div>
  );
};

export default NowHappening;
