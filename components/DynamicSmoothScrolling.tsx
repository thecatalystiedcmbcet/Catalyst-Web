"use client";

import dynamic from "next/dynamic";

const SmoothScrolling = dynamic(() => import("./SmoothScrolling"), { ssr: false });

export default function DynamicSmoothScrolling({ children }: { children: React.ReactNode }) {
  return <SmoothScrolling>{children}</SmoothScrolling>;
}
