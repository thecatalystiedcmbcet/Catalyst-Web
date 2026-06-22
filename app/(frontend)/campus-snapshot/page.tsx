import React from "react";
import CampusSnapshotClient, { CampusStat, TopLearner, TopIG } from "./CampusSnapshotClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campus Snapshot | Catalyst",
  description: "Live stats from the MuLearn Foundation Platform for MBCET.",
};

export default async function CampusSnapshotPage() {
  let stats: CampusStat[] = [];
  let topLearners: TopLearner[] = [];
  let topIGs: TopIG[] = [];

  try {
    const res = await fetch("https://mulearn.org/api/v1/public/campus-details/mbt/", {
      next: { revalidate: 60 },
    });
    
    if (res.ok) {
      const data = await res.json();
      const details = data.response?.campus_details;
      
      if (details) {
        stats = [
          { id: "rank", label: "CAMPUS RANK", value: `#${details.rank}` },
          { id: "karma", label: "TOTAL KARMA", value: details.total_karma.toLocaleString() },
          { id: "members", label: "TOTAL MEMBERS", value: details.total_members.toLocaleString() },
          { id: "active", label: "ACTIVE MEMBERS", value: details.active_members.toLocaleString() },
        ];
      }
      
      topLearners = data.response?.top_learners || [];
      topIGs = (data.response?.ig_details || []).slice(0, 5);
    }
  } catch (error) {
    console.error("Failed to fetch campus stats:", error);
  }

  return (
    <CampusSnapshotClient stats={stats} topLearners={topLearners} topIGs={topIGs} />
  );
}
