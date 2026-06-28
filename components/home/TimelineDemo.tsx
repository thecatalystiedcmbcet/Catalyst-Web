"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";

export interface TimelineItem {
  id: string;
  category: string;
  date: string;
  title: string;
  description: string;
  image: string;
}

export default function TimelineDemo({ items }: { items: TimelineItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || items.length === 0) return;
    const ctx = gsap.context(() => {
      /* ─────────────────────────────────────────────────────────
         Header animations — stagger each child element in
      ───────────────────────────────────────────────────────── */
      gsap.fromTo(
        ".tl-header > *",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.12,
          duration: 1.4,
          ease: "power4.out",
          scrollTrigger: {
            trigger: ".tl-header",
            start: "top 85%",
            once: true,
          },
        }
      );

      /* ─────────────────────────────────────────────────────────
         Spine draw-down — scrubs with scroll
      ───────────────────────────────────────────────────────── */
      gsap.fromTo(
        ".tl-spine",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          transformOrigin: "top center",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 55%",
            end: "bottom 55%",
            scrub: 2,
          },
        }
      );

      /* ─────────────────────────────────────────────────────────
         Per-item animations
      ───────────────────────────────────────────────────────── */
      const items = gsap.utils.toArray<HTMLElement>(".tl-item");

      items.forEach((item) => {
        const bgYear  = item.querySelector<HTMLElement>(".tl-bg-year");
        const leftEl  = item.querySelector<HTMLElement>(".tl-left");
        const rightEl = item.querySelector<HTMLElement>(".tl-right");
        const dot     = item.querySelector<HTMLElement>(".tl-dot-inner");
        const ring    = item.querySelector<HTMLElement>(".tl-dot-ring");
        const imgEl   = item.querySelector<HTMLElement>(".tl-img");
        const tagEl   = item.querySelector<HTMLElement>(".tl-tag");
        const lineEl  = item.querySelector<HTMLElement>(".tl-accent-line");
        const numEl   = item.querySelector<HTMLElement>(".tl-num");
        const titleEl = item.querySelector<HTMLElement>(".tl-title");
        const descEl  = item.querySelector<HTMLElement>(".tl-desc");
        const scanEl  = item.querySelector<HTMLElement>(".tl-scan");

        /* Initial states */
        gsap.set([leftEl, rightEl], { autoAlpha: 0 });
        gsap.set(leftEl,  { x: -60 });
        gsap.set(rightEl, { x: 60 });
        gsap.set(bgYear,  { y: 60, autoAlpha: 0 });
        gsap.set(dot,     { scale: 0, autoAlpha: 0 });
        gsap.set(ring,    { scale: 0, autoAlpha: 0 });
        gsap.set(tagEl,   { y: 16, autoAlpha: 0 });
        gsap.set(lineEl,  { scaleX: 0, autoAlpha: 0, transformOrigin: "left center" });
        gsap.set(numEl,   { y: 30, autoAlpha: 0 });
        gsap.set(titleEl, { y: 24, autoAlpha: 0 });
        gsap.set(descEl,  { y: 18, autoAlpha: 0 });
        gsap.set(scanEl,  { scaleX: 0, autoAlpha: 0, transformOrigin: "left center" });

        /* ── Enter timeline — scrub-linked ─────────────────── */
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: "top 82%",
            end: "top 20%",
            scrub: 1,
          },
        });

        tl
          .to(bgYear,  { y: 0, autoAlpha: 1, ease: "power3.out", duration: 1.2 }, 0)
          .to(dot,     { scale: 1, autoAlpha: 1, ease: "back.out(3)", duration: 0.6 }, 0.05)
          .to(ring,    { scale: 1, autoAlpha: 1, ease: "expo.out", duration: 1 }, 0.1)
          .to(leftEl,  { x: 0, autoAlpha: 1, ease: "expo.out", duration: 1.4 }, 0.05)
          .to(rightEl, { x: 0, autoAlpha: 1, ease: "expo.out", duration: 1.4 }, 0.18)
          .to(tagEl,   { y: 0, autoAlpha: 1, ease: "power4.out", duration: 0.8 }, 0.12)
          .to(lineEl,  { scaleX: 1, autoAlpha: 1, ease: "power3.out", duration: 0.7 }, 0.22)
          .to(numEl,   { y: 0, autoAlpha: 1, ease: "power4.out", duration: 0.9 }, 0.14)
          .to(titleEl, { y: 0, autoAlpha: 1, ease: "power4.out", duration: 0.9 }, 0.22)
          .to(descEl,  { y: 0, autoAlpha: 1, ease: "power3.out", duration: 0.9 }, 0.3)
          .to(scanEl,  { scaleX: 1, autoAlpha: 0.6, ease: "power2.out", duration: 0.5 }, 0.08);

        /* ── Exit — gentle fade ─────────────────────────────── */
        gsap.to(item, {
          autoAlpha: 0.25,
          scrollTrigger: {
            trigger: item,
            start: "bottom 38%",
            end: "bottom 8%",
            scrub: 1,
          },
        });

        /* ── Image parallax ─────────────────────────────────── */
        if (imgEl) {
          gsap.fromTo(
            imgEl,
            { yPercent: -10 },
            {
              yPercent: 10,
              ease: "none",
              scrollTrigger: {
                trigger: item,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.5,
              },
            }
          );
        }

        /* ── Bg-year text parallax ──────────────────────────── */
        if (bgYear) {
          gsap.fromTo(
            bgYear,
            { yPercent: -15 },
            {
              yPercent: 15,
              ease: "none",
              scrollTrigger: {
                trigger: item,
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
              },
            }
          );
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [items]);

  return (
    <div
      ref={containerRef}
      className="tl-wrapper relative w-full overflow-hidden"
      style={{
        /* Subtle dark-section feel — slightly lighter than pure black,
           fading in from the surrounding page */
        background:
          "linear-gradient(to bottom, transparent 0%, rgba(8,8,10,0.92) 6%, rgba(8,8,10,0.96) 94%, transparent 100%)",
      }}
    >
      {/* ── Ambient edge glow strips ──────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 10% 50%, rgba(255,255,255,0.025) 0%, transparent 70%), radial-gradient(ellipse 70% 40% at 90% 50%, rgba(255,255,255,0.018) 0%, transparent 70%)",
        }}
      />

      {/* ── Section header ──────────────────────────────────────── */}
      <div className="tl-header relative z-30 text-center pt-28 pb-24 px-6">
        <p className="text-[10px] font-secondary font-semibold tracking-[0.35em] uppercase text-white/25 mb-5">
          Our Journey
        </p>
        <h2 className="text-3xl sm:text-6xl md:text-7xl font-primary text-white tracking-tight leading-[1] break-words hyphens-auto">
          HISTORY &amp;
          <br />
          <span className="text-white/40">MILESTONES</span>
        </h2>
        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-white/20" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
          <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-white/20" />
        </div>
      </div>

      {/* ── Vertical spine ──────────────────────────────────────── */}
      <div className="absolute left-1/2 top-0 bottom-0 w-[1px] -translate-x-1/2 z-20 pointer-events-none">
        {/* Ghost dashes */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 6px, transparent 6px, transparent 14px)",
          }}
        />
        {/* Scroll-driven fill */}
        <div
          className="tl-spine absolute inset-0 origin-top"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.5), rgba(255,255,255,0.15))",
          }}
        />
      </div>

      {/* ── Timeline items ──────────────────────────────────────── */}
      {items.length === 0 ? (
        <div className="text-center py-20 text-white/50 uppercase tracking-widest text-sm z-10 relative">
          Coming Soon
        </div>
      ) : (
        items.map((item, idx) => {
          const isEven = idx % 2 === 0;

        return (
          <div
            key={item.id}
            className="tl-item relative w-full min-h-[80vh] flex items-center py-16"
          >
            {/* Horizontal scan line — subtle */}
            <div className="tl-scan absolute left-0 right-0 h-px z-10 pointer-events-none"
              style={{ top: "50%", background: "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.06) 70%, transparent 100%)" }}
            />

            {/* Giant parallax year */}
            <div className="tl-bg-year absolute inset-0 flex items-center justify-center z-0 pointer-events-none overflow-hidden select-none">
              <span
                className="font-primary font-normal leading-none tracking-tighter"
                style={{
                  fontSize: "clamp(120px, 28vw, 380px)",
                  color: "transparent",
                  WebkitTextStroke: "1px rgba(255,255,255,0.05)",
                  letterSpacing: "-0.04em",
                }}
              >
                {item.date}
              </span>
            </div>

            {/* Center dot */}
            <div className="tl-dot absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none flex items-center justify-center">
              {/* Animated glow ring */}
              <div
                className="tl-dot-ring absolute w-10 h-10 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)" }}
              />
              {/* Core dot */}
              <div
                className="tl-dot-inner w-3 h-3 rounded-full bg-white"
                style={{ boxShadow: "0 0 0 3px rgba(0,0,0,1), 0 0 0 4px rgba(255,255,255,0.4), 0 0 20px 4px rgba(255,255,255,0.18)" }}
              />
            </div>

            {/* Content grid */}
            <div className="relative z-20 w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-0 px-6 md:px-16">

              {/* LEFT */}
              <div
                className={`tl-left flex flex-col justify-center ${
                  isEven
                    ? "md:pr-24 md:items-end md:text-right"
                    : "md:pl-24 md:order-2"
                }`}
              >
                {isEven ? (
                  <TextBlock item={item} align="right" total={items.length} />
                ) : (
                  <ImageBlock item={item} />
                )}
              </div>

              {/* RIGHT */}
              <div
                className={`tl-right flex flex-col justify-center ${
                  isEven ? "md:pl-24" : "md:pr-24 md:items-end md:text-right md:order-1"
                }`}
              >
                {isEven ? (
                  <ImageBlock item={item} />
                ) : (
                  <TextBlock item={item} align="left" total={items.length} />
                )}
              </div>
            </div>
          </div>
        );
      })
      )}

      {/* Bottom breathing room */}
      <div className="h-24" />
    </div>
  );
}

