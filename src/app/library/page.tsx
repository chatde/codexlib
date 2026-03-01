import { createClient } from "@/lib/supabase/server";
import { PackCard } from "@/components/pack-card";
import { BookOpen, BookMarked, FileText } from "lucide-react";
import Link from "next/link";
import type { Pack } from "@/lib/types";

export const metadata = {
  title: "My Library — CodexLib",
};

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab ?? "packs";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch packs
  const { data: library } = await supabase
    .from("user_library")
    .select("*, pack:packs(*, domain:domains(*))")
    .eq("user_id", user!.id)
    .order("added_at", { ascending: false });

  const packs = (library ?? [])
    .map((item: Record<string, unknown>) => item.pack as Pack)
    .filter(Boolean);

  // Fetch user's vaults for the notes tab
  const { data: vaults } = await supabase
    .from("vaults")
    .select("id, name, slug, note_count")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-gold" />
          My Library
        </h1>
        <p className="mt-2 text-muted">
          Your saved knowledge packs and vault notes
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-border">
        <Link
          href="/library?tab=packs"
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === "packs"
              ? "border-gold text-gold"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          AI Packs
          <span className="rounded-full bg-surface px-2 py-0.5 text-xs">
            {packs.length}
          </span>
        </Link>
        <Link
          href="/library?tab=notes"
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === "notes"
              ? "border-gold text-gold"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          <BookMarked className="h-4 w-4" />
          Obsidian Notes
          <span className="rounded-full bg-surface px-2 py-0.5 text-xs">
            {(vaults ?? []).reduce((sum: number, v: Record<string, unknown>) => sum + ((v.note_count as number) ?? 0), 0)}
          </span>
        </Link>
      </div>

      {tab === "packs" ? (
        /* AI Packs tab */
        packs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {packs.map((pack) => (
              <PackCard key={pack.id} pack={pack} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted">
            <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Your library is empty.</p>
            <a href="/browse" className="text-gold hover:text-gold-light text-sm">
              Browse packs to get started
            </a>
          </div>
        )
      ) : (
        /* Obsidian Notes tab */
        (vaults ?? []).length > 0 ? (
          <div className="space-y-4">
            {(vaults ?? []).map((vault: Record<string, unknown>) => (
              <Link
                key={vault.id as string}
                href={`/my-vault/${vault.slug as string}`}
                className="flex items-center justify-between rounded-xl border border-border bg-surface p-5 hover:border-gold/30 hover:bg-surface-hover transition-all"
              >
                <div className="flex items-center gap-3">
                  <BookMarked className="h-5 w-5 text-gold" />
                  <div>
                    <h3 className="font-semibold">{vault.name as string}</h3>
                    <p className="text-xs text-muted">
                      {(vault.note_count as number) ?? 0} notes
                    </p>
                  </div>
                </div>
                <FileText className="h-5 w-5 text-muted" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted">
            <BookMarked className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No vaults yet.</p>
            <Link href="/my-vault" className="text-gold hover:text-gold-light text-sm">
              Create your first vault
            </Link>
          </div>
        )
      )}
    </div>
  );
}
