"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

function AddText() {
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
    <section ref={container} className="hero-legacy w-full min-h-[50vh] md:h-screen z-10 flex flex-col items-center justify-center text-center px-6 md:px-4 py-24 md:py-0 mx-auto" style={{ contain: 'layout' }}>
      <span className="font-secondary text-base sm:text-xl md:text-3xl text-white mb-4 md:mb-6">
        Building
      </span>
      <h3 className="font-primary text-[1.4rem] sm:text-4xl md:text-6xl lg:text-[5.5rem] text-white leading-[1.4] md:leading-[1.1]">
        A LEGACY OF<br />
        INNOVATION AND<br />
        ENTREPRENEURSHIP
      </h3>
    </section>
  );
}

export default AddText;