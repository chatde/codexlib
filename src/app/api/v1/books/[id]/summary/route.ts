import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServiceClient();

    const { data: summaries, error } = await supabase
      .from("summaries")
      .select("id, book_id, summary_type, content, token_count, compression_ratio, model_used, quality_score, created_at")
      .eq("book_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!summaries || summaries.length === 0) {
      return NextResponse.json(
        { error: "No summaries found for this book" },
        { status: 404 }
      );
    }

    // Return the best summary (highest quality score)
    const best = summaries.reduce((a, b) =>
      (a.quality_score || 0) > (b.quality_score || 0) ? a : b
    );

    return NextResponse.json({
      summary: best,
      all_summaries: summaries.map((s) => ({
        id: s.id,
        type: s.summary_type,
        token_count: s.token_count,
        quality_score: s.quality_score,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
