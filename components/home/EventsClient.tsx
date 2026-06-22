"use client";
import React, { useRef } from "react";
import Image from "next/image";
import EventCard from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { getValidImageUrl } from "@/lib/utils";
import Link from "next/link";

const ButtonNew = () => {
  return (
    <Link href="/events" className="block w-fit">
      <Button
        className="
      mt-5 flex items-center gap-1
      bg-white px-6 py-3 rounded-lg
      text-sm font-semibold font-secondary text-black
      transition-all duration-300
      hover:bg-gray-200 hover:text-black hover:shadow-lg
      group
      [&>svg]:h-10 [&>svg]:w-10
      md:text-lg md:mt-10 md:px-7 md:py-6 sm:text-lg sm:py-6
    "
      >
        Events
        <Image
          src="/right.svg"
          alt=""
          width={16}
          height={16}
          className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 ml-1 w-3 h-3 md:w-4 md:h-4 sm:w-4 sm:h-4"
        />
      </Button>
    </Link>
  );
};

export type BasicEvent = {
  id: string;
  title: string;
  cover_image: string;
  slug?: string;
};

export default function EventsClient({ events }: { events: BasicEvent[] }) {
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
      ".event-header",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    ).fromTo(
      ".event-desc",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
      "-=0.6"
    ).fromTo(
      ".event-grid",
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.2)" },
      "-=0.4"
    ).fromTo(
      ".event-btn",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
      "-=0.4"
    );
  }, { scope: container });

  // Fallback to dummy data if no events are in DB yet
  const displayEvents = events.length > 0 ? events : [
    { id: '1', title: 'ChallengeX 4.0', cover_image: '/log.png' },
    { id: '2', title: 'Converge', cover_image: '/log.png' },
    { id: '3', title: 'Catalyst Evening Cafe', cover_image: '/log.png' },
    { id: '4', title: 'IPL', cover_image: '/log.png' },
    { id: '5', title: 'Event 5', cover_image: '/log.png' },
  ];

  return (
    <div ref={container} className="text-white mx-5 md:px-9 sm:mx-15 lg:mt-60 overflow-hidden">
      <h1 className="event-header text-3xl font-primary mt-20 mb-6 md:text-4xl sm:text-4xl font-normal tracking-widest uppercase">
        THE EVENTS
      </h1>
      <p className="event-desc text-left font-secondary mb-10 leading-relaxed md:text-lg sm:text-lg text-gray-300 max-w-5xl">
        Catalyst is a hub of activity, where ideas are sparked and brought to life. Our events calendar is packed with opportunities for students to learn, collaborate, and grow. We believe that learning shouldn&apos;t be confined to the classroom. Our events offer a unique learning experience that goes beyond textbooks.
      </p>
      
      <div className="event-grid relative w-full overflow-hidden whitespace-nowrap py-4">
        {/* Infinite Scroll Container - 3 copies is the minimum needed for seamless looping */}
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]" style={{ animationDuration: '40s' }}>
          {[...Array(3)].map((_, setIdx) => (
            <div key={setIdx} className="flex gap-4 md:gap-6 pr-4 md:pr-6 items-center">
              {displayEvents.map((evt) => (
                <Link key={`${setIdx}-${evt.id}`} href={`/events/${evt.slug || evt.id}`}>
                  <EventCard 
                    imgSrc={getValidImageUrl(evt.cover_image)} 
                    alt={evt.title} 
                  />
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="event-btn">
        <ButtonNew />
      </div>
    </div>
  );
}
