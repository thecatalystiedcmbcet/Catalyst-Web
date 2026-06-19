import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  supabaseUrl = supabaseUrl.trim();
  if (supabaseUrl.endsWith("/")) {
    supabaseUrl = supabaseUrl.slice(0, -1);
  }
  if (supabaseUrl.endsWith("/rest/v1")) {
    supabaseUrl = supabaseUrl.slice(0, -8);
  }

  return createBrowserClient(
    supabaseUrl || "https://your-project-id.supabase.co",
    supabaseAnonKey || "placeholder-anon-key"
  );
}
