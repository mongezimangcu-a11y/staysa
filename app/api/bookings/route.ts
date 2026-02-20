import { NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabaseServer";
import { sendAdminBookingEmail, sendTravelerBookingEmail } from "../../../lib/mailer";

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function safeDateString(v: any) {
  if (!v) return "";
  return String(v).slice(0, 10);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Guardrail 1: Honeypot spam check
    if (body?.website) {
      return NextResponse.json({ success: false, error: "Spam detected." }, { status: 400 });
    }

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
        return NextResponse.json(
          { success: false, error: `Missing field: ${k}` },
          { status: 400 }
        );
      }
    }

    if (!uuidRegex.test(body.property_id)) {
      return NextResponse.json(
        { success: false, error: "Invalid property id format." },
        { status: 400 }
      );
    }

    // ✅ Guardrail 2: Date validation
    const checkInDate = new Date(body.check_in);
    const checkOutDate = new Date(body.check_out);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid dates provided." },
        { status: 400 }
      );
    }

    if (checkOutDate.getTime() <= checkInDate.getTime()) {
      return NextResponse.json(
        { success: false, error: "Check-out must be after check-in." },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // Load property (approved only)
    const { data: property, error: propErr } = await supabase
      .from("properties")
      .select("id, title, suburb, city, nightly_rate, status")
      .eq("id", body.property_id)
      .eq("status", "approved")
      .maybeSingle();

    if (propErr) {
      return NextResponse.json({ success: false, error: propErr.message }, { status: 500 });
    }

    if (!property) {
      return NextResponse.json(
        { success: false, error: "Property not found or not approved." },
        { status: 404 }
      );
    }

    // Calculate nights
    const diffMs = checkOutDate.getTime() - checkInDate.getTime();
    const nights = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)) || 1);

    const nightly = Number(property.nightly_rate || 0);
    const total_estimate = nightly * nights;

    // Insert booking
    const { data: booking, error: bookingErr } = await supabase
      .from("booking_requests")
      .insert({
        property_id: body.property_id,
        traveler_name: body.traveler_name,
        traveler_email: body.traveler_email,
        traveler_phone: body.traveler_phone,
        company_name: body.company_name,
        check_in: safeDateString(body.check_in),
        check_out: safeDateString(body.check_out),
        guests: Number(body.guests),
        notes: body.notes || null,
        total_estimate,
        booking_status: "pending",
        payment_status: "pending",
        archived: false,
      })
      .select("*")
      .single();

    if (bookingErr) {
      return NextResponse.json({ success: false, error: bookingErr.message }, { status: 500 });
    }

    // Generate booking reference
    const booking_reference = `TC-${String(booking.id).slice(-6).toUpperCase()}`;

    // Store booking reference
    await supabase
      .from("booking_requests")
      .update({ booking_reference })
      .eq("id", booking.id);

    const emailStatus = { admin: false, traveler: false };

    // Admin email (best-effort)
    try {
      await sendAdminBookingEmail({
        booking_reference,
        property_title: property.title,
        property_suburb: property.suburb,
        property_city: property.city,
        check_in: booking.check_in,
        check_out: booking.check_out,
        nights,
        guests: booking.guests,
        company_name: booking.company_name,
        traveler_name: booking.traveler_name,
        traveler_email: booking.traveler_email,
        traveler_phone: booking.traveler_phone,
        total_estimate: booking.total_estimate,
        booking_id: booking.id,
      });
      emailStatus.admin = true;
    } catch (e: any) {
      console.error("❌ Admin email failed:", e?.message || e);
    }

    // Traveler email (best-effort)
    try {
      await sendTravelerBookingEmail({
        to: booking.traveler_email,
        traveler_name: booking.traveler_name,
        booking_reference,
        suburb: property.suburb,
        city: property.city,
        check_in: booking.check_in,
        check_out: booking.check_out,
        guests: booking.guests,
        company_name: booking.company_name,
        total_estimate: booking.total_estimate,
      });
      emailStatus.traveler = true;
    } catch (e: any) {
      console.error("❌ Traveler email failed:", e?.message || e);
    }

    return NextResponse.json({
      success: true,
      booking: { ...booking, booking_reference },
      emailStatus,
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}