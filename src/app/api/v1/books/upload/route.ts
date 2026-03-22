import { NextResponse, type NextRequest } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { ingestPdf } from "@/lib/summarization/ingest";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Check user auth
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.name.endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    // Max 50MB
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 50MB)" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await ingestPdf(buffer);

    const titleOverride = formData.get("title") as string | null;
    const authorOverride = formData.get("author") as string | null;

    const supabase = await createServiceClient();

    const { data: book, error } = await supabase
      .from("books")
      .insert({
        title: titleOverride || result.title,
        author: authorOverride || result.author,
        page_count: result.pageCount,
        source_type: "pdf",
        raw_text: result.text,
        word_count: result.wordCount,
        uploaded_by: user.id,
        status: "pending",
        copyright_status: "user_uploaded",
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
      page_count: result.pageCount,
      status: "pending",
      message: "Book queued for summarization",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
