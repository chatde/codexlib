import { createClient } from "@/lib/supabase/server";
import { BookCard } from "@/components/book-card";
import Link from "next/link";
import { Upload } from "lucide-react";

export const metadata = {
  title: "Book Summaries — CodexLib",
  description:
    "AI-digestible book summaries. 300+ pages condensed to 10. Built for machines, useful for humans.",
};

export default async function BooksPage() {
  const supabase = await createClient();

  const { data: books } = await supabase
    .from("books")
    .select("*, summaries(id, summary_type, quality_score)")
    .eq("status", "summarized")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Book <span className="text-gold">Summaries</span>
          </h1>
          <p className="mt-2 text-muted">
            300+ pages distilled to ~10. AI-optimized digests for instant
            knowledge acquisition.
          </p>
        </div>
        <Link
          href="/books/upload"
          className="hidden sm:flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-medium text-background hover:bg-gold-light"
        >
          <Upload className="h-4 w-4" />
          Upload Book
        </Link>
      </div>

      {books && books.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface p-12 text-center">
          <p className="text-lg text-muted">
            No book summaries yet. Public domain books are being processed.
          </p>
          <Link
            href="/books/upload"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-medium text-background hover:bg-gold-light"
          >
            <Upload className="h-4 w-4" />
            Upload the first book
          </Link>
        </div>
      )}
    </div>
  );
}
