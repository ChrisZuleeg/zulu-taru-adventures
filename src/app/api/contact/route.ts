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
  const { name, email, message } = await request.json();

  if (!email || !message) {
    return NextResponse.json({ error: "Email and message are required." }, { status: 400 });
  }

  const { error } = await supabase
    .from("contacts")
    .insert({ name, email, message });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fire email notification via Formspree (best-effort, don't fail if it errors)
  await fetch("https://formspree.io/f/xvzlqrwe", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ name, email, message }),
  }).catch(() => {});

  return NextResponse.json({ success: true });
}
