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

    // Check API key for full content
    const apiKey = request.headers.get("x-api-key");
    let isPro = false;

    if (apiKey) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, api_requests_today, api_requests_reset_at")
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

      isPro = sub?.plan === "pro";

      // Rate limit check
      const resetAt = new Date(profile.api_requests_reset_at);
      const now = new Date();
      if (now.toDateString() !== resetAt.toDateString()) {
        await supabase
          .from("profiles")
          .update({ api_requests_today: 0, api_requests_reset_at: now.toISOString() })
          .eq("id", profile.id);
        profile.api_requests_today = 0;
      }

      const limit = isPro ? 1000 : 10;
      if (profile.api_requests_today >= limit) {
        return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
      }

      await supabase
        .from("profiles")
        .update({ api_requests_today: profile.api_requests_today + 1 })
        .eq("id", profile.id);
    }

    const { data: pack, error } = await supabase
      .from("packs")
      .select("*, domain:domains(name, slug), subdomain:subdomains(name, slug)")
      .eq("status", "approved")
      .or(`id.eq.${id},slug.eq.${id}`)
      .single();

    if (error || !pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    const canViewFull = pack.is_free || isPro;

    const response: Record<string, unknown> = {
      id: pack.slug,
      title: pack.title,
      domain: (pack.domain as Record<string, unknown>)?.name,
      subdomain: (pack.subdomain as Record<string, unknown>)?.name,
      version: pack.version,
      compression: pack.compression,
      token_count: pack.token_count,
      uncompressed_estimate: pack.uncompressed_estimate,
      savings_pct: pack.savings_pct,
      difficulty: pack.difficulty,
      downloads: pack.downloads,
      rating: pack.rating,
    };

    if (canViewFull) {
      response.rosetta = pack.rosetta;
      response.content = pack.content_compressed;
    } else {
      response.preview = true;
      response.rosetta = pack.rosetta;
      const lines = (pack.content_compressed as string).split("\n");
      response.content = lines.slice(0, Math.ceil(lines.length * 0.2)).join("\n");
    }

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
