import React, { memo } from "react";
import Image from "next/image";
import { Pioneer } from "@/lib/adminStore";
import { Instagram, Linkedin, Globe } from "lucide-react";
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400'], // specifically asked for regular
});

interface PioneerCardProps {
  pioneer?: Pioneer;
}

const PioneerCard = ({ pioneer }: PioneerCardProps) => {
  return (
    <div className="relative rounded-3xl p-[1px] w-[180px] h-[180px] md:w-[220px] md:h-[220px] flex-shrink-0 group">
      {/* Gradient border */}
      <div
        className="absolute inset-0 rounded-3xl"
        style={{
          background:
            "linear-gradient(225.38deg, rgba(255,255,255,0.2) 1.29%, rgba(255,255,255,0) 28.3%, rgba(255,255,255,0.1) 91.9%)",
        }}
      />

      {/* Card body */}
      <div className="relative w-full h-full rounded-3xl bg-gradient-to-b from-[#181818] to-[#0a0a0a] flex flex-col items-center p-6 text-white text-center">
        <div className="relative w-full flex-1 mb-4 flex-shrink-0">
          <Image 
            src={pioneer?.logo_url || ""} 
            alt={pioneer?.name || "Pioneer Logo"} 
            fill 
            sizes="(max-width: 768px) 100vw, 33vw" 
            className="object-contain" 
          />
        </div>
        
        <div className="mt-auto flex flex-col items-center justify-end w-full pb-2">
          <h3 className={`${poppins.className} text-sm md:text-lg font-normal line-clamp-1`}>{pioneer?.name}</h3>
          {/* {pioneer?.subtitle && (
            <p className={`${poppins.className} text-[8px] md:text-[10px] text-gray-400 mt-1 line-clamp-1`}>
              {pioneer.subtitle}
            </p>
          )} */}
        </div>

        {/* Social Links shown on hover (if any exist) */}
        {pioneer && (pioneer.instagram_url || pioneer.linkedin_url || pioneer.portfolio_url) && (
          <div className="absolute bottom-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {pioneer.instagram_url && (
              <a href={pioneer.instagram_url} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {pioneer.linkedin_url && (
              <a href={pioneer.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {pioneer.portfolio_url && (
              <a href={pioneer.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors">
                <Globe className="w-4 h-4" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(PioneerCard);
