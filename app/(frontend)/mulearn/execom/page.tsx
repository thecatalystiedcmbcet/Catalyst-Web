"use client";
import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import localFont from 'next/font/local';
import WatermarkHeader from '@/components/home/WatermarkHeader';
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

import TeamMemberCard from '@/components/TeamMemberCard';


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
        titleClassName={`font-primary font-extrabold nh-title drop-shadow-lg !text-[4vw] md:text-4xl lg:text-5xl`}
        watermarkClassName={`font-primary font-extrabold nh-watermark tracking-[1em] !text-[12vw] md:!text-[12vw] lg:!text-[12vw]`}
      />

      <div className="w-full px-5 sm:px-10 lg:px-20 relative z-10 flex flex-col items-center mt-16 md:mt-24">

        {/* Row 1 (2 items) */}
        <div className="flex justify-center gap-8 md:gap-24 mb-12 md:mb-16 w-full">
          <TeamMemberCard name="SABAREESH" role="Chief Nodal Officer" subtitle="Nodal Officer, 2024" />
          <TeamMemberCard name="SABAREESH" role="Chief Nodal Officer" subtitle="Nodal Officer, 2024" />
        </div>

        {/* Row 2 (4 items) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-8 lg:gap-12 mb-12 md:mb-16 w-full max-w-5xl justify-items-center">
          <TeamMemberCard name="SABAREESH" role="Chief Executive Officer" subtitle="CEO, 2024" />
          <TeamMemberCard name="SABAREESH" role="Chief Operations Officer" subtitle="COO, 2024" />
          <TeamMemberCard name="SABAREESH" role="Chief Skill Officer" subtitle="CSO, 2024" />
          <TeamMemberCard name="SABAREESH" role="Chief Technical Officer" subtitle="CTO, 2024" />
        </div>

        {/* Row 3 (4 items) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-8 lg:gap-12 w-full max-w-5xl justify-items-center">
          <TeamMemberCard name="SABAREESH" role="Chief Marketing Officer" subtitle="CMO, 2024" />
          <TeamMemberCard name="SABAREESH" role="Chief Creative Officer" subtitle="CCO, 2024" />
          <TeamMemberCard name="SABAREESH" role="Chief Finance Officer" subtitle="CFO, 2024" />
          <TeamMemberCard name="SABAREESH" role="Chief Vibe Officer" subtitle="CVO, 2024" />
        </div>
      </div>
    </div>
  );
};

export default MuLearnExecom;
