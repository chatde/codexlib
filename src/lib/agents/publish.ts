import { createServiceClient } from "@/lib/supabase/server";
import { logAgentActivity } from "./auth";
import { slugify } from "@/lib/utils";
import type { ContentType, PublicationContent } from "@/lib/types";
import { z } from "zod";

// Validation schema for publication submissions
const PublishSchema = z.object({
  title: z.string().min(3).max(200),
  contentType: z.enum(["book", "novel", "knowledge_base", "research", "tutorial", "reference"]),
  description: z.string().max(2000).optional(),
  content: z.object({
    chapters: z.array(
      z.object({
        title: z.string().min(1),
        content: z.string().min(10),
        order: z.number().int().positive(),
      })
    ).min(1),
    metadata: z.record(z.string(), z.unknown()).optional(),
  }),
  language: z.string().default("en"),
  price: z.number().min(0).max(99.99).default(0),
  tags: z.array(z.string()).max(10).default([]),
  domainSlug: z.string().optional(),
});

export type PublishInput = z.infer<typeof PublishSchema>;

/**
 * Submit a new publication from an agent.
 */
export async function publishContent(
  agentId: string,
  ownerId: string,
  input: unknown
): Promise<{ publication: { id: string; slug: string } | null; error?: string }> {
  // Validate input
  const parsed = PublishSchema.safeParse(input);
  if (!parsed.success) {
    return {
      publication: null,
      error: `Validation error: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
    };
  }

  const data = parsed.data;
  const supabase = await createServiceClient();

  // Generate unique slug
  let slug = slugify(data.title);
  const { data: existing } = await supabase
    .from("publications")
    .select("id")
    .eq("slug", slug)
    .single();

  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  // Resolve domain ID if provided
  let domainId: string | null = null;
  if (data.domainSlug) {
    const { data: domain } = await supabase
      .from("domains")
      .select("id")
      .eq("slug", data.domainSlug)
      .single();
    domainId = domain?.id || null;
  }

  // Calculate word and token counts
  const wordCount = data.content.chapters.reduce(
    (sum, ch) => sum + ch.content.split(/\s+/).length,
    0
  );
  const tokenCount = Math.ceil(wordCount * 1.3);

  // Insert publication
  const { data: publication, error } = await supabase
    .from("publications")
    .insert({
      agent_id: agentId,
      owner_id: ownerId,
      title: data.title,
      slug,
      content_type: data.contentType,
      description: data.description || null,
      content: data.content,
      word_count: wordCount,
      token_count: tokenCount,
      language: data.language,
      price: data.price,
      domain_id: domainId,
      tags: data.tags,
      status: "pending_review",
    })
    .select("id, slug")
    .single();

  if (error || !publication) {
    return {
      publication: null,
      error: error?.message || "Failed to publish",
    };
  }

  // Update agent publication count
  const { data: agentData } = await supabase
    .from("agents")
    .select("total_publications")
    .eq("id", agentId)
    .single();

  if (agentData) {
    await supabase
      .from("agents")
      .update({ total_publications: (agentData.total_publications || 0) + 1 })
      .eq("id", agentId);
  }

  // Log activity
  await logAgentActivity(agentId, "publish", {
    publication_id: publication.id,
    title: data.title,
    content_type: data.contentType,
  });

  return { publication };
}

/**
 * Update an existing publication (only if owned by agent's owner).
 */
export async function updatePublication(
  publicationId: string,
  ownerId: string,
  updates: Partial<{
    title: string;
    description: string;
    content: PublicationContent;
    price: number;
    tags: string[];
    status: "draft" | "pending_review";
  }>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServiceClient();

  const { error } = await supabase
    .from("publications")
    .update(updates)
    .eq("id", publicationId)
    .eq("owner_id", ownerId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * List publications with optional filters.
 */
export async function listPublications(filters?: {
  contentType?: ContentType;
  domainId?: string;
  agentId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const supabase = await createServiceClient();
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("publications")
    .select(
      "id, title, slug, content_type, description, word_count, token_count, price, tags, quality_score, downloads, rating, rating_count, status, published_at, created_at, agent:agents(id, name, agent_type, avatar_url), domain:domains(name, slug)",
      { count: "exact" }
    )
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters?.contentType) {
    query = query.eq("content_type", filters.contentType);
  }
  if (filters?.domainId) {
    query = query.eq("domain_id", filters.domainId);
  }
  if (filters?.agentId) {
    query = query.eq("agent_id", filters.agentId);
  }
  if (filters?.search) {
    query = query.ilike("title", `%${filters.search}%`);
  }

  const { data, count, error } = await query;

  return {
    publications: data || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
}
