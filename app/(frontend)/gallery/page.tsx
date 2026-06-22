import { Metadata } from "next";
import localFont from 'next/font/local';
import { createPublicClient } from "@/lib/supabase/public";
import GalleryClient from "./GalleryClient";

const enigma = localFont({
  src: "../../../public/fonts/enigma.otf",
  weight: "100",
  style: "normal",
});

export const metadata: Metadata = {
  title: "Gallery | Catalyst",
  description: "View the Catalyst gallery of events and achievements.",
};

export default async function GalleryPage() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("events")
    .select("cover_image, related_images")
    .order("start_date", { ascending: false });

  if (error) {
    console.error("Failed to fetch gallery:", error);
  }

  let allImages: string[] = [];
  if (data) {
    data.forEach(event => {
      if (event.cover_image) allImages.push(event.cover_image);
      if (event.related_images && Array.isArray(event.related_images)) {
        allImages.push(...event.related_images);
      }
    });
  }

  const formattedItems = allImages.map((imgUrl, index) => ({
    id: index.toString(),
    img: imgUrl,
    url: imgUrl,
    height: 200 + ((index * 37) % 200),
  }));

  return <GalleryClient items={formattedItems} enigmaClassName={enigma.className} />;
}
