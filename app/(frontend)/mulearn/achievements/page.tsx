import { Metadata } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import MuLearnAchievementsClient from "./MuLearnAchievementsClient";

export const metadata: Metadata = {
  title: "μLearn Achievements | Catalyst",
  description: "Explore the GTech μLearn student achievements, milestones, and awards of MBCET campus chapter.",
  alternates: {
    canonical: "/mulearn/achievements",
  },
  openGraph: {
    title: "μLearn Achievements | Catalyst",
    description: "Explore the GTech μLearn student achievements, milestones, and awards of MBCET campus chapter.",
    url: "https://catalyst.mbcet.ac.in/mulearn/achievements",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "μLearn Achievements | Catalyst",
    description: "Explore the GTech μLearn student achievements, milestones, and awards of MBCET campus chapter.",
  },
};

export default async function MuLearnAchievementsPage() {
  let achievements: any[] = [];
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .ilike("organisation", "%mulearn%")
      .order("date", { ascending: false });
    if (error) throw error;
    if (data) {
      achievements = data;
    }
  } catch (error) {
    console.error("Failed to fetch achievements on server:", error);
  }

  return <MuLearnAchievementsClient initialAchievements={achievements} />;
}
