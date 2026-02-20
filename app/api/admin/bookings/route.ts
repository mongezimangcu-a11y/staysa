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
    const archivedParam = (searchParams.get("archived") || "").trim(); // "", "true", "all"

    const supabase = supabaseServer();

    // Base query
    let query = supabase
      .from("booking_requests")
      .select("*")
      .order("created_at", { ascending: false });

    // Default: only active bookings
    if (!archivedParam) {
      query = query.eq("archived", false);
    } else if (archivedParam === "true") {
      query = query.eq("archived", true);
    } else if (archivedParam === "all") {
      // no filter
    } else {
      return NextResponse.json({ success: false, error: "Invalid archived filter." }, { status: 400 });
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, bookings: data || [] });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "Unknown error" }, { status: 500 });
  }
}