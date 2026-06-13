"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import WatermarkHeader from "./WatermarkHeader";

const NowHappening = () => {
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
      ".nh-card",
      { y: 40, opacity: 0, scale: 0.98 },
      { y: 0, opacity: 1, scale: 1, duration: 1, ease: "power3.out" },
      "-=0.4"
    );
  }, { scope: container });

  return (
    <div ref={container} className="relative w-full flex flex-col items-center justify-center pt-40">
      {/* Header & Watermark Container */}
      <WatermarkHeader 
        title="NOW HAPPENING" 
        watermark="CATALYST" 
        titleClassName="nh-title" 
        watermarkClassName="nh-watermark" 
      />

      {/* Event Card */}
      <div className="nh-card relative z-10 flex flex-col lg:flex-row w-full bg-[#080808] rounded-2xl md:rounded-[1.25rem] border border-zinc-800 overflow-hidden shadow-2xl">
        
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
              INCEPTRA VIII
            </h3>
            
            <div className="w-full h-[1px] bg-zinc-400 mt-2 mb-2" /> 
            
            <p 
              className="text-sm sm:text-base md:text-xl text-white uppercase tracking-[0.2em] mb-8" 
              style={{ fontFamily: '"Times New Roman", Times, serif' }}
            >
              Dawn of Innovation
            </p>
          </div>
          
          <Button className="bg-white text-black hover:bg-zinc-200 px-5 py-6 md:py-6 rounded-md flex items-center gap-1 font-secondary font-medium transition-all text-sm md:text-base group">
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
        <div className="w-full lg:w-[55%] h-64 sm:h-80 lg:h-auto relative bg-[#080808]">
          {/* Fading gradient edge for smooth blend on desktop */}
          <div className="hidden lg:block absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#080808] via-[#080808]/80 to-transparent z-10" />
          <Image 
            src="/log.png" 
            alt="Inceptra VIII Event" 
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover grayscale opacity-75"
          />
        </div>

      </div>
    </div>
  );
};

export default NowHappening;
