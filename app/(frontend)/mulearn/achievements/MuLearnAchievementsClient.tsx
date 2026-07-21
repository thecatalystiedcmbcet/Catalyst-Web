"use client";
import React, { useRef, useEffect, useState } from "react";
import localFont from "next/font/local";
import WatermarkHeader from "@/components/home/WatermarkHeader";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const enigma = localFont({
  src: "../../../../public/fonts/MonumentExtended-Ultrabold.otf",
  weight: "100",
  style: "normal",
});

const poppins = localFont({
  src: "../../../../public/fonts/Poppins-Regular.ttf",
  display: "swap",
});

interface AchievementRecord {
  id?: string;
  title: string;
  description: string;
  date?: string;
  created_at?: string;
  year?: number;
  is_featured?: boolean;
  cover_image?: string;
  image?: string;
  organisation?: string;
}

const Card = ({
  year,
  title,
  description,
  image,
}: {
  year: number | string;
  title: string;
  description: string;
  image: string;
}) => {
  return (
    <div className="mu-ach-card relative flex flex-col group h-full cursor-pointer bg-[#0c0c0c] rounded-3xl border border-white/5 hover:border-white/20 hover:bg-[#111] transition-all duration-500 overflow-hidden">
      {/* Image Section */}
      <div className="relative w-full aspect-[16/9] overflow-hidden">
        <img
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          src={image}
          alt={title}
        />
        {/* Gradient overlay to blend image into background */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent to-transparent group-hover:from-[#111] transition-colors duration-500" />
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-grow px-5 sm:px-6 pb-6 pt-0 z-10 relative">
        <div className="-mt-6 mb-3">
          <span className={`${enigma.className} text-3xl sm:text-4xl text-white drop-shadow-2xl`}>
            {year}
          </span>
        </div>

        <h3 className={`${poppins.className} text-base sm:text-lg font-semibold mb-2 text-white leading-snug group-hover:text-zinc-200 transition-colors`}>
          {title}
        </h3>
        <p className={`${poppins.className} text-xs sm:text-sm font-normal text-zinc-400 leading-relaxed line-clamp-3`}>
          {description}
        </p>
      </div>
    </div>
  );
};

const renderTitle = (title: string) => {
  if (!title) return "";
  const regex = /(µ|μ)/g;
  const parts = title.split(regex);
  return (
    <>
      {parts.map((part, i) => {
        if (part === "µ" || part === "μ") {
          return (
            <span key={i} className="font-sans font-semibold text-[0.9em] inline-block align-baseline mx-[2px]">
              {part}
            </span>
          );
        }
        return part;
      })}
    </>
  );
};

export default function MuLearnAchievementsClient({
  initialAchievements,
}: {
  initialAchievements: AchievementRecord[];
}) {
  const container = useRef<HTMLDivElement>(null);
  const [achievements] = useState<AchievementRecord[]>(initialAchievements);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll
  useEffect(() => {
    const featured = achievements.filter((a) => a.is_featured === true);
    if (featured.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % featured.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [achievements]);

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const featured = achievements.filter((a) => a.is_featured === true);
    setCurrentIndex((prev) => (prev + 1) % featured.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const featured = achievements.filter((a) => a.is_featured === true);
    setCurrentIndex((prev) => (prev - 1 + featured.length) % featured.length);
  };

  useGSAP(() => {
    if (achievements.length === 0) return;

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
    );

    const hasFeatured = container.current?.querySelector(".mu-ach-featured");
    if (hasFeatured) {
      tl.fromTo(
        ".mu-ach-featured",
        { y: 40, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 1, ease: "power3.out" },
        "-=0.4"
      );
    }

    const hasCards = container.current?.querySelector(".mu-ach-card");
    if (hasCards) {
      tl.fromTo(
        ".mu-ach-card",
        { y: 40, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 1, ease: "power3.out", stagger: 0.15 },
        "-=0.4"
      );
    }
  }, { scope: container, dependencies: [achievements] });

  let featured = achievements.filter((a) => a.is_featured === true);
  if (featured.length === 0 && achievements.length > 0) {
    featured = [achievements[0]];
  }
  const others = achievements.filter((a) => !featured.includes(a));
  const currentFeatured = featured.length > 0 ? featured[currentIndex] : null;

  return (
    <div ref={container} className="w-full overflow-hidden pb-10">
      <div className="w-full px-5 sm:px-10 lg:px-20 pt-28 md:pt-40">
        <WatermarkHeader
          title="ACHIEVEMENTS"
          watermark="MULEARN"
          titleClassName="nh-title"
          watermarkClassName="nh-watermark"
        />

        {achievements.length === 0 && (
          <p className="text-lg tracking-wide text-white/50 font-primary text-center mt-30 mb-5 md:text-3xl md:mb-7 md:mt-25">
            COMING SOON...
          </p>
        )}

        {/* Featured Achievement */}
        {currentFeatured && (
          <div className="mu-ach-featured group relative z-10 flex flex-col lg:flex-row w-full bg-[#0a0a0c]/85 rounded-3xl border border-white/5 overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.01)] hover:shadow-[0_0_60px_rgba(255,255,255,0.04)] hover:border-white/20 transition-all duration-500 cursor-pointer">
            {/* Left Content */}
            <div className="flex flex-col items-start justify-center p-6 md:p-8 lg:p-12 w-full lg:w-[45%] bg-[#0a0a0c]/50 relative overflow-hidden backdrop-blur-sm">
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none group-hover:bg-white/10 transition-colors duration-500" />
              <div className="flex flex-col items-start w-full relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-white/10 to-white/5 border border-white/15 text-zinc-200 mb-5 shadow-[0_0_15px_rgba(255,255,255,0.03)]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                  </span>
                  <span className={`${poppins.className} text-[10px] md:text-xs uppercase font-semibold tracking-widest`}>
                    FEATURED ACHIEVEMENT
                  </span>
                </div>

                <h3 className={`${enigma.className} text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-tight tracking-wide mb-3 font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-zinc-300 group-hover:from-white group-hover:to-white transition-all duration-300`}>
                  {renderTitle(currentFeatured.title)}
                </h3>

                <p className={`${poppins.className} text-xs sm:text-sm md:text-base text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300 leading-relaxed mb-6 font-normal line-clamp-3 md:line-clamp-4`}>
                  {currentFeatured.description}
                </p>
              </div>
            </div>

            {/* Right Image */}
            <div className="w-full lg:w-[55%] h-64 sm:h-80 lg:h-auto min-h-[300px] lg:min-h-[400px] relative bg-[#0a0a0c] overflow-hidden">
              <div className="hidden lg:block absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0a0a0c] via-[#0a0a0c]/85 to-transparent z-10" />
              <div className="lg:hidden absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#0a0a0c] to-transparent z-10" />
              <img
                src={currentFeatured.cover_image || currentFeatured.image || "/agni.png"}
                alt={currentFeatured.title}
                className="absolute inset-0 w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-90 group-hover:scale-102 transition-all duration-700 ease-out"
              />

              {/* Carousel Navigation Buttons */}
              {featured.length > 1 && (
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

        {others.length > 0 && (
          <>
            <p className={`text-lg tracking-wide text-white ${enigma.className} text-center mt-20 mb-8 md:text-left md:text-3xl`}>
              OTHER ACHIEVEMENTS
            </p>

            {/* Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 mb-20">
              {others.map((item, index) => (
                <Card
                  key={item.id || index}
                  year={item.year || new Date(item.date || item.created_at || Date.now()).getFullYear()}
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
