"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  ArrowUpRight,
  Check,
  Copy,
  CalendarCheck
} from "lucide-react";
import { getValidImageUrl } from "@/lib/utils";

interface EventClientPageProps {
  event: {
    id: string;
    title: string;
    description: string;
    coverImage: string;
    relatedImages: string[];
    startDate: string;
    endDate: string;
    status: "upcoming" | "ongoing" | "completed" | "cancelled";
    isRegistrationOpen: boolean;
    registrationUrl?: string;
    logoUrl?: string;
  };
}

export default function EventClientPage({ event }: EventClientPageProps) {
  const [copied, setCopied] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    label: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const start = new Date(event.startDate).getTime();
      const end = new Date(event.endDate).getTime();

      if (now < start) {
        const difference = start - now;
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
          label: "Starts In",
        };
      } else if (now >= start && now < end) {
        const difference = end - now;
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
          label: "Ends In",
        };
      } else {
        return null;
      }
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [event.startDate, event.endDate]);

  const images = event.relatedImages.length > 0 ? event.relatedImages : [event.coverImage];

  // Helper to format date range
  const formatDateRange = (startStr: string, endStrStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStrStr);

    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric"
    };

    const startFormatted = start.toLocaleDateString("en-US", options);
    const endFormatted = end.toLocaleDateString("en-US", options);

    if (startFormatted === endFormatted) {
      return startFormatted;
    }

    if (
      start.getMonth() === end.getMonth() &&
      start.getFullYear() === end.getFullYear()
    ) {
      return `${start.getDate()} - ${end.getDate()} ${start.toLocaleDateString(
        "en-US",
        { month: "long", year: "numeric" }
      )}`;
    }

    return `${start.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short"
    })} - ${end.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric"
    })}`;
  };

  // Clipboard copy helper
  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Slider navigation
  const handlePrevSlide = () => {
    setStartIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextSlide = () => {
    setStartIndex((prev) => (prev + 1) % images.length);
  };

  // Lightbox keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev + 1) % images.length);
      }
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, images.length]);

  // Determine indices of images to show (up to 3 side-by-side on desktop)
  const getVisibleIndices = () => {
    if (images.length === 1) return [0];
    if (images.length === 2) return [0, 1];
    return [
      startIndex % images.length,
      (startIndex + 1) % images.length,
      (startIndex + 2) % images.length
    ];
  };

  const visibleIndices = getVisibleIndices();

  return (
    <div className="relative min-h-screen text-white bg-transparent overflow-x-hidden selection:bg-white selection:text-black font-secondary pb-32">
      
      {/* 1. HERO SECTION (Full-Width Cover Image Background fading to Solid Black) */}
      <section className="relative w-full h-[75vh] md:h-[90vh]">
        {/* Banner cover image with linear gradient mask */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 100%)"
          }}
        >
          <Image
            src={getValidImageUrl(event.coverImage)}
            alt={event.title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-top opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black" />
        </div>

        {/* Title & subtitle text aligned towards the bottom */}
        <div className="absolute inset-x-0 bottom-16 md:bottom-24 flex flex-col items-center text-center z-10 px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {/* Monument Extended Event Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-primary font-normal tracking-widest text-white uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
              {event.title}
            </h1>
            {/* Elegant description subtitle */}
            <p className="text-xs md:text-sm font-semibold text-zinc-300 uppercase tracking-widest drop-shadow-md">
              {formatDateRange(event.startDate, event.endDate)}
            </p>

            {/* Countdown timer overlay */}
            {mounted && timeLeft && (
              <div className="mt-4 flex flex-col items-center gap-1">
                <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 font-bold">
                  {timeLeft.label}
                </span>
                <div className="flex items-center gap-3 font-mono text-lg md:text-xl font-bold text-white bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 shadow-lg">
                  <div className="flex flex-col items-center min-w-[2.5rem]">
                    <span>{String(timeLeft.days).padStart(2, "0")}</span>
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-normal mt-0.5">days</span>
                  </div>
                  <span className="text-zinc-600">:</span>
                  <div className="flex flex-col items-center min-w-[2.5rem]">
                    <span>{String(timeLeft.hours).padStart(2, "0")}</span>
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-normal mt-0.5">hours</span>
                  </div>
                  <span className="text-zinc-600">:</span>
                  <div className="flex flex-col items-center min-w-[2.5rem]">
                    <span>{String(timeLeft.minutes).padStart(2, "0")}</span>
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-normal mt-0.5">mins</span>
                  </div>
                  <span className="text-zinc-600">:</span>
                  <div className="flex flex-col items-center min-w-[2.5rem]">
                    <span>{String(timeLeft.seconds).padStart(2, "0")}</span>
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-normal mt-0.5">secs</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* 2. CENTRED CONTENT CONTAINER (Left-aligned text and white action button) */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 mt-12 md:mt-20 relative z-20 space-y-8">
        {/* Paragraphs description splitting */}
        <div className="text-zinc-300 font-secondary text-base md:text-[1.08rem] md:leading-loose text-left space-y-6">
          {event.description ? (
            event.description.split("\n\n").map((para, idx) => (
              <p key={idx} className="whitespace-pre-wrap">{para}</p>
            ))
          ) : (
            <p>No description available for this event.</p>
          )}
        </div>

        {/* Action Registration Button */}
        <div className="pt-4 flex flex-wrap items-center gap-4 justify-start">
          {event.status === "upcoming" ? (
            event.isRegistrationOpen && event.registrationUrl ? (
              <Link
                href={event.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-white text-black px-6 py-3.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-zinc-200 shadow-md group"
              >
                <span>Register Now</span>
                <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-zinc-900 border border-white/10 text-zinc-500 px-6 py-3.5 rounded-md text-xs font-semibold uppercase tracking-wider">
                <CalendarCheck className="w-4 h-4" />
                <span>Registration Opens Soon</span>
              </span>
            )
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-zinc-900 border border-white/10 text-zinc-500 px-6 py-3.5 rounded-md text-xs font-semibold uppercase tracking-wider">
              <span>Event Completed</span>
            </span>
          )}

          {/* Copy Link Action Button */}
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/25 px-5 py-3 rounded-md text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Event Link</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* 3. HORIZONTAL 3-IMAGE CAROUSEL SLIDER GALLERY */}
      {images.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-6 mt-20 relative z-20">
          <div className="relative w-full">
            {/* Grid display: 3 columns on desktop, 1 on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative px-0">
              {visibleIndices.map((imgIdx, idx) => (
                <motion.div
                  key={`${imgIdx}-${idx}`}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  className={`relative aspect-4/3 rounded-xl overflow-hidden cursor-pointer border border-white/10 group shadow-xl ${
                    idx > 0 ? "hidden md:block" : "block"
                  }`}
                  onClick={() => {
                    setLightboxIndex(imgIdx);
                    setLightboxOpen(true);
                  }}
                >
                  <Image
                    src={getValidImageUrl(images[imgIdx])}
                    alt={`Slider image ${idx + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300" />
                </motion.div>
              ))}
            </div>

            {/* Slider Next/Prev outline circle control buttons */}
            {images.length > 3 && (
              <>
                <button
                  onClick={handlePrevSlide}
                  className="absolute -left-2 md:-left-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full border border-white/30 bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black hover:border-white transition-all cursor-pointer shadow-lg"
                  aria-label="Previous images"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextSlide}
                  className="absolute -right-2 md:-right-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full border border-white/30 bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black hover:border-white transition-all cursor-pointer shadow-lg"
                  aria-label="Next images"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Simple Slider indicator indicator dots */}
          {images.length > 3 && (
            <div className="flex justify-center gap-1.5 mt-6">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === startIndex % images.length ? "w-6 bg-white" : "w-1.5 bg-white/20"
                  }`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 4. FULLSCREEN LIGHTBOX MODAL */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center"
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 z-50 p-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded-full transition-all cursor-pointer shadow-lg"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length)
                  }
                  className="absolute left-6 top-1/2 -translate-y-1/2 z-50 p-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded-full transition-all cursor-pointer shadow-lg"
                  aria-label="Previous Image"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button
                  onClick={() => setLightboxIndex((prev) => (prev + 1) % images.length)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 z-50 p-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded-full transition-all cursor-pointer shadow-lg"
                  aria-label="Next Image"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              </>
            )}

            {/* Main Viewer */}
            <div className="relative w-full max-w-5xl h-[65vh] px-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={lightboxIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={getValidImageUrl(images[lightboxIndex])}
                    alt={`Fullscreen image ${lightboxIndex + 1}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1200px) 100vw, 80vw"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Lightbox Status Info and Thumbnails */}
            <div className="mt-8 flex flex-col items-center gap-4">
              <div className="text-zinc-400 font-semibold text-sm">
                Image {lightboxIndex + 1} of {images.length}
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto max-w-lg py-2 px-4 justify-center">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setLightboxIndex(idx)}
                      className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer flex-shrink-0 ${
                        idx === lightboxIndex ? "border-white scale-105" : "border-transparent opacity-40 hover:opacity-100"
                      }`}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <Image
                        src={getValidImageUrl(img)}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
