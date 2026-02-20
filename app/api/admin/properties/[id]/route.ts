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
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const resolved = (ctx.params as any)?.then
      ? await (ctx.params as Promise<{ id: string }>)
      : (ctx.params as { id: string });

    const id = resolved.id;

    if (!id || !uuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid property id format." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const supabase = supabaseServer();

    // ✅ Only allow these property fields to be edited by admin
    const allowedFields = [
      "title",
      "description",
      "suburb",
      "city",
      "province",
      "nightly_rate",
      "max_guests",
      "amenities",
      "images",
      "status",
      "admin_note",
    ] as const;

    const updateData: Record<string, any> = {};

    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    // ✅ Validate status if provided (now includes archived)
    if (updateData.status !== undefined) {
      const ok = ["approved", "rejected", "pending_review", "archived"].includes(
        updateData.status
      );
      if (!ok) {
        return NextResponse.json(
          { success: false, error: "Invalid status" },
          { status: 400 }
        );
      }
    }

    // ✅ Normalize number fields if provided
    if (updateData.nightly_rate !== undefined) {
      updateData.nightly_rate = Number(updateData.nightly_rate);
      if (Number.isNaN(updateData.nightly_rate)) {
        return NextResponse.json(
          { success: false, error: "nightly_rate must be a number" },
          { status: 400 }
        );
      }
    }

    if (updateData.max_guests !== undefined) {
      updateData.max_guests = Number(updateData.max_guests);
      if (Number.isNaN(updateData.max_guests)) {
        return NextResponse.json(
          { success: false, error: "max_guests must be a number" },
          { status: 400 }
        );
      }
    }

    // Optional: update updated_at if your table has it
    updateData.updated_at = new Date().toISOString();

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields provided to update." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("properties")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, property: data });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}