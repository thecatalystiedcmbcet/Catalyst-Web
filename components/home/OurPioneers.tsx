"use client";
import React, { useRef } from "react";
import PioneerCard from "@/components/PioneerCard";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

const OurPioneers = () => {
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
      ".pioneer-header",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    ).fromTo(
      ".pioneer-desc",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
      "-=0.6"
    ).fromTo(
      ".pioneer-grid",
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.2)" },
      "-=0.4"
    );
  }, { scope: container });

  return (
    <div ref={container} className="text-white mx-5 md:px-9 sm:mx-15 lg:mt-32 overflow-hidden">
      <h1 className="pioneer-header text-3xl font-primary mt-20 mb-6 md:text-4xl sm:text-4xl font-bold tracking-widest uppercase">
        OUR PIONEERS
      </h1>
      <p className="pioneer-desc text-left font-secondary mb-10 leading-relaxed md:text-lg sm:text-lg text-gray-300 max-w-5xl">
        Catalyst is a hub of activity, where ideas are sparked and brought to life. Our events calendar is packed with opportunities for students to learn, collaborate, and grow. We believe that learning shouldn't be confined to the classroom. Our events offer a unique learning experience that goes beyond textbooks.
      </p>
      
      <div className="pioneer-grid relative w-full overflow-hidden whitespace-nowrap py-4">
        {/* Infinite Scroll Container */}
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          {[...Array(2)].map((_, setIdx) => (
            <div key={setIdx} className="flex gap-4 md:gap-6 pr-4 md:pr-6 items-center">
              {[...Array(6)].map((_, i) => (
                <PioneerCard key={i} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OurPioneers;
