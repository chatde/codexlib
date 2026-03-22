"use client";

import { useState } from "react";
import { Upload, BookOpen, Globe, Loader2 } from "lucide-react";

export default function UploadBookPage() {
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<"upload" | "gutenberg">("upload");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleFileUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/v1/books/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: `Book "${data.title}" submitted for summarization!` });
      } else {
        setMessage({ type: "error", text: data.error || "Upload failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setUploading(false);
    }
  }

  async function handleGutenberg(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const gutenbergId = formData.get("gutenberg_id") as string;

    try {
      const res = await fetch("/api/v1/books/ingest-public-domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gutenberg_id: parseInt(gutenbergId, 10) }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: `"${data.title}" queued for summarization!` });
      } else {
        setMessage({ type: "error", text: data.error || "Import failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">
        Upload <span className="text-gold">Book</span>
      </h1>
      <p className="text-muted mb-8">
        Submit a book for AI summarization. We&apos;ll condense it from hundreds of
        pages into a ~10-page AI-digestible summary.
      </p>

      {/* Mode tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode("upload")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === "upload"
              ? "bg-gold text-background"
              : "bg-surface text-muted hover:text-foreground"
          }`}
        >
          <Upload className="h-4 w-4" />
          Upload PDF
        </button>
        <button
          onClick={() => setMode("gutenberg")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === "gutenberg"
              ? "bg-gold text-background"
              : "bg-surface text-muted hover:text-foreground"
          }`}
        >
          <Globe className="h-4 w-4" />
          Project Gutenberg
        </button>
      </div>

      {message && (
        <div
          className={`mb-6 rounded-lg p-4 text-sm ${
            message.type === "success"
              ? "bg-green-400/10 text-green-400"
              : "bg-red-400/10 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {mode === "upload" ? (
        <form onSubmit={handleFileUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">PDF File</label>
            <input
              type="file"
              name="file"
              accept=".pdf"
              required
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm file:mr-4 file:rounded file:border-0 file:bg-gold/10 file:px-3 file:py-1 file:text-sm file:text-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Title (optional)</label>
            <input
              type="text"
              name="title"
              placeholder="Auto-detected from PDF metadata"
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm placeholder:text-muted focus:border-gold focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Author (optional)</label>
            <input
              type="text"
              name="author"
              placeholder="Auto-detected from PDF metadata"
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm placeholder:text-muted focus:border-gold focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-4 py-3 font-medium text-background hover:bg-gold-light disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? "Processing..." : "Upload & Summarize"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleGutenberg} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Gutenberg Book ID
            </label>
            <input
              type="number"
              name="gutenberg_id"
              placeholder="e.g., 1342 for Pride and Prejudice"
              required
              min={1}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm placeholder:text-muted focus:border-gold focus:outline-none"
            />
            <p className="mt-1 text-xs text-muted">
              Find books at{" "}
              <a
                href="https://www.gutenberg.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:underline"
              >
                gutenberg.org
              </a>
              . The ID is in the URL (e.g., /ebooks/1342).
            </p>
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-4 py-3 font-medium text-background hover:bg-gold-light disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BookOpen className="h-4 w-4" />
            )}
            {uploading ? "Importing..." : "Import & Summarize"}
          </button>
        </form>
      )}
    </div>
  );
}
