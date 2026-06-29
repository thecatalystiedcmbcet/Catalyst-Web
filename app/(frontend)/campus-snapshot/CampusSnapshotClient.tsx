"use client";
import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import localFont from "next/font/local";
import Image from "next/image";

export interface CampusStat {
  id: string;
  label: string;
  value: string;
}

export interface TopLearner {
  full_name: string;
  muid: string;
  karma: number;
  profile_pic: string | null;
}

export interface TopIG {
  ig_name: string;
  members: number;
  total_karma: number;
}

interface CampusSnapshotClientProps {
  stats: CampusStat[];
  topLearners: TopLearner[];
  topIGs: TopIG[];
}

const enigmaFont = localFont({
  src: "../../../public/fonts/enigma.otf",
  display: "swap",
});

const CampusSnapshotClient: React.FC<CampusSnapshotClientProps> = ({ stats, topLearners, topIGs }) => {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        start: "top 80%",
      },
    });

    tl.fromTo(
      ".snapshot-header",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    ).fromTo(
      ".snapshot-line",
      { scaleY: 0 },
      { scaleY: 1, duration: 1.5, ease: "power3.inOut" },
      "-=0.4"
    ).fromTo(
      ".snapshot-item",
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.8, stagger: 0.15, ease: "power3.out" },
      "-=1.2"
    );
  }, { scope: container });

  return (
    <div ref={container} className="min-h-screen bg-transparent pt-40 relative overflow-hidden">
      <div className="max-w-[95vw] lg:max-w-[90vw] mx-auto px-4 sm:px-8 lg:px-12 relative z-10 flex justify-start">
        <div className="w-full flex flex-col">
          <div className="snapshot-header mb-16">
            <h1 className={`text-[5.5vw] sm:text-5xl md:text-6xl lg:text-[64px] whitespace-nowrap text-white uppercase leading-[1.05] mb-4 tracking-wide ${enigmaFont.className}`}>
              MULEARN MBCET<br/>
              CAMPUS SNAPSHOT
            </h1>
            
            <div className={`flex items-center gap-3 text-gray-400 font-secondary text-sm md:text-base`}>
              <div className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
              Live stats from the MuLearn Foundation Platform
            </div>
          </div>

          <div className="relative mt-4 md:mt-8 w-full">
            <div className="flex flex-col gap-10 md:gap-14 relative z-10">
              {stats.length > 0 ? (
                stats.map((item, index) => (
                  <div key={item.id || index} className="snapshot-item relative flex items-start gap-6 md:gap-8 group">
                    {/* Connecting Line */}
                    {index !== stats.length - 1 && (
                      <div className="snapshot-line absolute left-[20px] md:left-[24px] top-[20px] md:top-[24px] bottom-[calc(-2.5rem-20px)] md:bottom-[calc(-3.5rem-24px)] w-[4px] bg-white -translate-x-1/2 origin-top z-0 shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                    )}

                    {/* Timeline Node */}
                    <svg className="relative z-10 w-10 h-10 md:w-12 md:h-12 shrink-0 drop-shadow-[4px_4px_8px_rgba(0,0,0,0.6)]" viewBox="0 0 47 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="23.9089" cy="23.0925" r="23.0925" fill="#D9D9D9"/>
                      <circle cx="23.0925" cy="24.7226" r="23.0925" fill="#171717"/>
                      <path d="M29.8469 25.2624C30.3631 25.2624 30.7816 25.6809 30.7816 26.1971V26.8462C30.7816 27.7066 30.0841 28.4041 29.2237 28.4041C27.9255 28.4041 26.9648 27.9713 26.3417 27.1058C25.5281 28.2137 24.2732 28.7676 22.5768 28.7676C21.4958 28.7676 20.24 29.5493 20.24 30.6302V31.9222C20.24 32.8471 19.4902 33.5969 18.5653 33.5969C17.6404 33.5969 16.8906 32.8471 16.8906 31.9222V17.0966C16.8906 16.1717 17.6404 15.4219 18.5653 15.4219C19.4902 15.4219 20.24 16.1717 20.24 17.0966V22.9515C20.24 23.817 20.4737 24.4834 20.9411 24.9508C21.4084 25.4182 22.0316 25.6518 22.8105 25.6518C23.676 25.6518 24.3684 25.3835 24.8877 24.8469C25.4069 24.3103 25.6666 23.5055 25.6666 22.4323V17.0966C25.6666 16.1717 26.4164 15.4219 27.3413 15.4219C28.2662 15.4219 29.016 16.1717 29.016 17.0966V24.4315C29.016 24.9854 29.2929 25.2624 29.8469 25.2624Z" fill="white"/>
                    </svg>

                    {/* Content */}
                    <div className="flex flex-col pt-1">
                      <span className="font-mono text-white/50 text-xs md:text-sm mb-1 tracking-wider">
                        {item.label}
                      </span>
                      <span className={`text-white text-2xl md:text-[36px] uppercase leading-tight tracking-wide whitespace-pre-line ${enigmaFont.className}`}>
                        {item.value}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-white/50">No campus stats found.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Karma Miners Section */}
      <section className="w-full bg-gradient-to-br from-[#0617e1] via-[#050f8f] to-[#040638] pt-24 pb-32 relative mt-32 z-10 border-t border-white/10">
        <div className="max-w-[95vw] lg:max-w-[90vw] mx-auto px-4 sm:px-8 lg:px-12 relative">
          
          <div className="flex flex-col relative z-10 mb-20">
            <h2 className={`text-5xl md:text-6xl text-white uppercase leading-[1.1] tracking-wide ${enigmaFont.className}`}>
              TOP 20<br/>
              KARMA MINERS
            </h2>
          </div>

          {/* Faded Watermark */}
          <div className={`absolute -top-10 right-0 md:right-10 text-[180px] md:text-[250px] text-white/5 font-bold leading-none pointer-events-none select-none ${enigmaFont.className}`}>
            20
          </div>

          {/* All 20 ranks in a unified grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 md:gap-x-10 lg:gap-x-12 gap-y-8 md:gap-y-12 relative z-10">
            {topLearners.slice(0, 20).map((learner, i) => {
              const rank = i + 1;
              const name = learner.full_name;

              // Grid Span
              const colSpan = rank === 1 ? "col-span-1 sm:col-span-2 lg:col-span-2" : "col-span-1 sm:col-span-1 lg:col-span-1";

              // Font Size & Avatar Size Hierarchy
              let rankSize = "text-xl sm:text-2xl lg:text-[28px]";
              let nameSize = "text-xs sm:text-sm lg:text-[13px]";
              let karmaSize = "text-lg sm:text-xl lg:text-[24px]";
              let avatarSize = "w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32";

              if (rank === 1) {
                rankSize = "text-4xl sm:text-5xl lg:text-[48px]";
                nameSize = "text-lg sm:text-xl lg:text-[24px]";
                karmaSize = "text-3xl sm:text-4xl lg:text-[42px]";
                avatarSize = "w-28 h-28 sm:w-32 sm:h-32 lg:w-40 lg:h-40";
              } else if (rank === 2) {
                rankSize = "text-2xl sm:text-3xl lg:text-[34px]";
                nameSize = "text-sm sm:text-base lg:text-[15px]";
                karmaSize = "text-xl sm:text-2xl lg:text-[30px]";
              }

              return (
                <div
                  key={rank}
                  className={`flex items-start gap-4 md:gap-5 ${colSpan}`}
                >
                  {/* Avatar */}
                  <div className={`relative shrink-0 bg-white/10 ${avatarSize}`}>
                    <Image
                      src={learner.profile_pic || `https://ui-avatars.com/api/?name=${encodeURIComponent(learner.full_name)}&background=random`}
                      fill
                      sizes={rank === 1 ? "(max-width: 640px) 112px, (max-width: 1024px) 128px, 160px" : "(max-width: 640px) 96px, (max-width: 1024px) 112px, 128px"}
                      priority={rank <= 2}
                      alt={name}
                      className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  {/* Text */}
                  <div className="flex flex-col text-white overflow-hidden min-w-0">
                    <div className={`leading-none tracking-wide ${enigmaFont.className} ${rankSize}`}>
                      #{rank}
                    </div>
                    <div className={`uppercase leading-[1.15] tracking-wide ${enigmaFont.className} mt-1 ${nameSize}`}>
                      {name}
                    </div>
                    <div className="text-white/70 font-mono mt-0.5 tracking-tight truncate text-[9px] sm:text-[10px] md:text-[11px]">
                      {learner.muid}
                    </div>
                    <div className={`leading-none tracking-wider ${enigmaFont.className} mt-1.5 ${karmaSize}`}>
                      {learner.karma.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Top 5 Interest Groups Section */}
      <section className="w-full bg-transparent pt-24 pb-12 relative z-10 border-t border-white/5">
        <div className="max-w-[95vw] lg:max-w-[90vw] mx-auto px-4 sm:px-8 lg:px-12 relative">
          
          <div className="flex flex-col relative z-10 mb-20">
            <h2 className={`text-[6vw] sm:text-5xl md:text-6xl whitespace-nowrap text-white uppercase leading-[1.1] tracking-wide ${enigmaFont.className}`}>
              TOP 5<br/>
              INTEREST GROUPS
            </h2>
          </div>

          {/* Faded Watermark */}
          <div className={`absolute -top-10 right-0 md:right-10 text-[180px] md:text-[250px] text-white/5 font-bold leading-none pointer-events-none select-none ${enigmaFont.className}`}>
            05
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 relative z-10">
            {topIGs.map((ig, i) => {
              const rank = i + 1;
              return (
                <div key={rank} className="flex flex-col text-white">
                  <div className={`text-4xl md:text-[44px] leading-none mb-1 text-white tracking-wide ${enigmaFont.className}`}>
                    #{rank}
                  </div>
                  <div className={`uppercase leading-[1.1] tracking-wide ${enigmaFont.className} text-xl md:text-[22px] mt-2`}>
                    {ig.ig_name}
                  </div>
                  <div className={`text-xs md:text-[14px] text-white/70 ${enigmaFont.className} mt-1 tracking-tight`}>
                    Members: {ig.members.toLocaleString()}
                  </div>
                  <div className={`text-3xl md:text-[40px] mt-4 leading-none tracking-wider ${enigmaFont.className}`}>
                    {ig.total_karma.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CampusSnapshotClient;
