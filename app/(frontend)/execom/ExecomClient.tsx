"use client";

import React, { useRef } from "react";
import WatermarkHeader from "@/components/home/WatermarkHeader";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import TeamMemberCard from '@/components/features/TeamMemberCard';
import { SectionData, MemberData, ExecomMember } from "../dev-team/DevTeamClient"; // Reusing the types

type CardSize = "sm" | "md" | "lg";

interface ExecomClientProps {
  sections: SectionData[];
}

const Card = ({
  invert = false,
  data,
  cardSize = "md",
}: {
  invert?: boolean;
  data: MemberData & { role?: string };
  cardSize?: "sm" | "md" | "lg";
}) => {
  return (
    <div className="execom-card">
      <TeamMemberCard
        name={data?.name ?? "Member"}
        role={data?.role ?? "Execom Member"}
        image={data?.photo_url ?? data?.photo ?? data?.image ?? "/sab.png"}
        instagram={data?.instagram ?? "#"}
        linkedin={data?.linkedin ?? "#"}
        invert={invert}
        cardSize={cardSize}
      />
    </div>
  );
};

const ExecomClient: React.FC<ExecomClientProps> = ({ sections }) => {
  const container = useRef<HTMLDivElement>(null);

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
      <div className="w-full pt-28 md:pt-40">
        <WatermarkHeader 
          title="THE CATALYST FAMILY"
          watermark="CATALYST"
          titleClassName={`font-primary font-extrabold nh-title drop-shadow-lg !text-[4vw] md:text-4xl lg:text-5xl`}
          watermarkClassName={`font-primary font-extrabold nh-watermark tracking-[1em] !text-[12vw] md:!text-[12vw] lg:!text-[12vw]`}
        />
      </div>

      {sections.length === 0 ? (
        <p className="text-center text-white/50 py-10 mb-20">No Execom members found.</p>
      ) : (
        sections.map((section, sIdx) => {
          const bgWhite = section.bgWhite;
          const colClass = getColClass(section.cols || 5);
          const cardSize = (section.size as CardSize) || "md";
          const isFeatured = sIdx === 0 && section.execom_members?.length <= 2;
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
                  {section.execom_members.map((em: ExecomMember) => (
                    <Card 
                      key={em.member_id} 
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
                  {section.execom_members?.map((em: ExecomMember) => (
                    <Card 
                      key={em.member_id} 
                      data={{ ...em.member, role: em.role }} 
                      invert={true} 
                      cardSize={cardSize}
                    />
                  ))}
                </div>
              </div>
            );
          }

          return (
            <div key={section.id} className={`mx-5 ${topMargin}`}>
              {section.title && (
                <h2 className="font-primary text-xl text-white text-center mb-10 sm:text-2xl md:text-3xl uppercase tracking-widest">
                  {formatTitle(section.title)}
                </h2>
              )}
              <div className={`flex flex-wrap justify-center gap-6 md:gap-10 ${colClass} mx-auto`}>
                {section.execom_members?.map((em: ExecomMember) => (
                  <Card 
                    key={em.member_id} 
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

export default ExecomClient;
