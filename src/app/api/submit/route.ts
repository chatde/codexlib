import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const submitSchema = z.object({
  title: z.string().min(1).max(200),
  domain_id: z.string().uuid(),
  subdomain_id: z.string().uuid().nullable(),
  content_raw: z.string().min(200),
  difficulty: z.enum(["beginner", "intermediate", "advanced", "expert"]),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = submitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // Compress with TokenShrink
    let compressed = parsed.data.content_raw;
    let rosetta = "";
    let tokenCount = 0;

    try {
      // Dynamic import for server-side only
      const { compress, countTokens } = await import("tokenshrink");
      const result = compress(parsed.data.content_raw);
      compressed = result.compressed;
      rosetta = result.rosetta;
      tokenCount = countTokens(compressed);
    } catch {
      // Fallback: use raw content
      tokenCount = Math.ceil(parsed.data.content_raw.split(/\s+/).length * 1.3);
    }

    const { error } = await supabase.from("submissions").insert({
      user_id: user.id,
      title: parsed.data.title,
      domain_id: parsed.data.domain_id,
      subdomain_id: parsed.data.subdomain_id,
      content_raw: parsed.data.content_raw,
      content_compressed: compressed,
      rosetta,
      token_count: tokenCount,
      difficulty: parsed.data.difficulty,
      status: "pending",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
