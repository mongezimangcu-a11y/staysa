import { NextResponse } from "next/server";
import { supabaseServer } from "../../../../../lib/supabaseServer";

function checkPin(req: Request) {
  const pin = process.env.ADMIN_PIN;
  const headerPin = req.headers.get("x-admin-pin");
  return Boolean(pin && headerPin && headerPin === pin);
}

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const allowedBookingStatus = ["pending", "approved", "declined"];
const allowedPaymentStatus = ["pending", "awaiting_payment", "paid", "declined"];

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    if (!checkPin(req)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized (admin pin)" },
        { status: 401 }
      );
    }

    const resolved = (ctx.params as any)?.then
      ? await (ctx.params as Promise<{ id: string }>)
      : (ctx.params as { id: string });

    const id = resolved?.id;

    if (!id || !uuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid booking id format." },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));

    const booking_status = body?.booking_status ?? undefined;
    const payment_status = body?.payment_status ?? undefined;
    const admin_note = body?.admin_note ?? undefined;

    if (booking_status !== undefined && !allowedBookingStatus.includes(booking_status)) {
      return NextResponse.json({ success: false, error: "Invalid booking_status" }, { status: 400 });
    }

    if (payment_status !== undefined && !allowedPaymentStatus.includes(payment_status)) {
      return NextResponse.json({ success: false, error: "Invalid payment_status" }, { status: 400 });
    }

    const update: any = {};
    if (booking_status !== undefined) update.booking_status = booking_status;
    if (payment_status !== undefined) update.payment_status = payment_status;
    if (admin_note !== undefined) update.admin_note = admin_note;

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
    return NextResponse.json(
      { success: false, error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
