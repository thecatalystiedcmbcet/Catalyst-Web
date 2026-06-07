import React from "react";
import localFont from "next/font/local";

const CabnetFont = localFont({
  src: "../public/fonts/CabinetGrotesk-Variable.ttf",
  weight: "800",
  style: "normal",
});

const Strap = ({className}: {className?: string}) => {
  return (
    <div className={`w-full ${className}`}>
      <div
        className={`w-full bg-white p-1 md:p-2 text-black ${CabnetFont.className} font-extrabold flex whitespace-nowrap overflow-hidden`}
      >
        <div className="animate-marquee flex w-max items-center" style={{ animationDuration: "40s" }}>
          {/* First set of items */}
          <div className="flex items-center gap-8 pl-8" style={{ transform: 'skewY(11.5deg) rotate(-11.5deg)' }}>
            {Array.from({ length: 25 }, (_, i) => (
              <h1 key={i} className="flex items-center gap-8 text-[24px] md:text-[28px] leading-none tracking-tight">
                <span className="text-[20px] md:text-[24px]">µ</span> µLearn MBCET
              </h1>
            ))}
          </div>
          {/* Second set of items for seamless infinite scroll */}
          <div className="flex items-center gap-8 pl-8" style={{ transform: 'skewY(11.5deg) rotate(-11.5deg)' }}>
            {Array.from({ length: 25 }, (_, i) => (
              <h1 key={`dup-${i}`} className="flex items-center gap-8 text-[24px] md:text-[28px] leading-none tracking-tight">
                <span className="text-[20px] md:text-[24px]">µ</span> µLearn MBCET
              </h1>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Strap;