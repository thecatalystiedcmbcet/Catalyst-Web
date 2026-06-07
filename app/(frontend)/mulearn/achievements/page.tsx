"use client";
import React, { useRef } from 'react';
import localFont from 'next/font/local';
import WatermarkHeader from '@/components/home/WatermarkHeader';
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

const enigma = localFont({
  src: "../../../../public/fonts/enigma.otf",
  weight: "100",
  style: "normal",
});

const muLearnAchievementsData = [
  {
    year: "2025",
    title: "First Campus to reach 2 Million Karma Points in µLearn Foundation.",
    description: "Received the Purple µNation Award from Hon. Chief Minister of Kerala, Shri. Pinarayi Vijayan during Permute 2025, India's Largest Skill Festival on 25th March 2025.",
    image: "/agni.png",
  },
  {
    year: "2024",
    title: "Best Enabler Award",
    description: "Awarded the Best Enabler Award for outstanding contributions to the µLearn community and ecosystem.",
    image: "/featured.jpg",
  },
  {
    year: "2024",
    title: "Top Performing Campus",
    description: "Recognized as the Top Performing Campus in the µLearn network for consistent engagement and high skill acquisition.",
    image: "/featured.jpg",
  },
  {
    year: "2023",
    title: "Fastest Growing Community",
    description: "Awarded the Fastest Growing Community award for onboarding the most number of active members in a single quarter.",
    image: "/featured.jpg",
  }
];

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

const MuLearnAchievements = () => {
  const container = useRef<HTMLDivElement>(null);

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

  const featured = muLearnAchievementsData[0];
  const others = muLearnAchievementsData.slice(1);

  return (
    <div ref={container} className="w-full overflow-hidden pb-10">
      <div className="w-full px-5 sm:px-10 lg:px-20 pt-40">
        <WatermarkHeader 
          title="ACHIEVEMENTS"
          watermark="MULEARN"
          titleClassName="nh-title"
          watermarkClassName="nh-watermark"
        />

        {/* Featured Achievement */}
        <div className="mu-ach-featured relative z-10 flex flex-col lg:flex-row w-full bg-[#080808] rounded-2xl md:rounded-[1.25rem] border border-zinc-800 overflow-hidden shadow-2xl ">
          
          {/* Left Content */}
          <div className="flex flex-col items-start justify-center p-6 md:p-8 lg:p-10 w-full lg:w-[45%] bg-[#080808]">
            <div className="flex flex-col items-start w-full">
              <div className="flex items-center gap-[4px] mb-2 tracking-widest">
                <span className="font-primary text-[10px] md:text-xs text-white uppercase font-bold">LATEST</span>
                <span className="font-secondary text-[10px] md:text-xs text-white uppercase font-bold">ACHIEVEMENT</span>
              </div>
              
              <div className="w-full h-[1px] bg-zinc-400 mb-3" /> 
              
              <h3 className="font-primary text-2xl sm:text-3xl md:text-4xl text-white leading-tight tracking-wide mb-2">
                {featured.title}
              </h3>
              
              <div className="w-full h-[1px] bg-zinc-400 mt-3 mb-3" /> 
              
              <p className="font-secondary text-xs sm:text-sm md:text-base text-zinc-400 leading-relaxed mb-2">
                {featured.description}
              </p>
            </div>
          </div>

          {/* Right Image */}
          <div className="w-full lg:w-[55%] h-56 sm:h-64 lg:h-auto relative bg-[#080808]">
            {/* Fading gradient edge for smooth blend on desktop */}
            <div className="hidden lg:block absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#080808] via-[#080808]/80 to-transparent z-10" />
            <img 
              src={featured.image} 
              alt={featured.title} 
              className="w-full h-full object-cover grayscale opacity-75"
            />
          </div>
        </div>

        <p className="text-lg tracking-wide text-white font-primary text-center mt-20 mb-8 md:text-left md:text-3xl">
          OTHER ACHIEVEMENTS
        </p>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 mb-20">
          {others.map((item, index) => (
            <Card key={index} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MuLearnAchievements;
