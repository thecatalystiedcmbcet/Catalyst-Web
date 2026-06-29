"use client";
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import Link from "next/link";

const ButtonNew = () => {
  return (
    <Link href="/execom" className="block w-fit mt-10">
      <Button
        className="
      team-btn
      flex items-center gap-2
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
    </Link>
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
    <div ref={container} className="h-full text-white flex flex-col justify-center py-10 lg:py-0 mx-5 md:px-9 sm:mx-15">
      <div className="team-content flex flex-col items-start  w-full">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-primary font-normal mb-10 uppercase tracking-[0.1em] text-white">
          OUR TEAM
        </h1>
        <div className="flex flex-col gap-8 w-full">
          <p className="text-base md:text-lg lg:text-2xl font-secondary text-white/80 leading-[1.8]">
            Catalyst is more than just a team; it&apos;s a dynamic ecosystem of innovation
            and entrepreneurship. Our team is a passionate group of young minds,
            driven by a shared vision of transforming ideas into reality. We believe
            that every engineer has the potential to be an innovator, and our role is
            to foster that spirit.
          </p>
          <p className="text-base md:text-lg lg:text-2xl font-secondary text-white/80 leading-[1.8]">
            We operate on the principle of collaborative learning and mutual growth. Our team
            is a melting pot of diverse talents, from technical experts to creative visionaries.
            We work together to create a supportive environment where ideas are nurtured,
            challenges are embraced, and solutions are co-created.
          </p>
        </div>
        <ButtonNew />
      </div>
    </div>
  );
};

export default Pioneers;
