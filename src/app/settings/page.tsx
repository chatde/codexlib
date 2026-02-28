"use client";

import { useState, useEffect } from "react";
import { Settings, Key, CreditCard, Copy, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/actions/auth";
import type { Profile, Subscription } from "@/lib/types";

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const [{ data: p }, { data: s }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("subscriptions").select("*").eq("user_id", user.id).single(),
      ]);
      setProfile(p as Profile);
      setSubscription(s as Subscription);
      setLoading(false);
    });
  }, []);

  async function generateApiKey() {
    if (!profile) return;
    const supabase = createClient();
    const key = `cxl_${crypto.randomUUID().replace(/-/g, "")}`;
    await supabase.from("profiles").update({ api_key: key }).eq("id", profile.id);
    setProfile({ ...profile, api_key: key });
  }

  async function copyApiKey() {
    if (!profile?.api_key) return;
    await navigator.clipboard.writeText(profile.api_key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  }

  async function handleUpgrade() {
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
  }

  async function handleManage() {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center text-muted">
        Loading...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold flex items-center gap-3 mb-8">
        <Settings className="h-8 w-8 text-gold" />
        Settings
      </h1>

      {/* Profile */}
      <section className="rounded-xl border border-border bg-surface p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        <div className="space-y-2 text-sm">
          <p>
            <span className="text-muted">Email:</span> {profile?.email}
          </p>
          <p>
            <span className="text-muted">Name:</span>{" "}
            {profile?.display_name ?? "Not set"}
          </p>
        </div>
      </section>

      {/* Subscription */}
      <section className="rounded-xl border border-border bg-surface p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Subscription
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">
              Plan:{" "}
              <span className="font-medium text-gold">
                {subscription?.plan === "pro" ? "Pro" : "Free"}
              </span>
            </p>
            {subscription?.current_period_end && (
              <p className="text-xs text-muted mt-1">
                Renews:{" "}
                {new Date(subscription.current_period_end).toLocaleDateString()}
              </p>
            )}
          </div>
          {subscription?.plan === "pro" ? (
            <button
              onClick={handleManage}
              className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface-hover"
            >
              Manage
            </button>
          ) : (
            <button
              onClick={handleUpgrade}
              className="rounded-lg bg-gold px-4 py-2 text-sm font-medium text-background hover:bg-gold-light"
            >
              Upgrade to Pro
            </button>
          )}
        </div>
      </section>

      {/* API Key */}
      <section className="rounded-xl border border-border bg-surface p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Key
        </h2>
        {profile?.api_key ? (
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-background px-3 py-2 text-sm font-mono truncate">
              {profile.api_key}
            </code>
            <button
              onClick={copyApiKey}
              className="rounded-lg border border-border p-2 hover:bg-surface-hover"
              title="Copy"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={generateApiKey}
              className="rounded-lg border border-border p-2 hover:bg-surface-hover"
              title="Regenerate"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={generateApiKey}
            className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface-hover"
          >
            Generate API Key
          </button>
        )}
        {copiedKey && (
          <p className="mt-2 text-xs text-green-400">Copied to clipboard!</p>
        )}
      </section>

      {/* Sign out */}
      <form action={signOut}>
        <button
          type="submit"
          className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
        >
          Sign Out
        </button>
      </form>
    </div>
  );
}
