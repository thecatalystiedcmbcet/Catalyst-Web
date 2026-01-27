"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

const mockEvents = [
  {
    $id: "1",
    title: "INCEPTRA VIII",
    cover_image:
      "https://t3.ftcdn.net/jpg/12/32/28/16/360_F_1232281625_dboxLo5JvuozabbQFjdR4auK5rJZ3NxT.jpg",
    register_link: "https://example.com",
    start_date: "Feb 10",
    end_date: "Feb 12",
    is_featured: true,
  },
  {
    $id: "2",
    title: "Design Sprint",
    cover_image: "/event2.jpg",
    start_date: "Jan 5",
    end_date: "Jan 6",
    is_featured: false,
  },
  {
    $id: "2",
    title: "Design Sprint",
    cover_image: "/event2.jpg",
    start_date: "Jan 5",
    end_date: "Jan 6",
    is_featured: false,
  },
  {
    $id: "2",
    title: "Design Sprint",
    cover_image: "/event2.jpg",
    start_date: "Jan 5",
    end_date: "Jan 6",
    is_featured: false,
  },
  {
    $id: "2",
    title: "Design Sprint",
    cover_image: "/event2.jpg",
    start_date: "Jan 5",
    end_date: "Jan 6",
    is_featured: false,
  },
];

const ButtonNew = ({ link }: { link?: string }) => (
  <Button
    className="
    mt-5 flex items-center gap-1
    bg-white px-6 py-3
    text-sm font-secondary text-black
    transition-all duration-300
    hover:bg-black hover:text-white hover:shadow-lg
    group
    [&>svg]:h-10 [&>svg]:w-10
    md:text-2xl md:mt-10 md:px-7 md:py-7 sm:text-2xl sm:py-7 w-fit
  "
  >
    Events
    <img
      src="/right.svg"
      alt=""
      className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 ml-1 w-3 h-3 md:w-5 md:h-5 sm:w-5 sm:h-5"
    />
  </Button>
);

const CardDesktop = ({ event }: any) => (
  <div className="relative rounded-2xl p-[0.5px]">
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
          <h1 className="font-primary text-2xl sm:text-4xl text-white mb-4">
            {event.title}
          </h1>
          <ButtonNew link={event.register_link} />
        </div>

        <div className="relative w-1/2 h-full">
          <img
            src={event.cover_image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/40 to-black" />
        </div>
      </div>
    </div>
  </div>
);

const Card = ({ event }: any) => (
  <div className="relative rounded-2xl p-[0.5px]">
    <div
      className="absolute inset-0 rounded-2xl"
      style={{
        background:
          "linear-gradient(225.38deg, #FFFFFF 1.29%, rgba(255,255,255,0) 28.3%, #FFFFFF 91.9%)",
      }}
    />
    <div className="relative rounded-2xl bg-gradient-to-b from-[#1D1D1D] to-[#0B0B0B] text-white p-1 h-[60vh]">
      <div className="relative w-full h-full rounded-xl overflow-hidden">
        <img
          src={event.cover_image}
          alt={event.title}
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        <div className="relative z-20 h-full flex flex-col justify-between items-center py-6">
          <h1 className="font-primary text-2xl sm:text-4xl">{event.title}</h1>
          <ButtonNew link={event.register_link} />
        </div>
      </div>
    </div>
  </div>
);

const Card2 = ({ event }: any) => (
  <div className="relative rounded-2xl p-[0.5px]">
    <div
      className="absolute inset-0 rounded-2xl"
      style={{
        background:
          "linear-gradient(225.38deg, #FFFFFF 1.29%, rgba(255,255,255,0) 28.3%, #FFFFFF 91.9%)",
      }}
    />
    <div className="relative rounded-2xl bg-gradient-to-b from-[#1D1D1D] to-[#0B0B0B] text-white overflow-hidden">
      <div className="relative h-[260px]">
        <img
          src={event.cover_image}
          alt={event.title}
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
      </div>
      <div className="absolute bottom-0 w-full h-[50px] bg-white text-black flex items-center justify-center font-primary text-sm">
        {event.start_date} – {event.end_date}
      </div>
    </div>
  </div>
);

const Events = () => {
  const featured = mockEvents.find((e) => e.is_featured);
  const past = mockEvents.filter((e) => !e.is_featured);

  return (
    <div className="sm:mx-5 md:mx-10 lg:mx-15 sm:mb-10 mx-5 mb-5">
      <div className="relative h-[50vh] flex items-center justify-center font-primary text-white overflow-hidden mb-[-100]">
        <h1 className="absolute text-5xl opacity-10 select-none sm:text-7xl md:text-8xl lg:text-9xl">
          CATALYST
        </h1>
        <p className="relative text-xl tracking-wide sm:text-2xl md:text-3xl lg:text-4xl">
          NOW HAPPENING
        </p>
      </div>

      {featured && (
        <>
          <div className="mx-5 md:hidden">
            <Card event={featured} />
          </div>
          <div className="hidden md:block">
            <CardDesktop event={featured} />
          </div>
        </>
      )}

      <p className="text-lg tracking-wide text-white font-primary text-center mt-30 mb-5 md:text-left md:text-3xl md:mb-7 md:mt-25">
        PAST EXPERIENCES
      </p>

      <div className=" grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:mr-40">
        {past.map((event) => (
          <Card2 key={event.$id} event={event} />
        ))}
      </div>
    </div>
  );
};

export default Events;
