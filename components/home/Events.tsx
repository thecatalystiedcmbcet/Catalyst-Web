import React from "react";
import EventsClient, { BasicEvent } from "./EventsClient";
import { createPublicClient } from "@/lib/supabase/public";

export default async function Events() {
  let events: BasicEvent[] = [];

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("events")
      .select("id, title, cover_image")
      .order("start_date", { ascending: false })
      .limit(10); // Show up to 10 latest events in the marquee

    if (!error && data) {
      events = data;
    } else if (error) {
      console.error("Failed to fetch events for home page:", error);
    }
  } catch (err) {
    console.error("Failed to fetch events for home page:", err);
  }

  return <EventsClient events={events} />;
}
