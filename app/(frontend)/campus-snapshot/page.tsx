"use client";
import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import localFont from "next/font/local";
import Image from "next/image";

const enigmaFont = localFont({
  src: "../../../public/fonts/enigma.otf",
  display: "swap",
});

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const CampusSnapshot = () => {
  const container = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [topLearners, setTopLearners] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [topIGs, setTopIGs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("https://mulearn.org/api/v1/public/campus-details/mbt/");
        if (res.ok) {
          const data = await res.json();
          const details = data.response.campus_details;
          
          setStats([
            { id: "rank", label: "CAMPUS RANK", value: `#${details.rank}` },
            { id: "karma", label: "TOTAL KARMA", value: details.total_karma.toLocaleString() },
            { id: "members", label: "TOTAL MEMBERS", value: details.total_members.toLocaleString() },
            { id: "active", label: "ACTIVE MEMBERS", value: details.active_members.toLocaleString() },
          ]);
          
          setTopLearners(data.response.top_learners || []);
          setTopIGs((data.response.ig_details || []).slice(0, 5));
        }
      } catch (error) {
        console.error("Failed to fetch campus stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

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
      { height: 0 },
      { height: "100%", duration: 1.5, ease: "power3.inOut" },
      "-=0.4"
    ).fromTo(
      ".snapshot-item",
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.8, stagger: 0.15, ease: "power3.out" },
      "-=1.2"
    );
  }, { scope: container });

  return (
    <div ref={container} className="min-h-screen bg-transparent pt-32 pb-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-20 relative z-10 flex justify-start">
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
            <div className="snapshot-line absolute left-[17px] md:left-[21px] top-5 bottom-5 w-1 bg-white origin-top z-0 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />

            <div className="flex flex-col gap-10 md:gap-14 relative z-10">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="snapshot-item relative flex items-start gap-6 md:gap-8">
                    <Skeleton className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 shrink-0" />
                    <div className="flex flex-col pt-1 w-full max-w-[300px]">
                      <Skeleton className="h-4 w-24 bg-white/10 mb-2" />
                      <Skeleton className="h-10 w-full bg-white/10" />
                    </div>
                  </div>
                ))
              ) : stats.length > 0 ? (
                stats.map((item, index) => (
                  <div key={item.id || index} className="snapshot-item relative flex items-start gap-6 md:gap-8 group">

                    {/* Timeline Node */}
                    <div className="relative z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#0a0a0a] flex items-center justify-center border border-white/30 text-white shrink-0 group-hover:border-white transition-colors duration-300">
                      <span className={`text-sm md:text-base ${enigmaFont.className} [text-shadow:-1.5px_0_0_#0ff,1.5px_0_0_#f00]`}>μ</span>
                    </div>

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
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-20 relative">
          
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
          <div className="grid grid-cols-6 gap-x-6 md:gap-x-10 gap-y-8 md:gap-y-12 relative z-10">
            {isLoading ? (
              Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className={`flex items-start gap-3 md:gap-5 ${i < 2 ? 'col-span-6 lg:col-span-3' : 'col-span-6 sm:col-span-3 lg:col-span-2'}`}>
                  <Skeleton className={`relative shrink-0 bg-white/10 ${i < 2 ? 'w-20 h-20 md:w-[130px] md:h-[130px]' : 'w-16 h-16 md:w-[110px] md:h-[120px]'}`} />
                  <div className="flex flex-col w-full">
                    <Skeleton className="h-8 w-16 bg-white/10 mb-2" />
                    <Skeleton className="h-6 w-32 bg-white/10 mb-2" />
                    <Skeleton className="h-4 w-24 bg-white/10 mb-2" />
                    <Skeleton className="h-8 w-20 bg-white/10" />
                  </div>
                </div>
              ))
            ) : topLearners.slice(0, 20).map((learner, i) => {
              const rank = i + 1;
              const isTop2 = rank <= 2;
              const name = learner.full_name;

              return (
                <div
                  key={rank}
                  className={`flex items-start gap-3 md:gap-5 ${isTop2 ? 'col-span-6 lg:col-span-3' : 'col-span-6 sm:col-span-3 lg:col-span-2'}`}
                >
                  {/* Avatar */}
                  <div className={`relative shrink-0 bg-white/10 ${isTop2 ? 'w-20 h-20 md:w-[130px] md:h-[130px]' : 'w-16 h-16 md:w-[110px] md:h-[120px]'}`}>
                    <Image
                      src={learner.profile_pic || `https://ui-avatars.com/api/?name=${encodeURIComponent(learner.full_name)}&background=random`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      alt={name}
                      className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  {/* Text */}
                  <div className="flex flex-col text-white overflow-hidden min-w-0">
                    <div className={`leading-none tracking-wide ${enigmaFont.className} ${isTop2 ? 'text-3xl md:text-[40px]' : 'text-2xl md:text-[34px]'}`}>
                      #{rank}
                    </div>
                    <div className={`uppercase leading-[1.15] whitespace-pre-line tracking-wide ${enigmaFont.className} mt-1 ${isTop2 ? 'text-base md:text-[20px]' : 'text-xs md:text-[15px]'}`}>
                      {name.split(" ").join("\n")}
                    </div>
                    <div className={`text-white/70 font-mono mt-0.5 tracking-tight truncate ${isTop2 ? 'text-[10px] md:text-[13px]' : 'text-[9px] md:text-[12px]'}`}>
                      {learner.muid}
                    </div>
                    <div className={`leading-none tracking-wider ${enigmaFont.className} mt-1.5 ${isTop2 ? 'text-2xl md:text-[36px]' : 'text-xl md:text-[30px]'}`}>
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
      <section className="w-full bg-transparent pt-24 pb-32 relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-20 relative">
          
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
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex flex-col w-full">
                  <Skeleton className="h-10 w-16 bg-white/10 mb-2" />
                  <Skeleton className="h-6 w-48 bg-white/10 mb-2" />
                  <Skeleton className="h-4 w-24 bg-white/10 mb-4" />
                  <Skeleton className="h-10 w-32 bg-white/10" />
                </div>
              ))
            ) : topIGs.map((ig, i) => {
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

export default CampusSnapshot;
