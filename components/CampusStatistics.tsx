import React from "react";
import Strap from "@/components/Strap";
import localFont from "next/font/local";

const enigmaFont = localFont({
  src: "../public/fonts/enigma.otf",
});

const stats = [
  {
    value: "#1",
    title: "THE BEST COLLEGE",
    desc: "We are the proud toppers in GTech μLearn"
  },
  {
    value: "20,00,000+",
    title: "KARMA POINTS MINED",
    desc: "The best in the platform"
  },
  {
    value: "2,200+",
    title: "ACTIVE LEARNERS",
    desc: "The most by any campus"
  },
  {
    value: "110+",
    title: "INTEREST GROUPS",
    desc: "The highest number of IGs ever"
  },
  {
    value: "3",
    title: "INTERNS",
    desc: "Contributing towards the Core"
  }
];

const CampusStatistics = () => {
  return (
    <section className="relative w-full mt-[120px] md:mt-[350px] pt-24 md:pt-32 pb-[120px] md:pb-[350px]">
      {/* Tilted Background and Ribbons */}
      <div className="absolute inset-0 origin-left -skew-y-[11.5deg] overflow-hidden">
        {/* Blue Gradient Background */}
        <div
          className="absolute inset-x-0 top-[40px] md:top-[56px] bottom-[40px] md:bottom-[56px]"
          style={{
            background: 'linear-gradient(187.58deg, #011B7A 12.31%, #1100D2 30.19%, #2B20A7 55.64%, #07005C 82.97%)'
          }}
        />

        {/* Top Ribbon */}
        <Strap className="absolute top-0 left-0 z-20 shadow-[0_4px_30px_rgba(0,0,0,0.3)]" />

        {/* Bottom Ribbon */}
        <Strap className="absolute bottom-0 left-0 z-20 shadow-[0_-4px_30px_rgba(0,0,0,0.3)]" />
      </div>

      {/* Content Container (Un-skewed) */}
      <div className="relative z-10 flex flex-col w-full max-w-5xl mx-auto px-6 mt-16 md:mt-24">

        {/* Title Container */}
        <div className="relative inline-block text-left w-fit">
          <h2
            className={`text-white uppercase z-10 relative drop-shadow-2xl ${enigmaFont.className} text-4xl md:text-5xl lg:text-6xl xl:text-9xl leading-[0.95]`}
            style={{
              fontWeight: 400,
            }}
          >
            CAMPUS <br />
            STATISTICS
          </h2>

          {/* Rotating Badge */}
          <div className="absolute -right-2 -top-7 md:-right-1 md:-top-8 w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 lg:-right-2 lg:-top-11 xl:w-56 xl:h-56 xl:right-3 xl:-top-20 rounded-full bg-[#0a0a0a] border border-white/10 shadow-[2px_-3px_0_#e5e7eb] md:shadow-[2px_-4px_0_#e5e7eb] lg:shadow-[3px_-5px_0_#e5e7eb] xl:shadow-[5px_-8px_0_#e5e7eb] flex items-center justify-center z-20">
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-white fill-current animate-[spin_10s_linear_infinite]">
              <path id="circlePath" d="M 50, 50 m -34, 0 a 34,34 0 1,1 68,0 a 34,34 0 1,1 -68,0" fill="transparent" />
              <text>
                <textPath href="#circlePath" startOffset="0%" className="text-[12px] font-secondary font-bold tracking-[0.22em]">
                  MBCET μ MBCET μ MBCET μ
                </textPath>
              </text>
            </svg>
            <span className={`text-white font-bold text-2xl md:text-3xl lg:text-4xl xl:text-6xl ${enigmaFont.className}`}>μ</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative mt-24 md:mt-32 w-full max-w-3xl pl-4 md:pl-16">
          {/* Vertical Line */}
          <div className="absolute left-[34px] md:left-[86px] top-2 bottom-2 w-[4px] bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]" />

          <div className="flex flex-col gap-16 md:gap-20 relative">
            {stats.map((stat, idx) => (
              <div key={idx} className="relative flex items-start gap-8 md:gap-12 group">
                {/* Timeline Node */}
                <div className="relative z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#111] flex items-center justify-center border-2 border-white/40 text-white shrink-0 shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:border-white transition-colors duration-300">
                  <span className={`text-sm md:text-base ${enigmaFont.className}`}>μ</span>
                </div>

                {/* Content */}
                <div className="flex flex-col -mt-1 md:-mt-2">
                  <span className={`font-extrabold text-white text-xl md:text-2xl mb-1 drop-shadow-md ${enigmaFont.className}`}>{stat.value}</span>
                  <h3 className={`font-bold text-white text-2xl md:text-[40px] uppercase leading-tight mb-2 md:mb-3 drop-shadow-lg tracking-wide ${enigmaFont.className}`}>
                    {stat.title}
                  </h3>
                  <p className="font-secondary font-normal text-white/80 text-sm md:text-base">
                    {stat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CampusStatistics;
