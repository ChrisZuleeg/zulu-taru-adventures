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
  const { password, name, state, lat, lng } = await request.json();

  if (password !== process.env.WRITE_PASSWORD) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  if (!name?.trim() || !lat || !lng) {
    return NextResponse.json({ error: "Name and location are required." }, { status: 400 });
  }

  // Find the last visited stop to insert after it
  const { data: lastVisited } = await supabase
    .from("stops")
    .select("order_num")
    .eq("visited", true)
    .order("order_num", { ascending: false })
    .limit(1)
    .single();

  // Fall back to end of list if nothing visited yet
  const { data: maxStop } = await supabase
    .from("stops")
    .select("order_num")
    .order("order_num", { ascending: false })
    .limit(1)
    .single();

  const insertAfter = lastVisited?.order_num ?? maxStop?.order_num ?? 0;
  const order_num = insertAfter + 1;

  // Shift all stops after the insertion point up by 1
  await supabase.rpc("increment_order_num_after", { cutoff: insertAfter });

  const { data, error } = await supabase
    .from("stops")
    .insert({ order_num, name, state: state || "", lat, lng, visited: true, visited_at: new Date().toISOString() })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
