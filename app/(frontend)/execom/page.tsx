"use client";
import React from "react";
const Card = ({ invert = false }) => {
  const bgClass = invert ? "bg-black" : "bg-white";
  const textClass = invert ? "text-black" : "text-white";

  return (
    <div className={`flex flex-col items-center text-center ${textClass}`}>
      <div className="relative">
        {/* Background box */}
        <div className={`${bgClass} w-50 h-50 overflow-hidden`} />

        {/* Image */}
        <div className="absolute bottom-0 left-0">
          <img src="/sab.png" alt="" className="h-full w-full object-contain" />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center">
        <h2 className="font-primary text-2xl mt-5">SABAREESH</h2>
        <p className="font-secondary text-sm">Chief Operations Officer</p>

        <div className="mt-3 flex gap-5">
          <img src="/social/insta.svg" alt="" className="w-5" />
          <img src="/social/link.svg" alt="" className="w-5" />
        </div>
      </div>
    </div>
  );
};
const a = [1, 2];
const Execom = () => {
  return (
    <div>
      <div className="flex items-center justify-center  h-[50vh] text-white">
        <h1 className="text-3xl font-primary text-center text-white">
          THE CATALYST FAMILY
        </h1>
      </div>
      <div className="mt-[-40]">
        <Card />
      </div>

      <div className="bg-white pt-10 mt-30 mx-5">
        <h2 className="font-primary text-xl mt-5 text-black text-center mb-10">
          LEGACY LEADERS
        </h2>
        <div className="grid grid-cols-2 gap-30 scale-68">
          {a.map((item, key) => (
            <Card key={key} invert={true} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Execom;
