"use client";
import React, { useRef } from "react";
import Link from "next/link";
import { FaInstagram, FaLinkedinIn, FaDiscord, FaYoutube } from "react-icons/fa";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export type SocialLinks = {
  instagram_url: string;
  linkedin_url: string;
  discord_url: string;
  youtube_url: string;
};

const DEFAULT_LINKS: SocialLinks = {
  instagram_url: "https://www.instagram.com/catalyst_mbcet/",
  linkedin_url: "https://www.linkedin.com/company/catalyst-mbcet/",
  discord_url: "https://discord.gg/catalyst",
  youtube_url: "https://www.youtube.com/@catalystmbcet",
};

const Footer = ({ socialLinks = DEFAULT_LINKS }: { socialLinks?: SocialLinks }) => {
  const container = useRef<HTMLElement>(null);

  React.useEffect(() => {
    // Refresh ScrollTrigger to recalculate footer trigger offset position
    // after content is rendered and heights settle.
    const timer = setTimeout(() => {
      if (typeof window !== "undefined") {
        ScrollTrigger.refresh();
      }
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        start: "top 90%",
        once: true,
      },
    });

    tl.fromTo(
      ".footer-card",
      { y: 50, opacity: 0, scale: 0.98 },
      { y: 0, opacity: 1, scale: 1, duration: 1, ease: "power3.out" }
    ).fromTo(
      ".footer-content > *",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" },
      "-=0.6"
    ).fromTo(
      ".footer-bg-text",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
      "-=0.8"
    );
  }, { scope: container });

  return (
    <footer ref={container} className="w-full px-4 md:px-8 lg:px-12 pb-8 mt-20">
      <div className="footer-card bg-[#0f0f0f] rounded-[2.5rem] pt-20 px-8 md:px-16 pb-32 md:pb-[14vw] overflow-hidden relative flex flex-col items-center border border-neutral-800/50 shadow-2xl text-center">

        {/* Top Section */}
        <div className="footer-content z-10 flex flex-col items-center space-y-6">
          <h2 className="text-white text-xl md:text-3xl font-primary font-normal tracking-widest uppercase">
            CATALYST MAR BASELIOS IEDC
          </h2>

          <div className="flex gap-6 items-center justify-center mt-2">
            <Link href={socialLinks.instagram_url} target="_blank" className="text-gray-400 hover:text-white transition-colors">
              <FaInstagram className="w-5 h-5 md:w-6 md:h-6" />
            </Link>
            <Link href={socialLinks.linkedin_url} target="_blank" className="text-gray-400 hover:text-white transition-colors">
              <FaLinkedinIn className="w-5 h-5 md:w-6 md:h-6" />
            </Link>
            <Link href={socialLinks.discord_url} target="_blank" className="text-gray-400 hover:text-white transition-colors">
              <FaDiscord className="w-5 h-5 md:w-6 md:h-6" />
            </Link>
            <Link href={socialLinks.youtube_url} target="_blank" className="text-gray-400 hover:text-white transition-colors">
              <FaYoutube className="w-5 h-5 md:w-6 md:h-6" />
            </Link>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="footer-content flex items-center justify-center text-[10px] md:text-xs text-gray-500 font-secondary z-10 mt-16 md:mt-24">
          <p>All Rights Reserved © Catalyst IEDC 2026</p>
        </div>

        {/* Huge Text Background */}
        <div className="footer-bg-text w-full flex justify-center mt-auto -mb-[3%] select-none pointer-events-none absolute bottom-0 left-0 right-0 overflow-hidden">
          <h1 className="text-[15.5vw] leading-[0.75] font-primary font-normal uppercase text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-neutral-900 tracking-tighter whitespace-nowrap text-center w-full">
            CATALYST
          </h1>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
