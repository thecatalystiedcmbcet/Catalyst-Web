"use client";
import React, { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const HeroSection = () => {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    // Logo fade-in and float animation
    tl.fromTo(
      ".hero-logo",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: "power3.out" }
    );

    // Continuous subtle floating effect
    gsap.to(".hero-logo", {
      y: -15,
      duration: 2,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });

    tl.fromTo(
      ".hero-title",
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
      "-=0.8" // Start slightly before logo finishes
    );
    tl.fromTo(
      ".hero-subtitle",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
      "-=0.6"
    );
  }, { scope: container });

  return (
    <div ref={container} className="pb-20 lg:pb-18 h-[100dvh] lg:h-auto flex flex-col lg:block">
      <div className="w-screen flex-1 lg:flex-none lg:h-[60vh] mt-[180px] lg:mt-28 overflow-hidden flex flex-col items-center justify-center px-9 relative">
        <Image
          src="/hero_logo.png"
          alt="Catalyst Logo"
          width={800}
          height={800}
          className="hero-logo w-[75%] md:w-[40%] lg:w-[29%] max-w-[400px] h-auto object-contain"
          priority
        />
      </div>
      <section className="flex flex-col items-center mt-auto lg:mt-0">
        <div className="flex flex-col items-center">
          <div className="z-10">
            <h1 className="hero-title text-white text-[8dvw] font-primary text-center leading-none">
              CATALYST{" "}
            </h1>
          </div>
          <div className="z-10 -mt-2 md:-mt-4">
            <h2 className="hero-subtitle text-white/40 text-xl xl:text-4xl font-primary text-center lg:text-2xl">
              MAR BASELIOS IEDC
            </h2>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HeroSection;
