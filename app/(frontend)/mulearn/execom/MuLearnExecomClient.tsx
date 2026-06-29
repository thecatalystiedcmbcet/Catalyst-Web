"use client";
import React, { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import WatermarkHeader from "@/components/home/WatermarkHeader";
import TeamMemberCard from "@/components/features/TeamMemberCard";

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

export default function MuLearnExecomClient({
  initialSections,
}: {
  initialSections: any[];
}) {
  const container = useRef<HTMLDivElement>(null);
  const [sections] = useState<any[]>(initialSections);

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
    <div ref={container} className="min-h-screen bg-transparent pb-16 relative px-5 sm:px-10 lg:px-20 pt-28 md:pt-40">
      <WatermarkHeader
        title="MULEARN WORKFORCE"
        watermark="MULEARN"
        titleClassName="font-primary font-extrabold nh-title drop-shadow-lg !text-[4vw] md:text-4xl lg:text-5xl"
        watermarkClassName="font-primary font-extrabold nh-watermark tracking-[1em] !text-[12vw] md:!text-[12vw] lg:!text-[12vw]"
      />

      <div className="w-full relative z-10 flex flex-col items-center mt-4 md:mt-8">
        {sections.length > 0 ? (
          sections.map((section) => {
            const colClass = getColClass(section.cols || 5);
            const cardSize = section.size || "md";
            return (
              <div key={section.id} className={`w-full mb-20 flex flex-col items-center ${section.bgWhite ? "bg-white pt-10 pb-10 rounded-3xl" : ""}`}>
                {section.title && (
                  <h2 className={`font-primary text-xl ${section.bgWhite ? "text-black" : "text-white"} text-center mb-10 sm:text-2xl md:text-3xl uppercase tracking-widest`}>
                    {formatTitle(section.title)}
                  </h2>
                )}
                <div className={`flex flex-wrap justify-center gap-x-4 gap-y-12 md:gap-8 lg:gap-12 w-full ${colClass} px-5`}>
                  {section.execom_members?.map((em: any, idx: number) => (
                    <div key={em.member_id || idx} className="team-member-card flex justify-center">
                      <TeamMemberCard
                        name={em.member.name || "Member"}
                        role={em.role || "Execom"}
                        subtitle=""
                        image={em.member.photo_url || em.member.photo || em.member.image || "/sab.png"}
                        instagram={em.member.instagram ?? "#"}
                        linkedin={em.member.linkedin ?? "#"}
                        invert={section.bgWhite}
                        cardSize={cardSize}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-white/50 py-10">No MuLearn workforce members found.</p>
        )}
      </div>
    </div>
  );
}
