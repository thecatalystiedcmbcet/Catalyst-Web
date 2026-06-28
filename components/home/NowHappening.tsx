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
import { getValidImageUrl } from "@/lib/utils";

const NowHappening = () => {
  const container = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        const { supabase } = await import("@/lib/supabaseClient");
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("is_featured", true)
          .order("start_date", { ascending: false })
          .limit(10);
          
        if (error) throw error;
        if (data) {
          setFeaturedEvents(data);
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
  }, [featuredEvents.length, currentIndex]);

  // Animate header — always safe, elements are always present
  useGSAP(() => {
    gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        start: "top 80%",
        once: true,
      },
    })
      .fromTo(
        ".nh-watermark",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
      )
      .fromTo(
        ".nh-title",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
        "-=0.6"
      );
  }, { scope: container });

  // Animate the card only after data has loaded and the element exists in the DOM
  useGSAP(() => {
    if (!featuredEvents.length) return;
    gsap.fromTo(
      ".nh-card",
      { y: 40, opacity: 0, scale: 0.98 },
      { y: 0, opacity: 1, scale: 1, duration: 1, ease: "power3.out" }
    );
  }, { scope: container, dependencies: [featuredEvents.length] });

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
        <Skeleton className="nh-card w-full h-[450px] rounded-3xl bg-white/5 border border-white/5" />
      ) : featuredEvents.length > 0 ? (
        <div 
          className="nh-card group relative z-10 flex flex-col lg:flex-row w-full bg-[#0a0a0c]/85 rounded-3xl border border-white/5 overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.01)] hover:shadow-[0_0_60px_rgba(255,255,255,0.04)] hover:border-white/20 transition-all duration-500 cursor-pointer"
          onClick={() => router.push(`/events/${currentEvent.slug || currentEvent.id}`)}
        >
          {/* Left Content Column */}
          <div className="flex flex-col items-start justify-center p-6 md:p-8 lg:p-12 w-full lg:w-[45%] bg-[#0a0a0c]/50 relative overflow-hidden backdrop-blur-sm min-h-[350px] lg:min-h-[450px] z-10">
            {/* Visual Glow Accent */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none group-hover:bg-white/10 transition-colors duration-500" />
            
            <div className="flex flex-col items-start w-full h-full justify-between relative z-10">
              <div className="w-full">
                {/* Glowing Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-white/10 to-white/5 border border-white/15 text-zinc-200 mb-5 shadow-[0_0_15px_rgba(255,255,255,0.03)]">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                  </span>
                  <span className="font-secondary text-[10px] md:text-xs uppercase font-semibold tracking-widest">
                    FEATURED EVENT
                  </span>
                </div>
                
                <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight tracking-wide mb-3 font-primary font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-zinc-300 group-hover:from-white group-hover:to-white transition-all duration-300">
                  {currentEvent.title}
                </h3>
                
                <p className="text-xs sm:text-sm md:text-base text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300 leading-relaxed mb-6 font-normal line-clamp-3 md:line-clamp-4 font-secondary">
                  {currentEvent.subtitle || "Join us for an incredible journey of innovation and entrepreneurship."}
                </p>
              </div>

              <div className="flex items-center justify-between w-full mt-4">
                {currentEvent.status === "upcoming" ? (
                  <Button 
                    className={`bg-white text-black hover:bg-zinc-200 px-5 py-5 rounded-xl font-secondary font-bold text-xs uppercase tracking-wider transition-all duration-300 hover:scale-105 ${!(currentEvent.is_registration_open && currentEvent.registration_url) ? 'opacity-50 cursor-not-allowed hover:bg-white hover:scale-100' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (currentEvent.is_registration_open && currentEvent.registration_url) {
                        window.open(currentEvent.registration_url, "_blank");
                      }
                    }}
                    disabled={!(currentEvent.is_registration_open && currentEvent.registration_url)}
                  >
                    {currentEvent.is_registration_open && currentEvent.registration_url ? "Register Now" : "Registration Open Soon"}
                  </Button>
                ) : (
                  <Button 
                    className="bg-white/10 text-white border border-white/10 hover:bg-white/20 px-5 py-5 rounded-xl font-secondary font-bold text-xs uppercase tracking-wider transition-all duration-300 hover:scale-105"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/events/${currentEvent.slug || currentEvent.id}`);
                    }}
                  >
                    View Details
                  </Button>
                )}
                
                {/* Pagination Indicators (Desktop) */}
                {featuredEvents.length > 1 && (
                  <div className="hidden sm:flex gap-2 items-center">
                    {featuredEvents.map((_, idx) => (
                      <button 
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentIndex(idx);
                        }}
                        className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentIndex ? "w-6 bg-white" : "w-1.5 bg-white/40"}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Image Column */}
          <div className="w-full lg:w-[55%] h-64 sm:h-80 lg:h-auto min-h-[300px] lg:min-h-[450px] relative bg-[#0a0a0c] overflow-hidden z-10">
            {/* Fading gradient edge for smooth blend on desktop */}
            <div className="hidden lg:block absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0a0a0c] via-[#0a0a0c]/85 to-transparent z-10 pointer-events-none" />
            {/* Fading gradient top for smooth blend on mobile */}
            <div className="lg:hidden absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#0a0a0c] to-transparent z-10 pointer-events-none" />
            
            <Image 
              src={getValidImageUrl(currentEvent.cover_image)} 
              alt={currentEvent.title} 
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              priority
              unoptimized={getValidImageUrl(currentEvent.cover_image).includes('appwrite.io') || getValidImageUrl(currentEvent.cover_image).includes('supabase.co')}
              className="absolute inset-0 w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-90 group-hover:scale-[1.02] transition-all duration-700 ease-out z-0"
            />

            {/* Carousel Navigation Buttons */}
            {featuredEvents.length > 1 && (
              <div className="absolute bottom-4 right-4 z-20 flex gap-2">
                <Button 
                  onClick={handlePrev}
                  size="icon"
                  className="bg-black/60 hover:bg-white/10 hover:text-white text-white rounded-full backdrop-blur-md border border-white/10 hover:border-white/20 w-10 h-10 transition-all duration-300"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button 
                  onClick={handleNext}
                  size="icon"
                  className="bg-black/60 hover:bg-white/10 hover:text-white text-white rounded-full backdrop-blur-md border border-white/10 hover:border-white/20 w-10 h-10 transition-all duration-300"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            )}
            
            {/* Mobile Pagination (hidden on sm+) */}
            {featuredEvents.length > 1 && (
              <div className="absolute top-4 right-4 sm:hidden flex gap-1.5 items-center bg-black/40 backdrop-blur-md px-3 py-2 rounded-full border border-white/10 z-20">
                {featuredEvents.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentIndex ? "w-4 bg-white" : "w-1.5 bg-white/30"}`}
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
