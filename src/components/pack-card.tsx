import Link from "next/link";
import { BookOpen, Download, Star, Zap } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import type { Pack } from "@/lib/types";

const difficultyColors: Record<string, string> = {
  beginner: "text-green-400 bg-green-400/10",
  intermediate: "text-blue-400 bg-blue-400/10",
  advanced: "text-orange-400 bg-orange-400/10",
  expert: "text-red-400 bg-red-400/10",
};

export function PackCard({ pack }: { pack: Pack }) {
  return (
    <Link
      href={`/pack/${pack.slug}`}
      className="group block rounded-xl border border-border bg-surface p-5 transition-all hover:border-gold/30 hover:bg-surface-hover"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-foreground group-hover:text-gold transition-colors line-clamp-2">
          {pack.title}
        </h3>
        {pack.is_free && (
          <span className="shrink-0 rounded-full bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold">
            FREE
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
        {pack.domain && (
          <span className="rounded bg-surface-hover px-2 py-0.5">
            {pack.domain.name}
          </span>
        )}
        <span
          className={cn(
            "rounded px-2 py-0.5",
            difficultyColors[pack.difficulty]
          )}
        >
          {pack.difficulty}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1">
          <Zap className="h-3 w-3 text-gold" />
          {formatNumber(pack.token_count)} tokens
        </span>
        <span className="flex items-center gap-1">
          <BookOpen className="h-3 w-3" />
          {pack.savings_pct.toFixed(1)}% saved
        </span>
        <span className="flex items-center gap-1">
          <Download className="h-3 w-3" />
          {formatNumber(pack.downloads)}
        </span>
        {pack.rating > 0 && (
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 text-gold" />
            {pack.rating.toFixed(1)}
          </span>
        )}
      </div>
    </Link>
  );
}
