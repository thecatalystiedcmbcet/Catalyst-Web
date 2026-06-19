"use client";
import React from "react";
import dynamic from "next/dynamic";
import Hero from "@/components/home/Hero";

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
  return (
    <div className="mb-5 md:mb-20 ">
      <Hero />
      <AddText />
      <About />
      <TimelineDemo />
      <Stats />
      <Events />
      <OurPioneers />
      <FamilyText />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 px-5 md:px-12 lg:px-20 mt-16 lg:mt-32 items-center w-full max-w-[1400px] mx-auto mb-10 md:mb-20">
        <Pioneers />
        <Connect />
      </div>
    </div>
  );
};

export default Page;
