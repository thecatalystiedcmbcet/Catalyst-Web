// Centralized GSAP plugin registration — import this once in your root layout
// instead of registering per-component.
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);

  // Global GSAP defaults for smoother animations
  gsap.defaults({
    ease: "power3.out",
    duration: 0.8,
  });

  // Optimize ScrollTrigger for smooth scroll libraries (Lenis)
  ScrollTrigger.config({
    ignoreMobileResize: true, // prevents layout recalc thrash on mobile resize
  });
}

export { gsap, ScrollTrigger };
