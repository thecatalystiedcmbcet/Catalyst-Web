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
  src: "../../../../public/fonts/enigma.otf",
  weight: "100",
  style: "normal",
});

const ExecomMember = ({ name, title }: { name: string; title: string }) => {
  return (
    <div className="team-member-card flex flex-col items-center group">
      {/* Grayscale image container */}
      <div className="w-36 h-36 md:w-48 md:h-48 relative overflow-hidden mb-4 bg-white/5 grayscale transition-all duration-300 group-hover:grayscale-0">
        <Image 
          src="/sab.png" 
          alt={name}
          fill
          className="object-cover object-center"
        />
      </div>
      {/* Details */}
      <h3 className={`${enigma.className} text-white text-base md:text-xl uppercase tracking-wider mb-1 text-center`}>
        {name}
      </h3>
      <p className="text-gray-300 font-secondary text-[10px] md:text-xs text-center mb-3 max-w-[180px]">
        {title}
      </p>
      {/* Socials */}
      <div className="flex gap-4 items-center justify-center">
        <Link href="#" className="text-gray-400 hover:text-white transition-colors">
          <FaInstagram className="w-4 h-4" />
        </Link>
        <Link href="#" className="text-gray-400 hover:text-white transition-colors">
          <FaLinkedinIn className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

const MuLearnExecom = () => {
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
      ".team-member-card",
      { y: 40, opacity: 0, scale: 0.98 },
      { y: 0, opacity: 1, scale: 1, duration: 1, ease: "power3.out", stagger: 0.1 },
      "-=0.4"
    );
  }, { scope: container });

  return (
    <div ref={container} className="min-h-screen bg-transparent pb-16 relative px-5 sm:px-10 lg:px-20 pt-40">
      <WatermarkHeader 
        title="MULEARN WORKFORCE"
        watermark="MULEARN"
        titleClassName={`${enigma.className} nh-title drop-shadow-lg !text-[4vw] md:text-4xl lg:text-5xl`}
        watermarkClassName={`${enigma.className} nh-watermark tracking-[1em] !text-[12vw] md:!text-[12vw] lg:!text-[12vw]`}
      />

      <div className="w-full px-5 sm:px-10 lg:px-20 relative z-10 flex flex-col items-center mt-16 md:mt-24">

        {/* Row 1 (2 items) */}
        <div className="flex justify-center gap-8 md:gap-24 mb-12 md:mb-16 w-full">
          <ExecomMember name="SABAREESH" title="Chief Nodal Officer" />
          <ExecomMember name="SABAREESH" title="Chief Nodal Officer" />
        </div>

        {/* Row 2 (4 items) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-8 lg:gap-12 mb-12 md:mb-16 w-full max-w-5xl justify-items-center">
          <ExecomMember name="SABAREESH" title="Chief Executive Officer" />
          <ExecomMember name="SABAREESH" title="Chief Operations Officer" />
          <ExecomMember name="SABAREESH" title="Chief Skill Officer" />
          <ExecomMember name="SABAREESH" title="Chief Technical Officer" />
        </div>

        {/* Row 3 (4 items) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-8 lg:gap-12 w-full max-w-5xl justify-items-center">
          <ExecomMember name="SABAREESH" title="Chief Marketing Officer" />
          <ExecomMember name="SABAREESH" title="Chief Creative Officer" />
          <ExecomMember name="SABAREESH" title="Chief Finance Officer" />
          <ExecomMember name="SABAREESH" title="Chief Vibe Officer" />
        </div>
      </div>
    </div>
  );
};

export default MuLearnExecom;
