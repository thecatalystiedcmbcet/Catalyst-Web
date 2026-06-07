"use client";
import Image from "next/image";
import React, { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import LogoContainer from "@/components/LogoContainer";
import { Environment, OrbitControls } from "@react-three/drei";
import { DM_Sans, Darker_Grotesque } from "next/font/google";
import { useWindowSize } from "@/hooks/useWindowSize";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const dm = Darker_Grotesque({ subsets: ["latin"] });

const HeroSection = () => {
  const { width } = useWindowSize();
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
        <Canvas camera={{ position: [0, -55, 110], fov: width < 1024 ? 6 : 4 }}>
          <Environment
            files={[
              "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/studio_small_09_4k.hdr",
            ]}
          />

          <LogoContainer />
        </Canvas>
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
