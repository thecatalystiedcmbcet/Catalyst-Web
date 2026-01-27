import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { Component } from "@/components/ui/image-auto-slider";
const ButtonNew = (props: { title: string }) => {
  return (
    <Button
      className="
    mt-5 flex items-center gap-1
    bg-white px-6 py-3
    text-sm font-medium text-black
    transition-all duration-300
    hover:bg-black hover:text-white hover:shadow-lg
    group
    [&>svg]:h-6 [&>svg]:w-6
  "
    >
      {props.title}
      <ArrowUpRight className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
    </Button>
  );
};
const events = [
  {
    id: "catalyst-2025",
    title: "CATALYST 2025",
    date: "March 12, 2025",
    location: "Trivandrum",
  },
];

export default function EventsPage() {
  return (
    <div className="mb-10">
      {/* Hero Section */}
      <section className="relative">
        {/* Image */}
        <img src="/boots.png" alt="" className="w-full h-[50vh] object-cover" />

        {/* Bottom fade overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,1) 100%)",
          }}
        />

        {/* Text */}
        <div className="text-white absolute bottom-6 text-center w-full z-10">
          <h1 className="text-2xl font-primary">INCEPTRA VIII</h1>
          <p className="font-secondary">2-Day Startup Bootcamp</p>
        </div>
      </section>

      <section className="mx-10 text-white font-secondary text-sm mt-10 leading-8">
        <p>
          The Innovation and Entrepreneurship Development Centre of Mar Baselios
          College of Engineering and Technology, Catalyst was inaugurated in the
          year 2013 with a purpose of inspiring students to become independent
          engineers by exposing then to the world of Entrepreneurship through
          Innovation. The Centre aims in sharpening the skills of students,
          broadening their knowledge base and equipping them with technical and
          non-technical qualities that an engineer need.
        </p>
        <p className="mt-5">
          Rather than pushing students to startup, the center believes in
          inculcating the spirit in students. The members have identified the
          true joy of self-learning and they passionately involve in bringing
          life into their ideas, to solve the problems that they see around.
        </p>
      </section>
      <div className="mx-10">
        <ButtonNew title="After Movie" />
      </div>
      <div className="mt-5">
        <Component />
      </div>
    </div>
  );
}
