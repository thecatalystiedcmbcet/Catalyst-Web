import React, { memo } from "react";
import Image from "next/image";

const PioneerCard = () => {
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
      <div className="relative w-full h-full rounded-3xl bg-gradient-to-b from-[#181818] to-[#0a0a0a] flex flex-col items-center justify-center p-6 text-white">
        <div className="relative w-12 h-12 md:w-16 md:h-16 mb-3">
          <Image src="/log.png" alt="Unibotix Logo" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-contain" />
        </div>
        <h3 className="font-primary text-sm md:text-lg font-bold">Unibotix</h3>
        <p className="font-secondary text-[8px] md:text-[10px] text-gray-400">Innovations Pvt. Ltd.</p>
      </div>
    </div>
  );
};

export default memo(PioneerCard);
