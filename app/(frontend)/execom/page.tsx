import React from 'react';
import ExecomClient from './ExecomClient';
import { decodeSectionTitle } from "@/lib/adminStore";
import { Metadata } from 'next';
import { SectionData, MemberData } from '../dev-team/DevTeamClient';

interface RawExecomMember {
  member_id: string;
  role: string;
  order_index?: number;
  member: MemberData;
}

interface RawSection {
  id: string;
  title: string;
  order_index: number;
  execom_members?: RawExecomMember[];
}

export const metadata: Metadata = {
  title: "Execom | Catalyst",
  description: "Meet the Executive Committee workforce leading the Catalyst Innovation and Entrepreneurship Development Centre at MBCET.",
  alternates: {
    canonical: "/execom",
  },
  openGraph: {
    title: "Execom | Catalyst",
    description: "Meet the Executive Committee workforce leading the Catalyst Innovation and Entrepreneurship Development Centre at MBCET.",
    url: "https://catalyst.mbcet.ac.in/execom",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Execom | Catalyst",
    description: "Meet the Executive Committee workforce leading the Catalyst Innovation and Entrepreneurship Development Centre at MBCET.",
  },
};

export default async function ExecomPage() {
  let sections: SectionData[] = [];

  try {
    const { createPublicClient } = await import("@/lib/supabase/public");
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
      .eq("scope", "catalyst")
      .order("order_index", { ascending: true });

    if (error) {
      console.error("Supabase Error:", error);
    }

    if (data) {
      const rawSections = data as unknown as RawSection[];
      sections = rawSections.map((sec): SectionData => {
        const decoded = decodeSectionTitle(sec.title);
        const execomMembers = sec.execom_members
          ? [...sec.execom_members].sort(
              (a, b) => (a.order_index || 0) - (b.order_index || 0)
            )
          : [];

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
    console.error("Failed to fetch execom:", error);
  }

  return <ExecomClient sections={sections} />;
}
