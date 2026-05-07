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
  const { password, type, title, body, location } = await request.json();

  if (password !== process.env.WRITE_PASSWORD) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  if (!body?.trim()) {
    return NextResponse.json({ error: "Body is required." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({ type, title: title || null, body, location: location || null })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
