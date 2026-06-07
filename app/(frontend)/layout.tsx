import Navbar from "@/components/Navbar";
import MobileMenu from "@/components/MobileMenu";
import Footer from "@/components/home/Footer";
import { StickyBanner } from "@/components/ui/sticky-banner";

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <Footer />
      </div>
    </div>
  );
}
