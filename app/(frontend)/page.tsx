import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { Metadata } from "next";
import Hero from "@/components/home/Hero";
import AddText from "@/components/home/AddText";
import About from "@/components/home/About";
import Events from "@/components/home/Events";
import TimelineServer, { TimelineSkeleton } from "@/components/home/TimelineServer";
import StatsServer, { StatsSkeleton } from "@/components/home/StatsServer";

// These remain client components with animation — lazy load them since they are below the fold
const OurPioneers = dynamic(() => import("@/components/home/OurPioneers"));
const Pioneers = dynamic(() => import("@/components/home/Team"));
const Connect = dynamic(() => import("@/components/home/Connect"));
const FamilyText = dynamic(() => import("@/components/home/FamilyText"));

export const metadata: Metadata = {
  title: "Home | Catalyst",
  description:
    "Catalyst — the Innovation and Entrepreneurship Development Centre of Mar Baselios College of Engineering and Technology. Explore events, achievements, and more.",
  openGraph: {
    title: "Catalyst | Mar Baselios IEDC",
    description:
      "Innovation and Entrepreneurship Development Centre of Mar Baselios College of Engineering and Technology.",
    type: "website",
  },
};

export default function Page() {
  return (
    <div className="mb-5 md:mb-20">
      <Hero />
      <AddText />
      <About />

      {/* Timeline: server-fetched, streamed in with a skeleton fallback */}
      <Suspense fallback={<TimelineSkeleton />}>
        <TimelineServer />
      </Suspense>

      {/* Stats: server-fetched, streamed in with a skeleton fallback */}
      <Suspense fallback={<StatsSkeleton />}>
        <StatsServer />
      </Suspense>

      <Events />
      <OurPioneers />
      <FamilyText />
      <div className="mt-16 lg:mt-32 mb-16">
        <Pioneers />
      </div>
      <div className="mb-10 md:mb-20">
        <Connect />
      </div>
    </div>
  );
}
