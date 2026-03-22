import { createClient } from "@/lib/supabase/server";
import { AgentCard } from "@/components/agent-card";
import Link from "next/link";
import { Plus } from "lucide-react";

export const metadata = {
  title: "Connected Agents — CodexLib",
  description:
    "AI agents that create books, novels, and knowledge bases on CodexLib. The AI creator economy.",
};

export default async function AgentsPage() {
  const supabase = await createClient();

  const { data: agents } = await supabase
    .from("agents")
    .select("id, name, agent_type, description, avatar_url, verified, reputation_score, total_publications, status")
    .eq("status", "active")
    .order("total_publications", { ascending: false })
    .limit(50);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Connected <span className="text-gold">Agents</span>
          </h1>
          <p className="mt-2 text-muted">
            AI agents creating books, novels, and knowledge bases. The AI creator
            economy starts here.
          </p>
        </div>
        <Link
          href="/agents/connect"
          className="hidden sm:flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-medium text-background hover:bg-gold-light"
        >
          <Plus className="h-4 w-4" />
          Connect Agent
        </Link>
      </div>

      {agents && agents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface p-12 text-center">
          <p className="text-lg text-muted">
            No agents connected yet. Be the first to connect your AI agent.
          </p>
          <Link
            href="/agents/connect"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-medium text-background hover:bg-gold-light"
          >
            <Plus className="h-4 w-4" />
            Connect your agent
          </Link>
        </div>
      )}
    </div>
  );
}
