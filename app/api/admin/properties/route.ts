import { NextResponse } from "next/server";
import { supabaseServer } from "../../../../lib/supabaseServer";

function checkPin(req: Request) {
  const pin = process.env.ADMIN_PIN;
  const headerPin = req.headers.get("x-admin-pin");
  return Boolean(pin && headerPin && headerPin === pin);
}

export async function GET(req: Request) {
  try {
    if (!checkPin(req)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "pending_review";

    const supabase = supabaseServer();

    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, properties: data || [] });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "Unknown error" }, { status: 500 });
  }
}
