"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  motion,
  useAnimation,
  useMotionValue,
  MotionValue,
} from "motion/react";

interface CircularTextProps {
  text: string;
}

const getRotationTransition = (
  duration: number,
  from: number,
  loop: boolean = true,
) => ({
  from,
  to: from + 360,
  ease: "linear" as const,
  duration,
  type: "tween" as const,
  repeat: loop ? Infinity : 0,
});

const getTransition = (duration: number, from: number) => ({
  rotate: getRotationTransition(duration, from),
  scale: {
    type: "spring" as const,
    damping: 20,
    stiffness: 300,
  },
});

const CircularText: React.FC<CircularTextProps> = ({ text }) => {
  // Hardcoded configuration
  const spinDuration = 20;

  /* ✅ ALL HOOKS MUST BE CALLED FIRST */
  const [mounted, setMounted] = useState(false);
  const [circleSize, setCircleSize] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const rotation: MotionValue<number> = useMotionValue(0);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    // Get the actual rendered size from Tailwind classes
    const size = containerRef.current.offsetWidth;
    setCircleSize(size);

    const start = rotation.get();
    controls.start({
      rotate: start + 360,
      scale: 1,
      transition: getTransition(spinDuration, start),
    });
  }, [mounted, spinDuration, text, controls, rotation]);

  /* ✅ Guard AFTER hooks */
  if (!mounted) return null;

  const letters = Array.from(text);

  return (
    <div
      ref={containerRef}
      className="relative w-[100px] h-[100px] sm:w-[150px] sm:h-[150px]"
    >
      <motion.div
        className="relative rounded-full font-black text-white text-center origin-center bg-black w-full h-full font-secondary"
        style={{
          rotate: rotation,
        }}
        initial={{ rotate: 0 }}
        animate={controls}
      >
        {letters.map((letter, i) => {
          const angle = (2 * Math.PI * i) / letters.length;
          // Text radius is 90% of the circle's radius (10% smaller)
          const radius = (circleSize / 2) * 0.8;

          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);
          const rotationDeg = (360 / letters.length) * i;

          return (
            <span
              key={i}
              // 👇 CHANGE LETTER TEXT SIZE HERE: text-sm
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-[10px] sm:text-sm"
              style={{
                transform: `translate(${x}px, ${y}px) rotate(${rotationDeg}deg)`,
              }}
            >
              {letter}
            </span>
          );
        })}
      </motion.div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-white text-2xl sm:text-4xl">
        μ
      </div>
    </div>
  );
};

export default CircularText;
