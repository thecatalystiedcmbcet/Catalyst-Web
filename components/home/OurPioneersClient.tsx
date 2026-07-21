"use client";
import React, { useRef, useState, useEffect } from "react";
import PioneerCard from "@/components/features/PioneerCard";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { Pioneer } from "@/lib/adminStore";
import { Poppins } from 'next/font/google';
import { X, Instagram, Linkedin, Globe } from "lucide-react";
import { createPortal } from "react-dom";

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

interface OurPioneersClientProps {
  pioneers: Pioneer[];
}

const OurPioneersClient = ({ pioneers }: OurPioneersClientProps) => {
  const container = useRef<HTMLDivElement>(null);
  const [activePioneer, setActivePioneer] = useState<Pioneer | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only mount flag, required to gate the portal until after hydration
    setMounted(true);
  }, []);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        start: "top 80%",
        once: true,
      },
    });

    tl.fromTo(
      ".pioneer-header",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    ).fromTo(
      ".pioneer-desc",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
      "-=0.6"
    ).fromTo(
      ".pioneer-grid",
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.2)" },
      "-=0.4"
    );
  }, { scope: container });

  if (pioneers.length === 0) {
    return null; // Don't render the section at all if there are no pioneers
  }

  const handleClose = () => {
    setActivePioneer(null);
  };

  return (
    <div ref={container} className="text-white mx-5 md:px-9 sm:mx-15 lg:mt-32 overflow-hidden">
      <h1 className="pioneer-header text-3xl font-primary mt-20 mb-6 md:text-4xl sm:text-4xl font-normal tracking-widest uppercase">
        OUR PIONEERS
      </h1>
      <p className={`pioneer-desc text-left ${poppins.className} mb-10 leading-relaxed md:text-lg sm:text-lg text-gray-300 max-w-5xl`}>
        Catalyst is a hub of activity, where ideas are sparked and brought to life. Our events calendar is packed with opportunities for students to learn, collaborate, and grow. We believe that learning shouldn&apos;t be confined to the classroom. Our events offer a unique learning experience that goes beyond textbooks.
      </p>
      
      <div className="pioneer-grid relative w-full overflow-hidden whitespace-nowrap py-4">
        {/* Infinite Scroll Container - 3 copies is sufficient for seamless looping */}
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]" style={{ animationDuration: '40s' }}>
          {[...Array(3)].map((_, setIdx) => (
            <div key={setIdx} className="flex gap-4 md:gap-6 pr-4 md:pr-6 items-center">
              {pioneers.map((pioneer, i) => (
                <PioneerCard 
                  key={`${setIdx}-${pioneer.id || i}`} 
                  pioneer={pioneer} 
                  onTap={(p) => setActivePioneer(p)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Social Overlay Popup */}
      {mounted && activePioneer && createPortal(
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 md:hidden"
          onClick={handleClose}
        >
          <div
            className="w-full max-w-sm bg-gradient-to-b from-[#18181b] to-[#09090b] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 animate-[scaleUp_0.3s_cubic-bezier(0.16,1,0.3,1)_forwards]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-white/50 uppercase tracking-widest font-mono">PIONEER SOCIALS</span>
                <h4 className={`${poppins.className} text-base font-semibold text-white mt-0.5`}>
                  {activePioneer.name}
                </h4>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Social Links Layout */}
            <div className="flex flex-col gap-2.5">
              {activePioneer.instagram_url && (
                <a
                  href={activePioneer.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center gap-2.5 text-white/80 hover:text-white transition-all font-secondary text-sm"
                >
                  <Instagram className="w-4 h-4" />
                  Instagram
                </a>
              )}
              {activePioneer.linkedin_url && (
                <a
                  href={activePioneer.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center gap-2.5 text-white/80 hover:text-white transition-all font-secondary text-sm"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
              )}
              {activePioneer.portfolio_url && (
                <a
                  href={activePioneer.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center gap-2.5 text-white/80 hover:text-white transition-all font-secondary text-sm"
                >
                  <Globe className="w-4 h-4" />
                  Website
                </a>
              )}
              {!(activePioneer.instagram_url || activePioneer.linkedin_url || activePioneer.portfolio_url) && (
                <p className="text-white/40 text-center text-sm py-2 italic font-secondary">
                  No social links registered
                </p>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default OurPioneersClient;
