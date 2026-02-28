"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ReviewItem {
  id: string;
  title: string;
  domain_id: string;
  subdomain_id: string | null;
  status: string;
  difficulty: string;
  token_count: number | null;
  content_compressed: string | null;
  content_raw: string;
  rosetta: string | null;
  created_at: string;
  domain: { name: string } | null;
  user_id: string;
}

export default function AdminReviewPage() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [selected, setSelected] = useState<ReviewItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    const supabase = createClient();
    const { data } = await supabase
      .from("submissions")
      .select("*, domain:domains(name)")
      .in("status", ["pending", "draft"])
      .order("created_at", { ascending: true });

    setItems((data as ReviewItem[]) ?? []);
    setLoading(false);
  }

  async function approve(item: ReviewItem) {
    const supabase = createClient();

    // Create as approved pack
    const slug =
      item.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      Date.now().toString(36);

    const { error: packError } = await supabase.from("packs").insert({
      slug,
      title: item.title,
      domain_id: item.domain_id,
      subdomain_id: item.subdomain_id,
      content_compressed: item.content_compressed ?? item.content_raw,
      rosetta: item.rosetta ?? "",
      token_count: item.token_count ?? 0,
      uncompressed_estimate: Math.ceil(item.content_raw.split(/\s+/).length * 1.3),
      savings_pct: item.token_count
        ? ((1 - item.token_count / Math.ceil(item.content_raw.split(/\s+/).length * 1.3)) * 100)
        : 0,
      difficulty: item.difficulty,
      author_id: item.user_id,
      status: "approved",
      is_free: false,
    });

    if (!packError) {
      await supabase
        .from("submissions")
        .update({ status: "approved" })
        .eq("id", item.id);
      setItems(items.filter((i) => i.id !== item.id));
      setSelected(null);
    }
  }

  async function reject(item: ReviewItem, reason: string) {
    const supabase = createClient();
    await supabase
      .from("submissions")
      .update({
        status: "rejected",
        flagged_reasons: [reason],
        reviewer_notes: reason,
      })
      .eq("id", item.id);
    setItems(items.filter((i) => i.id !== item.id));
    setSelected(null);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-center text-muted">
        Loading review queue...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold mb-8">
        Review <span className="text-gold">Queue</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <p className="text-sm text-muted">{items.length} items pending</p>
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelected(item)}
              className={`w-full text-left rounded-xl border p-4 transition-all ${
                selected?.id === item.id
                  ? "border-gold bg-surface-hover"
                  : "border-border bg-surface hover:border-gold/30"
              }`}
            >
              <h3 className="font-semibold text-sm">{item.title}</h3>
              <p className="text-xs text-muted mt-1">
                {item.domain?.name} &middot; {item.difficulty} &middot;{" "}
                {item.token_count ?? "?"} tokens
              </p>
            </button>
          ))}
          {items.length === 0 && (
            <p className="text-center py-10 text-muted">Queue is empty!</p>
          )}
        </div>

        {selected && (
          <div className="rounded-xl border border-border bg-surface p-6">
            <h2 className="text-lg font-bold mb-4">{selected.title}</h2>

            {selected.rosetta && (
              <div className="rosetta-header mb-4">
                <p className="text-xs font-medium text-gold mb-2">Rosetta Decoder</p>
                <pre className="text-xs whitespace-pre-wrap">{selected.rosetta}</pre>
              </div>
            )}

            <div className="rounded-lg bg-background p-4 mb-4 max-h-64 overflow-y-auto">
              <pre className="pack-content text-xs">
                {selected.content_compressed ?? selected.content_raw}
              </pre>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => approve(selected)}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4" />
                Approve & Publish
              </button>
              <button
                onClick={() => {
                  const reason = prompt("Rejection reason:");
                  if (reason) reject(selected, reason);
                }}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
