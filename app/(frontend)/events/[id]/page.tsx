import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { createPublicClient } from "@/lib/supabase/public";
import { connection } from "next/server";
import { EventCarousel } from "./EventCarousel";
import { getValidImageUrl } from "@/lib/utils";


type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  const supabase = createPublicClient();
  const { data: events } = await supabase.from("events").select("id");

  if (!events || events.length === 0) return [{ id: "dummy-event" }];

  return events.map((event) => ({
    id: event.id.toString(),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  if (!id) return { title: "Event Not Found" };

  const supabase = createPublicClient();
  const { data: event } = await supabase
    .from("events")
    .select("title, description, cover_image")
    .eq("id", id)
    .single();

  if (!event) return { title: "Event Not Found" };

  return {
    title: `${event.title} | Catalyst`,
    description: event.description?.substring(0, 160) || "Event on Catalyst platform",
    openGraph: {
      title: `${event.title} | Catalyst`,
      description: event.description?.substring(0, 160) || "Event on Catalyst platform",
      images: [
        {
          url: getValidImageUrl(event.cover_image),
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${event.title} | Catalyst`,
      description: event.description?.substring(0, 160) || "Event on Catalyst platform",
      images: [getValidImageUrl(event.cover_image)],
    },
  };
}

export default async function EventsPage({ params }: Props) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  if (!id) notFound();

  const supabase = createPublicClient();
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !event) {
    notFound();
  }

  let eventStatus = "";
  try {
    await connection();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(event.start_date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = event.end_date ? new Date(event.end_date) : startDate;
    endDate.setHours(0, 0, 0, 0);

    if (today < startDate) {
      eventStatus = "upcoming";
    } else if (today >= startDate && today <= endDate) {
      eventStatus = "ongoing";
    } else {
      eventStatus = "completed";
    }
  } catch (err) {
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
          <Image
            src={getValidImageUrl(event.cover_image)}
            alt={event.title}
            fill
            sizes="100vw"
            priority
            className="object-cover object-top"
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
          <Link
            href={event.registration_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 bg-white px-6 py-5 rounded-md text-sm font-semibold text-black transition-all duration-300 hover:bg-gray-200 hover:shadow-lg group"
          >
            Register Now
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>
        ) : eventStatus === "completed" ? (
          <div className="mt-8 inline-flex items-center gap-2 bg-white px-6 py-5 rounded-md text-sm font-semibold text-black opacity-50 cursor-not-allowed">
            Event Completed
          </div>
        ) : null}
      </section>

      {/* Carousel Section (Fallback to cover image if no gallery) */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 mt-20">
        <EventCarousel images={event.related_images?.length > 0 ? event.related_images : [event.cover_image]} />
      </div>
    </div>
  );
}
