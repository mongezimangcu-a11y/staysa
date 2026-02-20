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
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const statusParam = (searchParams.get("status") || "").trim();

    const supabase = supabaseServer();

    // ✅ If no status provided OR status=all → return ALL properties
    let query = supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });

    if (statusParam && statusParam !== "all") {
      // Only allow known statuses (prevents mistakes)
      const allowed = ["pending_review", "approved", "rejected", "archived"];
      if (!allowed.includes(statusParam)) {
        return NextResponse.json(
          { success: false, error: "Invalid status filter." },
          { status: 400 }
        );
      }

      query = query.eq("status", statusParam);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, properties: data || [] });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}