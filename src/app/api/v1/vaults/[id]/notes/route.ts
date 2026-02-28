import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServiceClient();
    const { id } = await params;

    // Verify vault exists and is public
    const { data: vault } = await supabase
      .from("vaults")
      .select("id, is_public")
      .eq("id", id)
      .single();

    if (!vault || !vault.is_public) {
      return NextResponse.json({ error: "Vault not found" }, { status: 404 });
    }

    const { searchParams } = request.nextUrl;
    const folder = searchParams.get("folder");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);
    const offset = (page - 1) * limit;

    let query = supabase
      .from("vault_notes")
      .select("id, title, slug, folder_path, tags, token_count, downloads, created_at, updated_at", { count: "exact" })
      .eq("vault_id", id)
      .eq("is_public", true);

    if (folder) query = query.eq("folder_path", folder);

    const { data, error, count } = await query
      .order("folder_path")
      .order("title")
      .range(offset, offset + limit - 1);

    if (error) {
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
