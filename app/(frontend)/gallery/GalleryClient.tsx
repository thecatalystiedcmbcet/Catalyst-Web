"use client";

import React, { useRef } from "react";
import Masonry from "@/components/features/Masonry";
import WatermarkHeader from "@/components/home/WatermarkHeader";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

export default function GalleryClient({ items, enigmaClassName }: { items: any[], enigmaClassName: string }) {
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
      ".nh-watermark",
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    ).fromTo(
      ".nh-title",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
      "-=0.6"
    );
  }, { scope: container });

  return (
    <div ref={container} className="mb-5 w-full pb-10">
      <div className="w-full px-5 sm:px-10 lg:px-20 pt-40">
        <WatermarkHeader 
          title="GALLERY"
          watermark="CATALYST"
          titleClassName={`${enigmaClassName} nh-title drop-shadow-lg !text-[4vw] md:text-4xl lg:text-5xl`}
          watermarkClassName={`${enigmaClassName} nh-watermark tracking-[1em] !text-[12vw] md:!text-[12vw] lg:!text-[12vw]`}
        />
      </div>
      
      <div className="mx-5 md:mx-10 lg:mx-20 mt-12">
        {items.length > 0 ? (
          <Masonry
            items={items}
            ease="power3.out"
            duration={0.6}
            stagger={0.05}
            animateFrom="bottom"
            scaleOnHover
            hoverScale={0.95}
            blurToFocus
            colorShiftOnHover
          />
        ) : (
          <p className="text-center text-white/50">No images in gallery.</p>
        )}
      </div>
    </div>
  );
}
