import Link from "next/link";
import { FileText, Tag, Zap, Download } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import type { VaultNote } from "@/lib/types";

export function NoteCard({
  note,
  basePath,
}: {
  note: VaultNote;
  basePath: string;
}) {
  const notePath = note.folder_path === "/"
    ? note.slug
    : `${note.folder_path.replace(/^\//, "")}/${note.slug}`;

  return (
    <Link
      href={`${basePath}/${notePath}`}
      className="group block rounded-xl border border-border bg-surface p-4 transition-all hover:border-gold/30 hover:bg-surface-hover"
    >
      <div className="flex items-start gap-3">
        <FileText className="h-5 w-5 shrink-0 text-gold/60 mt-0.5" />
        <div className="min-w-0">
          <h3 className="font-medium text-foreground group-hover:text-gold transition-colors line-clamp-1">
            {note.title}
          </h3>
          {note.folder_path !== "/" && (
            <p className="text-xs text-muted mt-0.5">{note.folder_path}</p>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
        {note.token_count != null && (
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-gold" />
            {formatNumber(note.token_count)} tokens
          </span>
        )}
        <span className="flex items-center gap-1">
          <Download className="h-3 w-3" />
          {formatNumber(note.downloads)}
        </span>
        {note.tags.length > 0 && (
          <span className="flex items-center gap-1">
            <Tag className="h-3 w-3" />
            {note.tags.slice(0, 3).join(", ")}
          </span>
        )}
      </div>
    </Link>
  );
}
