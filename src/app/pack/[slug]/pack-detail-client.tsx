"use client";

import { useState, useEffect } from "react";
import {
  Download,
  BookmarkPlus,
  BookmarkCheck,
  Star,
  Zap,
  ChevronDown,
  ChevronUp,
  Lock,
} from "lucide-react";
import { cn, formatNumber, truncateContent } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { Pack } from "@/lib/types";
import type { User } from "@supabase/supabase-js";

const difficultyColors: Record<string, string> = {
  beginner: "text-green-400",
  intermediate: "text-blue-400",
  advanced: "text-orange-400",
  expert: "text-red-400",
};

export function PackDetailClient({ pack }: { pack: Pack }) {
  const [user, setUser] = useState<User | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [inLibrary, setInLibrary] = useState(false);
  const [rosettaOpen, setRosettaOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        supabase
          .from("subscriptions")
          .select("plan")
          .eq("user_id", data.user.id)
          .single()
          .then(({ data: sub }) => setIsPro(sub?.plan === "pro" || sub?.plan === "team"));

        supabase
          .from("user_library")
          .select("id")
          .eq("user_id", data.user.id)
          .eq("pack_id", pack.id)
          .single()
          .then(({ data: lib }) => setInLibrary(!!lib));
      }
    });
  }, [pack.id]);

  const canViewFull = pack.is_free || isPro;
  const displayContent = canViewFull
    ? pack.content_compressed
    : truncateContent(pack.content_compressed, 20);

  async function toggleLibrary() {
    if (!user) return;
    const supabase = createClient();
    if (inLibrary) {
      await supabase
        .from("user_library")
        .delete()
        .eq("user_id", user.id)
        .eq("pack_id", pack.id);
      setInLibrary(false);
    } else {
      await supabase.from("user_library").insert({
        user_id: user.id,
        pack_id: pack.id,
      });
      setInLibrary(true);
    }
  }

  async function handleDownload() {
    if (!user) return;
    setDownloading(true);

    try {
      const supabase = createClient();

      if (!isPro && !pack.is_free) {
        // Count downloads this calendar month
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const { count } = await supabase
          .from("user_downloads")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("downloaded_at", monthStart);

        if ((count ?? 0) >= 5) {
          alert(
            "Free tier limit reached (5 downloads/month). Upgrade to Pro for unlimited access."
          );
          setDownloading(false);
          return;
        }
      }

      await supabase.from("user_downloads").insert({
        user_id: user.id,
        pack_id: pack.id,
      });

      const packJson: Record<string, unknown> = {
        id: pack.slug,
        title: pack.title,
        domain: pack.domain?.name,
        subdomain: pack.subdomain?.name,
        version: pack.version,
        compression: pack.compression,
        token_count: pack.token_count,
        uncompressed_estimate: pack.uncompressed_estimate,
        savings_pct: pack.savings_pct,
        rosetta: pack.rosetta,
        content: pack.content_compressed,
        difficulty: pack.difficulty,
      };

      const blob = new Blob([JSON.stringify(packJson, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${pack.slug}.codexlib`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main content */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold">{pack.title}</h1>
            {pack.is_free && (
              <span className="shrink-0 rounded-full bg-gold/10 px-3 py-1 text-sm font-medium text-gold">
                FREE
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
            <span className={cn(difficultyColors[pack.difficulty])}>
              {pack.difficulty}
            </span>
            <span>v{pack.version}</span>
            <span>{pack.compression}</span>
          </div>
        </div>

        {/* Rosetta decoder */}
        {pack.rosetta && (
          <div className="rosetta-header">
            <button
              onClick={() => setRosettaOpen(!rosettaOpen)}
              className="flex items-center gap-2 w-full text-left text-sm font-medium text-gold"
            >
              {rosettaOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              Rosetta Decoder Ring
            </button>
            {rosettaOpen && (
              <pre className="mt-3 text-xs text-foreground/80 whitespace-pre-wrap">
                {pack.rosetta}
              </pre>
            )}
          </div>
        )}

        {/* Content */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <pre className="pack-content">{displayContent}</pre>
          {!canViewFull && (
            <div className="mt-4 rounded-lg bg-gold/5 border border-gold/20 p-4 text-center">
              <Lock className="mx-auto h-5 w-5 text-gold mb-2" />
              <p className="text-sm text-muted">
                Showing 20% preview.{" "}
                <a href="/pricing" className="text-gold hover:text-gold-light">
                  Upgrade to Pro
                </a>{" "}
                for full access.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg bg-background p-3">
              <Zap className="mx-auto h-5 w-5 text-gold mb-1" />
              <p className="text-lg font-bold">
                {formatNumber(pack.token_count)}
              </p>
              <p className="text-xs text-muted">tokens</p>
            </div>
            <div className="rounded-lg bg-background p-3">
              <p className="text-lg font-bold text-gold">
                {pack.savings_pct.toFixed(1)}%
              </p>
              <p className="text-xs text-muted">savings</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Downloads</span>
            <span className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              {formatNumber(pack.downloads)}
            </span>
          </div>

          {pack.rating > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Rating</span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 text-gold" />
                {pack.rating.toFixed(1)} ({pack.rating_count})
              </span>
            </div>
          )}

          {user ? (
            <div className="space-y-2">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full rounded-lg bg-gold py-2.5 text-sm font-medium text-background hover:bg-gold-light disabled:opacity-50"
              >
                {downloading ? "Downloading..." : "Download .codexlib"}
              </button>
              <button
                onClick={toggleLibrary}
                className="w-full rounded-lg border border-border py-2.5 text-sm hover:bg-surface-hover flex items-center justify-center gap-2"
              >
                {inLibrary ? (
                  <>
                    <BookmarkCheck className="h-4 w-4 text-gold" />
                    In Library
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="h-4 w-4" />
                    Add to Library
                  </>
                )}
              </button>
            </div>
          ) : (
            <a
              href="/login"
              className="block w-full rounded-lg bg-gold py-2.5 text-sm font-medium text-background text-center hover:bg-gold-light"
            >
              Sign in to Download
            </a>
          )}
        </div>

        {pack.author && (
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs text-muted mb-1">Author</p>
            <p className="text-sm font-medium">
              {pack.author.display_name ?? "Anonymous"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
