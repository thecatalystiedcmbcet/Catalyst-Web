"use client";
import React from "react";
import { useWindowSize } from "@/hooks/useWindowSize";
import CircularText from "@/components/ui/shadcn-io/circular-text/circularText";

const Tilted = () => {
  return (
    <div className="w-full overflow-hidden bg-white skew-y-[-10deg] relative py-2">
      <div className="flex whitespace-nowrap animate-marquee">
        <p className="font-secondary text-black text-center px-8 font-bold">
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} className="mx-8 text-black text-lg font-semibold">
              μLearn MBCET
            </span>
          ))}
        </p>
      </div>
    </div>
  );
};

const Stats = ({
  rank,
  title,
  desc,
}: {
  rank: string;
  title: string;
  desc: string;
}) => {
  return (
    <div className="w-80 sm:w-120  mx-auto flex gap-3 mt-10 relative">
      <div className="relative z-10">
        <img src="/MuButton.svg" alt="" className="sm:w-17 w-15" />
      </div>

      <div className="sm:ml-5">
        <h1 className="text-white font-primary text-4xl sm:text-5xl">{rank}</h1>
        <h1 className="text-white font-primary text-3xl sm:text-4xl mt-3">
          {title}
        </h1>
        <p className="text-white font-secondary sm:text-2xl">{desc}</p>
      </div>
    </div>
  );
};

const MuLearn = () => {
  const stats = [1, 2, 3];
  const { width } = useWindowSize();

  /* ---------- Responsive Circle Logic ---------- */

  const screen = width ?? 1024; // SSR-safe fallback

  const getCircleSize = (w: number) => {
    if (w >= 1280) return 160;
    if (w >= 1024) return 140;
    if (w >= 768) return 120;
    if (w >= 640) return 120;
    return 80;
  };

  const circleSize = getCircleSize(screen);
  const centerSize = Math.round(circleSize * 0.2);

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="relative flex flex-col items-center justify-start h-[100vh] sm:h-[60vh] bg-black overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <img
            src="/mu.png"
            alt=""
            className="absolute inset-0 z-0 w-full h-full object-cover opacity-20"
          />
          <div
            className="absolute inset-0 z-[5]"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 60%)",
            }}
          />
        </div>

        <div className="relative z-[10] flex flex-col items-center justify-center gap-4 h-full px-4 mt-20">
          <h1 className="text-white font-primary text-3xl text-center sm:text-4xl md:text-6xl md:mt-40">
            MULEARN FOUNDATION
          </h1>

          <p className="text-white font-secondary text-center text-sm md:text-xl mx-5 sm:text-lg sm:mx-20 md:mx-40">
            GTech µLearn is a synergic philosophy of education, with a culture
            of mutual learning through micro peer groups. We help you break echo
            chambers and grow beyond limits as one of the active campuses of the
            foundation.
          </p>

          <button className="bg-white text-black md:mt-5 px-6 py-2 rounded-full font-secondary text-sm sm:text-md md:text-lg font-semibold hover:bg-black hover:text-white hover:scale-105 transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-white/50">
            Join μlearn
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-[-90] sm:mt-[-50] md:mt-[100] relative z-20">
        <Tilted />

        <div className="w-full  bg-[linear-gradient(189.81deg,_#011B7A_15.25%,_#1100D2_37.4%,_#2B20A7_68.93%,_#07005C_102.78%)] skew-y-[-10deg]">
          <div className="skew-y-[10deg] mx-auto mt-20 sm:mt-40 w-[375px] sm:w-[600px] ">
            <div className="mx-auto text-center sm:mt-10 relative">
              <div className="inline-block">
                <h1 className="text-white font-primary text-4xl sm:text-6xl text-left">
                  CAMPUS
                </h1>
                <h1 className="text-white font-primary text-4xl sm:text-6xl">
                  STATISTICS
                </h1>
              </div>
              <div className=" absolute top-0 right-0 mt-[-50] mr-[40] sm:mt-[-75] sm:mr-[60]">
                <CircularText text="MBCET • MBCET • MBCET • " />
              </div>
            </div>

            <div className=" w-[375px] sm:w-[600px]  mx-auto">
              {/* Wrapper with connecting line */}
              <div className="relative mb-20 sm:mb-40">
                {/* Vertical connecting line that spans all Stats */}
                <div className="absolute left-[12%] sm:left-[14%] top-0 bottom-40 w-[3px] sm:w-[5px] bg-white z-0"></div>

                <Stats
                  rank="#1"
                  title="THE BEST COLLEGE"
                  desc="We are the proud toppers in GTech µLearn"
                />
                <Stats
                  rank="#1"
                  title="THE BEST COLLEGE"
                  desc="We are the proud toppers in GTech µLearn"
                />
                <Stats
                  rank="#1"
                  title="THE BEST COLLEGE"
                  desc="We are the proud toppers in GTech µLearn"
                />
              </div>
            </div>
          </div>
        </div>

        <Tilted />
      </div>

      <div>
        <div className="text-white font-primary text-3xl sm:text-5xl text-center mx-10 mt-20 sm:mt-30 sm:mx-20 sm:mb-10">
          <h1>JOIN OUR DISCORD SERVER</h1>
          <p className="font-secondary text-sm sm:text-lg mx-5 mt-3">
            Discover campus events, tasks, and hidden easter eggs inside our
            community space.
          </p>
        </div>

        <div className="mt-5 mr-5 mb-[-20] md:ml-[250]">
          <img src="/dis.svg" alt="" />
        </div>
      </div>
    </div>
  );
};

export default MuLearn;
