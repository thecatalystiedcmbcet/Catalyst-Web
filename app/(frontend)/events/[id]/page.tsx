import { notFound } from "next/navigation";
import { Metadata } from "next";
import { connection } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { getValidImageUrl } from "@/lib/utils";
import EventClientPage from "./EventClientPage";

type Props = {
  params: Promise<{ id: string }>;
};

const isUUID = (val: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

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
  
  if (!id || !isUUID(id)) return { title: "Event Not Found" };

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
  await connection();
  const resolvedParams = await params;
  const id = resolvedParams.id;

  if (!id || !isUUID(id)) notFound();

  const supabase = createPublicClient();
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !event) {
    notFound();
  }

  // Map database row (snake_case) to client properties (camelCase)
  const mappedEvent = {
    id: event.id,
    title: event.title,
    description: event.description || "",
    coverImage: event.cover_image || "",
    relatedImages: event.related_images || [],
    startDate: event.start_date,
    endDate: event.end_date,
    status: (event.status || "completed") as "upcoming" | "ongoing" | "completed" | "cancelled",
    isRegistrationOpen: event.is_registration_open || false,
    registrationUrl: event.registration_url || undefined,
    logoUrl: event.logo_url || undefined,
  };

  return <EventClientPage event={mappedEvent} />;
}
