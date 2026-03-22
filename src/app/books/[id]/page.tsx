import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { BookOpen, FileText, CheckCircle, Download, Clock } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { MarkdownViewer } from "@/components/markdown-viewer";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: book } = await supabase
    .from("books")
    .select("title, author")
    .eq("id", id)
    .single();

  return {
    title: book ? `${book.title} — CodexLib` : "Book Summary — CodexLib",
    description: book
      ? `AI-generated summary of "${book.title}" by ${book.author}`
      : "AI-optimized book summary",
  };
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: book } = await supabase
    .from("books")
    .select("*, summaries(*)")
    .eq("id", id)
    .single();

  if (!book) return notFound();

  const executiveSummary = book.summaries?.find(
    (s: { summary_type: string }) => s.summary_type === "executive" || s.summary_type === "ai_digest"
  );

  const summaryContent = executiveSummary?.content as {
    executive_summary?: string;
    chapters?: { title: string; summary: string; key_points: string[] }[];
    key_concepts?: string[];
    takeaways?: string[];
  } | null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted mb-2">
          <span className="rounded bg-gold/10 px-2 py-0.5 text-gold capitalize">
            {book.source_type.replace("_", " ")}
          </span>
          {book.status === "summarized" && (
            <span className="flex items-center gap-1 text-green-400">
              <CheckCircle className="h-3 w-3" /> Summarized
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold">{book.title}</h1>
        <p className="mt-1 text-lg text-muted">by {book.author}</p>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted">
          {book.page_count && (
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" /> {book.page_count} pages
            </span>
          )}
          {book.word_count && (
            <span className="flex items-center gap-1">
              <FileText className="h-4 w-4" /> {formatNumber(book.word_count)} words
            </span>
          )}
          {executiveSummary?.token_count && (
            <span className="flex items-center gap-1">
              <Download className="h-4 w-4" /> Summary: {formatNumber(executiveSummary.token_count)} tokens
            </span>
          )}
          {executiveSummary?.compression_ratio && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> {(executiveSummary.compression_ratio * 100).toFixed(1)}% of original
            </span>
          )}
        </div>
      </div>

      {/* Executive Summary */}
      {summaryContent?.executive_summary && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">
            Executive <span className="text-gold">Summary</span>
          </h2>
          <div className="rounded-xl border border-border bg-surface p-6">
            <MarkdownViewer content={summaryContent.executive_summary} />
          </div>
        </section>
      )}

      {/* Key Concepts */}
      {summaryContent?.key_concepts && summaryContent.key_concepts.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">
            Key <span className="text-gold">Concepts</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {summaryContent.key_concepts.map((concept, i) => (
              <span
                key={i}
                className="rounded-full border border-border bg-surface px-3 py-1 text-sm"
              >
                {concept}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Chapter Summaries */}
      {summaryContent?.chapters && summaryContent.chapters.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">
            Chapter <span className="text-gold">Summaries</span>
          </h2>
          <div className="space-y-4">
            {summaryContent.chapters.map((chapter, i) => (
              <details
                key={i}
                className="rounded-xl border border-border bg-surface"
              >
                <summary className="cursor-pointer px-6 py-4 font-medium hover:text-gold">
                  {chapter.title}
                </summary>
                <div className="border-t border-border px-6 py-4">
                  <MarkdownViewer content={chapter.summary} />
                  {chapter.key_points && chapter.key_points.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gold mb-2">Key Points</p>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-muted">
                        {chapter.key_points.map((point, j) => (
                          <li key={j}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Takeaways */}
      {summaryContent?.takeaways && summaryContent.takeaways.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">
            Key <span className="text-gold">Takeaways</span>
          </h2>
          <div className="rounded-xl border border-border bg-surface p-6">
            <ol className="list-decimal pl-5 space-y-2">
              {summaryContent.takeaways.map((takeaway, i) => (
                <li key={i} className="text-foreground">
                  {takeaway}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}
    </div>
  );
}
