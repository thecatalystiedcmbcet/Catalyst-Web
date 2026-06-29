import { Metadata } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import { connection } from "next/server";
import AchievementsClient from "./AchievementsClient";

export const metadata: Metadata = {
  title: "Achievements | Catalyst",
  description: "Explore the awards, achievements, milestones, and startup successes of Catalyst MBCET IEDC.",
  alternates: {
    canonical: "/achievements",
  },
  openGraph: {
    title: "Achievements | Catalyst",
    description: "Explore the awards, achievements, milestones, and startup successes of Catalyst MBCET IEDC.",
    url: "https://catalyst.mbcet.ac.in/achievements",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Achievements | Catalyst",
    description: "Explore the awards, achievements, milestones, and startup successes of Catalyst MBCET IEDC.",
  },
};

export default async function AchievementsPage() {
  const supabase = createPublicClient();
  const { data: achievements, error } = await supabase
    .from("achievements")
    .select("*")
    .ilike("organisation", "%iedc%")
    .order("date", { ascending: false });

  if (error) {
    console.error("Failed to fetch achievements:", error);
  }

  const validAchievements = achievements || [];

  const featured = validAchievements.filter((a) => a.is_featured);
  // Fallback to most recent if no featured exist
  if (featured.length === 0 && validAchievements.length > 0) {
    featured.push(validAchievements[0]);
  }
  
  const others = validAchievements.filter((a) => !featured.includes(a));

  await connection();
  const currentYear = new Date().getFullYear();

  const recentAchievements = others.filter((item) => {
    const year = Number(item.year || new Date(item.date || item.created_at).getFullYear());
    return year >= currentYear;
  });

  const pastAchievements = others.filter((item) => {
    const year = Number(item.year || new Date(item.date || item.created_at).getFullYear());
    return year < currentYear;
  });

  return (
    <AchievementsClient 
      featured={featured} 
      recentAchievements={recentAchievements} 
      pastAchievements={pastAchievements} 
    />
  );
}
