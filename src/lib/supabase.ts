import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseKey);
export const supabase = hasSupabaseEnv
  ? createClient(supabaseUrl!, supabaseKey!)
  : null;

export type MediaItem = {
  id: string;
  type: "video" | "photo";
  title: string;
  location: string | null;
  filmed_at: string | null;
  r2_url: string;
  thumbnail_url: string | null;
  gps_lat: number | null;
  gps_lng: number | null;
  duration_seconds: number | null;
  created_at: string;
};
