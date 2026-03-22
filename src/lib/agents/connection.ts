import { createServiceClient } from "@/lib/supabase/server";
import { generateAgentApiKey } from "./auth";
import type { AgentType } from "@/lib/types";

export interface RegisterAgentInput {
  ownerId: string;
  name: string;
  agentType: AgentType;
  description?: string;
  capabilities?: string[];
  avatarUrl?: string;
}

/**
 * Register a new agent for a user.
 * Returns the agent record with the generated API key.
 */
export async function registerAgent(input: RegisterAgentInput): Promise<{
  agent: {
    id: string;
    api_key: string;
    name: string;
    agent_type: string;
  };
  error?: string;
}> {
  const supabase = await createServiceClient();

  // Check how many agents the user already has
  const { count } = await supabase
    .from("agents")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", input.ownerId)
    .neq("status", "suspended");

  const agentCount = count || 0;

  // Check user subscription for agent limits
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", input.ownerId)
    .eq("status", "active")
    .single();

  const plan = subscription?.plan || "free";
  const maxAgents = plan === "team" ? 999 : plan === "pro" ? 3 : 0;

  if (agentCount >= maxAgents) {
    const upgradeMsg =
      plan === "free"
        ? "Upgrade to Pro to connect agents"
        : plan === "pro"
          ? "Upgrade to Team for unlimited agents"
          : "Agent limit reached";
    return {
      agent: { id: "", api_key: "", name: "", agent_type: "" },
      error: upgradeMsg,
    };
  }

  const apiKey = generateAgentApiKey();

  const { data: agent, error } = await supabase
    .from("agents")
    .insert({
      owner_id: input.ownerId,
      name: input.name,
      agent_type: input.agentType,
      description: input.description || null,
      api_key: apiKey,
      capabilities: input.capabilities || [],
      avatar_url: input.avatarUrl || null,
    })
    .select("id, api_key, name, agent_type")
    .single();

  if (error || !agent) {
    return {
      agent: { id: "", api_key: "", name: "", agent_type: "" },
      error: error?.message || "Failed to register agent",
    };
  }

  return { agent };
}

/**
 * List agents owned by a user.
 */
export async function listUserAgents(ownerId: string) {
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from("agents")
    .select("id, name, agent_type, description, verified, reputation_score, total_publications, total_earnings, status, connected_at")
    .eq("owner_id", ownerId)
    .order("connected_at", { ascending: false });

  if (error) return [];
  return data || [];
}

/**
 * Get a single agent by ID (public view — no API key exposed).
 */
export async function getAgent(agentId: string) {
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from("agents")
    .select("id, name, agent_type, description, avatar_url, verified, reputation_score, total_publications, status, connected_at, owner:profiles(display_name, avatar_url)")
    .eq("id", agentId)
    .eq("status", "active")
    .single();

  if (error) return null;
  return data;
}

/**
 * Deactivate an agent.
 */
export async function deactivateAgent(agentId: string, ownerId: string) {
  const supabase = await createServiceClient();

  const { error } = await supabase
    .from("agents")
    .update({ status: "suspended" })
    .eq("id", agentId)
    .eq("owner_id", ownerId);

  return !error;
}
