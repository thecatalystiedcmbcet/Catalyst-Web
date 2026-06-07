"use client";

import React, { useRef } from "react";
import Masonry from "@/components/Masonry";
import WatermarkHeader from "@/components/home/WatermarkHeader";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import localFont from 'next/font/local';

const enigma = localFont({
  src: "../../../public/fonts/enigma.otf",
  weight: "100",
  style: "normal",
});

const items = [
  {
    id: "1",
    img: "https://picsum.photos/id/1015/800/600",
    url: "https://picsum.photos/",
    height: 200,
  },
  {
    id: "2",
    img: "https://picsum.photos/id/1024/800/900",
    url: "https://picsum.photos/",
    height: 300,
  },
  {
    id: "3",
    img: "https://picsum.photos/id/1035/800/700",
    url: "https://picsum.photos/",
    height: 250,
  },
  {
    id: "4",
    img: "https://picsum.photos/id/1043/800/1000",
    url: "https://picsum.photos/",
    height: 350,
  },
  {
    id: "5",
    img: "https://picsum.photos/id/1050/800/800",
    url: "https://picsum.photos/",
    height: 280,
  },
  {
    id: "6",
    img: "https://picsum.photos/id/1062/800/900",
    url: "https://picsum.photos/",
    height: 320,
  },
  {
    id: "7",
    img: "https://picsum.photos/id/1074/800/650",
    url: "https://picsum.photos/",
    height: 220,
  },
  {
    id: "8",
    img: "https://picsum.photos/id/1084/800/850",
    url: "https://picsum.photos/",
    height: 290,
  },
  {
    id: "9",
    img: "https://picsum.photos/id/1080/800/920",
    url: "https://picsum.photos/",
    height: 310,
  },
  {
    id: "10",
    img: "https://picsum.photos/id/109/800/780",
    url: "https://picsum.photos/",
    height: 260,
  },
];

export default function Page() {
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
          titleClassName={`${enigma.className} nh-title drop-shadow-lg !text-[4vw] md:text-4xl lg:text-5xl`}
          watermarkClassName={`${enigma.className} nh-watermark tracking-[1em] !text-[12vw] md:!text-[12vw] lg:!text-[12vw]`}
        />
      </div>
      
      <div className="mx-5 md:mx-10 lg:mx-20 mt-12">
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
      </div>
    </div>
  );
}
