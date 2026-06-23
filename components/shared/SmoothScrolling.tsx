"use client";

import { ReactLenis, useLenis } from "lenis/react";
import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import gsap from "gsap";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function SmoothScrollingContent() {
  const pathname = usePathname();
  const shouldSmoothScroll =
    !pathname.startsWith("/admin") && !pathname.startsWith("/api");

  if (!shouldSmoothScroll) {
    return null;
  }

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.07,
        duration: 0.9,
        smoothWheel: true,
        syncTouch: false,
        touchMultiplier: 1.2,
        infinite: false,
        wheelMultiplier: 1,
        autoRaf: true,
      }}
    >
      {/* <LenisScrollTriggerSync /> */}
    </ReactLenis>
  );
}

function SmoothScrolling({ children }: { children: React.ReactNode }) {
  return (
    <>
      <React.Suspense fallback={null}>
        <SmoothScrollingContent />
      </React.Suspense>
      {children}
    </>
  );
}

function LenisScrollTriggerSync() {
  const lenis = useLenis(() => {
    ScrollTrigger.update();
  });

  // Manual GSAP ticker syncing removed as requested for testing
  return null;
}

export default SmoothScrolling;
