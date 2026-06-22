"use client";

import WatermarkHeader from "@/components/home/WatermarkHeader";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import { getValidImageUrl } from "@/lib/utils";

const Card = ({ year, title, description, image }: { year: string | number, title: string, description: string, image: string }) => {
  return (
    <div className="ach-card relative flex flex-col group h-full cursor-pointer bg-[#0c0c0c] rounded-3xl border border-white/5 hover:border-white/20 hover:bg-[#111] transition-all duration-500 overflow-hidden">
      
      {/* Image Section */}
      <div className="relative w-full aspect-[16/9] overflow-hidden">
        <Image
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          src={getValidImageUrl(image)}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        {/* Gradient overlay to blend image into background */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent to-transparent group-hover:from-[#111] transition-colors duration-500" />
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-grow px-5 sm:px-6 pb-6 pt-0 z-10 relative">
        <div className="-mt-6 mb-3">
           <span className="font-primary text-3xl sm:text-4xl text-white drop-shadow-2xl">
             {year}
           </span>
        </div>
        
        <h3 className="font-secondary text-base sm:text-lg font-semibold mb-2 text-white leading-snug group-hover:text-zinc-200 transition-colors">
          {title}
        </h3>
        <p className="font-secondary text-xs sm:text-sm font-normal text-zinc-400 leading-relaxed line-clamp-3">
          {description}
        </p>
      </div>
      
    </div>
  );
};

export default function AchievementsClient({ 
  featured, 
  recentAchievements, 
  pastAchievements 
}: { 
  featured: any[], 
  recentAchievements: any[], 
  pastAchievements: any[] 
}) {
  const container = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll
  useEffect(() => {
    if (featured && featured.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % featured.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [featured]);

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % featured.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + featured.length) % featured.length);
  };

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
      ".ach-featured",
      { y: 40, opacity: 0, scale: 0.98 },
      { y: 0, opacity: 1, scale: 1, duration: 1, ease: "power3.out" },
      "-=0.4"
    ).fromTo(
      ".ach-card",
      { y: 40, opacity: 0, scale: 0.98 },
      { y: 0, opacity: 1, scale: 1, duration: 1, ease: "power3.out", stagger: 0.15 },
      "-=0.4"
    );
  }, { scope: container });

  const noAchievements = (!featured || featured.length === 0) && recentAchievements.length === 0 && pastAchievements.length === 0;

  const currentFeatured = featured && featured.length > 0 ? featured[currentIndex] : null;

  return (
    <div ref={container} className="w-full overflow-hidden pb-10">
      <div className="w-full px-5 sm:px-10 lg:px-20 pt-40">
        <WatermarkHeader
          title="ACHIEVEMENTS"
          watermark="CATALYST"
          titleClassName="nh-title"
          watermarkClassName="nh-watermark"
        />

        {noAchievements && (
          <p className="text-lg tracking-wide text-white/50 font-primary text-center mt-30 mb-5 md:text-3xl md:mb-7 md:mt-25">
            COMING SOON...
          </p>
        )}

        {/* Featured Achievement */}
        {currentFeatured && (
          <div className="ach-featured relative z-10 flex flex-col lg:flex-row w-full bg-[#080808] rounded-2xl md:rounded-[1.25rem] border border-zinc-800 overflow-hidden shadow-2xl lg:h-[420px]">
            
            {/* Left Content */}
            <div className="flex flex-col items-start justify-center p-8 md:p-12 lg:p-16 w-full lg:w-[45%] bg-[#080808]">
              <div className="flex flex-col items-start w-full">
                <div className="flex items-center gap-[6px] mb-2 tracking-widest">
                  <span className="font-primary text-[10px] md:text-xs text-white uppercase font-normal">LATEST</span>
                  <span className="font-primary text-[10px] md:text-xs text-white uppercase font-normal">ACHIEVEMENT</span>
                </div>
                
                <div className="w-full h-[1px] bg-zinc-400 mb-4" /> 
                
                <h3 className="font-primary font-normal text-[2rem] sm:text-3xl md:text-4xl lg:text-[2.5rem] text-white leading-tight tracking-wide mb-2 line-clamp-3">
                  {currentFeatured.title}
                </h3>
                
                <div className="w-full h-[1px] bg-zinc-400 mt-4 mb-4" /> 
                
                <p className="font-secondary text-sm sm:text-base text-gray-300 leading-relaxed mb-4 line-clamp-4">
                  {currentFeatured.description}
                </p>
              </div>
            </div>

            {/* Right Image */}
            <div className="w-full lg:w-[55%] h-64 sm:h-80 lg:h-full relative bg-[#080808] overflow-hidden">
              <div className="hidden lg:block absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#080808] via-[#080808]/80 to-transparent z-10" />
              <Image 
                src={getValidImageUrl(currentFeatured.cover_image || currentFeatured.image || "/agni.png")} 
                alt={currentFeatured.title} 
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover grayscale opacity-75"
              />

              {/* Carousel Navigation Buttons */}
              {featured.length > 1 && (
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
              {featured.length > 1 && (
                <div className="absolute bottom-6 left-6 lg:left-8 z-20 flex gap-2">
                  {featured.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-6 bg-white" : "w-1.5 bg-white/40"}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <>
            <p className="text-lg tracking-wide text-white font-primary text-center mt-20 mb-8 md:text-left md:text-3xl">
              RECENT ACHIEVEMENTS
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 mb-20">
              {recentAchievements.map((item, index) => (
                <Card 
                  key={item.id || index} 
                  year={item.year || new Date(item.date || item.created_at).getFullYear()} 
                  title={item.title} 
                  description={item.description} 
                  image={item.cover_image || item.image || "/agni.png"} 
                />
              ))}
            </div>
          </>
        )}

        {/* Past Achievements */}
        {pastAchievements.length > 0 && (
          <>
            <p className="text-lg tracking-wide text-white font-primary text-center mt-20 mb-8 md:text-left md:text-3xl">
              PAST ACHIEVEMENTS
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 mb-20">
              {pastAchievements.map((item, index) => (
                <Card 
                  key={item.id || index} 
                  year={item.year || new Date(item.date || item.created_at).getFullYear()} 
                  title={item.title} 
                  description={item.description} 
                  image={item.cover_image || item.image || "/agni.png"} 
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
