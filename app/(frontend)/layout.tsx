import Navbar from "@/components/layout/Navbar";
import MobileMenu from "@/components/layout/MobileMenu";
import Footer from "@/components/home/Footer";
import type { SocialLinks } from "@/components/home/Footer";
import { StickyBanner } from "@/components/ui/sticky-banner";
import { createPublicClient } from "@/lib/supabase/public";

const DEFAULT_SOCIAL_LINKS: SocialLinks = {
  instagram_url: "https://www.instagram.com/catalyst_mbcet/",
  linkedin_url: "https://www.linkedin.com/company/catalyst-mbcet/",
  discord_url: "https://discord.gg/catalyst",
  youtube_url: "https://www.youtube.com/@catalystmbcet",
};

async function getSocialLinks(): Promise<SocialLinks> {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("site_settings")
      .select("instagram_url, linkedin_url, discord_url, youtube_url")
      .eq("id", "social_links")
      .single();
    return data ?? DEFAULT_SOCIAL_LINKS;
  } catch {
    return DEFAULT_SOCIAL_LINKS;
  }
}

export default async function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch once on the server — no client-side flash, no # placeholder links
  const socialLinks = await getSocialLinks();

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      {/* Background texture layer */}
      <div
        className="absolute inset-0 z-0 opacity-3 pointer-events-none"
        style={{
          backgroundImage: "url('/images/Logo.svg')",
          backgroundRepeat: "repeat",
          backgroundSize: "1200px",
          backgroundPosition: "center top",
        }}
      />

      {/* UI layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navbar must always win */}
        <div className="relative z-50">
          <Navbar />
          <StickyBanner>
            Relevent 2025 – Register Now – Gateway to Leadership and
            Innovation
          </StickyBanner>
          <MobileMenu />
        </div>

        {/* Page content */}
        <main className="flex-1">{children}</main>
        <Footer socialLinks={socialLinks} />
      </div>
    </div>
  );
}
