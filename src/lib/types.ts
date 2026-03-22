export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  api_key: string | null;
  api_requests_today: number;
  created_at: string;
}

export interface Domain {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  pack_count: number;
  created_at: string;
}

export interface Subdomain {
  id: string;
  domain_id: string;
  name: string;
  slug: string;
  description: string | null;
  pack_count: number;
  created_at: string;
  domain?: Domain;
}

export interface Pack {
  id: string;
  slug: string;
  title: string;
  domain_id: string;
  subdomain_id: string | null;
  version: string;
  compression: string;
  token_count: number;
  uncompressed_estimate: number;
  savings_pct: number;
  rosetta: string;
  content_compressed: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  is_free: boolean;
  downloads: number;
  rating: number;
  rating_count: number;
  author_id: string | null;
  status: "draft" | "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  domain?: Domain;
  subdomain?: Subdomain;
  tags?: Tag[];
  author?: Profile;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface PackTag {
  pack_id: string;
  tag_id: string;
}

export interface PackPrerequisite {
  pack_id: string;
  prerequisite_id: string;
}

export interface UserLibrary {
  id: string;
  user_id: string;
  pack_id: string;
  added_at: string;
  pack?: Pack;
}

export interface UserDownload {
  id: string;
  user_id: string;
  pack_id: string;
  downloaded_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  plan: "free" | "pro" | "team";
  status: "active" | "canceled" | "past_due" | "incomplete";
  current_period_end: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  pack_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profile?: Profile;
}

export interface Submission {
  id: string;
  user_id: string;
  title: string;
  domain_id: string;
  subdomain_id: string | null;
  content_raw: string;
  content_compressed: string | null;
  rosetta: string | null;
  token_count: number | null;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  status: "draft" | "pending" | "approved" | "rejected";
  flagged_reasons: string[] | null;
  reviewer_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vault {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  is_public: boolean;
  note_count: number;
  created_at: string;
  owner?: Profile;
}

export interface VaultNote {
  id: string;
  vault_id: string;
  user_id: string;
  title: string;
  slug: string;
  folder_path: string;
  content_raw: string;
  content_compressed: string | null;
  rosetta: string | null;
  token_count: number | null;
  tags: string[];
  backlinks: string[];
  is_public: boolean;
  downloads: number;
  created_at: string;
  updated_at: string;
  vault?: Vault;
  owner?: Profile;
}

export interface KnowledgePack {
  id: string;
  title: string;
  domain: string;
  subdomain: string | null;
  version: string;
  compression: string;
  token_count: number;
  uncompressed_estimate: number;
  savings_pct: number;
  rosetta: string;
  content: string;
  tags: string[];
  difficulty: string;
  prerequisites: string[];
}

// ── Book Summarization ──────────────────────────────────────

export type BookSourceType = "pdf" | "epub" | "text" | "url" | "public_domain";
export type BookStatus = "pending" | "processing" | "summarized" | "failed" | "rejected";
export type CopyrightStatus = "public_domain" | "licensed" | "fair_use" | "user_uploaded";
export type SummaryType = "executive" | "chapter_by_chapter" | "key_concepts" | "ai_digest";

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  page_count: number | null;
  source_type: BookSourceType;
  source_url: string | null;
  raw_text: string | null;
  word_count: number | null;
  language: string;
  cover_image_url: string | null;
  uploaded_by: string | null;
  status: BookStatus;
  copyright_status: CopyrightStatus;
  created_at: string;
  updated_at: string;
  summaries?: Summary[];
  uploader?: Profile;
}

export interface SummaryContent {
  title: string;
  executive_summary: string;
  chapters: {
    title: string;
    summary: string;
    key_points: string[];
  }[];
  key_concepts: string[];
  takeaways: string[];
}

export interface Summary {
  id: string;
  book_id: string;
  summary_type: SummaryType;
  content: SummaryContent;
  token_count: number | null;
  compression_ratio: number | null;
  model_used: string | null;
  quality_score: number | null;
  human_reviewed: boolean;
  created_at: string;
  book?: Book;
}

export interface SummaryDownload {
  id: string;
  summary_id: string;
  user_id: string;
  downloaded_at: string;
}

// ── Agent-Authored Content Platform ─────────────────────────

export type AgentType = "claude" | "openai" | "custom" | "openclaw" | "langchain" | "autogpt";
export type AgentStatus = "active" | "suspended" | "pending_review";
export type ContentType = "book" | "novel" | "knowledge_base" | "research" | "tutorial" | "reference";
export type PublicationStatus = "draft" | "pending_review" | "published" | "rejected" | "archived";

export interface Agent {
  id: string;
  owner_id: string;
  name: string;
  agent_type: AgentType;
  description: string | null;
  api_key: string;
  capabilities: string[];
  avatar_url: string | null;
  verified: boolean;
  reputation_score: number;
  total_publications: number;
  total_earnings: number;
  status: AgentStatus;
  connected_at: string;
  owner?: Profile;
  publications?: Publication[];
}

export interface PublicationContent {
  chapters: {
    title: string;
    content: string;
    order: number;
  }[];
  metadata?: Record<string, unknown>;
}

export interface Publication {
  id: string;
  agent_id: string | null;
  owner_id: string;
  title: string;
  slug: string;
  content_type: ContentType;
  description: string | null;
  content: PublicationContent;
  cover_image_url: string | null;
  word_count: number | null;
  token_count: number | null;
  language: string;
  price: number;
  royalty_rate: number;
  domain_id: string | null;
  tags: string[];
  quality_score: number | null;
  downloads: number;
  rating: number;
  rating_count: number;
  status: PublicationStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  agent?: Agent;
  owner?: Profile;
  domain?: Domain;
}

export interface Purchase {
  id: string;
  publication_id: string;
  buyer_id: string | null;
  buyer_agent_id: string | null;
  price_paid: number;
  purchased_at: string;
  publication?: Publication;
}

export interface AgentActivity {
  id: string;
  agent_id: string;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
}
