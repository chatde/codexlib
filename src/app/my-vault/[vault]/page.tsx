import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { BookMarked, Upload, FileText, Trash2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUserVaultBySlug, getUserVaultNotes, deleteNote } from "@/lib/actions/vaults";
import { formatNumber } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ vault: string }>;
}) {
  const { vault: vaultSlug } = await params;
  const vault = await getUserVaultBySlug(vaultSlug);
  if (!vault) return { title: "Vault Not Found — CodexLib" };
  return { title: `${vault.name} — My Vault — CodexLib` };
}

export default async function VaultManagePage({
  params,
}: {
  params: Promise<{ vault: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { vault: vaultSlug } = await params;
  const vault = await getUserVaultBySlug(vaultSlug);

  if (!vault) notFound();

  const notes = await getUserVaultNotes(vault.id);

  async function handleDelete(formData: FormData) {
    "use server";
    const noteId = formData.get("note_id") as string;
    await deleteNote(noteId);
    redirect(`/my-vault/${vaultSlug}`);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/my-vault"
          className="flex items-center gap-1 text-sm text-muted hover:text-gold"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Vaults
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookMarked className="h-8 w-8 text-gold" />
            {vault.name}
          </h1>
          {vault.description && (
            <p className="mt-2 text-muted">{vault.description}</p>
          )}
          <div className="mt-2 flex items-center gap-3 text-sm text-muted">
            <span className="flex items-center gap-1">
              <FileText className="h-4 w-4 text-gold" />
              {formatNumber(vault.note_count)} notes
            </span>
            <span className="flex items-center gap-1">
              {vault.is_public ? (
                <>
                  <Eye className="h-4 w-4 text-green-400" />
                  <span className="text-green-400">Public</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4 text-orange-400" />
                  <span className="text-orange-400">Private</span>
                </>
              )}
            </span>
          </div>
        </div>
        <Link
          href={`/my-vault/${vault.slug}/upload`}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-2.5 text-sm font-medium text-background hover:bg-gold-light"
        >
          <Upload className="h-4 w-4" />
          Upload Notes
        </Link>
      </div>

      {/* Notes list */}
      {notes.length > 0 ? (
        <div className="space-y-2">
          {notes.map((note) => (
            <div
              key={note.id}
              className="flex items-center justify-between rounded-lg border border-border bg-surface p-4 hover:bg-surface-hover"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-gold/60" />
                  <span className="font-medium truncate">{note.title}</span>
                  {!note.is_public && (
                    <EyeOff className="h-3 w-3 text-orange-400 shrink-0" />
                  )}
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                  <span>{note.folder_path}</span>
                  {note.token_count != null && (
                    <span>{formatNumber(note.token_count)} tokens</span>
                  )}
                  <span>{formatNumber(note.downloads)} downloads</span>
                </div>
              </div>
              <form action={handleDelete}>
                <input type="hidden" name="note_id" value={note.id} />
                <button
                  type="submit"
                  className="p-2 rounded-lg text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  title="Delete note"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </form>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted">
          <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>No notes in this vault yet.</p>
          <Link
            href={`/my-vault/${vault.slug}/upload`}
            className="text-gold hover:text-gold-light text-sm"
          >
            Upload your first note
          </Link>
        </div>
      )}
    </div>
  );
}
