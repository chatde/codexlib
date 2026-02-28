import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { z } from "zod";

export const dynamic = "force-dynamic";

const noteSchema = z.object({
  title: z.string().min(1).max(300),
  folder_path: z.string().default("/"),
  content_raw: z.string().min(1),
  tags: z.array(z.string()).default([]),
});

const uploadSchema = z.object({
  vault_slug: z.string().min(1),
  notes: z.array(noteSchema).min(1).max(50),
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
    const parsed = uploadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // Find vault
    const { data: vault } = await supabase
      .from("vaults")
      .select("id")
      .eq("user_id", user.id)
      .eq("slug", parsed.data.vault_slug)
      .single();

    if (!vault) {
      return NextResponse.json({ error: "Vault not found" }, { status: 404 });
    }

    // Process each note
    const results: { title: string; status: string }[] = [];

    for (const note of parsed.data.notes) {
      let compressed = note.content_raw;
      let rosetta = "";
      let tokenCount = 0;

      try {
        const { compress, countTokens } = await import("tokenshrink");
        const result = compress(note.content_raw);
        compressed = result.compressed;
        rosetta = result.rosetta;
        tokenCount = countTokens(compressed);
      } catch {
        tokenCount = Math.ceil(note.content_raw.split(/\s+/).length * 1.3);
      }

      // Extract backlinks from [[wikilink]] syntax
      const backlinkRegex = /\[\[([^\]|]+?)(?:\|[^\]]+?)?\]\]/g;
      const backlinks: string[] = [];
      let match;
      while ((match = backlinkRegex.exec(note.content_raw)) !== null) {
        backlinks.push(match[1]);
      }

      const slug = slugify(note.title);
      const folderPath = note.folder_path.startsWith("/")
        ? note.folder_path
        : `/${note.folder_path}`;

      const { error } = await supabase.from("vault_notes").upsert(
        {
          vault_id: vault.id,
          user_id: user.id,
          title: note.title,
          slug,
          folder_path: folderPath,
          content_raw: note.content_raw,
          content_compressed: compressed,
          rosetta: rosetta || null,
          token_count: tokenCount,
          tags: note.tags,
          backlinks,
          is_public: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "vault_id,slug" }
      );

      if (error) {
        results.push({ title: note.title, status: `error: ${error.message}` });
      } else {
        results.push({ title: note.title, status: "success" });
      }
    }

    const hasErrors = results.some((r) => r.status.startsWith("error"));

    return NextResponse.json(
      { results },
      { status: hasErrors ? 207 : 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
