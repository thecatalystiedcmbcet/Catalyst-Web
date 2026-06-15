"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import NowHappening from "@/components/home/NowHappening";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminSettings } from "@/hooks/use-admin-settings";

/* ---------------- IMAGE UTILS ---------------- */

function getValidImageUrl(url?: string) {
  if (!url) return "/log.png";
  if (url.includes("unsplash.com") || url.includes("appwrite.io")) return url;
  return "/log.png";
}

/* ---------------- DATE UTILS ---------------- */

function getOrdinalSuffix(day: number) {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1:  return "st";
    case 2:  return "nd";
    case 3:  return "rd";
    default: return "th";
  }
}

function formatDateRange(startStr: string, endStr?: string) {
  if (!startStr) return "";
  const start = new Date(startStr);
  const startDay = start.getDate();
  const startMonth = start.toLocaleString('en-US', { month: 'long' });
  const startYear = start.getFullYear();
  
  if (!endStr) {
    return `${startDay}${getOrdinalSuffix(startDay)} ${startMonth} ${startYear}`;
  }

  const end = new Date(endStr);
  const endDay = end.getDate();
  const endMonth = end.toLocaleString('en-US', { month: 'long' });
  const endYear = end.getFullYear();

  // Same day
  if (startDay === endDay && startMonth === endMonth && startYear === endYear) {
    return `${startDay}${getOrdinalSuffix(startDay)} ${startMonth} ${startYear}`;
  }

  // Same month and year
  if (startMonth === endMonth && startYear === endYear) {
    return `${startDay}${getOrdinalSuffix(startDay)} & ${endDay}${getOrdinalSuffix(endDay)} ${startMonth} ${startYear}`;
  }

  // Same year, different month
  if (startYear === endYear) {
    return `${startDay}${getOrdinalSuffix(startDay)} ${start.toLocaleString('en-US', { month: 'short' })} & ${endDay}${getOrdinalSuffix(endDay)} ${endMonth} ${startYear}`;
  }

  // Different year
  return `${startDay}${getOrdinalSuffix(startDay)} ${startMonth} ${startYear} – ${endDay}${getOrdinalSuffix(endDay)} ${endMonth} ${endYear}`;
}

/* ---------------- BUTTON ---------------- */

const ButtonNew = ({ link }: { link?: string }) => (
  <Button className="mt-5 flex items-center gap-1 bg-white px-6 py-3 text-sm font-secondary text-black transition-all duration-300 hover:bg-black hover:text-white hover:shadow-lg group md:text-2xl md:mt-10 md:px-7 md:py-7 sm:text-2xl sm:py-7 w-fit">
    Events
    <Image
      src="/right.svg"
      alt=""
      width={20}
      height={20}
      className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 ml-1 w-3 h-3 md:w-5 md:h-5 sm:w-5 sm:h-5"
    />
  </Button>
);

/* ---------------- FEATURED CARDS ---------------- */

const CardDesktop = ({ event }: any) => (
  <Link href={`/events/${event.slug || event.$id}`} className="block relative rounded-2xl p-[0.5px]">
    <div
      className="absolute inset-0 rounded-2xl"
      style={{
        background:
          "linear-gradient(225.38deg, #FFFFFF 1.29%, rgba(255,255,255,0) 28.3%, #FFFFFF 91.9%)",
      }}
    />
    <div className="relative rounded-2xl bg-gradient-to-b from-[#1D1D1D] to-[#0B0B0B] text-white p-1 h-[40vh]">
      <div className="relative w-full h-full rounded-xl overflow-hidden flex">
        <div className="w-1/2 bg-black flex flex-col justify-center px-10 z-20">
          <h1 className="font-primary text-2xl sm:text-4xl mb-4">
            {event.title}
          </h1>
          <ButtonNew link={event.register_link} />
        </div>

        <div className="relative w-1/2 h-full">
          <Image
            src={getValidImageUrl(event.cover_image)}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            unoptimized={getValidImageUrl(event.cover_image).includes('appwrite.io')}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/40 to-black" />
        </div>
      </div>
    </div>
  </Link>
);

