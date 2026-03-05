import Link from "next/link";
import { BookMarked, FileText, User } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import type { Vault } from "@/lib/types";

export function VaultCard({ vault }: { vault: Vault }) {
  const username = vault.owner?.display_name ?? "anonymous";

  return (
    <Link
      href={`/vaults/${encodeURIComponent(username)}/${vault.slug}`}
      className="group block rounded-xl border border-border bg-surface p-5 transition-all hover:border-gold/30 hover:bg-surface-hover"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-foreground group-hover:text-gold transition-colors line-clamp-2">
          {vault.name}
        </h3>
        <BookMarked className="h-5 w-5 shrink-0 text-gold/60" />
      </div>

      {vault.description && (
        <p className="mt-2 text-sm text-muted line-clamp-2">{vault.description}</p>
      )}

      <div className="mt-4 flex items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1">
          <User className="h-3 w-3" />
          {username}
        </span>
        <span className="flex items-center gap-1">
          <FileText className="h-3 w-3 text-gold" />
          {formatNumber(vault.note_count)} notes
        </span>
      </div>
    </Link>
  );
}
