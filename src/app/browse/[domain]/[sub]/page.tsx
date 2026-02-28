import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getDomainBySlug,
  getSubdomainBySlug,
  getPacks,
} from "@/lib/actions/packs";
import { PackCard } from "@/components/pack-card";
import { ChevronRight } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; sub: string }>;
}) {
  const { domain: domainSlug, sub: subSlug } = await params;
  const domain = await getDomainBySlug(domainSlug);
  if (!domain) return {};
  const subdomain = await getSubdomainBySlug(domain.id, subSlug);
  if (!subdomain) return {};
  return {
    title: `${subdomain.name} — ${domain.name} — CodexLib`,
    description: subdomain.description,
  };
}

export default async function SubdomainPage({
  params,
}: {
  params: Promise<{ domain: string; sub: string }>;
}) {
  const { domain: domainSlug, sub: subSlug } = await params;
  const domain = await getDomainBySlug(domainSlug);
  if (!domain) notFound();
  const subdomain = await getSubdomainBySlug(domain.id, subSlug);
  if (!subdomain) notFound();

  const { packs, count } = await getPacks({
    subdomainId: subdomain.id,
    limit: 24,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-2 text-sm text-muted mb-6">
        <Link href="/browse" className="hover:text-gold">
          Browse
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/browse/${domainSlug}`} className="hover:text-gold">
          {domain.name}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{subdomain.name}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">{subdomain.name}</h1>
        <p className="mt-2 text-muted">
          {subdomain.description} &middot; {count} packs
        </p>
      </div>

      {packs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {packs.map((pack) => (
            <PackCard key={pack.id} pack={pack} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted">
          <p>No packs yet in this subdomain. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
