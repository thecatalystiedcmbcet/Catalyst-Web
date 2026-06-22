import React from 'react';
import DevTeamClient, { SectionData } from './DevTeamClient';
import { decodeSectionTitle } from "@/lib/adminStore";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Dev Team | Catalyst",
  description: "Meet the minds behind Catalyst Web.",
};

export default async function DevTeamPage() {
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
      .eq("scope", "dev-team")
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
    console.error("Failed to fetch dev team:", error);
  }

  return <DevTeamClient sections={sections} />;
}
