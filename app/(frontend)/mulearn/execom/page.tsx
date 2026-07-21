import { Metadata } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import { decodeSectionTitle } from "@/lib/adminStore";
import MuLearnExecomClient from "./MuLearnExecomClient";

interface ExecomMemberRef {
  member_id: string;
  role?: string;
  order_index?: number;
  member: {
    id: string;
    name: string;
    photo_url?: string;
    instagram?: string;
    linkedin?: string;
  };
}

interface ExecomSection {
  id: string;
  title: string;
  order_index?: number;
  bgWhite?: boolean;
  cols?: number;
  size?: string;
  execom_members?: ExecomMemberRef[];
}

type RawSection = Omit<ExecomSection, "bgWhite" | "cols" | "size">;

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
  let sortedSections: ExecomSection[] = [];
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
      const rawSections = data as unknown as RawSection[];
      sortedSections = rawSections.map((sec): ExecomSection => {
        const decoded = decodeSectionTitle(sec.title);
        const execomMembers = sec.execom_members
          ? [...sec.execom_members].sort(
              (a, b) => (a.order_index || 0) - (b.order_index || 0)
            )
          : sec.execom_members;

        return {
          ...sec,
          title: decoded.title,
          bgWhite: decoded.bgWhite,
          cols: decoded.cols,
          size: decoded.size,
          execom_members: execomMembers,
        };
      });
    }
  } catch (error) {
    console.error("Failed to fetch execom sections on server:", error);
  }

  return <MuLearnExecomClient initialSections={sortedSections} />;
}
