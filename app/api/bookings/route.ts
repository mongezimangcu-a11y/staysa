import { NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabaseServer";

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const required = [
      "property_id",
      "traveler_name",
      "traveler_email",
      "traveler_phone",
      "company_name",
      "check_in",
      "check_out",
      "guests",
    ];

    for (const k of required) {
      if (!body?.[k]) {
        return NextResponse.json({ success: false, error: `Missing field: ${k}` }, { status: 400 });
      }
    }

    if (!uuidRegex.test(body.property_id)) {
      return NextResponse.json({ success: false, error: "Invalid property id format." }, { status: 400 });
    }

    const supabase = supabaseServer();

    // Load property to calculate estimate (nightly_rate * nights)
    const { data: property, error: propErr } = await supabase
      .from("properties")
      .select("id, title, suburb, nightly_rate, status")
      .eq("id", body.property_id)
      .eq("status", "approved")
      .maybeSingle();

    if (propErr) return NextResponse.json({ success: false, error: propErr.message }, { status: 500 });
    if (!property) return NextResponse.json({ success: false, error: "Property not found or not approved." }, { status: 404 });

    const checkIn = new Date(body.check_in);
    const checkOut = new Date(body.check_out);
    const diffMs = checkOut.getTime() - checkIn.getTime();
    const nights = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)) || 1);

    const total_estimate = Number(property.nightly_rate) * nights;

    const { data: booking, error: bookingErr } = await supabase
      .from("booking_requests")
      .insert({
        property_id: body.property_id,
        traveler_name: body.traveler_name,
        traveler_email: body.traveler_email,
        traveler_phone: body.traveler_phone,
        company_name: body.company_name,
        check_in: body.check_in,
        check_out: body.check_out,
        guests: Number(body.guests),
        notes: body.notes || null,
        total_estimate,
        booking_status: "pending",
        payment_status: "pending",
      })
      .select("*")
      .single();

    if (bookingErr) {
      return NextResponse.json({ success: false, error: bookingErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "Unknown error" }, { status: 500 });
  }
}
