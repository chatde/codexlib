import Link from "next/link";
import {
  Library,
  Zap,
  Download,
  Globe,
  BookOpen,
  BookMarked,
  ArrowRight,
  Star,
} from "lucide-react";
import { getFeaturedPacks } from "@/lib/actions/packs";
import { getFeaturedVaults } from "@/lib/actions/vaults";
import { PackCard } from "@/components/pack-card";
import { VaultCard } from "@/components/vault-card";
import FadeIn from "@/components/interactive/fade-in";
import SplitText from "@/components/interactive/split-text";
import MagneticButton from "@/components/interactive/magnetic-button";
import TiltCard from "@/components/interactive/tilt-card";

export default async function HomePage() {
  const [featuredPacks, featuredVaults] = await Promise.all([
    getFeaturedPacks(),
    getFeaturedVaults(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent" />
        {/* Warm glow atmosphere */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full pointer-events-none animate-pulse-glow" style={{ background: 'radial-gradient(ellipse, rgba(212, 168, 67, 0.07) 0%, transparent 70%)' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(212, 168, 67, 0.04) 0%, transparent 70%)' }} />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <FadeIn delay={0}>
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full blur-2xl opacity-50" style={{ background: 'rgba(212, 168, 67, 0.2)' }} />
                  <Library className="h-16 w-16 text-gold relative" />
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={100}>
              <p className="arch-line text-xs tracking-[0.3em] uppercase font-mono mb-6" style={{ color: 'rgba(212, 168, 67, 0.7)' }}>
                AI Knowledge Repository
              </p>
            </FadeIn>
            <h1 className="font-display text-6xl sm:text-7xl font-light tracking-tight leading-[1.05]">
              <SplitText text="The Library of" className="block" delay={200} stagger={25} />
              <br />
              <span className="gold-shimmer font-bold italic">
                <SplitText text="Alexandria for AI" delay={600} stagger={30} />
              </span>
            </h1>
            <FadeIn delay={400}>
              <p className="mt-6 text-lg text-muted max-w-2xl mx-auto">
                10,000+ deep knowledge bases in compressed, AI-optimized format.
                Not human English — compressed knowledge that any AI can ingest
                instantly using TokenShrink compression.
              </p>
            </FadeIn>
            <FadeIn delay={500}>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <MagneticButton as="div" strength={0.25}>
                  <Link
                    href="/browse"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-6 py-3 text-sm font-medium text-background hover:bg-gold-light"
                  >
                    <BookOpen className="h-4 w-4" />
                    Browse Packs
                  </Link>
                </MagneticButton>
                <MagneticButton as="div" strength={0.25}>
                  <Link
                    href="/api-docs"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium hover:bg-surface"
                  >
                    API Docs
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </MagneticButton>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Stats */}
      <FadeIn delay={100}>
        <section className="border-y border-border bg-surface/50">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="border-t-2 border-gold/30 pt-4">
                <p className="text-3xl font-bold text-gold font-display">10,000+</p>
                <p className="mt-1 text-sm text-muted">Knowledge Packs</p>
              </div>
              <div className="border-t-2 border-gold/30 pt-4">
                <p className="text-3xl font-bold text-gold font-display">50+</p>
                <p className="mt-1 text-sm text-muted">Domains</p>
              </div>
              <div className="border-t-2 border-gold/30 pt-4">
                <p className="text-3xl font-bold text-gold font-display">~15%</p>
                <p className="mt-1 text-sm text-muted">Token Savings</p>
              </div>
              <div className="border-t-2 border-gold/30 pt-4">
                <p className="text-3xl font-bold text-gold font-display">$12</p>
                <p className="mt-1 text-sm text-muted">/mo Pro</p>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <FadeIn delay={0}>
          <h2 className="font-display text-4xl font-light text-center mb-12">
            How It <span className="text-gold italic">Works</span>
          </h2>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FadeIn delay={100}>
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-full border border-gold/30 bg-gold/8 flex items-center justify-center mb-5 shadow-lg shadow-gold/5">
                <Zap className="h-6 w-6 text-gold" />
              </div>
              <h3 className="font-semibold mb-2">Compressed Knowledge</h3>
              <p className="text-sm text-muted">
                Each pack is compressed with TokenShrink, saving ~15% tokens while
                preserving 100% of the information.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-full border border-gold/30 bg-gold/8 flex items-center justify-center mb-5 shadow-lg shadow-gold/5">
                <Globe className="h-6 w-6 text-gold" />
              </div>
              <h3 className="font-semibold mb-2">Self-Contained Packs</h3>
              <p className="text-sm text-muted">
                Every pack includes a Rosetta decoder header. Paste into any AI
                system prompt — it decompresses on-the-fly.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={300}>
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-full border border-gold/30 bg-gold/8 flex items-center justify-center mb-5 shadow-lg shadow-gold/5">
                <Download className="h-6 w-6 text-gold" />
              </div>
              <h3 className="font-semibold mb-2">REST API</h3>
              <p className="text-sm text-muted">
                Integrate via API. Feed packs directly into your AI workflows,
                agents, and pipelines.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Community Vaults */}
      {featuredVaults.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <FadeIn delay={0}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold">
                  Community <span className="text-gold">Vaults</span>
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Share your Obsidian vault. Browse others. Build knowledge together.
                </p>
              </div>
              <Link
                href="/vaults"
                className="text-sm text-gold hover:text-gold-light flex items-center gap-1"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredVaults.map((vault, i) => (
              <FadeIn key={vault.id} delay={100 + i * 100}>
                <TiltCard>
                  <VaultCard vault={vault} />
                </TiltCard>
              </FadeIn>
            ))}
          </div>
        </section>
      )}

      {/* Featured Packs */}
      {featuredPacks.length > 0 && (
        <FadeIn delay={0}>
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
                {featuredPacks.map((pack, i) => (
                  <FadeIn key={pack.id} delay={100 + i * 100}>
                    <TiltCard>
                      <PackCard pack={pack} />
                    </TiltCard>
                  </FadeIn>
                ))}
              </div>
            </div>
          </section>
        </FadeIn>
      )}

      {/* CTA */}
      <FadeIn delay={100}>
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-gold/20 bg-gradient-to-r from-gold/5 to-transparent p-12 text-center">
            <Star className="mx-auto h-10 w-10 text-gold mb-4" />
            <h2 className="font-display text-4xl font-light mb-3">
              Ready to supercharge <em className="italic">your AI?</em>
            </h2>
            <p className="text-muted mb-6 max-w-lg mx-auto">
              Start with 5 free packs per month. Upgrade to Pro for unlimited
              access to 10,000+ knowledge bases.
            </p>
            <MagneticButton as="div" strength={0.25}>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-lg bg-gold px-8 py-3 text-sm font-medium text-background hover:bg-gold-light"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </MagneticButton>
          </div>
        </section>
      </FadeIn>
    </div>
  );
}
