import { NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabaseServer";

export async function GET() {
  try {
    const supabase = supabaseServer();

    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, properties: data || [] });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "Unknown error" }, { status: 500 });
  }
}
