"use client";
import WatermarkHeader from "@/components/home/WatermarkHeader";
import React, { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Card = ({ year, title, description, image }: any) => {
  return (
    <div className="ach-card text-white flex flex-col group h-full cursor-pointer">
      {/* Image Container */}
      <div className="relative w-full aspect-video overflow-hidden mb-4 md:mb-6">
        <Image
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          src={image}
          alt={title}
          fill
          unoptimized={typeof image === 'string' && image.includes('appwrite.io')}
        />
        {/* Subtle overlay on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-grow">
        <h1 className="font-primary text-3xl sm:text-4xl md:text-[40px] mb-2 text-white">
          {year}
        </h1>
        <p className="font-secondary text-base sm:text-lg md:text-xl font-semibold mb-3 text-white">
          {title}
        </p>
        <p className="font-secondary text-sm sm:text-base md:text-[15px] font-normal text-zinc-400 text-pretty leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

const Team = () => {

  const container = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const { supabase } = await import("@/lib/supabaseClient");
        const { data, error } = await supabase
          .from("achievements")
          .select("*")
          .order("date", { ascending: false });
        if (error) throw error;
        if (data) {
          setAchievements(data);
        }
      } catch (error) {
        console.error("Failed to fetch achievements:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAchievements();
  }, []);

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

  const featured = achievements.find((a) => a.is_featured === true) || null;
  const others = achievements.filter((a) => a !== featured);

  const currentYear = new Date().getFullYear();

  const recentAchievements = others.filter((item) => {
    const year = Number(item.year || new Date(item.date || item.created_at).getFullYear());
    return year >= currentYear;
  });

  const pastAchievements = others.filter((item) => {
    const year = Number(item.year || new Date(item.date || item.created_at).getFullYear());
    return year < currentYear;
  });

  return (
    <div ref={container} className="w-full overflow-hidden pb-10">
      <div className="w-full px-5 sm:px-10 lg:px-20 pt-40">
        <WatermarkHeader
          title="ACHIEVEMENTS"
          watermark="CATALYST"
          titleClassName="nh-title"
          watermarkClassName="nh-watermark"
        />

        {!isLoading && achievements.length === 0 && (
          <p className="text-lg tracking-wide text-white/50 font-primary text-center mt-30 mb-5 md:text-3xl md:mb-7 md:mt-25">
            COMING SOON...
          </p>
        )}

        {/* Featured Achievement */}
        {(
          isLoading ? (
            <Skeleton className="ach-featured h-[400px] w-full rounded-2xl bg-white/5" />
          ) : featured ? (
            <div className="ach-featured relative z-10 flex flex-col lg:flex-row w-full bg-[#080808] rounded-2xl md:rounded-[1.25rem] border border-zinc-800 overflow-hidden shadow-2xl ">
              
              {/* Left Content */}
              <div className="flex flex-col items-start justify-center p-8 md:p-12 lg:p-16 w-full lg:w-[45%] bg-[#080808]">
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-[6px] mb-2 tracking-widest">
                    <span className="font-primary text-[10px] md:text-xs text-white uppercase font-normal">LATEST</span>
                    <span className="font-primary text-[10px] md:text-xs text-white uppercase font-normal">ACHIEVEMENT</span>
                  </div>
                  
                  <div className="w-full h-[1px] bg-zinc-400 mb-4" /> 
                  
                  <h3 className="font-primary font-normal text-[2rem] sm:text-3xl md:text-4xl lg:text-[2.5rem] text-white leading-tight tracking-wide mb-2">
                    {featured.title}
                  </h3>
                  
                  <div className="w-full h-[1px] bg-zinc-400 mt-4 mb-4" /> 
                  
                  <p className="font-secondary text-sm sm:text-base text-gray-300 leading-relaxed mb-4">
                    {featured.description}
                  </p>
                </div>
              </div>

              {/* Right Image */}
              <div className="w-full lg:w-[55%] h-64 sm:h-80 lg:h-auto relative bg-[#080808]">
                {/* Fading gradient edge for smooth blend on desktop */}
                <div className="hidden lg:block absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#080808] via-[#080808]/80 to-transparent z-10" />
                <Image 
                  src={featured.cover_image || featured.image || "/agni.png"} 
                  alt={featured.title} 
                  fill
                  unoptimized={(featured.cover_image || featured.image || "").includes('appwrite.io')}
                  className="object-cover grayscale opacity-75"
                />
              </div>
            </div>
          ) : null
        )}

        {/* Recent Achievements */}
        {(isLoading || recentAchievements.length > 0) && (
          <>
            <p className="text-lg tracking-wide text-white font-primary text-center mt-20 mb-8 md:text-left md:text-3xl">
              RECENT ACHIEVEMENTS
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 mb-20">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-[300px] w-full rounded-2xl bg-white/5" />
                ))
              ) : (
                recentAchievements.map((item, index) => (
                  <Card key={item.id || index} year={item.year || new Date(item.date || item.created_at).getFullYear()} title={item.title} description={item.description} image={item.cover_image || item.image || "/agni.png"} />
                ))
              )}
            </div>
          </>
        )}

        {/* Past Achievements */}
        {(isLoading || pastAchievements.length > 0) && (
          <>
            <p className="text-lg tracking-wide text-white font-primary text-center mt-20 mb-8 md:text-left md:text-3xl">
              PAST ACHIEVEMENTS
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 mb-20">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-[300px] w-full rounded-2xl bg-white/5" />
                ))
              ) : (
                pastAchievements.map((item, index) => (
                  <Card key={item.id || index} year={item.year || new Date(item.date || item.created_at).getFullYear()} title={item.title} description={item.description} image={item.cover_image || item.image || "/agni.png"} />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Team;
