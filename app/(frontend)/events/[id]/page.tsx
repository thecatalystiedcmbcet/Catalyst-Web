"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";

const ButtonNew = (props: { title: string }) => {
  return (
    <Button
      className="
    mt-8 flex items-center gap-2
    bg-white px-6 py-5 rounded-md
    text-sm font-semibold text-black
    transition-all duration-300
    hover:bg-gray-200 hover:text-black hover:shadow-lg
    group
    [&>svg]:h-4 [&>svg]:w-4
  "
    >
      {props.title}
      <ArrowUpRight className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
    </Button>
  );
};

const EventCarousel = () => {
  const images = [
    "https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=2152&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505142468610-359e7d316be0?q=80&w=2126&auto=format&fit=crop",
  ];

  return (
    <div className="relative w-full flex items-center overflow-hidden rounded-xl">
      {/* Left Image */}
      <div className="relative w-1/3 aspect-[4/5] md:aspect-square group cursor-pointer">
        <img src={images[0]} className="w-full h-full object-cover brightness-[0.3] transition-all duration-500 group-hover:brightness-[0.5]" />
        <div className="absolute inset-0 flex items-center justify-center">
           <button className="p-2 md:p-3 rounded-full border border-white/50 bg-black/20 text-white/80 hover:text-white hover:bg-white/20 transition-all">
             <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
           </button>
        </div>
      </div>
      
      {/* Center Image */}
      <div className="relative w-1/3 aspect-[4/5] md:aspect-[4/3] z-10 shadow-2xl scale-[1.02] cursor-pointer">
        <img src={images[1]} className="w-full h-full object-cover" />
      </div>

      {/* Right Image */}
      <div className="relative w-1/3 aspect-[4/5] md:aspect-square group cursor-pointer">
        <img src={images[2]} className="w-full h-full object-cover brightness-[0.3] transition-all duration-500 group-hover:brightness-[0.5]" />
        <div className="absolute inset-0 flex items-center justify-center">
           <button className="p-2 md:p-3 rounded-full border border-white/50 bg-black/20 text-white/80 hover:text-white hover:bg-white/20 transition-all">
             <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
           </button>
        </div>
      </div>
    </div>
  );
};

export default function EventsPage() {
  return (
    <div className="mb-20 min-h-screen bg-transparent">
      {/* Hero Section */}
      <section className="relative w-full h-[55vh] md:h-[65vh]">
        {/* Masking the image so it fades its opacity to 0 at the bottom, revealing the global background texture perfectly */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)'
          }}
        >
          <img
            src="/boots.png"
            alt="Event Hero"
            className="w-full h-full object-cover object-top"
          />
        </div>

        {/* Text */}
        <div className="absolute bottom-4 md:bottom-10 w-full text-center z-10 px-4">
          <h1 className="text-5xl md:text-7xl lg:text-[5rem] font-primary font-extrabold tracking-widest text-white uppercase drop-shadow-xl">
            INCEPTRA VIII
          </h1>
          <p className="text-xl md:text-2xl font-secondary text-gray-300 mt-2 md:mt-4 drop-shadow-md">
            2-Day Startup Bootcamp
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-5xl mx-auto px-6 md:px-12 mt-12 md:mt-20">
        <div className="text-gray-300 font-secondary text-sm md:text-base leading-loose space-y-6">
          <p>
            The Innovation and Entrepreneurship Development Centre of Mar Baselios
            College of Engineering and Technology, Catalyst was inaugurated in the
            year 2013 with a purpose of inspiring students to become independent
            engineers by exposing them to the world of Entrepreneurship through
            Innovation. The Centre aims in sharpening the skills of students,
            broadening their knowledge base and equipping them with technical and
            non-technical qualities that an engineer need.
          </p>
          <p>
            Rather than pushing students to startup, the center believes in
            inculcating the spirit in students. The members have identified the
            true joy of self-learning and they passionately involve in bringing
            life into their ideas, to solve the problems that they see around.
          </p>
        </div>

        <ButtonNew title="After Movie" />
      </section>

      {/* Carousel Section */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 mt-20">
        <EventCarousel />
      </div>
    </div>
  );
}
