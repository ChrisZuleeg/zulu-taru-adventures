import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { driveFileId } from "@/lib/drive";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

const THUMB_WIDTH = 400;

// wsrv.nl handles HEIC, JPEG, PNG — no sharp needed
async function fetchViaWsrv(sourceUrl: string, width: number): Promise<Buffer | null> {
  const wsrvUrl = `https://wsrv.nl/?url=${encodeURIComponent(sourceUrl)}&output=jpg&w=${width}&q=80&we`;
  try {
    const res = await fetch(wsrvUrl, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("text/html")) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.length > 2000 ? buf : null;
  } catch {
    return null;
  }
}

async function generateThumbnail(r2_url: string, thumbnail_url: string | null, width: number): Promise<Buffer | null> {
  const fileId = driveFileId(r2_url);

  const sources = [
    thumbnail_url && !thumbnail_url.includes(".supabase.co") ? thumbnail_url : null,
    fileId ? `https://lh3.googleusercontent.com/d/${fileId}=w800` : null,
    fileId ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w800` : null,
  ].filter(Boolean) as string[];

  for (const src of sources) {
    const buf = await fetchViaWsrv(src, width);
    if (buf) return buf;
  }
  return null;
}

// GET — return counts of processed vs total photos
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("password") !== process.env.WRITE_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Not configured." }, { status: 500 });

  const { count: total } = await supabase.from("media").select("*", { count: "exact", head: true }).eq("type", "photo");
  const { count: done } = await supabase.from("media").select("*", { count: "exact", head: true }).eq("type", "photo").like("thumbnail_url", "%supabase.co/storage%");

  return NextResponse.json({ total: total ?? 0, done: done ?? 0 });
}

// POST — process one unprocessed photo, return updated counts
export async function POST(request: NextRequest) {
  const { password, width, exclude_ids } = await request.json();
  if (password !== process.env.WRITE_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Not configured." }, { status: 500 });

  const thumbWidth = width ?? THUMB_WIDTH;

  // Find one unprocessed photo, skipping client-reported failures
  let query = supabase
    .from("media")
    .select("id,r2_url,thumbnail_url")
    .eq("type", "photo")
    .not("thumbnail_url", "like", "%supabase.co/storage%")
    .limit(1);

  if (exclude_ids?.length) {
    query = query.not("id", "in", `(${exclude_ids.map((id: string) => `"${id}"`).join(",")})`);
  }

  const { data: photos } = await query;

  if (!photos || photos.length === 0) {
    const { count: total } = await supabase.from("media").select("*", { count: "exact", head: true }).eq("type", "photo");
    return NextResponse.json({ finished: true, total: total ?? 0, done: total ?? 0 });
  }

  const photo = photos[0];

  try {
    const buf = await generateThumbnail(photo.r2_url, photo.thumbnail_url, thumbWidth);

    if (!buf) {
      const { count: done } = await supabase.from("media").select("*", { count: "exact", head: true }).eq("type", "photo").like("thumbnail_url", "%supabase.co/storage%");
      const { count: total } = await supabase.from("media").select("*", { count: "exact", head: true }).eq("type", "photo");
      return NextResponse.json({ finished: false, skipped: photo.id, done: done ?? 0, total: total ?? 0 });
    }

    const filename = `${photo.id}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("thumbnails")
      .upload(filename, buf, { contentType: "image/jpeg", upsert: true });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message, photo_id: photo.id }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage.from("thumbnails").getPublicUrl(filename);
    await supabase.from("media").update({ thumbnail_url: publicUrl }).eq("id", photo.id);

    const { count: done } = await supabase.from("media").select("*", { count: "exact", head: true }).eq("type", "photo").like("thumbnail_url", "%supabase.co/storage%");
    const { count: total } = await supabase.from("media").select("*", { count: "exact", head: true }).eq("type", "photo");

    return NextResponse.json({
      finished: false,
      processed: photo.id,
      done: done ?? 0,
      total: total ?? 0,
      size_kb: Math.round(buf.length / 1024),
    });

  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg, photo_id: photo.id }, { status: 500 });
  }
}
