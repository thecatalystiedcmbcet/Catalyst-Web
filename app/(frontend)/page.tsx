import React from "react";
import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import TimelineDemo from "@/components/home/TimelineDemo";
import Stats from "@/components/home/Stats";
import Events from "@/components/home/Events";
import OurPioneers from "@/components/home/OurPioneers";
import Pioneers from "@/components/home/Team";
import Connect from "@/components/home/Connect";
import AddText from "@/components/home/AddText";
import FamilyText from "@/components/home/FamilyText";
import Footer from "@/components/home/Footer";

const page = () => {
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

export default page;
