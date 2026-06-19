/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, prefer-const, @next/next/no-img-element */
"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import WatermarkHeader from "@/components/home/WatermarkHeader";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import localFont from 'next/font/local';
import TeamMemberCard from '@/components/features/TeamMemberCard';
import { decodeSectionTitle } from "@/lib/adminStore";


const enigma = localFont({
  src: "../../../public/fonts/enigma.otf",
  weight: "100",
  style: "normal",
});
/* ---------------- SKELETON COMPONENTS ---------------- */

const CardSkeleton = () => (
  <div className="execom-card flex flex-col items-center text-center animate-pulse">
    <div className="relative">
      <div className="w-50 h-50 bg-gray-700" />
    </div>
    <div className="flex flex-col items-center mt-5 w-full">
      <div className="h-6 w-32 bg-gray-700 rounded mb-2" />
      <div className="h-4 w-24 bg-gray-600 rounded mb-3" />
      <div className="mt-3 flex gap-5">
        <div className="w-5 h-5 bg-gray-700 rounded-full" />
        <div className="w-5 h-5 bg-gray-700 rounded-full" />
      </div>
    </div>
  </div>
);

const CardSkeletonInvert = () => (
  <div className="execom-card flex flex-col items-center text-center animate-pulse">
    <div className="relative">
      <div className="w-50 h-50 bg-gray-300" />
    </div>
    <div className="flex flex-col items-center mt-5 w-full">
      <div className="h-6 w-32 bg-gray-300 rounded mb-2" />
      <div className="h-4 w-24 bg-gray-400 rounded mb-3" />
      <div className="mt-3 flex gap-5">
        <div className="w-5 h-5 bg-gray-300 rounded-full" />
        <div className="w-5 h-5 bg-gray-300 rounded-full" />
      </div>
    </div>
  </div>
);

/* ---------------- CARD ---------------- */

const Card = ({ invert = false, data = null as any, loading = true, cardSize = "md" as any }) => {
  if (loading) {
    return invert ? <CardSkeletonInvert /> : <CardSkeleton />;
  }

  return (
    <div className="execom-card">
      <TeamMemberCard
        name={data?.name ?? "Member"}
        role={data?.role ?? "Execom Member"}
        image={data?.photo_url ?? data?.photo ?? data?.image ?? "/sab.png"}
        invert={invert}
        cardSize={cardSize}
      />
    </div>
  );
};

/* ---------------- EXECOM ---------------- */

