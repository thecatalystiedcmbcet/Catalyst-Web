"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

const About = () => {
  const container = useRef<HTMLElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        start: "top 80%",
        once: true,
      },
    });

    tl.fromTo(
      ".about-title",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    ).fromTo(
      ".about-text",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power3.out" },
      "-=0.6"
    );
  }, { scope: container });

  return (
    <section 
      ref={container} 
      className="h-screen relative text-white py-16 md:py-24 min-h-[70vh] flex flex-col justify-center mx-5 md:px-9 sm:mx-15"
      style={{ contain: 'layout' }}
    >
      {/* Background patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[20%] w-[30rem] h-[30rem] rounded-full bg-white/[0.02]"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[25rem] h-[25rem] rounded-full bg-white/[0.02]"></div>
        <div className="absolute top-[40%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-white/[0.01]"></div>
      </div>

      <div className="relative z-10 flex flex-col items-start text-justify w-full">
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-primary font-normal mb-10 about-title uppercase tracking-[0.1em] text-white">
          About Us
        </h2>
        
        <div className="flex flex-col gap-8 w-full">
          <p className="text-base md:text-lg lg:text-2xl font-secondary text-white/80 leading-[1.8] about-text">
            The Innovation and Entrepreneurship Development Centre of Mar Baselios College of Engineering and Technology, Catalyst was inaugurated in the year 2013 with a purpose of inspiring students to become independent engineers by exposing them to the world of Entrepreneurship through Innovation. The Centre aims in sharpening the skills of students, broadening their knowledge base and equipping them with technical and non-technical qualities that an engineer need.
          </p>
          <p className="text-base md:text-lg lg:text-2xl font-secondary text-white/80 leading-[1.8] about-text">
            Rather than pushing students to startup, the center believes in inculcating the spirit in students. The members have identified the true joy of self-learning and they passionately involve in bringing life into their ideas, to solve the problems that they see around.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;