const Card = ({ event }: any) => (
  <Link href={`/events/${event.slug || event.$id}`} className="block relative rounded-2xl p-[0.5px]">
    <div
      className="absolute inset-0 rounded-2xl"
      style={{
        background:
          "linear-gradient(225.38deg, #FFFFFF 1.29%, rgba(255,255,255,0) 28.3%, #FFFFFF 91.9%)",
      }}
    />
    <div className="relative rounded-2xl bg-gradient-to-b from-[#1D1D1D] to-[#0B0B0B] text-white p-1 h-[60vh]">
      <div className="relative w-full h-full rounded-xl overflow-hidden">
        <Image
          src={getValidImageUrl(event.cover_image)}
          alt={event.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          unoptimized={getValidImageUrl(event.cover_image).includes('appwrite.io')}
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        <div className="relative z-20 h-full flex flex-col justify-between items-center py-6">
          <h1 className="font-primary text-2xl sm:text-4xl">{event.title}</h1>
          <ButtonNew link={event.register_link} />
        </div>
      </div>
    </div>
  </Link>
);

/* ---------------- PAST CARD ---------------- */

const Card2 = ({ event }: any) => (
  <Link href={`/events/${event.slug || event.$id}`} className="block relative rounded-2xl p-[0.5px]">
    <div
      className="absolute inset-0 rounded-2xl"
      style={{
        background:
          "linear-gradient(225.38deg, #FFFFFF 1.29%, rgba(255,255,255,0) 28.3%, #FFFFFF 91.9%)",
      }}
    />
    <div className="relative rounded-2xl bg-gradient-to-b from-[#1D1D1D] to-[#0B0B0B] text-white overflow-hidden">
      <div className="relative h-[260px]">
        <Image
          src={getValidImageUrl(event.cover_image)}
          alt={event.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized={getValidImageUrl(event.cover_image).includes('appwrite.io')}
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
      </div>
      <div className="absolute bottom-0 w-full h-[50px] bg-white text-black flex items-center justify-center font-primary text-sm tracking-wide">
        {formatDateRange(event.start_date, event.end_date)}
      </div>
    </div>
  </Link>
);

/* ---------------- PAGE ---------------- */

const Events = () => {
  const { pageComponents } = useAdminSettings();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/v1/events?limit=100");
        if (res.ok) {
          const data = await res.json();
          setEvents(data.documents || []);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events.filter((e) => {
    const startDate = new Date(e.start_date);
    return startDate >= today;
  });

  const pastEvents = events.filter((e) => {
    const startDate = new Date(e.start_date);
    return startDate < today;
  });

  return (
    <div className="sm:mb-10 mb-5">
      <div className="w-full px-5 sm:px-10 lg:px-20">
        {pageComponents.events.showNowHappening && <NowHappening />}

        {!isLoading && events.length === 0 && (
          <p className="text-lg tracking-wide text-white/50 font-primary text-center mt-30 mb-5 md:text-3xl md:mb-7 md:mt-25">
            COMING SOON...
          </p>
        )}

        {/* UPCOMING EVENTS SECTION */}
        {pageComponents.events.showUpcoming && (isLoading || upcomingEvents.length > 0) && (
          <>
            <p className="text-lg tracking-wide text-white font-primary text-center mt-30 mb-5 md:text-left md:text-3xl md:mb-7 md:mt-25">
              UPCOMING EVENTS
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-[260px] w-full rounded-2xl bg-white/5" />
                ))
              ) : (
                upcomingEvents.map((event, index) => (
                  <Card2 key={`${event.$id}-${index}`} event={event} />
                ))
              )}
            </div>
          </>
        )}

        {/* PAST EXPERIENCES SECTION */}
        {pageComponents.events.showPast && (isLoading || pastEvents.length > 0) && (
          <>
            <p className="text-lg tracking-wide text-white font-primary text-center mt-20 mb-5 md:text-left md:text-3xl md:mb-7 md:mt-20">
              PAST EXPERIENCES
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-[260px] w-full rounded-2xl bg-white/5" />
                ))
              ) : (
                pastEvents.map((event, index) => (
                  <Card2 key={`${event.$id}-${index}`} event={event} />
                ))
              )}
            </div>
          </>
        )}
    </div>
     </div>
  );
};

export default Events;
