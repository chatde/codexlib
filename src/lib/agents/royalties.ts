import { createServiceClient } from "@/lib/supabase/server";
import { logAgentActivity } from "./auth";

const PLATFORM_FEE = 0.30; // 30% platform fee

export interface RoyaltyBreakdown {
  totalPrice: number;
  platformFee: number;
  authorEarnings: number;
  royaltyRate: number;
}

/**
 * Calculate royalty breakdown for a publication purchase.
 */
export function calculateRoyalties(
  price: number,
  royaltyRate: number = 0.70
): RoyaltyBreakdown {
  const authorEarnings = price * royaltyRate;
  const platformFee = price - authorEarnings;

  return {
    totalPrice: price,
    platformFee: Math.round(platformFee * 100) / 100,
    authorEarnings: Math.round(authorEarnings * 100) / 100,
    royaltyRate,
  };
}

/**
 * Record a purchase and update agent earnings.
 */
export async function recordPurchase(
  publicationId: string,
  buyerId: string | null,
  buyerAgentId: string | null
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServiceClient();

  // Get publication details
  const { data: pub } = await supabase
    .from("publications")
    .select("id, price, royalty_rate, agent_id, owner_id")
    .eq("id", publicationId)
    .single();

  if (!pub) {
    return { success: false, error: "Publication not found" };
  }

  // Check if already purchased
  if (buyerId) {
    const { data: existing } = await supabase
      .from("purchases")
      .select("id")
      .eq("publication_id", publicationId)
      .eq("buyer_id", buyerId)
      .single();

    if (existing) {
      return { success: false, error: "Already purchased" };
    }
  }

  // Record purchase
  const { error: purchaseError } = await supabase.from("purchases").insert({
    publication_id: publicationId,
    buyer_id: buyerId,
    buyer_agent_id: buyerAgentId,
    price_paid: pub.price,
  });

  if (purchaseError) {
    return { success: false, error: purchaseError.message };
  }

  // Update agent earnings if agent-authored
  if (pub.agent_id) {
    const royalties = calculateRoyalties(pub.price, pub.royalty_rate);

    const { data: agent } = await supabase
      .from("agents")
      .select("total_earnings")
      .eq("id", pub.agent_id)
      .single();

    if (agent) {
      await supabase
        .from("agents")
        .update({
          total_earnings: (Number(agent.total_earnings) || 0) + royalties.authorEarnings,
        })
        .eq("id", pub.agent_id);
    }

    // Log activity
    await logAgentActivity(pub.agent_id, "sale", {
      publication_id: publicationId,
      price: pub.price,
      earnings: calculateRoyalties(pub.price, pub.royalty_rate).authorEarnings,
      buyer_type: buyerAgentId ? "agent" : "human",
    });
  }

  // Increment download count
  await supabase
    .from("publications")
    .update({ downloads: (pub as unknown as { downloads: number }).downloads + 1 || 1 })
    .eq("id", publicationId);

  return { success: true };
}

/**
 * Get earnings summary for an agent owner.
 */
export async function getEarningsSummary(ownerId: string): Promise<{
  totalEarnings: number;
  totalSales: number;
  agents: { id: string; name: string; earnings: number; sales: number }[];
}> {
  const supabase = await createServiceClient();

  // Get all agents for owner
  const { data: agents } = await supabase
    .from("agents")
    .select("id, name, total_earnings, total_publications")
    .eq("owner_id", ownerId);

  if (!agents || agents.length === 0) {
    return { totalEarnings: 0, totalSales: 0, agents: [] };
  }

  // Get purchase counts per agent
  const agentIds = agents.map((a) => a.id);
  const { data: purchases } = await supabase
    .from("purchases")
    .select("publication:publications(agent_id)")
    .in("publication.agent_id", agentIds);

  const salesByAgent: Record<string, number> = {};
  for (const p of purchases || []) {
    const agentId = (p.publication as unknown as { agent_id: string })?.agent_id;
    if (agentId) {
      salesByAgent[agentId] = (salesByAgent[agentId] || 0) + 1;
    }
  }

  const agentSummaries = agents.map((a) => ({
    id: a.id,
    name: a.name,
    earnings: Number(a.total_earnings) || 0,
    sales: salesByAgent[a.id] || 0,
  }));

  return {
    totalEarnings: agentSummaries.reduce((sum, a) => sum + a.earnings, 0),
    totalSales: agentSummaries.reduce((sum, a) => sum + a.sales, 0),
    agents: agentSummaries,
  };
}
