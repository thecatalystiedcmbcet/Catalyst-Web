"use client";
import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import useNavbarStore from "@/app/utils/useNavbarStore";

export const StickyBanner = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  const { isOpen } = useNavbarStore();
  const [isAtTop, setIsAtTop] = React.useState(true);

  React.useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;
      requestAnimationFrame(() => {
        setIsAtTop(window.scrollY < 50);
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.div
      className={cn(
        "fixed top-[84px] lg:top-[72px] left-0 right-0 z-[350] w-full overflow-hidden bg-white py-1 text-black font-secondary",
        className
      )}
      initial={{
        y: -100,
        opacity: 0,
      }}
      animate={{
        y: isOpen || !isAtTop ? -100 : 0,
        opacity: isOpen || !isAtTop ? 0 : 1,
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
    >
      <motion.div
        className="flex whitespace-nowrap"
        animate={{
          x: [0, -1000],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 16,
            ease: "linear",
          },
        }}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <span key={index} className="inline-block px-4 text-black font-medium">
            {children}
          </span>
        ))}
      </motion.div>
    </motion.div>
  );
};
