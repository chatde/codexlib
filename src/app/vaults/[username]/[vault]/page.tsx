import { notFound } from "next/navigation";
import { BookMarked, User, FileText } from "lucide-react";
import { getVaultByUserAndSlug, getVaultNotes, getVaultFolders } from "@/lib/actions/vaults";
import { NoteCard } from "@/components/note-card";
import { formatNumber } from "@/lib/utils";
import { VaultDetailClient } from "./vault-detail-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; vault: string }>;
}) {
  const { username, vault: vaultSlug } = await params;
  const vault = await getVaultByUserAndSlug(decodeURIComponent(username), vaultSlug);
  if (!vault) return { title: "Vault Not Found — CodexLib" };
  return { title: `${vault.name} — CodexLib` };
}

export default async function VaultPage({
  params,
}: {
  params: Promise<{ username: string; vault: string }>;
}) {
  const { username, vault: vaultSlug } = await params;
  const vault = await getVaultByUserAndSlug(decodeURIComponent(username), vaultSlug);

  if (!vault) notFound();

  const [notes, folders] = await Promise.all([
    getVaultNotes(vault.id),
    getVaultFolders(vault.id),
  ]);

  const basePath = `/vaults/${encodeURIComponent(username)}/${vault.slug}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted mb-2">
          <a href="/vaults" className="hover:text-gold">Vaults</a>
          <span>/</span>
          <span>{decodeURIComponent(username)}</span>
        </div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BookMarked className="h-8 w-8 text-gold" />
          {vault.name}
        </h1>
        {vault.description && (
          <p className="mt-2 text-muted">{vault.description}</p>
        )}
        <div className="mt-3 flex items-center gap-4 text-sm text-muted">
          <span className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {vault.owner?.display_name ?? "anonymous"}
          </span>
          <span className="flex items-center gap-1">
            <FileText className="h-4 w-4 text-gold" />
            {formatNumber(vault.note_count)} notes
          </span>
        </div>
      </div>

      <VaultDetailClient
        notes={notes}
        folders={folders}
        basePath={basePath}
      />
    </div>
  );
}
