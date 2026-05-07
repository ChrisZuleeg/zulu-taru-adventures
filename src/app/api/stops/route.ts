import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function POST(request: NextRequest) {
  const { password, name, state, lat, lng } = await request.json();

  if (password !== process.env.WRITE_PASSWORD) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  if (!name?.trim() || !lat || !lng) {
    return NextResponse.json({ error: "Name and location are required." }, { status: 400 });
  }

  const { data: maxStop } = await supabase
    .from("stops")
    .select("order_num")
    .order("order_num", { ascending: false })
    .limit(1)
    .single();

  const order_num = (maxStop?.order_num ?? 0) + 1;

  const { data, error } = await supabase
    .from("stops")
    .insert({ order_num, name, state: state || "", lat, lng, visited: true, visited_at: new Date().toISOString() })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
