import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !supabaseSecretKey) {
    return NextResponse.json(
      { error: "Supabase is not configured on this environment." },
      { status: 500 }
    );
  }
  const supabase = createClient(supabaseUrl, supabaseSecretKey);

  const { searchParams } = new URL(request.url);
  if (searchParams.get("password") !== process.env.WRITE_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [{ data: rows }, { count: comments_this_month }] = await Promise.all([
    supabase
      .from("pageviews")
      .select("page, visitor_id, country, country_region, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
  ]);

  if (!rows) return NextResponse.json({ error: "No data" }, { status: 500 });

  const total_pageviews = rows.length;
  const unique_visitors = new Set(rows.map((r) => r.visitor_id).filter(Boolean)).size;

  const pageCounts = new Map<string, number>();
  for (const r of rows) pageCounts.set(r.page, (pageCounts.get(r.page) ?? 0) + 1);
  const top_pages = [...pageCounts.entries()]
    .map(([page, count]) => ({ page, count }))
    .sort((a, b) => b.count - a.count);

  const countryCounts = new Map<string, number>();
  for (const r of rows) {
    if (r.country) countryCounts.set(r.country, (countryCounts.get(r.country) ?? 0) + 1);
  }
  const top_countries = [...countryCounts.entries()]
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);

  const stateCounts = new Map<string, number>();
  for (const r of rows) {
    if (r.country === "US" && r.country_region)
      stateCounts.set(r.country_region, (stateCounts.get(r.country_region) ?? 0) + 1);
  }
  const us_states = [...stateCounts.entries()]
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const dailyMap = new Map<string, { pageviews: number; visitors: Set<string> }>();
  for (const r of rows) {
    if (new Date(r.created_at) < cutoff) continue;
    const key = r.created_at.substring(0, 10);
    if (!dailyMap.has(key)) dailyMap.set(key, { pageviews: 0, visitors: new Set() });
    const entry = dailyMap.get(key)!;
    entry.pageviews++;
    if (r.visitor_id) entry.visitors.add(r.visitor_id);
  }
  const daily = [...dailyMap.entries()]
    .map(([date, { pageviews, visitors }]) => ({ date, pageviews, visitors: visitors.size }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({ total_pageviews, unique_visitors, top_pages, top_countries, us_states, daily, comments_this_month: comments_this_month ?? 0 });
}
