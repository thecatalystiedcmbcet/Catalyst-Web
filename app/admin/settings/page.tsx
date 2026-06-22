"use client";

import { useEffect, useState } from "react";
import { useAdminStore } from "@/lib/adminStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Loader2, Link as LinkIcon, Instagram, Linkedin, Youtube, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { 
    siteSettings, 
    fetchSettings, 
    updateSettings, 
    isLoadingSettings 
  } = useAdminStore();

  const [isSaving, setIsSaving] = useState(false);
  
  // Local state for the form
  const [formData, setFormData] = useState({
    instagram_url: "",
    linkedin_url: "",
    discord_url: "",
    youtube_url: "",
  });

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (siteSettings) {
      setFormData({
        instagram_url: siteSettings.instagram_url || "",
        linkedin_url: siteSettings.linkedin_url || "",
        discord_url: siteSettings.discord_url || "",
        youtube_url: siteSettings.youtube_url || "",
      });
    }
  }, [siteSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings(formData);
      toast.success("Settings updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingSettings && !siteSettings) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Global Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage configuration across the Catalyst website.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Social Links Card */}
        <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <LinkIcon className="h-5 w-5 text-white/70" />
            <h2 className="text-xl font-semibold text-white">Social Media Links</h2>
          </div>
          <p className="text-sm text-white/50 mb-6">
            These links appear in the footer across all pages. Provide the full URL (e.g. https://instagram.com/catalyst).
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              
              <div className="space-y-2">
                <Label htmlFor="instagram_url" className="text-white/80 flex items-center gap-2">
                  <Instagram className="h-4 w-4" /> Instagram URL
                </Label>
                <Input
                  id="instagram_url"
                  name="instagram_url"
                  value={formData.instagram_url}
                  onChange={handleChange}
                  placeholder="https://instagram.com/..."
                  className="bg-black/50 border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin_url" className="text-white/80 flex items-center gap-2">
                  <Linkedin className="h-4 w-4" /> LinkedIn URL
                </Label>
                <Input
                  id="linkedin_url"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/..."
                  className="bg-black/50 border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discord_url" className="text-white/80 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> Discord URL
                </Label>
                <Input
                  id="discord_url"
                  name="discord_url"
                  value={formData.discord_url}
                  onChange={handleChange}
                  placeholder="https://discord.gg/..."
                  className="bg-black/50 border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube_url" className="text-white/80 flex items-center gap-2">
                  <Youtube className="h-4 w-4" /> YouTube URL
                </Label>
                <Input
                  id="youtube_url"
                  name="youtube_url"
                  value={formData.youtube_url}
                  onChange={handleChange}
                  placeholder="https://youtube.com/..."
                  className="bg-black/50 border-white/10 text-white"
                />
              </div>

            </div>

            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={isSaving}
                className="bg-white text-black hover:bg-gray-200"
              >
                {isSaving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" /> Save Changes</>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
