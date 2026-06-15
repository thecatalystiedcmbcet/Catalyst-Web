"use client";

import React, { useEffect, useState } from "react";
import { useAdminSettings } from "@/hooks/use-admin-settings";
import { FeatureDisabled } from "./feature-disabled";

interface FeatureGuardProps {
  featureKey: "events" | "members" | "roles" | "achievements" | "logs";
  featureName: string;
  children: React.ReactNode;
}

export function FeatureGuard({ featureKey, featureName, children }: FeatureGuardProps) {
  const [mounted, setMounted] = useState(false);
  const { features } = useAdminSettings();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration errors by not rendering until mounted
  if (!mounted) {
    return null;
  }

  if (!features[featureKey]) {
    return <FeatureDisabled featureName={featureName} />;
  }

  return <>{children}</>;
}
