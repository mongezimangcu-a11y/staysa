import { NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Required fields
    const required = [
      "host_email",
      "host_name",
      "title",
      "suburb",
      "city",
      "province",
      "nightly_rate",
    ];

    for (const field of required) {
      if (!body?.[field]) {
        return NextResponse.json(
          { success: false, error: `Missing field: ${field}` },
          { status: 400 }
        );
      }
    }

    const supabase = supabaseServer();

    // 1️⃣ Check if host already exists
    const { data: existingHost, error: hostFindError } = await supabase
      .from("hosts")
      .select("id")
      .eq("email", body.host_email)
      .maybeSingle();

    if (hostFindError) {
      return NextResponse.json(
        { success: false, error: hostFindError.message },
        { status: 500 }
      );
    }

    let hostId: string;

    if (existingHost?.id) {
      hostId = existingHost.id;
    } else {
      // 2️⃣ Create host
      const { data: newHost, error: hostCreateError } = await supabase
        .from("hosts")
        .insert({
          email: body.host_email,
          full_name: body.host_name, // ✅ matches your DB column
          phone: body.host_phone || null,
        })
        .select("id")
        .single();

      if (hostCreateError) {
        return NextResponse.json(
          { success: false, error: hostCreateError.message },
          { status: 500 }
        );
      }

      hostId = newHost.id;
    }

    // 3️⃣ Create property
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .insert({
        host_id: hostId,
        host_email: body.host_email,
        title: body.title,
        description: body.description || "",
        suburb: body.suburb,
        city: body.city,
        province: body.province,
        nightly_rate: Number(body.nightly_rate),
        max_guests: Number(body.max_guests || 1),
        amenities: body.amenities || [],
        images: body.images || [],
        status: "pending_review",
      })
      .select("*")
      .single();

    if (propertyError) {
      return NextResponse.json(
        { success: false, error: propertyError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      property,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
