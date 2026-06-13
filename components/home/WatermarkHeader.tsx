import React from "react";
import localFont from "next/font/local";

const monument = localFont({
  src: "../../public/fonts/MonumentExtended-Regular.otf",
  display: "swap",
});

interface WatermarkHeaderProps {
  title: string;
  watermark: string;
  titleClassName?: string;
  watermarkClassName?: string;
}

const WatermarkHeader: React.FC<WatermarkHeaderProps> = ({
  title,
  watermark,
  titleClassName = "",
  watermarkClassName = "",
}) => {
  return (
    <div className="relative w-full flex items-center justify-center py-12 md:py-20 lg:py-24">
      {/* Watermark Background Wrapper */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
        <h1
          className={`nh-watermark text-[15vw] md:text-[12vw] lg:text-[14vw] font-normal uppercase text-transparent bg-clip-text whitespace-nowrap select-none leading-none tracking-normal ${monument.className} ${watermarkClassName}`}
          style={{
            backgroundImage: "linear-gradient(58.9deg, rgba(61, 61, 61, 0.8) 61.92%, rgba(61, 61, 61, 0) 111.62%)",
            WebkitBackgroundClip: "text",
          }}
        >
          {watermark}
        </h1>
      </div>

      {/* Header */}
      <h2
        className={`relative z-10 text-[6vw] md:text-[48px] lg:text-[62px] font-normal text-white uppercase text-center leading-none tracking-normal ${monument.className} ${titleClassName}`}
      >
        {title}
      </h2>
    </div>
  );
};

export default WatermarkHeader;
