"use client";
import React, { useRef, useState, useEffect } from 'react';
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
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch("/api/v1/members?limit=100");
        if (res.ok) {
          const data = await res.json();
          const docs = data.documents || [];
          
          const mulearnMembers = docs.filter((m: any) => 
            m.orgs?.some((o: any) => o.name?.toLowerCase().includes("mulearn"))
          );
          setMembers(mulearnMembers);
        }
      } catch (error) {
        console.error("Failed to fetch members:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMembers();
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-8 lg:gap-12 w-full max-w-5xl justify-items-center">
          {isLoading ? (
             Array.from({ length: 8 }).map((_, idx) => (
               <div key={idx} className="team-member-card w-full aspect-[3/4] bg-white/5 rounded animate-pulse" />
             ))
          ) : members.length > 0 ? (
            members.map((member, idx) => (
              <div key={idx} className="team-member-card w-full flex justify-center">
                <TeamMemberCard 
                  name={member.name || "Member"} 
                  role={member.roles?.[0]?.name || "Execom"} 
                  subtitle=""
                  image={member.photo || member.image || "/sab.png"} 
                />
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-white/50 py-10">No MuLearn workforce members found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MuLearnExecom;
