import React from 'react';
import ExecomClient from './ExecomClient';
import { decodeSectionTitle } from "@/lib/adminStore";
import { Metadata } from 'next';
import { SectionData } from '../dev-team/DevTeamClient';

export const metadata: Metadata = {
  title: "Execom | Catalyst",
  description: "Meet the Catalyst Family.",
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
      sections = data.map((sec: any) => {
        const decoded = decodeSectionTitle(sec.title);
        sec.title = decoded.title;
        sec.bgWhite = decoded.bgWhite;
        sec.cols = decoded.cols;
        sec.size = decoded.size;

        if (sec.execom_members) {
          sec.execom_members.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0));
        }
        return sec as SectionData;
      });
    }
  } catch (error) {
    console.error("Failed to fetch execom:", error);
  }

  return <ExecomClient sections={sections} />;
}
