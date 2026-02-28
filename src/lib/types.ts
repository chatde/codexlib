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
  plan: "free" | "pro";
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
