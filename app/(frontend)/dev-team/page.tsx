"use client";
import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import localFont from 'next/font/local';
import WatermarkHeader from '@/components/home/WatermarkHeader';
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

const enigma = localFont({
  src: "../../../public/fonts/enigma.otf",
  weight: "100",
  style: "normal",
});

const CabnetFont = localFont({
  src: "../../../public/fonts/CabinetGrotesk-Variable.ttf",
  weight: "200",
  style: "normal",
});

const WebTeamMember = ({ name, role, subtitle }: { name: string; role: string; subtitle: string }) => {
  return (
    <div className="web-team-card flex flex-col items-center group w-full max-w-[180px]">
      {/* Grayscale image container */}
      <div className="w-full aspect-square relative overflow-hidden mb-4 bg-white/5 grayscale transition-all duration-300 group-hover:grayscale-0">
        <Image
          src="/sab.png"
          alt={name}
          fill
          className="object-cover object-center"
        />
      </div>
      {/* Details */}
      <h3 className={`${enigma.className} text-white text-sm md:text-base uppercase tracking-wider mb-1 text-center`}>
        {name}
      </h3>
      <p className="text-white font-secondary text-[10px] md:text-xs text-center font-semibold mb-0.5">
        {role}
      </p>
      <p className="text-gray-400 font-secondary text-[9px] md:text-[10px] text-center mb-3">
        {subtitle}
      </p>
      {/* Socials */}
      <div className="flex gap-4 items-center justify-center">
        <Link href="#" className="text-gray-400 hover:text-white transition-colors">
          <FaInstagram className="w-3 h-3 md:w-4 md:h-4" />
        </Link>
        <Link href="#" className="text-gray-400 hover:text-white transition-colors">
          <FaLinkedinIn className="w-3 h-3 md:w-4 md:h-4" />
        </Link>
      </div>
    </div>
  );
};

const DevTeamPage = () => {
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
      ".web-team-card",
      { y: 40, opacity: 0, scale: 0.98 },
      { y: 0, opacity: 1, scale: 1, duration: 1, ease: "power3.out", stagger: 0.1 },
      "-=0.4"
    ).fromTo(
      ".v1-section",
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
      "-=0.5"
    );
  }, { scope: container });

  return (
    <div ref={container} className="min-h-screen bg-transparent pb-16 relative px-5 sm:px-10 lg:px-20 pt-40">
      <WatermarkHeader
        title="WEB WORKFORCE"
        watermark="CATALYST"
        titleClassName={`${enigma.className} nh-title drop-shadow-lg !text-[4vw] md:text-4xl lg:text-5xl`}
        watermarkClassName={`${enigma.className} nh-watermark tracking-[1em] !text-[12vw] md:!text-[12vw] lg:!text-[12vw]`}
      />

      <div className="w-full px-5 sm:px-10 lg:px-20 relative z-10 flex flex-col items-center mt-12 md:mt-24">

        {/* Row 1 (5 items) */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-12 w-full">
          <WebTeamMember name="SABAREESH" role="Web Designer" subtitle="Creative Director, 2024" />
          <WebTeamMember name="SABAREESH" role="Web Designer" subtitle="Creative Director, 2024" />
          <WebTeamMember name="SABAREESH" role="Web Designer" subtitle="Creative Director, 2024" />
          <WebTeamMember name="SABAREESH" role="Web Designer" subtitle="Creative Director, 2024" />
          <WebTeamMember name="SABAREESH" role="Web Designer" subtitle="Creative Director, 2024" />
        </div>

        {/* Row 2 (4 items) */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-20 md:mb-32 w-full max-w-4xl">
          <WebTeamMember name="SABAREESH" role="Web Designer" subtitle="Creative Director, 2024" />
          <WebTeamMember name="SABAREESH" role="Web Designer" subtitle="Creative Director, 2024" />
          <WebTeamMember name="SABAREESH" role="Web Designer" subtitle="Creative Director, 2024" />
          <WebTeamMember name="SABAREESH" role="Web Designer" subtitle="Creative Director, 2024" />
        </div>

        {/* CATALYST WEB V1 Section */}
        <div className="v1-section flex flex-col items-center w-full max-w-4xl text-center mb-8">
          <h2 className={`${enigma.className} text-white text-2xl md:text-3xl lg:text-4xl mb-6 tracking-wide`}>
            CATALYST WEB V1
          </h2>
          <p className={`${CabnetFont.className} text-gray-300 text-sm md:text-base leading-relaxed mb-12 max-w-3xl`}>
            Catalyst is a hub of activity, where ideas are sparked and brought to life. Our events
            calendar is packed with opportunities for students to learn, collaborate, and grow. We
            believe that learning shouldn't be confined to the classroom. Our events offer a unique
            learning experience that goes beyond textbooks.
          </p>

          <div className="w-full relative overflow-hidden mb-16 px-4 md:px-0">
            <Image
              src="/featured.jpg"
              alt="Catalyst Web V1 Team"
              width={1200}
              height={600}
              className="w-full h-auto object-cover rounded-sm shadow-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevTeamPage;
