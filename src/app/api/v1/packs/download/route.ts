import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServiceClient();

    const apiKey = request.headers.get("x-api-key");
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key required" },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("api_key", apiKey)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("plan")
      .eq("user_id", profile.id)
      .single();

    if (sub?.plan !== "pro" && sub?.plan !== "team") {
      return NextResponse.json(
        { error: "Pro or Team subscription required for bulk download" },
        { status: 403 }
      );
    }

    const { searchParams } = request.nextUrl;
    const domain = searchParams.get("domain");

    let query = supabase
      .from("packs")
      .select("slug, title, version, compression, token_count, uncompressed_estimate, savings_pct, rosetta, content_compressed, difficulty")
      .eq("status", "approved")
      .limit(100);

    if (domain) {
      const { data: d } = await supabase
        .from("domains")
        .select("id")
        .eq("slug", domain)
        .single();
      if (d) query = query.eq("domain_id", d.id);
    }

    const { data: packs, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return as JSON array (clients can handle archiving)
    const packData = (packs ?? []).map((p) => ({
      id: p.slug,
      title: p.title,
      version: p.version,
      compression: p.compression,
      token_count: p.token_count,
      uncompressed_estimate: p.uncompressed_estimate,
      savings_pct: p.savings_pct,
      rosetta: p.rosetta,
      content: p.content_compressed,
      difficulty: p.difficulty,
    }));

    return NextResponse.json({ data: packData, count: packData.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
