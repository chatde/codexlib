import { NextResponse, type NextRequest } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { ingestGutenberg } from "@/lib/summarization/ingest";
import { z } from "zod";

export const dynamic = "force-dynamic";

const IngestSchema = z.object({
  gutenberg_id: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
  try {
    // Check user auth (admin only for batch imports)
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = IngestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join(", ") },
        { status: 400 }
      );
    }

    const { gutenberg_id } = parsed.data;

    // Check if already imported
    const supabase = await createServiceClient();
    const { data: existing } = await supabase
      .from("books")
      .select("id")
      .eq("source_url", `https://www.gutenberg.org/ebooks/${gutenberg_id}`)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "This book has already been imported", id: existing.id },
        { status: 409 }
      );
    }

    // Fetch from Gutenberg
    const result = await ingestGutenberg(gutenberg_id);

    const { data: book, error } = await supabase
      .from("books")
      .insert({
        title: result.title,
        author: result.author,
        source_type: "public_domain",
        source_url: `https://www.gutenberg.org/ebooks/${gutenberg_id}`,
        raw_text: result.text,
        word_count: result.wordCount,
        uploaded_by: user.id,
        status: "pending",
        copyright_status: "public_domain",
      })
      .select("id, title")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      id: book.id,
      title: book.title,
      word_count: result.wordCount,
      source: "gutenberg",
      gutenberg_id,
      status: "pending",
      message: "Public domain book queued for summarization",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
