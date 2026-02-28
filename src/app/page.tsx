import Link from "next/link";
import {
  Library,
  Zap,
  Download,
  Globe,
  BookOpen,
  ArrowRight,
  Star,
} from "lucide-react";
import { getFeaturedPacks } from "@/lib/actions/packs";
import { PackCard } from "@/components/pack-card";

export default async function HomePage() {
  const featuredPacks = await getFeaturedPacks();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent" />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex justify-center mb-6">
              <Library className="h-16 w-16 text-gold" />
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
              The Library of
              <br />
              <span className="gold-shimmer">Alexandria for AI</span>
            </h1>
            <p className="mt-6 text-lg text-muted max-w-2xl mx-auto">
              10,000+ deep knowledge bases in compressed, AI-optimized format.
              Not human English — compressed knowledge that any AI can ingest
              instantly using TokenShrink compression.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/browse"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-6 py-3 text-sm font-medium text-background hover:bg-gold-light"
              >
                <BookOpen className="h-4 w-4" />
                Browse Packs
              </Link>
              <Link
                href="/api-docs"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium hover:bg-surface"
              >
                API Docs
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-surface/50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-gold">10,000+</p>
              <p className="mt-1 text-sm text-muted">Knowledge Packs</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gold">50+</p>
              <p className="mt-1 text-sm text-muted">Domains</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gold">~15%</p>
              <p className="mt-1 text-sm text-muted">Token Savings</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gold">$15</p>
              <p className="mt-1 text-sm text-muted">/mo Unlimited</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">
          How It <span className="text-gold">Works</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-gold" />
            </div>
            <h3 className="font-semibold mb-2">Compressed Knowledge</h3>
            <p className="text-sm text-muted">
              Each pack is compressed with TokenShrink, saving ~15% tokens while
              preserving 100% of the information.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-4">
              <Globe className="h-6 w-6 text-gold" />
            </div>
            <h3 className="font-semibold mb-2">Self-Contained Packs</h3>
            <p className="text-sm text-muted">
              Every pack includes a Rosetta decoder header. Paste into any AI
              system prompt — it decompresses on-the-fly.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-4">
              <Download className="h-6 w-6 text-gold" />
            </div>
            <h3 className="font-semibold mb-2">REST API</h3>
            <p className="text-sm text-muted">
              Integrate via API. Feed packs directly into your AI workflows,
              agents, and pipelines.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Packs */}
      {featuredPacks.length > 0 && (
        <section className="bg-surface/50 border-y border-border">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">
                Featured <span className="text-gold">Packs</span>
              </h2>
              <Link
                href="/browse"
                className="text-sm text-gold hover:text-gold-light flex items-center gap-1"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredPacks.map((pack) => (
                <PackCard key={pack.id} pack={pack} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gold/20 bg-gradient-to-r from-gold/5 to-transparent p-12 text-center">
          <Star className="mx-auto h-10 w-10 text-gold mb-4" />
          <h2 className="text-3xl font-bold mb-3">
            Ready to supercharge your AI?
          </h2>
          <p className="text-muted mb-6 max-w-lg mx-auto">
            Start with 3 free packs. Upgrade to Pro for unlimited access to
            10,000+ knowledge bases.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-8 py-3 text-sm font-medium text-background hover:bg-gold-light"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
