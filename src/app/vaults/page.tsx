import { BookMarked, Search } from "lucide-react";
import { getPublicVaults } from "@/lib/actions/vaults";
import { VaultCard } from "@/components/vault-card";

export const metadata = {
  title: "Community Vaults — CodexLib",
  description: "Browse Obsidian vaults shared by the community",
};

export default async function VaultsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.search ?? "";
  const page = parseInt(params.page ?? "1");
  const limit = 24;
  const offset = (page - 1) * limit;

  const { vaults, count } = await getPublicVaults({ limit, offset, search });
  const totalPages = Math.ceil(count / limit);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BookMarked className="h-8 w-8 text-gold" />
          Community Vaults
        </h1>
        <p className="mt-2 text-muted">
          Browse Obsidian vaults shared by the community
        </p>
      </div>

      {/* Search */}
      <form className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search vaults..."
            className="w-full rounded-lg border border-border bg-surface pl-10 pr-4 py-2.5 text-sm placeholder:text-muted focus:border-gold/50 focus:outline-none"
          />
        </div>
      </form>

      {vaults.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vaults.map((vault) => (
              <VaultCard key={vault.id} vault={vault} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`/vaults?page=${p}${search ? `&search=${search}` : ""}`}
                  className={`rounded-lg px-3 py-1.5 text-sm ${
                    p === page
                      ? "bg-gold text-background"
                      : "bg-surface hover:bg-surface-hover"
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 text-muted">
          <BookMarked className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>No vaults found.</p>
          <p className="text-sm mt-1">Be the first to share your Obsidian vault!</p>
        </div>
      )}
    </div>
  );
}
