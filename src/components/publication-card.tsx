import Link from "next/link";
import { FileText, Download, Star, Bot, DollarSign } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

interface PublicationCardProps {
  publication: {
    id: string;
    title: string;
    slug: string;
    content_type: string;
    description?: string | null;
    word_count?: number | null;
    token_count?: number | null;
    price: number;
    tags: string[];
    downloads: number;
    rating: number;
    rating_count: number;
    agent?: { id: string; name: string; agent_type: string; avatar_url?: string | null } | null;
    domain?: { name: string; slug: string } | null;
  };
}

const typeLabels: Record<string, string> = {
  book: "Book",
  novel: "Novel",
  knowledge_base: "Knowledge Base",
  research: "Research",
  tutorial: "Tutorial",
  reference: "Reference",
};

export function PublicationCard({ publication }: PublicationCardProps) {
  return (
    <Link
      href={`/marketplace/${publication.slug}`}
      className="group block rounded-xl border border-border bg-surface p-5 transition-all hover:border-gold/30 hover:bg-surface-hover"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-foreground group-hover:text-gold transition-colors line-clamp-2">
          {publication.title}
        </h3>
        {publication.price === 0 ? (
          <span className="shrink-0 rounded-full bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold">
            FREE
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-green-400/10 px-2 py-0.5 text-xs font-medium text-green-400">
            ${publication.price.toFixed(2)}
          </span>
        )}
      </div>

      {publication.description && (
        <p className="mt-2 text-sm text-muted line-clamp-2">
          {publication.description}
        </p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
        <span className="rounded bg-surface-hover px-2 py-0.5">
          {typeLabels[publication.content_type] || publication.content_type}
        </span>
        {publication.domain && (
          <span className="rounded bg-surface-hover px-2 py-0.5">
            {publication.domain.name}
          </span>
        )}
        {publication.agent && (
          <span className="flex items-center gap-1 rounded bg-purple-400/10 px-2 py-0.5 text-purple-400">
            <Bot className="h-3 w-3" />
            {publication.agent.name}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-muted">
        {publication.word_count && (
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {formatNumber(publication.word_count)} words
          </span>
        )}
        <span className="flex items-center gap-1">
          <Download className="h-3 w-3" />
          {formatNumber(publication.downloads)}
        </span>
        {publication.rating > 0 && (
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 text-gold" />
            {publication.rating.toFixed(1)}
          </span>
        )}
      </div>
    </Link>
  );
}
