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

    const resolved = (ctx.params as any)?.then
      ? await (ctx.params as Promise<{ id: string }>)
      : (ctx.params as { id: string });

    const id = resolved.id;

    if (!id || !uuidRegex.test(id)) {
      return NextResponse.json({ success: false, error: "Invalid booking id format." }, { status: 400 });
    }

    const body = await req.json();

    // Only allow updating specific fields (prevents accidents)
    const update: any = {};

    if (typeof body.booking_status === "string") update.booking_status = body.booking_status;
    if (typeof body.payment_status === "string") update.payment_status = body.payment_status;
    if (typeof body.admin_note === "string" || body.admin_note === null) update.admin_note = body.admin_note;

    // ✅ One-way archive (true only)
    if (body.archived === true) update.archived = true;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ success: false, error: "No valid fields to update." }, { status: 400 });
    }

    const supabase = supabaseServer();

    const { data, error } = await supabase
      .from("booking_requests")
      .update(update)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, booking: data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "Unknown error" }, { status: 500 });
  }
}