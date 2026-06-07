"use client";

import React, { useRef } from "react";
import WatermarkHeader from "@/components/home/WatermarkHeader";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import localFont from 'next/font/local';

const enigma = localFont({
  src: "../../../public/fonts/enigma.otf",
  weight: "100",
  style: "normal",
});
/* ---------------- SKELETON COMPONENTS ---------------- */

const CardSkeleton = () => (
  <div className="execom-card flex flex-col items-center text-center animate-pulse">
    <div className="relative">
      <div className="w-50 h-50 bg-gray-700" />
    </div>
    <div className="flex flex-col items-center mt-5 w-full">
      <div className="h-6 w-32 bg-gray-700 rounded mb-2" />
      <div className="h-4 w-24 bg-gray-600 rounded mb-3" />
      <div className="mt-3 flex gap-5">
        <div className="w-5 h-5 bg-gray-700 rounded-full" />
        <div className="w-5 h-5 bg-gray-700 rounded-full" />
      </div>
    </div>
  </div>
);

const CardSkeletonInvert = () => (
  <div className="execom-card flex flex-col items-center text-center animate-pulse">
    <div className="relative">
      <div className="w-50 h-50 bg-gray-300" />
    </div>
    <div className="flex flex-col items-center mt-5 w-full">
      <div className="h-6 w-32 bg-gray-300 rounded mb-2" />
      <div className="h-4 w-24 bg-gray-400 rounded mb-3" />
      <div className="mt-3 flex gap-5">
        <div className="w-5 h-5 bg-gray-300 rounded-full" />
        <div className="w-5 h-5 bg-gray-300 rounded-full" />
      </div>
    </div>
  </div>
);

/* ---------------- CARD ---------------- */

const Card = ({ invert = false, data = null as any, loading = true }) => {
  const bgClass = invert ? "bg-black" : "bg-white";
  const textClass = invert ? "text-black" : "text-white";

  if (loading) {
    return invert ? <CardSkeletonInvert /> : <CardSkeleton />;
  }

  return (
    <div className={`execom-card flex flex-col items-center text-center ${textClass}`}>
      <div className="relative">
        <div className={`${bgClass} w-50 h-50 overflow-hidden`} />
        <div className="absolute bottom-0 left-0">
          <img
            src={data?.image ?? "/sab.png"}
            alt={data?.name ?? ""}
            className="h-full w-full object-contain"
          />
        </div>
      </div>
      <div className="flex flex-col items-center">
        <h2 className="font-primary text-2xl mt-5">
          {data?.name ?? "SABAREESH"}
        </h2>
        <p className="font-secondary text-sm">
          {data?.role ?? "Chief Operations Officer"}
        </p>
        <div className="mt-3 flex gap-5">
          <img src="/social/insta.svg" alt="Instagram" className="w-5" />
          <img src="/social/link.svg" alt="LinkedIn" className="w-5" />
        </div>
      </div>
    </div>
  );
};

/* ---------------- EXECOM ---------------- */

const Execom = () => {
  // Simulate loading state — replace with real API state
  const isLoading = true;

  // Simulated API shape — replace with real fetch
  const featured = null;
  const legacyLeaders = [null, null, null, null];
  const coreTeam = [null, null, null, null, null, null];

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
      ".execom-card",
      { y: 40, opacity: 0, scale: 0.98 },
      { y: 0, opacity: 1, scale: 1, duration: 1, ease: "power3.out", stagger: 0.1 },
      "-=0.4"
    );
  }, { scope: container });

  return (
    <div ref={container}>
      {/* ── HERO TITLE ── */}
      <div className="w-full pt-20 lg:pt-40">
        <WatermarkHeader 
          title="THE CATALYST FAMILY"
          watermark="CATALYST"
          titleClassName={`${enigma.className} nh-title drop-shadow-lg !text-[4vw] md:text-4xl lg:text-5xl`}
          watermarkClassName={`${enigma.className} nh-watermark tracking-[1em] !text-[12vw] md:!text-[12vw] lg:!text-[12vw]`}
        />
      </div>

      {/* ── FEATURED LEAD ── */}
      <div className="flex justify-center mt-[-40px]">
        <Card loading={isLoading} data={featured} invert={false} />
      </div>

      {/* ── CORE TEAM ── */}
      <div className="mt-20 mx-5">
        <h2 className="font-primary text-xl text-white text-center mb-10 sm:text-2xl md:text-3xl">
          CORE TEAM
        </h2>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6">
          {coreTeam.map((member, index) => (
            <Card
              key={index}
              loading={isLoading}
              data={member}
              invert={false}
            />
          ))}
        </div>
      </div>

      {/* ── LEGACY LEADERS ── */}
      <div className="bg-white pt-10 mt-20 mx-5 pb-10">
        <h2 className="font-primary text-xl mt-5 text-black text-center mb-10 sm:text-2xl md:text-3xl">
          LEGACY LEADERS
        </h2>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-2 md:grid-cols-4">
          {legacyLeaders.map((member, index) => (
            <Card key={index} loading={isLoading} data={member} invert={true} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Execom;
