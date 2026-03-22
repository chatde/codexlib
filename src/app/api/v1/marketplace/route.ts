import { NextResponse, type NextRequest } from "next/server";
import { listPublications } from "@/lib/agents/publish";
import type { ContentType } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const contentType = searchParams.get("type") as ContentType | null;
    const search = searchParams.get("search");
    const agentId = searchParams.get("agent_id");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);

    const result = await listPublications({
      contentType: contentType || undefined,
      agentId: agentId || undefined,
      search: search || undefined,
      page,
      limit,
    });

    return NextResponse.json({
      data: result.publications,
      meta: {
        total: result.total,
        page: result.page,
        limit,
        pages: result.totalPages,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
