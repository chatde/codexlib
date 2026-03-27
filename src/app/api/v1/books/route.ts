import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServiceClient();
    const { searchParams } = request.nextUrl;

    const search = searchParams.get("search");
    const status = searchParams.get("status") || "summarized";
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);
    const offset = (page - 1) * limit;

    let query = supabase
      .from("books")
      .select(
        "id, title, author, isbn, page_count, source_type, word_count, language, cover_image_url, status, copyright_status, created_at",
        { count: "exact" }
      )
      .eq("status", status);

    if (search) {
      query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%`);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      // Table may not exist yet — return empty result instead of 500
      if (error.message.includes("schema cache") || error.code === "PGRST204") {
        return NextResponse.json({ data: [], meta: { total: 0, page, limit, pages: 0 } });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data,
      meta: {
        total: count,
        page,
        limit,
        pages: Math.ceil((count ?? 0) / limit),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
