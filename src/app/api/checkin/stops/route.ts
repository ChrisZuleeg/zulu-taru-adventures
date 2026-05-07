import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured on this environment." },
      { status: 500 }
    );
  }

  const { data, error } = await supabase
    .from("stops")
    .select("*")
    .order("order_num");

  if (error) return NextResponse.json([], { status: 500 });
  return NextResponse.json(data);
}
