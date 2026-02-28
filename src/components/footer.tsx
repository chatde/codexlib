import Link from "next/link";
import { Library } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Library className="h-5 w-5 text-gold" />
            <span className="font-bold">
              <span className="text-gold">Codex</span>Lib
            </span>
          </div>
          <div className="flex gap-6 text-sm text-muted">
            <Link href="/browse" className="hover:text-gold">
              Browse
            </Link>
            <Link href="/pricing" className="hover:text-gold">
              Pricing
            </Link>
            <Link href="/api-docs" className="hover:text-gold">
              API Docs
            </Link>
          </div>
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} CodexLib. Built by{" "}
            <a
              href="https://ghb.ventures"
              className="text-gold hover:text-gold-light"
              target="_blank"
              rel="noopener noreferrer"
            >
              GHB Ventures
            </a>
            <span className="mx-1.5 text-border">&middot;</span>
            <a
              href="https://chatde.dev"
              className="text-muted hover:text-gold"
              target="_blank"
              rel="noopener noreferrer"
            >
              chatde.dev
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
