"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

/* ---------------- IMAGE UTILS ---------------- */
function getValidImageUrl(url?: string) {
  if (!url) return "/log.png";
  if (url.includes("unsplash.com") || url.includes("appwrite.io")) return url;
  return "/log.png";
}


const ButtonNew = (props: { title: string, onClick?: () => void, disabled?: boolean }) => {
  return (
    <Button
      onClick={props.disabled ? undefined : props.onClick}
      disabled={props.disabled}
      className={`
    mt-8 flex items-center gap-2
    bg-white px-6 py-5 rounded-md
    text-sm font-semibold text-black
    transition-all duration-300
    ${props.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200 hover:text-black hover:shadow-lg group'}
    [&>svg]:h-4 [&>svg]:w-4
  `}
    >
      {props.title}
      {!props.disabled && <ArrowUpRight className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />}
    </Button>
  );
};

const EventCarousel = ({ images = [] }: { images?: string[] }) => {
  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full flex items-center justify-center overflow-hidden rounded-xl h-[50vh] md:h-[70vh]">
      <img src={getValidImageUrl(images[0])} className="w-full h-full object-cover rounded-xl shadow-2xl" />
    </div>
  );
};

export default function EventsPage() {
  const params = useParams();
  const id = params?.id as string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchEventDetails = async () => {
      try {
        const { supabase } = await import("@/lib/supabaseClient");
        // We assume id is the UUID from Supabase.
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          setError("Event not found");
        } else if (data) {
          setEvent(data);
        }
      } catch (err) {
        console.error("Failed to fetch event:", err);
        setError("Failed to load event details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent p-10 flex flex-col gap-10">
        <Skeleton className="w-full h-[55vh] rounded-2xl bg-white/5" />
        <div className="max-w-5xl mx-auto w-full space-y-4">
          <Skeleton className="w-1/2 h-10 bg-white/5" />
          <Skeleton className="w-full h-4 bg-white/5" />
          <Skeleton className="w-full h-4 bg-white/5" />
          <Skeleton className="w-3/4 h-4 bg-white/5" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-10 text-white">
        <h1 className="text-3xl font-primary mb-4">{error || "Event not found"}</h1>
        <Link href="/events">
          <Button className="bg-white text-black hover:bg-gray-200">Go Back to Events</Button>
        </Link>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(event.start_date);
  startDate.setHours(0, 0, 0, 0);

  const endDate = event.end_date ? new Date(event.end_date) : startDate;
  endDate.setHours(0, 0, 0, 0);

  let eventStatus = "";
  if (today < startDate) {
    eventStatus = "upcoming";
  } else if (today >= startDate && today <= endDate) {
    eventStatus = "ongoing";
  } else {
    eventStatus = "completed";
  }

  return (
    <div className="mb-20 min-h-screen bg-transparent">
      {/* Hero Section */}
      <section className="relative w-full h-[55vh] md:h-[65vh]">
        {/* Masking the image so it fades its opacity to 0 at the bottom */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)'
          }}
        >
          <img
            src={getValidImageUrl(event.cover_image)}
            alt={event.title}
            className="w-full h-full object-cover object-top"
          />
        </div>

        {/* Text */}
        <div className="absolute bottom-4 md:bottom-10 w-full text-center z-10 px-4">
          <h1 className="text-5xl md:text-7xl lg:text-[5rem] font-primary font-extrabold tracking-widest text-white uppercase drop-shadow-xl">
            {event.title}
          </h1>
          <p className="text-xl md:text-2xl font-secondary text-gray-300 mt-2 md:mt-4 drop-shadow-md">
            {event.subtitle || new Date(event.start_date).toLocaleDateString()}
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-5xl mx-auto px-6 md:px-12 mt-12 md:mt-20">
        <div className="text-gray-300 font-secondary text-sm md:text-base leading-loose space-y-6">
          <p className="whitespace-pre-wrap">{event.description || "No description available for this event."}</p>
        </div>

        {eventStatus !== "completed" && event.registration_url ? (
          <ButtonNew title="Register Now" onClick={() => window.open(event.registration_url, "_blank")} />
        ) : eventStatus === "completed" ? (
          <ButtonNew title="Event Completed" disabled />
        ) : null}
      </section>

      {/* Carousel Section (Fallback to cover image if no gallery) */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 mt-20">
        <EventCarousel images={event.related_images?.length > 0 ? event.related_images : [event.cover_image]} />
      </div>
    </div>
  );
}
