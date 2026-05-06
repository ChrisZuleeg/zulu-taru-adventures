import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabase
    .from("stops")
    .select("*")
    .order("order_num");

  if (error) return NextResponse.json([], { status: 500 });
  return NextResponse.json(data);
}
