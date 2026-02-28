import Link from "next/link";
import { formatNumber } from "@/lib/utils";
import type { Domain } from "@/lib/types";

export function DomainCard({ domain }: { domain: Domain }) {
  return (
    <Link
      href={`/browse/${domain.slug}`}
      className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-surface p-6 text-center transition-all hover:border-gold/30 hover:bg-surface-hover"
    >
      <span className="text-3xl">{domain.icon}</span>
      <h3 className="font-semibold group-hover:text-gold transition-colors">
        {domain.name}
      </h3>
      <p className="text-xs text-muted line-clamp-2">{domain.description}</p>
      <span className="text-xs text-gold">
        {formatNumber(domain.pack_count)} packs
      </span>
    </Link>
  );
}
