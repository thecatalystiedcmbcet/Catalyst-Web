import { Metadata } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import { decodeSectionTitle } from "@/lib/adminStore";
import MuLearnExecomClient from "./MuLearnExecomClient";

export const metadata: Metadata = {
  title: "μLearn Workforce | Catalyst",
  description: "Meet the student workforce and Executive Committee leading GTech μLearn MBCET chapter.",
  alternates: {
    canonical: "/mulearn/execom",
  },
  openGraph: {
    title: "μLearn Workforce | Catalyst",
    description: "Meet the student workforce and Executive Committee leading GTech μLearn MBCET chapter.",
    url: "https://catalyst.mbcet.ac.in/mulearn/execom",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "μLearn Workforce | Catalyst",
    description: "Meet the student workforce and Executive Committee leading GTech μLearn MBCET chapter.",
  },
};

export default async function MuLearnExecomPage() {
  let sortedSections: any[] = [];
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("execom_sections")
      .select(`
        id, title, order_index,
        execom_members (
          member_id, role, order_index,
          member:members (
            id, name, photo_url, instagram, linkedin
          )
        )
      `)
      .eq("scope", "mulearn")
      .order("order_index", { ascending: true });

    if (error) throw error;

    if (data) {
      sortedSections = data.map((sec: any) => {
        const decoded = decodeSectionTitle(sec.title);
        sec.title = decoded.title;
        sec.bgWhite = decoded.bgWhite;
        sec.cols = decoded.cols;
        sec.size = decoded.size;

        if (sec.execom_members) {
          sec.execom_members.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0));
        }
        return sec;
      });
    }
  } catch (error) {
    console.error("Failed to fetch execom sections on server:", error);
  }

  return <MuLearnExecomClient initialSections={sortedSections} />;
}
