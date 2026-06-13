"use client";
import React, { useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const Hero3D = dynamic(() => import("@/components/home/Hero3D"), {
  ssr: false,
  loading: () => null,
});

const HeroSection = () => {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.fromTo(
      ".hero-title",
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.2 }
    );
    tl.fromTo(
      ".hero-subtitle",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
      "-=0.6"
    );
  }, { scope: container });

  return (
    <div ref={container} className="pb-20">
      <div className="w-screen h-[60vh] mt-23 overflow-hidden flex flex-col items-center px-9 relative lg:h-[60vh]">
        <Hero3D />
      </div>
      <section className="flex flex-col items-center">
        <div className="flex flex-col items-center">
          <div className="z-10">
            <h1 className="hero-title text-white text-[12.5dvw] font-primary text-center leading-none">
              CATALYST{" "}
            </h1>
          </div>
          <div className="z-10 -mt-2 md:-mt-6">
            <h2 className="hero-subtitle text-white/40 text-2xl xl:text-5xl font-primary text-center lg:text-4xl">
              MAR BASELIOS IEDC
            </h2>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HeroSection;
