import { Check, X } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Pricing — CodexLib",
  description: "Free and Pro plans for AI knowledge packs",
};

const features = [
  { name: "Browse & search packs", free: true, pro: true },
  { name: "Preview (20% of content)", free: true, pro: true },
  { name: "Download packs", free: "3 total", pro: "Unlimited" },
  { name: "Full pack content", free: false, pro: true },
  { name: "REST API access", free: "10/day", pro: "1,000/day" },
  { name: "Bulk download (zip)", free: false, pro: true },
  { name: "Submit your own packs", free: true, pro: true },
  { name: "Priority support", free: false, pro: true },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold">
          Simple <span className="text-gold">Pricing</span>
        </h1>
        <p className="mt-3 text-lg text-muted">
          Start free. Upgrade when you need more.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
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
                {f.free ? (
                  <Check className="h-4 w-4 text-green-400 shrink-0" />
                ) : (
                  <X className="h-4 w-4 text-muted shrink-0" />
                )}
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
            RECOMMENDED
          </div>
          <h2 className="text-xl font-bold">Pro</h2>
          <p className="mt-1 text-sm text-muted">Full access to everything</p>
          <p className="mt-4">
            <span className="text-4xl font-bold text-gold">$15</span>
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
                <Check className="h-4 w-4 text-gold shrink-0" />
                <span>
                  {f.name}
                  {typeof f.pro === "string" && (
                    <span className="text-gold"> ({f.pro})</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
