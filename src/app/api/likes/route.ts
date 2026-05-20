import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Not configured." }, { status: 500 });

  const { media_id } = await request.json();
  if (!media_id) return NextResponse.json({ error: "media_id required." }, { status: 400 });

  const { data, error } = await supabase.rpc("increment_likes", { target_id: media_id });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ likes_count: data });
}
