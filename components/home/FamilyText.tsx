"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

function FamilyText() {
  const container = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      container.current,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: container.current,
          start: "top 85%",
          once: true,
        },
      }
    );
  }, { scope: container });

  return (
    <section ref={container} className="w-full min-h-[50vh] md:h-screen z-10 flex flex-col items-center justify-center text-center px-6 md:px-4 py-24 md:py-0 mx-auto" style={{ contain: 'layout' }}>
      <span className="font-secondary text-lg sm:text-2xl md:text-3xl lg:text-4xl text-white mb-1 md:mb-2">
        Your life&apos;s best choice
      </span>
      <h3 className="font-primary text-[1.5rem] sm:text-4xl md:text-5xl lg:text-7xl text-white leading-[1.1] uppercase tracking-[0.1em]">
        MORE THAN<br />
        JUST A CENTRE,<br />
        WE ARE A FAMILY
      </h3>
    </section>
  );
}

export default FamilyText;
