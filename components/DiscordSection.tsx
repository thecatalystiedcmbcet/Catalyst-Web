import React from "react";
import Image from "next/image";
import localFont from "next/font/local";

const enigma = localFont({
  src: "../public/fonts/enigma.otf",
  weight: "100",
  style: "normal",
});

const CabnetFont = localFont({
  src: "../public/fonts/CabinetGrotesk-Variable.ttf",
  weight: "200",
  style: "normal",
});

const DiscordSection = () => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center relative w-full -mt-[62px] md:-mt-[248px] overflow-hidden md:overflow-visible pt-25 md:pt-0">
      <div className="w-full relative md:absolute flex flex-col items-center  md:items-start text-center md:text-left md:pl-10 lg:bottom-20 xl:pl-20 z-10 px-6 md:px-0">
        <h1 className={`${enigma.className} text-4xl sm:text-4xl lg:text-4xl xl:text-5xl text-white drop-shadow-md uppercase`}>
          Join Our <br className="md:hidden" />Discord <br /> Server
        </h1>
        <h1 className={`${CabnetFont.className} text-sm sm:text-base lg:text-xl text-white/90 mt-2 md:mt-6 drop-shadow-md max-w-[280px] sm:max-w-sm md:max-w-md`}>
          Here, you can find more about our campus events, tasks and
          many more interesting easter eggs!
        </h1>
      </div>
      <div className="h-full flex justify-center md:justify-end w-full relative -mt-10 md:mt-0">
        <Image
          src="/dis.svg"
          height={720}
          width={720}
          alt="phone image"
          className="h-[450px] w-[450px] sm:h-[500px] sm:w-[500px] md:h-[480px] md:w-[440px] lg:h-[600px] lg:w-[560px] xl:h-[720px] xl:w-[720px] object-contain drop-shadow-2xl translate-y-16 md:translate-y-0"
        />
      </div>
    </div>
  );
};

export default DiscordSection;
