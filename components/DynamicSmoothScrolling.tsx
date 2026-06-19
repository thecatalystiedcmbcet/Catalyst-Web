"use client";

import dynamic from "next/dynamic";

const SmoothScrolling = dynamic(() => import("./shared/SmoothScrolling"), {
  ssr: false,
});

export default function DynamicSmoothScrolling({ children }: { children: React.ReactNode }) {
  return <SmoothScrolling>{children}</SmoothScrolling>;
}
