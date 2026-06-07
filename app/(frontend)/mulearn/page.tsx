"use client";
import React from "react";
import CampusStatistics from "@/components/CampusStatistics";
import DiscordSection from "@/components/DiscordSection";

const MuLearn = () => {
  return (
    <div className="min-h-screen bg-transparent -mb-20 md:-mb-32">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] md:h-[75vh] flex flex-col items-center justify-end pb-8">
        {/* Masking the image so it fades its opacity to 0 at the bottom */}
        <div
          className="absolute inset-0 pointer-events-none -z-10"
          style={{
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)'
          }}
        >
          <img
            src="/mu.png"
            alt="MuLearn Group"
            className="w-full h-full object-cover object-center grayscale"
          />
        </div>

        {/* Content over the hero image/fade */}
        <div className="flex flex-col items-center z-10 w-full px-4 text-center mt-auto">
          {/* Join Button */}
          <button className="mb-6 px-8 py-2.5 rounded-full border border-white/20 bg-[#1a1a1a]/80 backdrop-blur-md text-white font-secondary text-sm font-medium hover:bg-white/20 transition-all cursor-pointer">
            Join μLearn
          </button>

          <h1 className="text-[32px] md:text-[50px] font-primary font-normal leading-none tracking-normal text-white uppercase drop-shadow-2xl">
            MULEARN FOUNDATION
          </h1>
        </div>
      </section>

      {/* Description Section */}
      <section className="max-w-6xl mx-auto px-6 mt-4 md:mt-6 text-center z-10 relative">
        <p className="text-gray-300 font-secondary font-medium text-[15px] md:text-[18px] leading-[24px] md:leading-[30px] tracking-tight md:tracking-[-0.03em]">
          GTech μLearn is a synergic philosophy of education, with a culture of mutual learning through micro peer groups.
          We are here to assist you in breaking through the echo chambers and free you from the shackles you have
          grounded yourself in. And we are one of the campuses of the foundation.
        </p>
      </section>

      {/* Campus Statistics Section */}
      <CampusStatistics />

      {/* Discord Section */}
      <DiscordSection />
    </div>
  );
};

export default MuLearn;
