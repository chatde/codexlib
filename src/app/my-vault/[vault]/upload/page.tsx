"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Upload, FileText, ArrowLeft, CheckCircle, AlertCircle, X } from "lucide-react";

interface UploadResult {
  name: string;
  status: "success" | "error";
  message?: string;
}

export default function UploadPage() {
  const params = useParams<{ vault: string }>();
  const router = useRouter();
  const [mode, setMode] = useState<"files" | "paste">("files");
  const [title, setTitle] = useState("");
  const [folderPath, setFolderPath] = useState("/");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter(
      (f) => f.name.endsWith(".md") || f.name.endsWith(".txt")
    );
    setFiles((prev) => [...prev, ...dropped]);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files).filter(
      (f) => f.name.endsWith(".md") || f.name.endsWith(".txt")
    );
    setFiles((prev) => [...prev, ...selected]);
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    setUploading(true);
    setResults([]);
    const newResults: UploadResult[] = [];

    for (const file of files) {
      try {
        const text = await file.text();
        const res = await fetch("/api/upload-notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vault_slug: params.vault,
            notes: [
              {
                title: file.name.replace(/\.(md|txt)$/, ""),
                folder_path: folderPath,
                content_raw: text,
                tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
              },
            ],
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          newResults.push({ name: file.name, status: "error", message: data.error });
        } else {
          newResults.push({ name: file.name, status: "success" });
        }
      } catch (err) {
        newResults.push({
          name: file.name,
          status: "error",
          message: err instanceof Error ? err.message : "Upload failed",
        });
      }
    }

    setResults(newResults);
    setUploading(false);

    if (newResults.every((r) => r.status === "success")) {
      router.push(`/my-vault/${params.vault}`);
    }
  };

  const uploadPaste = async () => {
    if (!title.trim() || !content.trim()) return;
    setUploading(true);
    setResults([]);

    try {
      const res = await fetch("/api/upload-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vault_slug: params.vault,
          notes: [
            {
              title: title.trim(),
              folder_path: folderPath,
              content_raw: content,
              tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
            },
          ],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setResults([{ name: title, status: "error", message: data.error }]);
      } else {
        router.push(`/my-vault/${params.vault}`);
      }
    } catch (err) {
      setResults([{
        name: title,
        status: "error",
        message: err instanceof Error ? err.message : "Upload failed",
      }]);
    }

    setUploading(false);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href={`/my-vault/${params.vault}`}
          className="flex items-center gap-1 text-sm text-muted hover:text-gold"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to vault
        </Link>
      </div>

      <h1 className="text-3xl font-bold flex items-center gap-3 mb-8">
        <Upload className="h-8 w-8 text-gold" />
        Upload Notes
      </h1>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode("files")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === "files"
              ? "bg-gold text-background"
              : "bg-surface hover:bg-surface-hover"
          }`}
        >
          Upload Files
        </button>
        <button
          onClick={() => setMode("paste")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === "paste"
              ? "bg-gold text-background"
              : "bg-surface hover:bg-surface-hover"
          }`}
        >
          Paste Content
        </button>
      </div>

      {/* Shared fields */}
      <div className="space-y-4 mb-6">
        <div>
          <label htmlFor="folder" className="block text-sm font-medium mb-1">
            Folder Path
          </label>
          <input
            type="text"
            id="folder"
            value={folderPath}
            onChange={(e) => setFolderPath(e.target.value)}
            placeholder="/"
            className="w-full max-w-xs rounded-lg border border-border bg-surface px-4 py-2.5 text-sm placeholder:text-muted focus:border-gold/50 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="tags" className="block text-sm font-medium mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="obsidian, research, notes"
            className="w-full max-w-md rounded-lg border border-border bg-surface px-4 py-2.5 text-sm placeholder:text-muted focus:border-gold/50 focus:outline-none"
          />
        </div>
      </div>

      {mode === "files" ? (
        <>
          {/* Drop zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="rounded-xl border-2 border-dashed border-border bg-surface p-12 text-center hover:border-gold/30 transition-colors"
          >
            <Upload className="mx-auto h-10 w-10 text-muted mb-3" />
            <p className="text-sm text-muted mb-2">
              Drag &amp; drop .md or .txt files here
            </p>
            <label className="inline-flex items-center gap-2 cursor-pointer rounded-lg bg-surface-hover px-4 py-2 text-sm hover:bg-border transition-colors">
              <FileText className="h-4 w-4" />
              Browse files
              <input
                type="file"
                multiple
                accept=".md,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file, i) => (
                <div
                  key={`${file.name}-${i}`}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-2"
                >
                  <span className="text-sm truncate">{file.name}</span>
                  <button
                    onClick={() => removeFile(i)}
                    className="p-1 text-muted hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={uploadFiles}
                disabled={uploading}
                className="mt-4 rounded-lg bg-gold px-6 py-2.5 text-sm font-medium text-background hover:bg-gold-light disabled:opacity-50"
              >
                {uploading ? "Uploading..." : `Upload ${files.length} file${files.length === 1 ? "" : "s"}`}
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Paste mode */}
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Note Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Research Note"
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm placeholder:text-muted focus:border-gold/50 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium mb-1">
                Content (Markdown)
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={15}
                placeholder="# My Note&#10;&#10;Write or paste your markdown content here..."
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm font-mono placeholder:text-muted focus:border-gold/50 focus:outline-none resize-y"
              />
            </div>
            <button
              onClick={uploadPaste}
              disabled={uploading || !title.trim() || !content.trim()}
              className="rounded-lg bg-gold px-6 py-2.5 text-sm font-medium text-background hover:bg-gold-light disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload Note"}
            </button>
          </div>
        </>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-6 space-y-2">
          {results.map((r, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm ${
                r.status === "success"
                  ? "bg-green-400/10 text-green-400"
                  : "bg-red-400/10 text-red-400"
              }`}
            >
              {r.status === "success" ? (
                <CheckCircle className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span className="truncate">{r.name}</span>
              {r.message && <span className="text-xs opacity-75">— {r.message}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
