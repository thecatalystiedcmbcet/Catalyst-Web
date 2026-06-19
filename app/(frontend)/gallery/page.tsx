/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, prefer-const, @next/next/no-img-element */
"use client";

import React, { useRef } from "react";
import Masonry from "@/components/features/Masonry";
import WatermarkHeader from "@/components/home/WatermarkHeader";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import localFont from 'next/font/local';

const enigma = localFont({
  src: "../../../public/fonts/enigma.otf",
  weight: "100",
  style: "normal",
});

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";


export default function Page() {

  const container = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const { supabase } = await import("@/lib/supabaseClient");
        const { data, error } = await supabase
          .from("events")
          .select("cover_image, related_images")
          .order("start_date", { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          let allImages: string[] = [];
          data.forEach(event => {
            if (event.cover_image) allImages.push(event.cover_image);
            if (event.related_images && Array.isArray(event.related_images)) {
              allImages.push(...event.related_images);
            }
          });
          
          const formattedItems = allImages.map((imgUrl, index) => ({
            id: index.toString(),
            img: imgUrl,
            url: imgUrl,
            // Generate a stable pseudo-random height between 200 and 400
            height: 200 + ((index * 37) % 200),
          }));
          setItems(formattedItems);
        }
      } catch (error) {
        console.error("Failed to fetch gallery:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGallery();
  }, []);

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
        {(
          isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="w-full h-48 bg-white/5 rounded-lg" />
              ))}
            </div>
          ) : items.length > 0 ? (
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
          )
        )}
      </div>
    </div>
  );
}
