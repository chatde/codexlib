import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Bot, FileText, Download, Star, DollarSign } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { MarkdownViewer } from "@/components/markdown-viewer";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("publications")
    .select("title, description")
    .eq("slug", slug)
    .single();

  return {
    title: data ? `${data.title} — CodexLib Marketplace` : "Publication — CodexLib",
    description: data?.description || "AI-authored content on CodexLib",
  };
}

export default async function PublicationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: pub } = await supabase
    .from("publications")
    .select(
      "*, agent:agents(id, name, agent_type, avatar_url, verified), domain:domains(name, slug), owner:profiles(display_name)"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!pub) return notFound();

  const content = pub.content as {
    chapters?: { title: string; content: string; order: number }[];
  } | null;

  const typeLabels: Record<string, string> = {
    book: "Book",
    novel: "Novel",
    knowledge_base: "Knowledge Base",
    research: "Research",
    tutorial: "Tutorial",
    reference: "Reference",
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted mb-2">
          <span className="rounded bg-gold/10 px-2 py-0.5 text-gold">
            {typeLabels[pub.content_type] || pub.content_type}
          </span>
          {pub.domain && (
            <span className="rounded bg-surface-hover px-2 py-0.5">
              {(pub.domain as { name: string }).name}
            </span>
          )}
          {pub.tags?.map((tag: string) => (
            <span key={tag} className="rounded bg-surface-hover px-2 py-0.5">
              {tag}
            </span>
          ))}
        </div>

        <h1 className="text-3xl font-bold">{pub.title}</h1>

        {pub.description && (
          <p className="mt-2 text-lg text-muted">{pub.description}</p>
        )}

        {/* Agent author */}
        {pub.agent && (
          <Link
            href={`/agents/${(pub.agent as { id: string }).id}`}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-sm hover:bg-surface-hover"
          >
            <Bot className="h-4 w-4 text-purple-400" />
            <span>by {(pub.agent as { name: string }).name}</span>
            {(pub.agent as { verified: boolean }).verified && (
              <span className="text-gold text-xs">Verified</span>
            )}
          </Link>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted">
          {pub.word_count && (
            <span className="flex items-center gap-1">
              <FileText className="h-4 w-4" /> {formatNumber(pub.word_count)} words
            </span>
          )}
          <span className="flex items-center gap-1">
            <Download className="h-4 w-4" /> {formatNumber(pub.downloads)} downloads
          </span>
          {pub.rating > 0 && (
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 text-gold" /> {pub.rating.toFixed(1)} ({pub.rating_count})
            </span>
          )}
        </div>

        {/* Price / CTA */}
        <div className="mt-6">
          {pub.price === 0 ? (
            <button className="rounded-lg bg-gold px-6 py-3 font-medium text-background hover:bg-gold-light">
              Download Free
            </button>
          ) : (
            <button className="flex items-center gap-2 rounded-lg bg-gold px-6 py-3 font-medium text-background hover:bg-gold-light">
              <DollarSign className="h-4 w-4" />
              Purchase — ${pub.price.toFixed(2)}
            </button>
          )}
        </div>
      </div>

      {/* Content preview */}
      {content?.chapters && content.chapters.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">
            Table of <span className="text-gold">Contents</span>
          </h2>
          <div className="space-y-4">
            {content.chapters
              .sort((a, b) => a.order - b.order)
              .map((chapter, i) => (
                <details
                  key={i}
                  className="rounded-xl border border-border bg-surface"
                  open={i === 0}
                >
                  <summary className="cursor-pointer px-6 py-4 font-medium hover:text-gold">
                    {chapter.title}
                  </summary>
                  <div className="border-t border-border px-6 py-4">
                    <MarkdownViewer content={chapter.content} />
                  </div>
                </details>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
