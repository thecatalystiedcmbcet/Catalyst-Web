import React from "react";
import { ShieldAlert, Home, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface FeatureDisabledProps {
  featureName: string;
}

export function FeatureDisabled({ featureName }: FeatureDisabledProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-muted/50 p-6 rounded-full mb-6">
        <ShieldAlert className="w-16 h-16 text-muted-foreground" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Feature Disabled</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        The <strong>{featureName}</strong> module has been disabled by the system administrator. 
        If you believe this is an error, please check the settings or contact support.
      </p>
      <div className="flex gap-4">
        <Button asChild variant="default">
          <Link href="/admin">
            <Home className="w-4 h-4 mr-2" />
            Return to Dashboard
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/settings">
            <Settings className="w-4 h-4 mr-2" />
            Admin Settings
          </Link>
        </Button>
      </div>
    </div>
  );
}
