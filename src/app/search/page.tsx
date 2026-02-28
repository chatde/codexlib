"use client";

import { useState, useEffect, useCallback } from "react";
import { Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PackCard } from "@/components/pack-card";
import type { Pack } from "@/lib/types";

const difficulties = ["beginner", "intermediate", "advanced", "expert"];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [freeOnly, setFreeOnly] = useState(false);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const search = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    let q = supabase
      .from("packs")
      .select("*, domain:domains(*), subdomain:subdomains(*)")
      .eq("status", "approved")
      .order("downloads", { ascending: false })
      .limit(24);

    if (query.trim()) q = q.ilike("title", `%${query.trim()}%`);
    if (difficulty) q = q.eq("difficulty", difficulty);
    if (freeOnly) q = q.eq("is_free", true);

    const { data } = await q;
    setPacks((data as Pack[]) ?? []);
    setLoading(false);
  }, [query, difficulty, freeOnly]);

  useEffect(() => {
    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">
        <span className="text-gold">Search</span> Knowledge Packs
      </h1>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, topic, or keyword..."
            className="w-full rounded-lg border border-border bg-surface pl-10 pr-4 py-3 text-sm focus:border-gold focus:outline-none"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="rounded-lg border border-border bg-surface px-4 py-3 hover:bg-surface-hover"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-4 mb-6 p-4 rounded-lg border border-border bg-surface">
          <div>
            <label className="block text-xs text-muted mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">All</option>
              {difficulties.map((d) => (
                <option key={d} value={d}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={freeOnly}
                onChange={(e) => setFreeOnly(e.target.checked)}
                className="rounded"
              />
              Free only
            </label>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-muted">Searching...</div>
      ) : packs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {packs.map((pack) => (
            <PackCard key={pack.id} pack={pack} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted">
          {query ? "No packs found. Try a different search." : "Start typing to search knowledge packs."}
        </div>
      )}
    </div>
  );
}
