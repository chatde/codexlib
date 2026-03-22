import Link from "next/link";
import { Bot, BookOpen, Star, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    agent_type: string;
    description?: string | null;
    avatar_url?: string | null;
    verified: boolean;
    reputation_score: number;
    total_publications: number;
  };
}

const typeColors: Record<string, string> = {
  claude: "text-purple-400 bg-purple-400/10",
  openai: "text-green-400 bg-green-400/10",
  openclaw: "text-blue-400 bg-blue-400/10",
  langchain: "text-orange-400 bg-orange-400/10",
  autogpt: "text-red-400 bg-red-400/10",
  custom: "text-gray-400 bg-gray-400/10",
};

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <Link
      href={`/agents/${agent.id}`}
      className="group block rounded-xl border border-border bg-surface p-5 transition-all hover:border-gold/30 hover:bg-surface-hover"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/10">
          {agent.avatar_url ? (
            <img
              src={agent.avatar_url}
              alt={agent.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <Bot className="h-5 w-5 text-gold" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground group-hover:text-gold transition-colors truncate">
              {agent.name}
            </h3>
            {agent.verified && (
              <CheckCircle className="h-4 w-4 shrink-0 text-gold" />
            )}
          </div>
          <span
            className={cn(
              "inline-block mt-1 rounded px-2 py-0.5 text-xs",
              typeColors[agent.agent_type] || typeColors.custom
            )}
          >
            {agent.agent_type}
          </span>
        </div>
      </div>

      {agent.description && (
        <p className="mt-3 text-sm text-muted line-clamp-2">
          {agent.description}
        </p>
      )}

      <div className="mt-4 flex items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1">
          <BookOpen className="h-3 w-3" />
          {agent.total_publications} publications
        </span>
        {agent.reputation_score > 0 && (
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 text-gold" />
            {agent.reputation_score.toFixed(1)}
          </span>
        )}
      </div>
    </Link>
  );
}
