import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const monument = localFont({
  src: [
    {
      path: "../public/fonts/MonumentExtended-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/MonumentExtended-Ultrabold.otf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-monument",
});

const poppins = localFont({
  src: [
    { path: "../public/fonts/Poppins-Thin.ttf", weight: "100" },
    { path: "../public/fonts/Poppins-ExtraLight.ttf", weight: "200" },
    { path: "../public/fonts/Poppins-Light.ttf", weight: "300" },
    { path: "../public/fonts/Poppins-Regular.ttf", weight: "400" },
    { path: "../public/fonts/Poppins-Medium.ttf", weight: "500" },
    { path: "../public/fonts/Poppins-SemiBold.ttf", weight: "600" },
    { path: "../public/fonts/Poppins-Bold.ttf", weight: "700" },
    { path: "../public/fonts/Poppins-ExtraBold.ttf", weight: "800" },
    { path: "../public/fonts/Poppins-Black.ttf", weight: "900" },
  ],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Catalyst",
  description: "Catalyst Platform",
};

import SmoothScrolling from "@/components/SmoothScrolling";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${monument.variable} ${poppins.variable}`}>
        <SmoothScrolling>{children}</SmoothScrolling>
      </body>
    </html>
  );
}
