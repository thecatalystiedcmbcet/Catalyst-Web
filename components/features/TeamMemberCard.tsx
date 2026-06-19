import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaInstagram, FaLinkedinIn } from 'react-icons/fa';

export interface TeamMemberCardProps {
  name: string;
  role: string;
  subtitle?: string;
  image?: string;
  instagram?: string;
  linkedin?: string;
  invert?: boolean;
  cardSize?: "sm" | "md" | "lg";
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  name,
  role,
  subtitle,
  image = "/sab.png",
  instagram = "#",
  linkedin = "#",
  invert = false,
  cardSize = "md",
}) => {
  const textColor = invert ? "text-black" : "text-white";
  const roleColor = invert ? "text-gray-700" : "text-gray-300";
  const subtitleColor = invert ? "text-gray-500" : "text-gray-500";
  const iconColor = invert ? "text-gray-500 hover:text-black" : "text-gray-400 hover:text-white";
  
  // Maximum contrast box for the bottom half of the image
  const halfBg = invert ? "bg-black" : "bg-white";

  const sizeClasses = {
    sm: "w-[100px] md:w-[130px]",
    md: "w-[130px] md:w-[170px]",
    lg: "w-[160px] md:w-[220px]"
  };

  return (
    <div className={`team-member-card flex flex-col group ${sizeClasses[cardSize]}`}>
      {/* Image area with half bg */}
      <div className="w-full aspect-[3/4] relative overflow-hidden transition-all duration-500">
        <div className={`absolute bottom-0 left-0 right-0 h-1/2 ${halfBg}`} />
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized={image.includes('appwrite.io')}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </div>

      {/* Text section */}
      <div className="flex flex-col items-center px-2 pt-3 pb-2 gap-0.5">
        <h3 className={`font-primary font-normal ${textColor} text-xs md:text-sm uppercase tracking-wider text-center leading-tight`}>
          {name}
        </h3>
        <p className={`font-secondary ${roleColor} text-[11px] md:text-xs text-center`}>
          {role}
        </p>
        {subtitle && (
          <p className={`font-secondary ${subtitleColor} text-[10px] md:text-[11px] text-center mb-1`}>
            {subtitle}
          </p>
        )}

        <div className="flex gap-3 items-center justify-center mt-2">
          <Link href={instagram} className={`${iconColor} transition-colors`}>
            <FaInstagram className="w-3.5 h-3.5" />
          </Link>
          <Link href={linkedin} className={`${iconColor} transition-colors`}>
            <FaLinkedinIn className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberCard;
