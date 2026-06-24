import Navbar from "@/components/layout/Navbar";
import MobileMenu from "@/components/layout/MobileMenu";
import Footer from "@/components/home/Footer";
import type { SocialLinks } from "@/components/home/Footer";
import { StickyBanner } from "@/components/ui/sticky-banner";
import { createPublicClient } from "@/lib/supabase/public";
import Link from "next/link";

const DEFAULT_SOCIAL_LINKS: SocialLinks = {
  instagram_url: "https://www.instagram.com/catalyst_mbcet/",
  linkedin_url: "https://www.linkedin.com/company/catalyst-mbcet/",
  discord_url: "https://discord.gg/catalyst",
  youtube_url: "https://www.youtube.com/@catalystmbcet",
};

interface RegistrationOpenEvent {
  id: string;
  title: string;
  registration_url?: string;
  status: string;
  is_registration_open: boolean;
  description: string;
}

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

async function getRegistrationOpenEvents(): Promise<RegistrationOpenEvent[]> {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("events")
      .select("id, title, registration_url, status, is_registration_open, description")
      .in("status", ["upcoming", "ongoing"])
      .eq("is_registration_open", true)
      .order("start_date", { ascending: true });
    return data || [];
  } catch (error) {
    console.error("Error fetching registration open events:", error);
    return [];
  }
}

export default async function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch once on the server — no client-side flash, no # placeholder links
  const socialLinks = await getSocialLinks();
  const registrationOpenEvents = await getRegistrationOpenEvents();

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
          {registrationOpenEvents.length > 0 && (
            <StickyBanner>
              <span className="inline-flex items-center gap-8 pr-8">
                {registrationOpenEvents.map((event, idx) => {
                  const cleanDesc = event.description
                    ? event.description.length > 100
                      ? event.description.slice(0, 100) + "..."
                      : event.description
                    : "";
                  return (
                    <span key={event.id} className="inline-flex items-center">
                      {idx > 0 && <span className="mx-4 text-black/40">•</span>}
                      <Link
                        href={event.registration_url || `/events/${event.id}`}
                        target={event.registration_url ? "_blank" : undefined}
                        rel={event.registration_url ? "noopener noreferrer" : undefined}
                        className="hover:underline font-medium text-black hover:text-black/80 transition-colors"
                      >
                        {event.title} – Register Now{cleanDesc ? ` – ${cleanDesc}` : ""}
                      </Link>
                    </span>
                  );
                })}
              </span>
            </StickyBanner>
          )}
          <MobileMenu />
        </div>

        {/* Page content */}
        <main className="flex-1">{children}</main>
        <Footer socialLinks={socialLinks} />
      </div>
    </div>
  );
}
