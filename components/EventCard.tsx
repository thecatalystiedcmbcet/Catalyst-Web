import React, { memo } from "react";
import Image from "next/image";

interface EventCardProps {
  imgSrc?: string;
  alt?: string;
}

const EventCard: React.FC<EventCardProps> = ({ imgSrc = "/log.png", alt = "Event Logo" }) => {
  return (
    <div className="relative rounded-3xl p-[1px] w-[180px] h-[180px] md:w-[220px] md:h-[220px] flex-shrink-0">
      {/* Gradient border */}
      <div
        className="absolute inset-0 rounded-3xl"
        style={{
          background:
            "linear-gradient(225.38deg, rgba(255,255,255,0.2) 1.29%, rgba(255,255,255,0) 28.3%, rgba(255,255,255,0.1) 91.9%)",
        }}
      />

      {/* Card body */}
      <div className="relative w-full h-full rounded-3xl bg-gradient-to-b from-[#181818] to-[#0a0a0a] flex items-center justify-center p-6">
        <div className="relative w-full h-full">
          <Image src={imgSrc} alt={alt} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-contain" />
        </div>
      </div>
    </div>
  );
};

export default memo(EventCard);
