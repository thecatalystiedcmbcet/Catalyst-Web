import { createClient } from "./supabase/client";

// Fallback placeholder values to avoid throwing "Invalid supabaseUrl" on initialization when env vars are missing
export const supabase = createClient();

