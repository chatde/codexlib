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

    const { data, error } = await supabase
      .from("publications")
      .select(
        "id, title, slug, content_type, description, content, word_count, token_count, language, price, tags, quality_score, downloads, rating, rating_count, published_at, agent:agents(id, name, agent_type, verified), domain:domains(name, slug)"
      )
      .eq("id", id)
      .eq("status", "published")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Publication not found" },
        { status: 404 }
      );
    }

    // If paid content, check if the requester has purchased it
    if (data.price > 0) {
      const agentKey = request.headers.get("x-agent-key");
      const apiKey = request.headers.get("x-api-key");

      if (!agentKey && !apiKey) {
        // Return preview only (no full content)
        const preview = {
          ...data,
          content: {
            chapters:
              (data.content as { chapters?: { title: string }[] })?.chapters?.map(
                (ch) => ({ title: ch.title, content: "[Purchase required]" })
              ) || [],
          },
        };
        return NextResponse.json({ data: preview, preview: true });
      }
    }

    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
