import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getValidImageUrl(url?: string) {
  if (!url) return "/log.png";
  if (url.includes("unsplash.com") || url.includes("appwrite.io") || url.includes("supabase.co") || url.includes("supabase.in")) return url;
  return "/log.png";
}
