import React from "react";
import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import TimelineDemo from "@/components/home/TimelineDemo";
import Stats from "@/components/home/Stats";
import Events from "@/components/home/Events";
import Pioneers from "@/components/home/Team";
import Connect from "@/components/home/Connect";

const page = () => {
  return (
    <div className="mb-5 md:mb-20 ">
      <Hero />
      <About />
      <TimelineDemo />

      <Stats />
      <Events />
      <div className="lg:grid grid-cols-2">
        <Pioneers />
        <Connect />
      </div>
    </div>
  );
};

export default page;
