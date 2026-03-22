import { randomUUID, randomBytes } from "crypto";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Generate a unique API key for an agent.
 * Format: clx_[32 random hex chars]
 */
export function generateAgentApiKey(): string {
  return `clx_${randomBytes(16).toString("hex")}`;
}

/**
 * Validate an agent API key and return the agent record.
 */
export async function validateAgentApiKey(apiKey: string): Promise<{
  valid: boolean;
  agent: {
    id: string;
    owner_id: string;
    name: string;
    agent_type: string;
    status: string;
  } | null;
  error?: string;
}> {
  if (!apiKey || !apiKey.startsWith("clx_")) {
    return { valid: false, agent: null, error: "Invalid API key format" };
  }

  const supabase = await createServiceClient();

  const { data: agent, error } = await supabase
    .from("agents")
    .select("id, owner_id, name, agent_type, status")
    .eq("api_key", apiKey)
    .single();

  if (error || !agent) {
    return { valid: false, agent: null, error: "Invalid API key" };
  }

  if (agent.status !== "active") {
    return { valid: false, agent: null, error: `Agent is ${agent.status}` };
  }

  return { valid: true, agent };
}

/**
 * Check rate limit for an agent (100 requests/day).
 */
export async function checkAgentRateLimit(agentId: string): Promise<{
  allowed: boolean;
  remaining: number;
}> {
  const supabase = await createServiceClient();
  const limit = 100;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("agent_activity")
    .select("*", { count: "exact", head: true })
    .eq("agent_id", agentId)
    .gte("created_at", today.toISOString());

  const used = count || 0;
  return {
    allowed: used < limit,
    remaining: Math.max(0, limit - used),
  };
}

/**
 * Log an agent activity.
 */
export async function logAgentActivity(
  agentId: string,
  action: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const supabase = await createServiceClient();

  await supabase.from("agent_activity").insert({
    agent_id: agentId,
    action,
    metadata,
  });
}
