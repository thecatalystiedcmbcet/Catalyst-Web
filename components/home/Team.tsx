"use client";
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

const ButtonNew = () => {
  return (
    <Button
      className="
    team-btn
    mt-5 flex items-center gap-2
    bg-white px-6 py-5
    text-sm font-semibold text-black
    transition-all duration-300
    hover:bg-gray-200 hover:text-black hover:shadow-lg
    rounded-md
    group
  "
    >
      Execom
      <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
    </Button>
  );
};
const Pioneers = () => {
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
      ".team-content > *",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out" }
    );
  }, { scope: container });

  return (
    <div ref={container} className="text-white flex flex-col justify-center h-full py-10 lg:py-0">
      <div className="team-content">
        <h1 className="text-4xl md:text-5xl lg:text-[4rem] font-primary mb-8 text-left text-white tracking-widest uppercase font-bold">
          OUR TEAM
        </h1>
        <p className="text-left font-secondary mb-6 leading-relaxed text-sm md:text-base text-gray-300">
          Catalyst is more than just a team; it's a dynamic ecosystem of innovation
          and entrepreneurship. Our team is a passionate group of young minds,
          driven by a shared vision of transforming ideas into reality. We believe
          that every engineer has the potential to be an innovator, and our role is
          to foster that spirit.
        </p>
        <p className="text-left font-secondary mb-8 leading-relaxed text-sm md:text-base text-gray-300">
          We operate on the principle of collaborative learning and mutual growth. Our team
          is a melting pot of diverse talents, from technical experts to creative visionaries.
          We work together to create a supportive environment where ideas are nurtured,
          challenges are embraced, and solutions are co-created.
        </p>
        <ButtonNew />
      </div>
    </div>
  );
};

export default Pioneers;