/* ─── Text block ─────────────────────────────────────────────────────── */
function TextBlock({
  item,
  align,
  total,
}: {
  item: TimelineItem;
  align: "left" | "right";
  total: number;
}) {
  const right = align === "right";
  return (
    <div className={`flex flex-col gap-4 ${right ? "items-end" : "items-start"}`}>

      {/* Category tag */}
      <span
        className="tl-tag text-[9px] font-secondary font-semibold tracking-[0.3em] uppercase px-3 py-[5px] border"
        style={{
          color: "rgba(255,255,255,0.45)",
          borderColor: "rgba(255,255,255,0.1)",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        {item.category}
      </span>

      {/* Year number — huge */}
      <h3
        className="tl-num font-primary text-[clamp(4rem,10vw,9rem)] text-white tracking-tighter leading-none"
      >
        {item.date}
      </h3>

      {/* Accent line */}
      <div
        className={`tl-accent-line h-[1px] w-16 ${right ? "self-end" : "self-start"}`}
        style={{
          background: right
            ? "linear-gradient(to left, rgba(255,255,255,0.6), transparent)"
            : "linear-gradient(to right, rgba(255,255,255,0.6), transparent)",
        }}
      />

      {/* Title */}
      <h4 className="tl-title font-primary text-2xl md:text-[1.75rem] text-white leading-snug tracking-tight max-w-xs">
        {item.title}
      </h4>

      {/* Description */}
      <p className="tl-desc font-secondary text-sm text-white/40 leading-[1.8] max-w-[320px]">
        {item.description}
      </p>

      {/* Serial */}
      <span
        className="font-secondary text-[10px] tracking-[0.25em] mt-2"
        style={{ color: "rgba(255,255,255,0.15)" }}
      >
        — {item.id} / {String(total).padStart(2, "0")}
      </span>
    </div>
  );
}

/* ─── Image block ────────────────────────────────────────────────────── */
function ImageBlock({ item }: { item: TimelineItem }) {
  return (
    <div
      className="relative w-full aspect-[4/3] overflow-hidden will-change-transform"
      style={{
        /* Subtle white border with glow */
        outline: "1px solid rgba(255,255,255,0.08)",
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.04), 0 12px 40px -10px rgba(0,0,0,0.6)",
      }}
    >
      {/* Gradient vignettes */}
      <div className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(8,8,10,0.4) 0%, transparent 30%, transparent 60%, rgba(8,8,10,0.7) 100%)",
        }}
      />
      {/* Left-right vignette */}
      <div className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, rgba(8,8,10,0.35) 0%, transparent 25%, transparent 75%, rgba(8,8,10,0.35) 100%)",
        }}
      />

      {/* Image */}
      <Image
        src={item.image}
        alt={item.title}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="tl-img object-cover scale-[1.15] grayscale"
        style={{ opacity: 0.75 }}
      />

      {/* Corner labels */}
      <div className="absolute top-3 right-3 z-20">
        <span
          className="font-secondary text-[9px] tracking-[0.22em] uppercase"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          {item.id}
        </span>
      </div>
      <div className="absolute bottom-3 left-3 z-20">
        <span
          className="font-secondary text-[9px] tracking-[0.22em] uppercase"
          style={{ color: "rgba(255,255,255,0.28)" }}
        >
          {item.category}
        </span>
      </div>
    </div>
  );
}