const Execom = () => {

  const [sections, setSections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatTitle = (title: string) => {
    if (!title) return null;
    const words = title.split(" ");
    if (words.length <= 3) return title;
    
    const chunks = [];
    for (let i = 0; i < words.length; i += 3) {
      chunks.push(words.slice(i, i + 3).join(" "));
    }
    
    return (
      <>
        {chunks.map((chunk, index) => (
          <React.Fragment key={index}>
            {chunk}
            {index < chunks.length - 1 && <br />}
          </React.Fragment>
        ))}
      </>
    );
  };

  const getColClass = (cols: number) => {
    switch (cols) {
      case 1: return "max-w-[220px]";
      case 2: return "max-w-[450px]";
      case 3: return "max-w-3xl";
      case 4: return "max-w-4xl";
      case 5: return "max-w-5xl";
      case 6: return "max-w-6xl";
      case 7: return "max-w-7xl";
      default: return "max-w-5xl";
    }
  };

  useEffect(() => {
    const fetchExecom = async () => {
      try {
        const { supabase } = await import("@/lib/supabaseClient");
        const { data, error } = await supabase
          .from("execom_sections")
          .select(`
            id, title, order_index,
            execom_members (
              member_id, role, order_index,
              member:members (
                id, name, photo_url, instagram, linkedin
              )
            )
          `)
          .eq("scope", "catalyst")
          .order("order_index", { ascending: true });

        if (error) throw error;

        if (data) {
          // Sort members within each section
          const sortedSections = data.map((sec: any) => {
            const decoded = decodeSectionTitle(sec.title);
            sec.title = decoded.title;
            sec.bgWhite = decoded.bgWhite;
            sec.cols = decoded.cols;
            sec.size = decoded.size;

            if (sec.execom_members) {
              sec.execom_members.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0));
            }
            return sec;
          });
          setSections(sortedSections);
        }
      } catch (error) {
        console.error("Failed to fetch execom:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExecom();
  }, []);

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
      ".execom-card",
      { y: 40, opacity: 0, scale: 0.98 },
      { y: 0, opacity: 1, scale: 1, duration: 1, ease: "power3.out", stagger: 0.1 },
      "-=0.4"
    );
  }, { scope: container });

  return (
    <div ref={container} className="pb-20">
      {/* ── HERO TITLE ── */}
      <div className="w-full pt-20 lg:pt-40">
        <WatermarkHeader 
          title="THE CATALYST FAMILY"
          watermark="CATALYST"
          titleClassName={` nh-title drop-shadow-lg !text-[4vw] md:text-4xl lg:text-5xl`}
          watermarkClassName={` nh-watermark tracking-[1em] !text-[12vw] md:!text-[12vw] lg:!text-[12vw]`}
        />
      </div>

      {isLoading ? (
        <div className="mt-20 mx-5 flex justify-center flex-wrap gap-10">
           {Array.from({ length: 3 }).map((_, idx) => <Card key={idx} loading={true} />)}
        </div>
      ) : (
        sections.map((section, sIdx) => {
          const bgWhite = section.bgWhite;
          const colClass = getColClass(section.cols || 5);
          const cardSize = section.size || "md";
          const isFeatured = sIdx === 0 && section.execom_members?.length <= 2; // Typically Nodal Officer or CEO
          const topMargin = sIdx === 0 ? "mt-4" : "mt-20";

          if (isFeatured) {
            return (
              <div key={section.id} className="mt-4 flex flex-col items-center">
                {section.title && section.title.toUpperCase() !== "THE CATALYST FAMILY" && (
                  <h2 className="font-primary text-xl text-white text-center mb-10 sm:text-2xl md:text-3xl uppercase tracking-widest">
                    {formatTitle(section.title)}
                  </h2>
                )}
                <div className="flex justify-center gap-10 mt-[-40px]">
                  {section.execom_members.map((em: any) => (
                    <Card 
                      key={em.member_id} 
                      loading={false} 
                      data={{ ...em.member, role: em.role }} 
                      invert={false} 
                      cardSize={cardSize}
                    />
                  ))}
                </div>
              </div>
            );
          }

          if (bgWhite) {
            return (
              <div key={section.id} className={`bg-white pt-10 mx-5 pb-10 rounded-3xl ${topMargin}`}>
                {section.title && (
                  <h2 className="font-primary text-xl mt-5 text-black text-center mb-10 sm:text-2xl md:text-3xl uppercase tracking-widest">
                    {formatTitle(section.title)}
                  </h2>
                )}
                <div className={`flex flex-wrap justify-center gap-10 px-5 ${colClass} mx-auto`}>
                  {section.execom_members?.map((em: any) => (
                    <Card 
                      key={em.member_id} 
                      loading={false} 
                      data={{ ...em.member, role: em.role }} 
                      invert={true} 
                      cardSize={cardSize}
                    />
                  ))}
                </div>
              </div>
            );
          }

          // Normal section
          return (
            <div key={section.id} className={`mx-5 ${topMargin}`}>
              {section.title && (
                <h2 className="font-primary text-xl text-white text-center mb-10 sm:text-2xl md:text-3xl uppercase tracking-widest">
                  {formatTitle(section.title)}
                </h2>
              )}
              <div className={`flex flex-wrap justify-center gap-6 md:gap-10 ${colClass} mx-auto`}>
                {section.execom_members?.map((em: any) => (
                  <Card 
                    key={em.member_id} 
                    loading={false} 
                    data={{ ...em.member, role: em.role }} 
                    invert={false} 
                    cardSize={cardSize}
                  />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Execom;
