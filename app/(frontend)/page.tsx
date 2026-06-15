"use client";
import React from "react";
import dynamic from "next/dynamic";
import Hero from "@/components/home/Hero";
import { useAdminSettings } from "@/hooks/use-admin-settings";

const AddText = dynamic(() => import("@/components/home/AddText"));
const About = dynamic(() => import("@/components/home/About"));
const TimelineDemo = dynamic(() => import("@/components/home/TimelineDemo"));
const Stats = dynamic(() => import("@/components/home/Stats"));
const Events = dynamic(() => import("@/components/home/Events"));
const OurPioneers = dynamic(() => import("@/components/home/OurPioneers"));
const Pioneers = dynamic(() => import("@/components/home/Team"));
const Connect = dynamic(() => import("@/components/home/Connect"));
const FamilyText = dynamic(() => import("@/components/home/FamilyText"));

const Page = () => {
  const { frontendComponents } = useAdminSettings();

  return (
    <div className="mb-5 md:mb-20 ">
      {frontendComponents.showHero && <Hero />}
      {frontendComponents.showAddText && <AddText />}
      {frontendComponents.showAbout && <About />}
      {frontendComponents.showTimelineDemo && <TimelineDemo />}

      {frontendComponents.showStats && <Stats />}
      {frontendComponents.showHomeEvents && <Events />}
      {frontendComponents.showOurPioneers && <OurPioneers />}
      {frontendComponents.showFamilyText && <FamilyText />}
      
      {(frontendComponents.showTeam || frontendComponents.showConnect) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 px-5 md:px-12 lg:px-20 mt-16 lg:mt-32 items-center w-full max-w-[1400px] mx-auto mb-10 md:mb-20">
          {frontendComponents.showTeam ? <Pioneers /> : <div></div>}
          {frontendComponents.showConnect ? <Connect /> : <div></div>}
        </div>
      )}

    </div>
  );
};

export default Page;
