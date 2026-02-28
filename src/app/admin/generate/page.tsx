"use client";

import { useState, useEffect } from "react";
import { Zap, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Domain, Subdomain } from "@/lib/types";

const difficulties = ["beginner", "intermediate", "advanced", "expert"];

export default function AdminGeneratePage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [subdomains, setSubdomains] = useState<Subdomain[]>([]);
  const [domainId, setDomainId] = useState("");
  const [subdomainId, setSubdomainId] = useState("");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [compressed, setCompressed] = useState("");
  const [rosetta, setRosetta] = useState("");
  const [tokenCount, setTokenCount] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("domains")
      .select("*")
      .order("name")
      .then(({ data }) => setDomains((data as Domain[]) ?? []));
  }, []);

  useEffect(() => {
    if (!domainId) {
      setSubdomains([]);
      return;
    }
    const supabase = createClient();
    supabase
      .from("subdomains")
      .select("*")
      .eq("domain_id", domainId)
      .order("name")
      .then(({ data }) => setSubdomains((data as Subdomain[]) ?? []));
  }, [domainId]);

  async function compressContent() {
    if (!content.trim()) return;
    setGenerating(true);
    try {
      const { compress, countTokens } = await import("tokenshrink");
      const result = compress(content);
      setCompressed(result.compressed);
      setRosetta(result.rosetta);
      setTokenCount(countTokens(result.compressed));
    } catch {
      setCompressed(content);
      setTokenCount(Math.ceil(content.split(/\s+/).length * 1.3));
    }
    setGenerating(false);
  }

  async function savePack() {
    if (!title || !domainId || !compressed) return;
    setSaving(true);
    setMessage("");

    const supabase = createClient();
    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      Date.now().toString(36);

    const uncompressedEstimate = Math.ceil(content.split(/\s+/).length * 1.3);
    const savingsPct = uncompressedEstimate > 0
      ? ((1 - tokenCount / uncompressedEstimate) * 100)
      : 0;

    const { error } = await supabase.from("packs").insert({
      slug,
      title,
      domain_id: domainId,
      subdomain_id: subdomainId || null,
      content_compressed: compressed,
      rosetta,
      token_count: tokenCount,
      uncompressed_estimate: uncompressedEstimate,
      savings_pct: Math.max(0, savingsPct),
      difficulty,
      status: "draft",
      is_free: false,
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage(`Saved as draft: "${title}"`);
      setTitle("");
      setContent("");
      setCompressed("");
      setRosetta("");
      setTokenCount(0);
    }
    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold mb-8">
        <span className="text-gold">Generate</span> Knowledge Packs
      </h1>

      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Domain</label>
            <select
              value={domainId}
              onChange={(e) => {
                setDomainId(e.target.value);
                setSubdomainId("");
              }}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm"
            >
              <option value="">Select domain</option>
              {domains.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subdomain</label>
            <select
              value={subdomainId}
              onChange={(e) => setSubdomainId(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm"
              disabled={!domainId}
            >
              <option value="">None</option>
              {subdomains.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm"
            >
              {difficulties.map((d) => (
                <option key={d} value={d}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
            placeholder="e.g., Quantum Computing Fundamentals"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Raw Content (paste Claude output here)
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm font-mono focus:border-gold focus:outline-none"
            placeholder="Paste comprehensive knowledge content..."
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={compressContent}
            disabled={generating || !content.trim()}
            className="flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-medium text-background hover:bg-gold-light disabled:opacity-50"
          >
            <Zap className="h-4 w-4" />
            {generating ? "Compressing..." : "Compress with TokenShrink"}
          </button>

          {compressed && (
            <button
              onClick={savePack}
              disabled={saving || !title}
              className="flex items-center gap-2 rounded-lg border border-gold px-4 py-2.5 text-sm font-medium text-gold hover:bg-gold/10 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {saving ? "Saving..." : "Save as Draft"}
            </button>
          )}
        </div>

        {message && (
          <p className="text-sm text-gold">{message}</p>
        )}

        {compressed && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted">
                Tokens: <span className="text-gold font-medium">{tokenCount}</span>
              </span>
            </div>

            {rosetta && (
              <div className="rosetta-header">
                <p className="text-xs font-medium text-gold mb-2">Rosetta Decoder</p>
                <pre className="text-xs whitespace-pre-wrap">{rosetta}</pre>
              </div>
            )}

            <div className="rounded-lg border border-border bg-background p-4 max-h-64 overflow-y-auto">
              <pre className="pack-content text-xs">{compressed}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
