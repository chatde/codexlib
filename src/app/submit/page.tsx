"use client";

import { useState, useEffect } from "react";
import { Send, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Domain, Subdomain } from "@/lib/types";

const difficulties = ["beginner", "intermediate", "advanced", "expert"];

export default function SubmitPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [subdomains, setSubdomains] = useState<Subdomain[]>([]);
  const [domainId, setDomainId] = useState("");
  const [subdomainId, setSubdomainId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          domain_id: domainId,
          subdomain_id: subdomainId || null,
          content_raw: content,
          difficulty,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }

      setSuccess(true);
      setTitle("");
      setContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <Zap className="mx-auto h-12 w-12 text-gold mb-4" />
        <h1 className="text-2xl font-bold mb-2">Submitted!</h1>
        <p className="text-muted mb-6">
          Your knowledge pack has been compressed and submitted for review.
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/my-packs" className="text-gold hover:text-gold-light text-sm">
            View My Packs
          </a>
          <button
            onClick={() => setSuccess(false)}
            className="text-gold hover:text-gold-light text-sm"
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold mb-2">
        <span className="text-gold">Submit</span> a Knowledge Pack
      </h1>
      <p className="text-muted mb-8">
        Write or paste knowledge content. It will be automatically compressed
        with TokenShrink and validated before review.
      </p>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
            placeholder="e.g., Cardiology Fundamentals"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Domain</label>
            <select
              value={domainId}
              onChange={(e) => {
                setDomainId(e.target.value);
                setSubdomainId("");
              }}
              required
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
            <label className="block text-sm font-medium mb-1">
              Subdomain (optional)
            </label>
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
          <label className="block text-sm font-medium mb-1">
            Knowledge Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={15}
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm font-mono focus:border-gold focus:outline-none"
            placeholder="Write your knowledge content here. Use markdown formatting. This will be automatically compressed with TokenShrink..."
          />
          <p className="mt-1 text-xs text-muted">
            Minimum 200 characters. Markdown supported.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting || content.length < 200}
          className="flex items-center gap-2 rounded-lg bg-gold px-6 py-3 text-sm font-medium text-background hover:bg-gold-light disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {submitting ? "Compressing & submitting..." : "Submit Pack"}
        </button>
      </form>
    </div>
  );
}
