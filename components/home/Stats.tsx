"use client";
import React, { useRef } from "react";
import Card from "@/components/Card";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

const Stats = () => {
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
      ".stat-header",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    ).fromTo(
      ".stat-card",
      { y: 40, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.15, ease: "back.out(1.2)" },
      "-=0.4"
    );
  }, { scope: container });

  return (
    <div ref={container} className="sm:px-15 lg:mt-60 overflow-hidden">
      <h1 className="stat-header text-3xl text-center text-white font-primary mx-5 mt-27 mb-10 md:mb-1 md:text-4xl sm:text-4xl tracking-widest uppercase font-normal">
        CATALYST MATRIX
      </h1>
      <div className="mx-8 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-7 md:p-9 sm:grid-cols-2 lg:grid-cols-3">
        <div className="stat-card"><Card /></div>
        <div className="stat-card"><Card /></div>
        <div className="stat-card"><Card /></div>
        <div className="stat-card"><Card /></div>
        <div className="stat-card"><Card /></div>
        <div className="stat-card"><Card /></div>
      </div>
    </div>
  );
};

export default Stats;
