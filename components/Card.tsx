import React from "react";
import { CountingNumber } from "./ui/shadcn-io/counting-number";

interface CardProps {
  value?: number;
  suffix?: string;
  label?: string;
}

const Card = ({ value = 20, suffix = "+", label = "Startups" }: CardProps) => {
  return (
    <div className="relative rounded-2xl p-[0.5px]">
      {/* Gradient border */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background:
            "linear-gradient(225.38deg, #FFFFFF 1.29%, rgba(255,255,255,0) 28.3%, #FFFFFF 91.9%)",
        }}
      />

      {/* Card body */}
      <div className="relative rounded-2xl bg-gradient-to-b from-[#1D1D1D] to-[#0B0B0B] text-white flex flex-col items-center gap-2 px-8 py-12">
        <div className="flex items-center">
          {" "}
          <CountingNumber number={value} className="text-6xl font-primary" />
          <p className="text-5xl font-primary">{suffix}</p>
        </div>

        <p className="text-xl">{label}</p>
      </div>
    </div>
  );
};

export default Card;
