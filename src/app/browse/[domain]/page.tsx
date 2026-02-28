import { notFound } from "next/navigation";
import Link from "next/link";
import { getDomainBySlug, getSubdomains, getPacks } from "@/lib/actions/packs";
import { PackCard } from "@/components/pack-card";
import { ChevronRight } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain: domainSlug } = await params;
  const domain = await getDomainBySlug(domainSlug);
  if (!domain) return {};
  return {
    title: `${domain.name} Knowledge Packs — CodexLib`,
    description: domain.description,
  };
}

export default async function DomainPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain: domainSlug } = await params;
  const domain = await getDomainBySlug(domainSlug);
  if (!domain) notFound();

  const [subdomains, { packs }] = await Promise.all([
    getSubdomains(domain.id),
    getPacks({ domainId: domain.id, limit: 12 }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-2 text-sm text-muted mb-6">
        <Link href="/browse" className="hover:text-gold">
          Browse
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{domain.name}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="text-3xl">{domain.icon}</span>
          {domain.name}
        </h1>
        <p className="mt-2 text-muted">{domain.description}</p>
      </div>

      {subdomains.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-4">Subdomains</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {subdomains.map((sub) => (
              <Link
                key={sub.id}
                href={`/browse/${domainSlug}/${sub.slug}`}
                className="rounded-lg border border-border bg-surface p-4 text-center hover:border-gold/30 hover:bg-surface-hover transition-all"
              >
                <h3 className="text-sm font-medium">{sub.name}</h3>
                <p className="mt-1 text-xs text-muted">
                  {sub.pack_count} packs
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {packs.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Latest Packs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {packs.map((pack) => (
              <PackCard key={pack.id} pack={pack} />
            ))}
          </div>
        </div>
      )}

      {packs.length === 0 && subdomains.length === 0 && (
        <div className="text-center py-20 text-muted">
          <p>No packs yet in this domain. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
