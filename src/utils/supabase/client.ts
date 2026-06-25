import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://txmgboymetrhxidnqbje.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable__9vVdRbZ9sb-YXUjVykNxg_REApNSLP";

export const createClient = () => {
  return createBrowserClient(supabaseUrl, supabaseKey);
};
