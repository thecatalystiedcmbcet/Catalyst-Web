"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import WatermarkHeader from "@/components/home/WatermarkHeader";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import localFont from 'next/font/local';
import TeamMemberCard from '@/components/TeamMemberCard';
import { useAdminSettings } from "@/hooks/use-admin-settings";

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

const Card = ({ invert = false, data = null as any, loading = true }) => {
  if (loading) {
    return invert ? <CardSkeletonInvert /> : <CardSkeleton />;
  }

  return (
    <div className="execom-card">
      <TeamMemberCard
        name={data?.name ?? "Member"}
        role={data?.roles?.[0]?.name ?? "Execom Member"}
        image={data?.photo ?? data?.image ?? "/sab.png"}
        invert={invert}
      />
    </div>
  );
};

/* ---------------- EXECOM ---------------- */

const Execom = () => {
  const { pageComponents } = useAdminSettings();
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch("/api/v1/members?limit=100");
        if (res.ok) {
          const data = await res.json();
          const docs = data.documents || [];
          
          // Filter by org "iedc" or "catalyst"
          const iedcMembers = docs.filter((m: any) => 
            m.orgs?.some((o: any) => o.name?.toLowerCase().includes("iedc") || o.name?.toLowerCase().includes("catalyst"))
          );
          setMembers(iedcMembers);
        }
      } catch (error) {
        console.error("Failed to fetch members:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const featured = members.find((m) => m.roles?.some((r: any) => r.name?.toLowerCase().includes("nodal") || r.name?.toLowerCase().includes("lead") || r.name?.toLowerCase().includes("ceo"))) || null;
  const legacyLeaders = members.filter((m) => m !== featured && m.roles?.some((r: any) => r.name?.toLowerCase().includes("legacy") || r.name?.toLowerCase().includes("alumni")));
  const coreTeam = members.filter((m) => m !== featured && !legacyLeaders.includes(m));

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
    <div ref={container}>
      {/* ── HERO TITLE ── */}
      <div className="w-full pt-20 lg:pt-40">
        <WatermarkHeader 
          title="THE CATALYST FAMILY"
          watermark="CATALYST"
          titleClassName={` nh-title drop-shadow-lg !text-[4vw] md:text-4xl lg:text-5xl`}
          watermarkClassName={` nh-watermark tracking-[1em] !text-[12vw] md:!text-[12vw] lg:!text-[12vw]`}
        />
      </div>

      {/* ── FEATURED LEAD ── */}
      {pageComponents.execom.showFeatured && (
        <div className="flex justify-center mt-[-40px]">
          <Card loading={isLoading} data={featured} invert={false} />
        </div>
      )}

      {/* ── CORE TEAM ── */}
      {pageComponents.execom.showCore && (
        <div className="mt-20 mx-5">
          <h2 className="font-primary text-xl text-white text-center mb-10 sm:text-2xl md:text-3xl">
            CORE TEAM
          </h2>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, idx) => <Card key={idx} loading={true} invert={false} />)
            ) : coreTeam.length > 0 ? (
              coreTeam.map((member, index) => (
                <Card
                  key={index}
                  loading={false}
                  data={member}
                  invert={false}
                />
              ))
            ) : (
              <p className="col-span-full text-center text-white/50">No core team members found.</p>
            )}
          </div>
        </div>
      )}

      {/* ── LEGACY LEADERS ── */}
      {pageComponents.execom.showLegacy && (
        <div className="bg-white pt-10 mt-20 mx-5 pb-10">
          <h2 className="font-primary text-xl mt-5 text-black text-center mb-10 sm:text-2xl md:text-3xl">
            LEGACY LEADERS
          </h2>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-2 md:grid-cols-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => <Card key={idx} loading={true} invert={true} />)
            ) : legacyLeaders.length > 0 ? (
              legacyLeaders.map((member, index) => (
                <Card key={index} loading={false} data={member} invert={true} />
              ))
            ) : (
              <p className="col-span-full text-center text-black/50">No legacy leaders found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Execom;
