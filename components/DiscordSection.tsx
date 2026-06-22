"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { ArrowUpRight } from "lucide-react";
import localFont from "next/font/local";

const enigma = localFont({
  src: "../public/fonts/enigma.otf",
  weight: "100",
  style: "normal",
});

const CabnetFont = localFont({
  src: "../public/fonts/CabinetGrotesk-Variable.ttf",
  weight: "200",
  style: "normal",
});

const DiscordSection = () => {
  const [discordUrl, setDiscordUrl] = useState("#");

  useEffect(() => {
    const fetchLinks = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", "social_links")
        .single();
      if (data && data.discord_url) {
        setDiscordUrl(data.discord_url);
      }
    };
    fetchLinks();
  }, []);

  return (
    <div className="flex flex-col md:flex-row items-center justify-center relative w-full -mt-[62px] md:-mt-[248px] overflow-hidden md:overflow-visible pt-25 md:pt-0">
      <div className="w-full relative md:absolute flex flex-col items-center md:items-start text-center md:text-left md:pl-10 lg:bottom-20 xl:pl-20 z-10 px-6 md:px-0">
        <h1 className={`${enigma.className} text-4xl sm:text-4xl lg:text-4xl xl:text-5xl text-white drop-shadow-md uppercase`}>
          Join Our <br className="md:hidden" />Discord <br /> Server
        </h1>
        <h1 className={`${CabnetFont.className} text-sm sm:text-base lg:text-xl text-white/90 mt-2 md:mt-6 drop-shadow-md max-w-[280px] sm:max-w-sm md:max-w-md`}>
          Here, you can find more about our campus events, tasks and
          many more interesting easter eggs!
        </h1>
        <Link 
          href={discordUrl} 
          target="_blank"
          className="group mt-6 md:mt-8 px-6 py-3.5 bg-white text-black font-semibold text-sm md:text-base rounded-xl hover:bg-gray-200 transition-all duration-300 flex items-center gap-2 drop-shadow-lg w-fit"
        >
          Join Discord
          <ArrowUpRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </Link>
      </div>
      <div className="h-full flex justify-center md:justify-end w-full relative -mt-10 md:mt-0">
        <Image
          src="/dis.svg"
          height={720}
          width={720}
          alt="phone image"
          className="h-[450px] w-[450px] sm:h-[500px] sm:w-[500px] md:h-[480px] md:w-[440px] lg:h-[600px] lg:w-[560px] xl:h-[720px] xl:w-[720px] object-contain drop-shadow-2xl translate-y-16 md:translate-y-0"
        />
      </div>
    </div>
  );
};

export default DiscordSection;
