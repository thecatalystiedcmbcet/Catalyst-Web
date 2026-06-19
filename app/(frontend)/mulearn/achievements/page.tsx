/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, prefer-const, @next/next/no-img-element */
"use client";
import React, { useRef, useEffect, useState } from 'react';
import localFont from 'next/font/local';
import WatermarkHeader from '@/components/home/WatermarkHeader';
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { Skeleton } from "@/components/ui/skeleton";

const enigma = localFont({
  src: "../../../../public/fonts/MonumentExtended-Ultrabold.otf",
  weight: "100",
  style: "normal",
});

const poppins = localFont({
  src: "../../../../public/fonts/Poppins-Regular.ttf",
  display: "swap",
});



const Card = ({ year, title, description, image }: any) => {
  return (
    <div className="mu-ach-card text-white flex flex-col group h-full cursor-pointer">
      {/* Image Container */}
      <div className="relative w-full aspect-video overflow-hidden mb-4 md:mb-6">
        <img
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          src={image}
          alt={title}
        />
        {/* Subtle overlay on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-grow">
        <h1 className={`${enigma.className} text-3xl sm:text-4xl md:text-[40px] mb-2 text-white`}>
          {year}
        </h1>
        <p className={`${poppins.className} text-base sm:text-lg md:text-xl font-semibold mb-3 text-white`}>
          {title}
        </p>
        <p className={`${poppins.className} text-sm sm:text-base md:text-[15px] font-normal text-zinc-400 text-pretty leading-relaxed`}>
          {description}
        </p>
      </div>
    </div>
  );
};

const MuLearnAchievements = () => {
  const container = useRef<HTMLDivElement>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const { supabase } = await import("@/lib/supabaseClient");
        const { data, error } = await supabase
          .from("achievements")
          .select("*")
          .ilike("organisation", "%mulearn%")
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
      ".mu-ach-featured",
      { y: 40, opacity: 0, scale: 0.98 },
      { y: 0, opacity: 1, scale: 1, duration: 1, ease: "power3.out" },
      "-=0.4"
    ).fromTo(
      ".mu-ach-card",
      { y: 40, opacity: 0, scale: 0.98 },
      { y: 0, opacity: 1, scale: 1, duration: 1, ease: "power3.out", stagger: 0.15 },
      "-=0.4"
    );
  }, { scope: container });

  const featured = achievements.find((a) => a.is_featured === true) || achievements[0] || null;
  const others = achievements.filter((a) => a !== featured);

  return (
    <div ref={container} className="w-full overflow-hidden pb-10">
      <div className="w-full px-5 sm:px-10 lg:px-20 pt-40">
        <WatermarkHeader 
          title="ACHIEVEMENTS"
          watermark="MULEARN"
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
            <Skeleton className="mu-ach-featured h-[400px] w-full rounded-2xl bg-white/5" />
          ) : featured ? (
            <div className="mu-ach-featured relative z-10 flex flex-col lg:flex-row w-full bg-[#080808] rounded-2xl md:rounded-[1.25rem] border border-zinc-800 overflow-hidden shadow-2xl ">
              
              {/* Left Content */}
              <div className="flex flex-col items-start justify-center p-6 md:p-8 lg:p-10 w-full lg:w-[45%] bg-[#080808]">
                <div className="flex flex-col items-start w-full">
                  <div className="flex items-center gap-[4px] mb-2 tracking-widest">
                    <span className={`${enigma.className} text-[10px] md:text-xs text-white uppercase font-bold`}>LATEST</span>
                    <span className={`${enigma.className} text-[10px] md:text-xs text-white uppercase font-bold`}>ACHIEVEMENT</span>
                  </div>
                  
                  <div className="w-full h-[1px] bg-zinc-400 mb-3" /> 
                  
                  <h3 className={`${poppins.className} text-2xl sm:text-3xl md:text-4xl text-white leading-tight tracking-wide mb-2`}>
                    {featured.title}
                  </h3>
                  
                  <div className="w-full h-[1px] bg-zinc-400 mt-3 mb-3" /> 
                  
                  <p className={`${poppins.className} text-xs sm:text-sm md:text-base text-zinc-400 leading-relaxed mb-2`}>
                    {featured.description}
                  </p>
                </div>
              </div>

              {/* Right Image */}
              <div className="w-full lg:w-[55%] h-56 sm:h-64 lg:h-auto relative bg-[#080808]">
                {/* Fading gradient edge for smooth blend on desktop */}
                <div className="hidden lg:block absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#080808] via-[#080808]/80 to-transparent z-10" />
                <img 
                  src={featured.cover_image || featured.image || "/agni.png"} 
                  alt={featured.title} 
                  className="w-full h-full object-cover grayscale opacity-75"
                />
              </div>
            </div>
          ) : null
        )}

        {(isLoading || others.length > 0) && (
          <>
            <p className={`text-lg tracking-wide text-white ${enigma.className} text-center mt-20 mb-8 md:text-left md:text-3xl`}>
              OTHER ACHIEVEMENTS
            </p>

            {/* Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 mb-20">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-[300px] w-full rounded-2xl bg-white/5" />
                ))
              ) : (
                others.map((item, index) => (
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

export default MuLearnAchievements;
