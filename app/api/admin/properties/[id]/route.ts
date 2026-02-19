import { NextResponse } from "next/server";
import { supabaseServer } from "../../../../../lib/supabaseServer";

function checkPin(req: Request) {
  const pin = process.env.ADMIN_PIN;
  const headerPin = req.headers.get("x-admin-pin");
  return Boolean(pin && headerPin && headerPin === pin);
}

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    if (!checkPin(req)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const resolved = (ctx.params as any)?.then ? await (ctx.params as Promise<{ id: string }>) : (ctx.params as { id: string });
    const id = resolved.id;

    if (!uuidRegex.test(id)) {
      return NextResponse.json({ success: false, error: "Invalid property id format." }, { status: 400 });
    }

    const body = await req.json();
    const status = body?.status as string;
    const admin_note = (body?.admin_note ?? null) as string | null;

    if (!["approved", "rejected", "pending_review"].includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
    }

    const supabase = supabaseServer();

    const { data, error } = await supabase
      .from("properties")
      .update({ status, admin_note })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, property: data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "Unknown error" }, { status: 500 });
  }
}
