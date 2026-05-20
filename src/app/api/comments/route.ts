import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

const SKY_ANSWER = "blue";

export async function GET(request: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Not configured." }, { status: 500 });

  const { searchParams } = new URL(request.url);
  const media_id = searchParams.get("media_id");
  if (!media_id) return NextResponse.json({ error: "media_id required." }, { status: 400 });

  const { data, error } = await supabase
    .from("comments")
    .select("id,text,author,reply,created_at")
    .eq("media_id", media_id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Not configured." }, { status: 500 });

  const { media_id, text, author, sky_answer, photo_label, photo_date, photo_url } = await request.json();

  if (!text?.trim()) return NextResponse.json({ error: "Comment cannot be empty." }, { status: 400 });
  if (!media_id) return NextResponse.json({ error: "media_id required." }, { status: 400 });

  // Spam check
  if ((sky_answer || "").trim().toLowerCase() !== SKY_ANSWER) {
    return NextResponse.json({ error: "Incorrect answer to the sky question." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({ media_id, text: text.trim(), author: author?.trim() || "Anonymous" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Email Zulu via Formspree (best-effort)
  const label = photo_label || "a photo";
  const dateStr = photo_date ? new Date(photo_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "";
  await fetch("https://formspree.io/f/xvzlqrwe", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      name: `💬 Comment on ${label}`,
      email: "comment@taruuuu.com",
      message: `From: ${data.author}\n${dateStr ? `Photo date: ${dateStr}\n` : ""}${photo_url ? `Photo: ${photo_url}\n` : ""}\nComment:\n${data.text}`,
    }),
  }).catch(() => {});

  return NextResponse.json(data);
}
