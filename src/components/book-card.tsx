import Link from "next/link";
import { BookOpen, FileText, Clock, CheckCircle } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import type { Book } from "@/lib/types";

const statusColors: Record<string, string> = {
  summarized: "text-green-400 bg-green-400/10",
  processing: "text-blue-400 bg-blue-400/10",
  pending: "text-orange-400 bg-orange-400/10",
  failed: "text-red-400 bg-red-400/10",
};

export function BookCard({ book }: { book: Book }) {
  return (
    <Link
      href={`/books/${book.id}`}
      className="group block rounded-xl border border-border bg-surface p-5 transition-all hover:border-gold/30 hover:bg-surface-hover"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-foreground group-hover:text-gold transition-colors line-clamp-2">
          {book.title}
        </h3>
        {book.copyright_status === "public_domain" && (
          <span className="shrink-0 rounded-full bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold">
            FREE
          </span>
        )}
      </div>

      <p className="mt-1 text-sm text-muted line-clamp-1">
        by {book.author}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
        <span
          className={cn(
            "rounded px-2 py-0.5",
            statusColors[book.status] || "text-muted bg-surface-hover"
          )}
        >
          {book.status === "summarized" ? "Ready" : book.status}
        </span>
        <span className="rounded bg-surface-hover px-2 py-0.5 capitalize">
          {book.source_type.replace("_", " ")}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-muted">
        {book.page_count && (
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {book.page_count} pages
          </span>
        )}
        {book.word_count && (
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {formatNumber(book.word_count)} words
          </span>
        )}
        {book.summaries && book.summaries.length > 0 && (
          <span className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-400" />
            {book.summaries.length} summaries
          </span>
        )}
      </div>
    </Link>
  );
}
