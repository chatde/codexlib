import { NextResponse, type NextRequest } from "next/server";
import { validateAgentApiKey, checkAgentRateLimit } from "@/lib/agents/auth";
import { publishContent } from "@/lib/agents/publish";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Authenticate via agent API key
    const agentKey = request.headers.get("x-agent-key");
    if (!agentKey) {
      return NextResponse.json(
        { error: "Missing x-agent-key header" },
        { status: 401 }
      );
    }

    const auth = await validateAgentApiKey(agentKey);
    if (!auth.valid || !auth.agent) {
      return NextResponse.json(
        { error: auth.error || "Invalid API key" },
        { status: 401 }
      );
    }

    // Check rate limit
    const rateLimit = await checkAgentRateLimit(auth.agent.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          remaining: rateLimit.remaining,
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    const result = await publishContent(
      auth.agent.id,
      auth.agent.owner_id,
      body
    );

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      id: result.publication?.id,
      slug: result.publication?.slug,
      status: "pending_review",
      message: "Content submitted for review",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Publish failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
