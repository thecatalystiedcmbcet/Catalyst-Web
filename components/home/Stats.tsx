"use client";
import React, { useRef } from "react";
import Card from "@/components/Card";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

interface MatrixItem {
  id: string;
  value: number;
  suffix: string;
  label: string;
  sort_order: number;
}

const Stats = ({ items }: { items: MatrixItem[] }) => {
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
  }, { scope: container, dependencies: [items.length] });

  return (
    <div ref={container} className="sm:px-15 lg:mt-60 overflow-hidden">
      <h1 className="stat-header text-3xl text-center text-white font-primary mx-5 mt-27 mb-10 md:mb-1 md:text-4xl sm:text-4xl tracking-widest uppercase font-normal">
        CATALYST MATRIX
      </h1>
      <div className="mx-8 flex flex-wrap justify-center gap-5 md:gap-7 md:p-9">
        {items.map((item) => (
          <div key={item.id} className="stat-card w-full sm:w-[calc(50%-10px)] md:w-[calc(50%-14px)] lg:w-[calc(33.333%-19px)] flex-shrink-0">
            <Card value={item.value} suffix={item.suffix} label={item.label} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stats;

