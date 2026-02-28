import { getDomains } from "@/lib/actions/packs";
import { DomainCard } from "@/components/domain-card";

export const metadata = {
  title: "Browse Domains — CodexLib",
  description: "Explore 50+ knowledge domains with AI-optimized packs",
};

export default async function BrowsePage() {
  const domains = await getDomains();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Browse <span className="text-gold">Domains</span>
        </h1>
        <p className="mt-2 text-muted">
          Explore {domains.length} knowledge domains across every discipline
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {domains.map((domain) => (
          <DomainCard key={domain.id} domain={domain} />
        ))}
      </div>
    </div>
  );
}
