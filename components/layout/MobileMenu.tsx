"use client";
import useNavbarStore from "@/app/utils/useNavbarStore";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";



const ALL_LINKS = [
  { page: "Home", path: "/" },
  { page: "Events", path: "/events" },
  { page: "Catalyst Execom", path: "/execom" },
  { page: "Achievements", path: "/achievements" },
  { page: "Web Team", path: "/dev-team" },
  {
    page: "µLearn",
    path: "/mulearn",
    subLinks: [
      { page: "µLearn Home", path: "/mulearn" },
      { page: "Execom", path: "/mulearn/execom" },
      { page: "Achievements", path: "/mulearn/achievements" },
      { page: "Campus Snapshot", path: "/campus-snapshot" },
    ]
  },
  { page: "Gallery", path: "/gallery" },
  { page: "Certificate", path: "/certificate" },
];

const MobileMenu = () => {
  const links = ALL_LINKS;
  const { isOpen, toggleNavbar } = useNavbarStore();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    } else {
      // Close all submenus when closing the main menu
      setTimeout(() => setOpenSubmenu(null), 300);
    }
  }, [isOpen]);

  const handleSubmenuToggle = (page: string) => {
    setOpenSubmenu(openSubmenu === page ? null : page);
  };

  return (
    <div
      className={`
        fixed
        top-0
        right-0
        h-screen
        w-full
        bg-[#000]
        text-white
        z-[600]
        flex
        flex-col
        px-12
        justify-center
        gap-8
        transform
        transition-all
        duration-500
        ease-in-out
        ${isOpen
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0 pointer-events-none"
        }
        lg:hidden
      `}
      style={{
        transitionProperty: "transform, opacity",
        willChange: "transform, opacity",
      }}
    >
      {/* Close Button */}
      <button
        onClick={toggleNavbar}
        className="
          absolute
          top-10
          right-10
          z-10
          text-6xl
          transition-transform
          duration-300
          hover:scale-110
          active:scale-95
        "
      >
        &times;
      </button>

      {/* Menu Links */}
      {links.map((link, index) => (
        <div key={index} className="flex flex-col">
          <div className="flex items-center justify-between z-10 w-full max-w-[280px]">
            <Link
              href={link.path}
              onClick={toggleNavbar}
              className="
                text-4xl
                text-white
                font-secondary
                font-light
                tracking-tighter
                transform
                transition-all
                duration-300
                hover:translate-x-4
                hover:opacity-80
              "
            >
              {link.page}
            </Link>

            {link.subLinks && (
              <button
                onClick={() => handleSubmenuToggle(link.page)}
                className="p-3 focus:outline-none transition-transform duration-300"
                style={{
                  transform: openSubmenu === link.page ? "rotate(180deg)" : "rotate(0deg)"
                }}
              >
                <FaChevronDown className="w-6 h-6 text-white" />
              </button>
            )}
          </div>

          {/* Sub Links */}
          {link.subLinks && (
            <div
              className={`flex flex-col gap-5 ml-6 overflow-hidden transition-all duration-500 ease-in-out ${openSubmenu === link.page ? "max-h-64 mt-6 opacity-100" : "max-h-0 mt-0 opacity-0"
                }`}
            >
              {link.subLinks.map((subLink, subIndex) => (
                <Link
                  key={subIndex}
                  href={subLink.path}
                  onClick={toggleNavbar}
                  className="text-2xl text-gray-300 font-secondary font-light tracking-tighter hover:text-white"
                >
                  {subLink.page}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MobileMenu;
