import React from 'react';
import Link from 'next/link';
import { FaInstagram, FaLinkedinIn, FaDiscord, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="w-full px-4 md:px-8 lg:px-12 pb-8 mt-20">
      <div className="bg-[#0f0f0f] rounded-[2.5rem] pt-20 px-8 md:px-16 pb-32 md:pb-[14vw] overflow-hidden relative flex flex-col items-center border border-neutral-800/50 shadow-2xl text-center">
        
        {/* Top Section */}
        <div className="z-10 flex flex-col items-center space-y-6">
          <h2 className="text-white text-xl md:text-3xl font-primary font-bold tracking-widest uppercase">
            CATALYST MAR BASELIOS IEDC
          </h2>
          
          <div className="flex gap-6 items-center justify-center mt-2">
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              <FaInstagram className="w-5 h-5 md:w-6 md:h-6" />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              <FaLinkedinIn className="w-5 h-5 md:w-6 md:h-6" />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              <FaDiscord className="w-5 h-5 md:w-6 md:h-6" />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              <FaYoutube className="w-5 h-5 md:w-6 md:h-6" />
            </Link>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="flex items-center justify-center text-[10px] md:text-xs text-gray-500 font-secondary z-10 mt-16 md:mt-24">
          <p>All Rights Reserved © Catalyst IEDC {new Date().getFullYear()}</p>
        </div>

        {/* Huge Text Background */}
        <div className="w-full flex justify-center mt-auto -mb-[3%] select-none pointer-events-none absolute bottom-0 left-0 right-0 overflow-hidden">
          <h1 className="text-[15.5vw] leading-[0.75] font-primary font-bold uppercase text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-neutral-900 tracking-tighter whitespace-nowrap text-center w-full">
            CATALYST
          </h1>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
