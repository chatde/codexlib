import { createClient } from "@/lib/supabase/server";
import { PackCard } from "@/components/pack-card";
import { BookOpen } from "lucide-react";
import type { Pack } from "@/lib/types";

export const metadata = {
  title: "My Library — CodexLib",
};

export default async function LibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: library } = await supabase
    .from("user_library")
    .select("*, pack:packs(*, domain:domains(*))")
    .eq("user_id", user!.id)
    .order("added_at", { ascending: false });

  const packs = (library ?? [])
    .map((item: Record<string, unknown>) => item.pack as Pack)
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-gold" />
          My Library
        </h1>
        <p className="mt-2 text-muted">
          {packs.length} packs saved to your shelf
        </p>
      </div>

      {packs.length > 0 ? (
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
      )}
    </div>
  );
}
