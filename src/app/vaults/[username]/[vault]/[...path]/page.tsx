import { notFound } from "next/navigation";
import { ArrowLeft, Download, Tag, Zap, Clock } from "lucide-react";
import Link from "next/link";
import { getVaultByUserAndSlug, getVaultNote } from "@/lib/actions/vaults";
import { MarkdownViewer } from "@/components/markdown-viewer";
import { formatNumber } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; vault: string; path: string[] }>;
}) {
  const { username, vault: vaultSlug, path } = await params;
  const vault = await getVaultByUserAndSlug(decodeURIComponent(username), vaultSlug);
  if (!vault) return { title: "Note Not Found — CodexLib" };

  const noteSlug = path[path.length - 1];
  const note = await getVaultNote(vault.id, noteSlug);
  if (!note) return { title: "Note Not Found — CodexLib" };

  return { title: `${note.title} — ${vault.name} — CodexLib` };
}

export default async function NotePage({
  params,
}: {
  params: Promise<{ username: string; vault: string; path: string[] }>;
}) {
  const { username, vault: vaultSlug, path } = await params;
  const vault = await getVaultByUserAndSlug(decodeURIComponent(username), vaultSlug);
  if (!vault) notFound();

  const noteSlug = path[path.length - 1];
  const note = await getVaultNote(vault.id, noteSlug);
  if (!note) notFound();

  const vaultPath = `/vaults/${encodeURIComponent(username)}/${vault.slug}`;
  const content = note.content_compressed ?? note.content_raw;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href={vaultPath}
          className="flex items-center gap-1 text-sm text-muted hover:text-gold"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {vault.name}
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{note.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted">
          {note.token_count != null && (
            <span className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-gold" />
              {formatNumber(note.token_count)} tokens
            </span>
          )}
          <span className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            {formatNumber(note.downloads)} downloads
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {new Date(note.updated_at).toLocaleDateString()}
          </span>
        </div>
        {note.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full bg-surface px-2.5 py-0.5 text-xs text-muted"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Rosetta header if compressed */}
      {note.rosetta && (
        <div className="mb-6 rounded-lg border border-gold/20 bg-gold/5 p-4">
          <p className="text-xs font-medium text-gold mb-2">Rosetta Decoder</p>
          <pre className="text-xs text-muted overflow-x-auto whitespace-pre-wrap">
            {note.rosetta}
          </pre>
        </div>
      )}

      {/* Content */}
      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8">
        <MarkdownViewer content={content} />
      </div>

      {/* Backlinks */}
      {note.backlinks.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-medium text-muted mb-3">Backlinks</h3>
          <div className="flex flex-wrap gap-2">
            {note.backlinks.map((link) => (
              <span
                key={link}
                className="rounded-full bg-surface px-3 py-1 text-xs text-gold border border-gold/20"
              >
                {link}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
