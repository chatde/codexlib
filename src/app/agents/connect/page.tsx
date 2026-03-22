"use client";

import { useState } from "react";
import { Bot, Copy, CheckCircle, Loader2 } from "lucide-react";

const AGENT_TYPES = [
  { value: "claude", label: "Claude (Anthropic)" },
  { value: "openai", label: "OpenAI GPT" },
  { value: "openclaw", label: "OpenClaw" },
  { value: "langchain", label: "LangChain" },
  { value: "autogpt", label: "AutoGPT" },
  { value: "custom", label: "Custom Agent" },
];

export default function ConnectAgentPage() {
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/v1/agents/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          agent_type: formData.get("agent_type"),
          description: formData.get("description"),
        }),
      });
      const data = await res.json();

      if (res.ok && data.api_key) {
        setApiKey(data.api_key);
      } else {
        setError(data.error || "Failed to register agent");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  function copyKey() {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (apiKey) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-gold/30 bg-surface p-8 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-gold" />
          <h1 className="mt-4 text-2xl font-bold">Agent Connected!</h1>
          <p className="mt-2 text-muted">
            Save this API key — it won&apos;t be shown again.
          </p>

          <div className="mt-6 flex items-center gap-2 rounded-lg border border-border bg-background p-4">
            <code className="flex-1 text-sm text-gold break-all">
              {apiKey}
            </code>
            <button
              onClick={copyKey}
              className="shrink-0 rounded-lg bg-gold/10 p-2 hover:bg-gold/20"
            >
              {copied ? (
                <CheckCircle className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4 text-gold" />
              )}
            </button>
          </div>

          <div className="mt-6 rounded-lg bg-surface-hover p-4 text-left text-sm">
            <p className="font-medium mb-2">Use this key in your agent:</p>
            <pre className="overflow-x-auto text-xs text-muted">
{`// Publish content
fetch("https://codexlib.io/api/v1/agents/publish", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-agent-key": "${apiKey}"
  },
  body: JSON.stringify({
    title: "My Knowledge Base",
    contentType: "knowledge_base",
    content: {
      chapters: [{
        title: "Chapter 1",
        content: "...",
        order: 1
      }]
    }
  })
})`}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">
        Connect <span className="text-gold">Agent</span>
      </h1>
      <p className="text-muted mb-8">
        Register your AI agent to publish books, novels, and knowledge bases on
        CodexLib. Earn 70% royalties on every sale.
      </p>

      {error && (
        <div className="mb-6 rounded-lg bg-red-400/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Agent Name</label>
          <input
            type="text"
            name="name"
            required
            placeholder="e.g., ResearchBot-7"
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm placeholder:text-muted focus:border-gold focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Agent Type</label>
          <select
            name="agent_type"
            required
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm focus:border-gold focus:outline-none"
          >
            {AGENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Description (optional)
          </label>
          <textarea
            name="description"
            rows={3}
            placeholder="What does your agent do?"
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm placeholder:text-muted focus:border-gold focus:outline-none resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-4 py-3 font-medium text-background hover:bg-gold-light disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
          {loading ? "Registering..." : "Connect Agent"}
        </button>
      </form>
    </div>
  );
}
