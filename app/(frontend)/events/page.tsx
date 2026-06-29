import React, { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { MoveRight } from "lucide-react";
import { connection } from "next/server";
import { Button } from "@/components/ui/button";
import NowHappening from "@/components/home/NowHappening";
import { createPublicClient } from "@/lib/supabase/public";

export const metadata: Metadata = {
  title: "Events | Catalyst",
  description: "Discover upcoming workshops, hackathons, speaker sessions, and past events hosted by Catalyst MBCET IEDC.",
  alternates: {
    canonical: "/events",
  },
  openGraph: {
    title: "Events | Catalyst",
    description: "Discover upcoming workshops, hackathons, speaker sessions, and past events hosted by Catalyst MBCET IEDC.",
    url: "https://catalyst.mbcet.ac.in/events",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Events | Catalyst",
    description: "Discover upcoming workshops, hackathons, speaker sessions, and past events hosted by Catalyst MBCET IEDC.",
  },
};

import { getValidImageUrl } from "@/lib/utils";

/* ---------------- DATE UTILS ---------------- */
function getOrdinalSuffix(day: number) {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
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

  if (startDay === endDay && startMonth === endMonth && startYear === endYear) {
    return `${startDay}${getOrdinalSuffix(startDay)} ${startMonth} ${startYear}`;
  }
  if (startMonth === endMonth && startYear === endYear) {
    return `${startDay}${getOrdinalSuffix(startDay)} & ${endDay}${getOrdinalSuffix(endDay)} ${startMonth} ${startYear}`;
  }
  if (startYear === endYear) {
    return `${startDay}${getOrdinalSuffix(startDay)} ${start.toLocaleString('en-US', { month: 'short' })} & ${endDay}${getOrdinalSuffix(endDay)} ${endMonth} ${startYear}`;
  }
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
const CardDesktop = ({ event }: { event: any }) => (
  <Link href={`/events/${event.slug || event.id}`} className="block relative rounded-2xl p-[0.5px]">
    <div
      className="absolute inset-0 rounded-2xl"
      style={{
        background: "linear-gradient(225.38deg, #FFFFFF 1.29%, rgba(255,255,255,0) 28.3%, #FFFFFF 91.9%)",
      }}
    />
    <div className="relative rounded-2xl bg-gradient-to-b from-[#1D1D1D] to-[#0B0B0B] text-white p-1 h-[40vh]">
      <div className="relative w-full h-full rounded-xl overflow-hidden flex">
        <div className="w-1/2 bg-black flex flex-col justify-center px-10 z-20">
          <h1 className="font-primary text-2xl sm:text-4xl mb-4">
            {event.title}
          </h1>
          <ButtonNew link={event.registration_url} />
        </div>

        <div className="relative w-1/2 h-full">
          <Image
            src={getValidImageUrl(event.cover_image)}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/40 to-black" />
        </div>
      </div>
    </div>
  </Link>
);

const Card = ({ event }: { event: any }) => (
  <Link href={`/events/${event.slug || event.id}`} className="block relative rounded-2xl p-[0.5px]">
    <div
      className="absolute inset-0 rounded-2xl"
      style={{
        background: "linear-gradient(225.38deg, #FFFFFF 1.29%, rgba(255,255,255,0) 28.3%, #FFFFFF 91.9%)",
      }}
    />
    <div className="relative rounded-2xl bg-gradient-to-b from-[#1D1D1D] to-[#0B0B0B] text-white p-1 h-[60vh]">
      <div className="relative w-full h-full rounded-xl overflow-hidden">
        <Image
          src={getValidImageUrl(event.cover_image)}
          alt={event.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
        <div className="relative z-20 h-full flex flex-col justify-between items-center py-6">
          <h1 className="font-primary text-2xl sm:text-4xl">{event.title}</h1>
          <ButtonNew link={event.registration_url} />
        </div>
      </div>
    </div>
  </Link>
);

/* ---------------- PAST CARD ---------------- */
const Card2 = ({ event, priority = false }: { event: any; priority?: boolean }) => (
  <Link href={`/events/${event.slug || event.id}`} className="block relative rounded-2xl p-[0.5px]">
    <div
      className="absolute inset-0 rounded-2xl"
      style={{
        background: "linear-gradient(225.38deg, #FFFFFF 1.29%, rgba(255,255,255,0) 28.3%, #FFFFFF 91.9%)",
      }}
    />
    <div className="relative rounded-2xl bg-gradient-to-b from-[#1D1D1D] to-[#0B0B0B] text-white overflow-hidden">
      <div className="relative h-[260px]">
        <Image
          src={getValidImageUrl(event.cover_image)}
          alt={event.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          className="object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
        {event.status === 'cancelled' && (
          <div className="absolute top-3 right-3 bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-bold z-20">
            CANCELLED
          </div>
        )}
      </div>
      <div className="absolute bottom-0 w-full h-[50px] bg-white text-black flex items-center justify-center font-primary text-sm tracking-wide">
        {formatDateRange(event.start_date, event.end_date)}
      </div>
    </div>
  </Link>
);

/* ---------------- PAGE ---------------- */
export default async function Events() {
  const supabase = createPublicClient();
  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) {
    console.error("Failed to fetch events:", error);
  }

  const validEvents = events || [];
  await connection();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const ongoingEvents = validEvents.filter((e) => e.status === "ongoing");
  const upcomingEvents = validEvents.filter((e) => e.status === "upcoming");
  const completedEvents = validEvents
    .filter((e) => e.status === "completed" || e.status === "cancelled")
    .sort((a, b) => {
      // Put cancelled events at the bottom
      if (a.status === "cancelled" && b.status !== "cancelled") return 1;
      if (b.status === "cancelled" && a.status !== "cancelled") return -1;
      // Maintain default sort (by date desc) if both have same status
      return 0;
    });

  return (
    <div className="sm:mb-10 mb-5">
      <div className="w-full px-5 sm:px-10 lg:px-20">
        <NowHappening />

        {validEvents.length === 0 && (
          <p className="text-lg tracking-wide text-white/50 font-primary text-center mt-30 mb-5 md:text-3xl md:mb-7 md:mt-25">
            COMING SOON...
          </p>
        )}

        {/* ONGOING EVENTS SECTION */}
        {ongoingEvents.length > 0 && (
          <>
            <p className="text-lg tracking-wide text-white font-primary text-center mt-30 mb-5 md:text-left md:text-3xl md:mb-7 md:mt-25">
              ONGOING EVENTS
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
              {ongoingEvents.map((event, index) => (
                <Card2 key={`${event.id}-${index}`} event={event} priority={index === 0} />
              ))}
            </div>
          </>
        )}

        {/* UPCOMING EVENTS SECTION */}
        {upcomingEvents.length > 0 && (
          <>
            <p className="text-lg tracking-wide text-white font-primary text-center mt-20 mb-5 md:text-left md:text-3xl md:mb-7 md:mt-20">
              UPCOMING EVENTS
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event, index) => (
                <Card2 key={`${event.id}-${index}`} event={event} priority={index === 0} />
              ))}
            </div>
          </>
        )}

        {/* COMPLETED EVENTS SECTION */}
        {completedEvents.length > 0 && (
          <>
            <p className="text-lg tracking-wide text-white font-primary text-center mt-20 mb-5 md:text-left md:text-3xl md:mb-7 md:mt-20">
              COMPLETED EVENTS
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
              {completedEvents.map((event, index) => (
                <Card2 key={`${event.id}-${index}`} event={event} priority={index < 3} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
