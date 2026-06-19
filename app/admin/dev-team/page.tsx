"use client";

import { ExecomWorkspace } from "@/components/features/admin/ExecomWorkspace";

export default function DevTeamPage() {
  return (
    <ExecomWorkspace 
      scope="dev-team" 
      title="Web Team" 
      description="Structure and manage the core web development team for Catalyst." 
    />
  );
}
