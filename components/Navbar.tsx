"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { HiOutlineMenuAlt3 } from "react-icons/hi";
import useNavbarStore from "@/app/utils/useNavbarStore";

const Navbar = () => {
  const { isOpen, toggleNavbar } = useNavbarStore();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Always show at the top of the page
      if (currentScrollY < 50) {
        setIsVisible(true);
      } 
      // Show when scrolling up
      else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      } 
      // Hide when scrolling down
      else {
        setIsVisible(false);
      }
      
      lastScrollY = currentScrollY > 0 ? currentScrollY : 0;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { page: "Home", path: "/" },
    { page: "Events", path: "/events" },
    { page: "Achievements", path: "/achievements" },
    { page: "Catalyst Execom", path: "/execom" },
    { page: "Web Team", path: "/dev-team" },
    { 
      page: "MuLearn", 
      path: "/mulearn",
      subLinks: [
        { page: "Execom", path: "/mulearn/execom" },
        { page: "Achievements", path: "/mulearn/achievements" }
      ]
    },
    { page: "Gallery", path: "/gallery" },
  ];

  return (
    <div className={`flex fixed z-[500] top-4 left-4 right-4 lg:top-0 lg:left-0 lg:right-0 lg:w-screen rounded-[2rem] lg:rounded-none border border-white/20 lg:border-none py-3 px-6 lg:py-4 lg:px-14 justify-between bg-black/80 lg:bg-[#000000] backdrop-blur-2xl lg:backdrop-blur-none items-center text-white transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-[150%] lg:translate-y-0'}`}>
      {/* Logo */}
      <Link href={"/"} className="font-bold text-2xl">
        <img className="h-10" src="/Catalyst_Logo_Navbar.png" alt="" />
      </Link>

      {/* Desktop Navigation */}
      <div className="gap-12 hidden lg:flex">
        {links.map((link, index) => {
          return (
            <div key={index} className="relative w-fit group py-2">
              <div className="flex items-center gap-1 cursor-pointer">
                <Link
                  className="text-base font-light text-white"
                  href={link.path}
                >
                  {link.page}
                </Link>
                {link.subLinks && (
                  <svg className="w-4 h-4 text-white transition-transform duration-300 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </div>
              <div className="scale-0 group-hover:scale-100 transition-transform duration-300 ease-in-out origin-left h-[1px] w-full bg-white mt-1"></div>
              
              {/* Dropdown for Desktop */}
              {link.subLinks && (
                <div className="absolute top-full left-0 pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform translate-y-2 group-hover:translate-y-0">
                  <div className="bg-black/95 border border-white/20 rounded-xl overflow-hidden flex flex-col py-2 backdrop-blur-md shadow-2xl">
                    {link.subLinks.map((subLink, subIndex) => (
                      <Link
                        key={subIndex}
                        href={subLink.path}
                        className="px-5 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        {subLink.page}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Menu Toggle */}
      <button
        onClick={toggleNavbar}
        className="lg:hidden p-1 -mr-1 cursor-pointer focus:outline-none"
        aria-label="Toggle Menu"
      >
        <HiOutlineMenuAlt3 size={30} />
      </button>
    </div>
  );
};

export default Navbar;
