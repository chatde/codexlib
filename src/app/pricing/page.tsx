import { Check, X } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Pricing — CodexLib",
  description: "Free, Pro, and Team plans for AI knowledge packs",
};

const features = [
  { name: "Browse & search packs", free: true, pro: true, team: true },
  { name: "Download packs", free: "5/mo", pro: "Unlimited", team: "Unlimited" },
  { name: "Full pack content", free: false, pro: true, team: true },
  { name: "REST API access", free: false, pro: "1,000/day", team: "10,000/day" },
  { name: "Bulk download", free: false, pro: true, team: true },
  { name: "Obsidian vault export", free: false, pro: true, team: true },
  { name: "Submit your own packs", free: true, pro: true, team: true },
  { name: "Priority support", free: false, pro: false, team: true },
];

type FeatureValue = boolean | string;

function FeatureIcon({ value, accent }: { value: FeatureValue; accent: string }) {
  if (value === true) return <Check className={`h-4 w-4 ${accent} shrink-0`} />;
  if (value === false) return <X className="h-4 w-4 text-muted shrink-0" />;
  return <Check className={`h-4 w-4 ${accent} shrink-0`} />;
}

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold">
          Simple <span className="text-gold">Pricing</span>
        </h1>
        <p className="mt-3 text-lg text-muted">
          Start free. Upgrade when you need more.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* Free */}
        <div className="rounded-xl border border-border bg-surface p-8">
          <h2 className="text-xl font-bold">Free</h2>
          <p className="mt-1 text-sm text-muted">Perfect for exploring</p>
          <p className="mt-4">
            <span className="text-4xl font-bold">$0</span>
            <span className="text-muted">/mo</span>
          </p>
          <Link
            href="/signup"
            className="mt-6 block w-full rounded-lg border border-border py-2.5 text-center text-sm font-medium hover:bg-surface-hover"
          >
            Get Started
          </Link>
          <ul className="mt-6 space-y-3">
            {features.map((f) => (
              <li key={f.name} className="flex items-center gap-3 text-sm">
                <FeatureIcon value={f.free} accent="text-green-400" />
                <span className={f.free ? "" : "text-muted"}>
                  {f.name}
                  {typeof f.free === "string" && (
                    <span className="text-muted"> ({f.free})</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pro */}
        <div className="rounded-xl border-2 border-gold bg-surface p-8 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-4 py-1 text-xs font-bold text-background">
            MOST POPULAR
          </div>
          <h2 className="text-xl font-bold">Pro</h2>
          <p className="mt-1 text-sm text-muted">Full access for individuals</p>
          <p className="mt-4">
            <span className="text-4xl font-bold text-gold">$12</span>
            <span className="text-muted">/mo</span>
          </p>
          <Link
            href="/signup"
            className="mt-6 block w-full rounded-lg bg-gold py-2.5 text-center text-sm font-medium text-background hover:bg-gold-light"
          >
            Start Pro
          </Link>
          <ul className="mt-6 space-y-3">
            {features.map((f) => (
              <li key={f.name} className="flex items-center gap-3 text-sm">
                <FeatureIcon value={f.pro} accent="text-gold" />
                <span className={f.pro ? "" : "text-muted"}>
                  {f.name}
                  {typeof f.pro === "string" && (
                    <span className="text-gold"> ({f.pro})</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Team */}
        <div className="rounded-xl border border-border bg-surface p-8">
          <h2 className="text-xl font-bold">Team</h2>
          <p className="mt-1 text-sm text-muted">For teams & power users</p>
          <p className="mt-4">
            <span className="text-4xl font-bold">$29</span>
            <span className="text-muted">/mo</span>
          </p>
          <Link
            href="/signup"
            className="mt-6 block w-full rounded-lg border border-gold py-2.5 text-center text-sm font-medium text-gold hover:bg-gold/10"
          >
            Start Team
          </Link>
          <ul className="mt-6 space-y-3">
            {features.map((f) => (
              <li key={f.name} className="flex items-center gap-3 text-sm">
                <FeatureIcon value={f.team} accent="text-green-400" />
                <span>
                  {f.name}
                  {typeof f.team === "string" && (
                    <span className="text-green-400"> ({f.team})</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Creator callout */}
      <div className="mt-16 max-w-2xl mx-auto text-center">
        <h3 className="text-lg font-semibold mb-2">Are you a domain expert?</h3>
        <p className="text-sm text-muted mb-4">
          Become a verified creator and earn 30% revenue share on every download of your knowledge packs.
        </p>
        <Link
          href="/submit"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-2.5 text-sm font-medium hover:bg-surface"
        >
          Apply to Create
        </Link>
      </div>
    </div>
  );
}
