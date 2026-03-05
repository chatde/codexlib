import { redirect } from "next/navigation";
import Link from "next/link";
import { BookMarked, Plus, FileText, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUserVaults, createVault } from "@/lib/actions/vaults";
import { formatNumber } from "@/lib/utils";

export const metadata = {
  title: "My Vault — CodexLib",
};

export default async function MyVaultPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const vaults = await getUserVaults();

  async function handleCreate(formData: FormData) {
    "use server";
    const result = await createVault(formData);
    if ("slug" in result) {
      redirect(`/my-vault/${result.slug}`);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BookMarked className="h-8 w-8 text-gold" />
          My Vaults
        </h1>
        <p className="mt-2 text-muted">
          Manage your Obsidian vaults and shared notes
        </p>
      </div>

      {/* Create vault */}
      <div className="mb-8 rounded-xl border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-gold" />
          Create New Vault
        </h2>
        <form action={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Vault Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              maxLength={100}
              placeholder="My Research Notes"
              className="w-full max-w-md rounded-lg border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted focus:border-gold/50 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <input
              type="text"
              id="description"
              name="description"
              maxLength={300}
              placeholder="A collection of notes on..."
              className="w-full max-w-md rounded-lg border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted focus:border-gold/50 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_public"
              name="is_public"
              defaultChecked
              value="true"
              className="rounded border-border"
            />
            <label htmlFor="is_public" className="text-sm">
              Public vault (visible to community)
            </label>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-gold px-6 py-2.5 text-sm font-medium text-background hover:bg-gold-light"
          >
            Create Vault
          </button>
        </form>
      </div>

      {/* Existing vaults */}
      {vaults.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vaults.map((vault) => (
            <Link
              key={vault.id}
              href={`/my-vault/${vault.slug}`}
              className="group block rounded-xl border border-border bg-surface p-5 transition-all hover:border-gold/30 hover:bg-surface-hover"
            >
              <h3 className="font-semibold group-hover:text-gold transition-colors">
                {vault.name}
              </h3>
              {vault.description && (
                <p className="mt-1 text-sm text-muted line-clamp-2">
                  {vault.description}
                </p>
              )}
              <div className="mt-3 flex items-center gap-3 text-xs text-muted">
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3 text-gold" />
                  {formatNumber(vault.note_count)} notes
                </span>
                <span className={vault.is_public ? "text-green-400" : "text-orange-400"}>
                  {vault.is_public ? "Public" : "Private"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted">
          <BookMarked className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>You haven&apos;t created any vaults yet.</p>
          <p className="text-sm mt-1">Create one above to start sharing your notes!</p>
        </div>
      )}
    </div>
  );
}
