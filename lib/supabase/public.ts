import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createPublicClient() {
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  supabaseUrl = supabaseUrl.trim();
  if (supabaseUrl.endsWith("/")) {
    supabaseUrl = supabaseUrl.slice(0, -1);
  }
  if (supabaseUrl.endsWith("/rest/v1")) {
    supabaseUrl = supabaseUrl.slice(0, -8);
  }

  return createSupabaseClient(
    supabaseUrl || "https://your-project-id.supabase.co",
    supabaseAnonKey || "placeholder-anon-key",
    {
      global: {
        fetch: (url, options) => {
          return fetch(url, { ...options, next: { revalidate: 60 } });
        },
      },
    }
  );
}
