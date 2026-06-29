import type { Metadata } from "next";
import { Suspense } from "react";
import localFont from "next/font/local";


import DynamicSmoothScrolling from "@/components/DynamicSmoothScrolling";
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
  display: "swap",
  preload: false,
});

// Only load the 4 weights actually used on the site (Regular, Medium, SemiBold, Bold).
// The original 9-weight load was adding 5 unnecessary font-file round-trips.
const poppins = localFont({
  src: [
    { path: "../public/fonts/Poppins-Light.ttf", weight: "300" },
    { path: "../public/fonts/Poppins-Regular.ttf", weight: "400" },
    { path: "../public/fonts/Poppins-Medium.ttf", weight: "500" },
    { path: "../public/fonts/Poppins-SemiBold.ttf", weight: "600" },
    { path: "../public/fonts/Poppins-Bold.ttf", weight: "700" },
  ],
  variable: "--font-poppins",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "Catalyst | Mar Baselios IEDC",
    template: "%s | Catalyst",
  },
  description:
    "Catalyst — Innovation and Entrepreneurship Development Centre of Mar Baselios College of Engineering and Technology. Empowering students with innovation, entrepreneurship, and technical skills.",
  metadataBase: new URL("https://catalyst.mbcet.ac.in"),
  alternates: {
    canonical: "/",
  },
  keywords: [
    "Catalyst",
    "IEDC",
    "MBCET",
    "Mar Baselios College of Engineering and Technology",
    "Innovation",
    "Entrepreneurship",
    "Startup",
    "Technology Hub",
    "Trivandrum",
    "Kerala IEDC",
    "Student Startups",
  ],
  authors: [{ name: "Catalyst Dev Team" }],
  creator: "Catalyst Dev Team",
  publisher: "Mar Baselios IEDC",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Catalyst | Mar Baselios IEDC",
    description:
      "Innovation and Entrepreneurship Development Centre of Mar Baselios College of Engineering and Technology. Explore events, achievements, and statistics.",
    url: "https://catalyst.mbcet.ac.in",
    siteName: "Catalyst MBCET IEDC",
    images: [
      {
        url: "/featured.jpg",
        width: 1200,
        height: 630,
        alt: "Catalyst Mar Baselios IEDC",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Catalyst | Mar Baselios IEDC",
    description:
      "Innovation and Entrepreneurship Development Centre of Mar Baselios College of Engineering and Technology.",
    images: ["/featured.jpg"],
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "") ?? "";
  const supabaseOrigin = supabaseUrl ? new URL(supabaseUrl).origin : null;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to Supabase so the first API call skips the DNS+TCP+TLS handshake */}
        {supabaseOrigin && (
          <>
            <link rel="preconnect" href={supabaseOrigin} />
            <link rel="dns-prefetch" href={supabaseOrigin} />
          </>
        )}
      </head>
      <body className={`${monument.variable} ${poppins.variable}`}>
        <DynamicSmoothScrolling>
          <Suspense fallback={null}>{children}</Suspense>
        </DynamicSmoothScrolling>
      </body>
    </html>
  );
}
