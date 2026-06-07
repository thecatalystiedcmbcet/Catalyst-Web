"use client";

import { ReactLenis, useLenis } from "lenis/react";
import React, { useEffect } from "react";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import gsap from "gsap";

// Register plugin once at module level
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function SmoothScrolling({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.08,
        duration: 1.2,
        smoothWheel: true,
        syncTouch: false,      // use native scroll on touch — much smoother
        touchMultiplier: 1.5,
        infinite: false,
      }}
    >
      <LenisScrollTriggerSync />
      {children}
    </ReactLenis>
  );
}

// Keeps GSAP ScrollTrigger in sync with Lenis scroll position
function LenisScrollTriggerSync() {
  const lenis = useLenis(({ scroll }) => {
    ScrollTrigger.update();
  });

  useEffect(() => {
    // Tell ScrollTrigger to use Lenis scroll values
    function update(time: number) {
      lenis?.raf(time * 1000);
    }
    // Use GSAP ticker to drive Lenis — prevents double requestAnimationFrame
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
    };
  }, [lenis]);

  return null;
}

export default SmoothScrolling;
