import React from "react";
import OurPioneersClient from "./OurPioneersClient";
import { createPublicClient } from "@/lib/supabase/public";
import { Pioneer } from "@/lib/adminStore";

export default async function OurPioneers() {
  let pioneers: Pioneer[] = [];

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("pioneers")
      .select("*")
      .order("sort_order", { ascending: true });

    if (!error && data) {
      pioneers = data as Pioneer[];
    } else if (error) {
      console.error("Failed to fetch pioneers for home page:", error);
    }
  } catch (err) {
    console.error("Failed to fetch pioneers for home page:", err);
  }

  return <OurPioneersClient pioneers={pioneers} />;
}
