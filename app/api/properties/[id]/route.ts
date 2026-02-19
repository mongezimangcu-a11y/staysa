import { NextResponse } from "next/server";
import { supabaseServer } from "../../../../lib/supabaseServer";

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
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

    const supabase = supabaseServer();

    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ success: false, error: "Property not found." }, { status: 404 });
    }

    // For public view, only allow approved properties
    if (data.status !== "approved") {
      return NextResponse.json(
        { success: false, error: "Property not approved." },
        { status: 403 }
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
