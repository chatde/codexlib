import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { registerAgent } from "@/lib/agents/connection";
import { z } from "zod";

export const dynamic = "force-dynamic";

const RegisterSchema = z.object({
  name: z.string().min(2).max(50),
  agent_type: z.enum(["claude", "openai", "custom", "openclaw", "langchain", "autogpt"]),
  description: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join(", ") },
        { status: 400 }
      );
    }

    const result = await registerAgent({
      ownerId: user.id,
      name: parsed.data.name,
      agentType: parsed.data.agent_type,
      description: parsed.data.description,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      id: result.agent.id,
      name: result.agent.name,
      agent_type: result.agent.agent_type,
      api_key: result.agent.api_key,
      message: "Agent registered. Save the API key — it won't be shown again.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
