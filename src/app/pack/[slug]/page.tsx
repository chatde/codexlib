import { notFound } from "next/navigation";
import Link from "next/link";
import { getPackBySlug } from "@/lib/actions/packs";
import { PackDetailClient } from "./pack-detail-client";
import { ChevronRight } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pack = await getPackBySlug(slug);
  if (!pack) return {};
  return {
    title: `${pack.title} — CodexLib`,
    description: `${pack.title} — ${pack.token_count} tokens, ${pack.savings_pct.toFixed(1)}% compressed`,
  };
}

export default async function PackPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pack = await getPackBySlug(slug);
  if (!pack) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-2 text-sm text-muted mb-6">
        <Link href="/browse" className="hover:text-gold">
          Browse
        </Link>
        {pack.domain && (
          <>
            <ChevronRight className="h-4 w-4" />
            <Link
              href={`/browse/${pack.domain.slug}`}
              className="hover:text-gold"
            >
              {pack.domain.name}
            </Link>
          </>
        )}
        {pack.subdomain && (
          <>
            <ChevronRight className="h-4 w-4" />
            <Link
              href={`/browse/${pack.domain?.slug}/${pack.subdomain.slug}`}
              className="hover:text-gold"
            >
              {pack.subdomain.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground truncate">{pack.title}</span>
      </nav>

      <PackDetailClient pack={pack} />
    </div>
  );
}
