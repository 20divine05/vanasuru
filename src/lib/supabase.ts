import { createClient } from "@supabase/supabase-js";

function getValidSupabaseUrl(): string {
  const envUrl =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    (typeof import.meta !== "undefined" && import.meta.env
      ? import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL
      : "");

  if (envUrl && !envUrl.includes("ofurtobrwyjnyyoloued")) {
    return envUrl;
  }
  return "https://psxbcvwiyybqouumnuus.supabase.co";
}

function getValidSupabaseKey(): string {
  const envKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    (typeof import.meta !== "undefined" && import.meta.env
      ? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      : "");

  if (envKey && !envKey.includes("YWUD06")) {
    return envKey;
  }
  return "sb_publishable_z-rW-bxr8WJjQ4zR7yvg2A_-BkDP-o0";
}

const SUPABASE_URL = getValidSupabaseUrl();
const SUPABASE_PUBLISHABLE_KEY = getValidSupabaseKey();

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
