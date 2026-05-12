import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
    if (!supabaseUrl || !supabaseSecretKey) {
      return NextResponse.json({ ok: false });
    }
    const supabase = createClient(supabaseUrl, supabaseSecretKey);

    const { page } = await request.json();

    const country = request.headers.get("x-vercel-ip-country") ?? null;
    const country_region = request.headers.get("x-vercel-ip-country-region") ?? null;
    const rawCity = request.headers.get("x-vercel-ip-city");
    const city = rawCity ? decodeURIComponent(rawCity) : null;

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
    const ua = request.headers.get("user-agent") ?? "";
    const visitor_id = createHash("sha256").update(ip + ua).digest("hex").substring(0, 16);

    await supabase.from("pageviews").insert({ page, visitor_id, country, country_region, city });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
