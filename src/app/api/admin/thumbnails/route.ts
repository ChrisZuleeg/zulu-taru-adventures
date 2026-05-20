import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { driveFileId } from "@/lib/drive";
import sharp from "sharp";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const THUMB_WIDTH = 400;

function isAlreadyProcessed(url: string | null): boolean {
  return Boolean(url && url.includes(".supabase.co/storage"));
}

// Try multiple URL strategies to fetch the photo from Google Drive
async function fetchFromDrive(r2_url: string, thumbnail_url: string | null): Promise<Buffer | null> {
  const fileId = driveFileId(r2_url);
  if (!fileId) return null;

  const candidates = [
    // Direct download of full file
    `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`,
    // Drive thumbnail at 800px (already compressed)
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`,
    // wsrv proxy on thumbnail_url
    thumbnail_url
      ? `https://wsrv.nl/?url=${encodeURIComponent(thumbnail_url)}&output=jpg&q=85`
      : null,
  ].filter(Boolean) as string[];

  for (const url of candidates) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      const contentType = res.headers.get("content-type") || "";
      // Skip if Google returned an HTML confirmation/error page
      if (contentType.includes("text/html")) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 1000) continue; // too small to be a real image
      return buf;
    } catch {
      // Try next candidate
    }
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
  const { password, width } = await request.json();
  if (password !== process.env.WRITE_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Not configured." }, { status: 500 });

  const thumbWidth = width ?? THUMB_WIDTH;

  // Find one unprocessed photo
  const { data: photos } = await supabase
    .from("media")
    .select("id,r2_url,thumbnail_url")
    .eq("type", "photo")
    .not("thumbnail_url", "like", "%supabase.co/storage%")
    .limit(1);

  if (!photos || photos.length === 0) {
    // Count final totals
    const { count: total } = await supabase.from("media").select("*", { count: "exact", head: true }).eq("type", "photo");
    return NextResponse.json({ finished: true, total: total ?? 0, done: total ?? 0 });
  }

  const photo = photos[0];

  try {
    const rawBuffer = await fetchFromDrive(photo.r2_url, photo.thumbnail_url);

    if (!rawBuffer) {
      // Mark as skipped by storing a placeholder so we don't retry forever
      // (just leave thumbnail_url as-is and report the skip)
      const { count: done } = await supabase.from("media").select("*", { count: "exact", head: true }).eq("type", "photo").like("thumbnail_url", "%supabase.co/storage%");
      const { count: total } = await supabase.from("media").select("*", { count: "exact", head: true }).eq("type", "photo");
      return NextResponse.json({ finished: false, skipped: photo.id, done: done ?? 0, total: total ?? 0 });
    }

    // Resize with sharp
    const resized = await sharp(rawBuffer)
      .resize(thumbWidth, null, { withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();

    const filename = `${photo.id}.jpg`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("thumbnails")
      .upload(filename, resized, { contentType: "image/jpeg", upsert: true });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message, photo_id: photo.id }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage.from("thumbnails").getPublicUrl(filename);

    // Update thumbnail_url
    await supabase.from("media").update({ thumbnail_url: publicUrl }).eq("id", photo.id);

    const { count: done } = await supabase.from("media").select("*", { count: "exact", head: true }).eq("type", "photo").like("thumbnail_url", "%supabase.co/storage%");
    const { count: total } = await supabase.from("media").select("*", { count: "exact", head: true }).eq("type", "photo");

    const sizeKb = Math.round(resized.length / 1024);
    return NextResponse.json({ finished: false, processed: photo.id, done: done ?? 0, total: total ?? 0, size_kb: sizeKb });

  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg, photo_id: photo.id }, { status: 500 });
  }
}
