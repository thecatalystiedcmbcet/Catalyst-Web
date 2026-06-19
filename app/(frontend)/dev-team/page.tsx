"use client";
import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import localFont from 'next/font/local';
import { Poppins } from 'next/font/google';
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

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500'],
  display: 'swap',
});

import TeamMemberCard from '@/components/features/TeamMemberCard';
import { decodeSectionTitle } from "@/lib/adminStore";

/* ---------------- SKELETON COMPONENTS ---------------- */

const CardSkeleton = () => (
  <div className="team-member-card flex flex-col items-center text-center animate-pulse">
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
  <div className="team-member-card flex flex-col items-center text-center animate-pulse">
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Card = ({ invert = false, data = null as any, loading = true, cardSize = "md" as any }) => {
  if (loading) {
    return invert ? <CardSkeletonInvert /> : <CardSkeleton />;
  }

  return (
    <div className="team-member-card flex justify-center">
      <TeamMemberCard
        name={data?.name ?? "Member"}
        role={data?.role ?? "Web Team"}
        subtitle=""
        image={data?.photo_url ?? data?.photo ?? data?.image ?? "/sab.png"}
        instagram={data?.instagram ?? "#"}
        linkedin={data?.linkedin ?? "#"}
        invert={invert}
        cardSize={cardSize}
      />
    </div>
  );
};

const DevTeamPage = () => {

  const container = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          .eq("scope", "dev-team")
          .order("order_index", { ascending: true });

        if (error) throw error;

        if (data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sortedSections = data.map((sec: any) => {
            const decoded = decodeSectionTitle(sec.title);
            sec.title = decoded.title;
            sec.bgWhite = decoded.bgWhite;
            sec.cols = decoded.cols;
            sec.size = decoded.size;

            if (sec.execom_members) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              sec.execom_members.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0));
            }
            return sec;
          });
          setSections(sortedSections);
        }
      } catch (error) {
        console.error("Failed to fetch dev team:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExecom();
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

      <div className="w-full px-5 sm:px-10 lg:px-20 relative z-10 flex flex-col items-center mt-4 md:mt-8">

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-8 lg:gap-12 w-full max-w-5xl justify-items-center mb-20">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="team-member-card w-full aspect-[3/4] bg-white/5 rounded animate-pulse" />
            ))}
          </div>
        ) : sections.length > 0 ? (
          sections.map((section, sIdx) => {
            const colClass = getColClass(section.cols || 5);
            const cardSize = section.size || "md";
            const topMargin = sIdx === 0 ? "mt-4" : "mt-20";
            return (
              <div key={section.id} className={`w-full mb-20 flex flex-col items-center ${section.bgWhite ? "bg-white pt-10 pb-10 rounded-3xl" : ""} ${topMargin}`}>
                {section.title && (
                  <h2 className={`font-primary text-xl ${section.bgWhite ? "text-black" : "text-white"} text-center mb-10 sm:text-2xl md:text-3xl uppercase tracking-widest`}>
                    {formatTitle(section.title)}
                  </h2>
                )}
                <div className={`flex flex-wrap justify-center gap-x-4 gap-y-12 md:gap-8 lg:gap-12 w-full ${colClass} px-5`}>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {section.execom_members?.map((em: any, idx: number) => (
                    <Card 
                      key={em.member_id || idx}
                      loading={false}
                      data={{ ...em.member, role: em.role }}
                      invert={section.bgWhite}
                      cardSize={cardSize}
                    />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-white/50 py-10 mb-20">No Web Team members found.</p>
        )}

        {/* CATALYST WEB V1 Section */}
        {(
          <div className="v1-section flex flex-col items-center w-full max-w-4xl text-center mb-8">
            <h2 className={`font-primary text-white text-2xl md:text-3xl lg:text-4xl mb-6 tracking-wide`}>
              CATALYST WEB V1
            </h2>
            <p className={`${poppins.className} text-gray-300 text-sm md:text-base leading-relaxed mb-12 max-w-3xl`}>
              Catalyst is a hub of activity, where ideas are sparked and brought to life. Our events
              calendar is packed with opportunities for students to learn, collaborate, and grow. We
              believe that learning shouldn&apos;t be confined to the classroom. Our events offer a unique
              learning experience that goes beyond textbooks.
            </p>

            <div className="w-full relative overflow-hidden mb-16 px-4 md:px-0">
              <Image
                src="/agni.png"
                alt="Catalyst Web V1 Team"
                width={1200}
                height={600}
                className="w-full h-auto object-cover rounded-sm shadow-2xl"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevTeamPage;
