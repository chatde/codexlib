import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServiceClient();

    // Check API key
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

      // Reset daily counter if needed
      const resetAt = new Date(profile.api_requests_reset_at);
      const now = new Date();
      if (now.toDateString() !== resetAt.toDateString()) {
        await supabase
          .from("profiles")
          .update({ api_requests_today: 0, api_requests_reset_at: now.toISOString() })
          .eq("id", profile.id);
        profile.api_requests_today = 0;
      }

      // Check subscription
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("plan")
        .eq("user_id", profile.id)
        .single();

      isPro = sub?.plan === "pro";
      const limit = isPro ? 1000 : 10;

      if (profile.api_requests_today >= limit) {
        return NextResponse.json(
          { error: "Rate limit exceeded" },
          { status: 429 }
        );
      }

      await supabase
        .from("profiles")
        .update({ api_requests_today: profile.api_requests_today + 1 })
        .eq("id", profile.id);
    }

    const { searchParams } = request.nextUrl;
    const domain = searchParams.get("domain");
    const search = searchParams.get("search");
    const difficulty = searchParams.get("difficulty");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);
    const offset = (page - 1) * limit;

    let query = supabase
      .from("packs")
      .select("id, slug, title, version, compression, token_count, uncompressed_estimate, savings_pct, difficulty, is_free, downloads, rating, created_at", { count: "exact" })
      .eq("status", "approved");

    if (domain) {
      const { data: d } = await supabase
        .from("domains")
        .select("id")
        .eq("slug", domain)
        .single();
      if (d) query = query.eq("domain_id", d.id);
    }

    if (search) query = query.ilike("title", `%${search}%`);
    if (difficulty) query = query.eq("difficulty", difficulty);

    const { data, error, count } = await query
      .order("downloads", { ascending: false })
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
