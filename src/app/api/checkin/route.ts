import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    return NextResponse.json(
      { error: "Supabase is not configured on this environment." },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseSecretKey);
  const { id, visited } = await request.json();

  const { error } = await supabase
    .from("stops")
    .update({
      visited,
      visited_at: visited ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
