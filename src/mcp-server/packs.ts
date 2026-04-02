import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Difficulty = "beginner" | "intermediate" | "advanced" | "expert";
type Plan = "free" | "pro" | "team";

interface DomainRow {
  name: string;
  slug: string;
}

interface SubdomainRow {
  name: string;
  slug: string;
}

interface PackRow {
  id: string;
  slug: string;
  title: string;
  version: string;
  compression: string;
  token_count: number;
  uncompressed_estimate: number;
  savings_pct: number;
  difficulty: Difficulty;
  is_free: boolean;
  downloads: number;
  rating: number;
  rosetta: string;
  content_compressed: string;
  domain?: DomainRow | DomainRow[] | null;
  subdomain?: SubdomainRow | SubdomainRow[] | null;
}

interface ProfileRow {
  id: string;
  api_requests_today: number;
  api_requests_reset_at: string;
}

interface SubscriptionRow {
  plan: Plan;
}

interface AuthContext {
  hasApiKey: boolean;
  plan: Plan | null;
  canViewFullContent: boolean;
  canBulkDownload: boolean;
}

export interface ListPacksInput {
  domain?: string;
  difficulty?: Difficulty;
  page?: number;
  limit?: number;
  apiKey?: string;
}

export interface SearchPacksInput extends ListPacksInput {
  query: string;
}

export interface GetPackInput {
  id: string;
  apiKey?: string;
}

export interface DownloadPacksInput {
  domain?: string;
  apiKey?: string;
}

export class SporeConfigError extends Error {}
export class SporeAuthError extends Error {}
export class SporePermissionError extends Error {}
export class SporeNotFoundError extends Error {}
export class SporeRateLimitError extends Error {}

function normalizeRow<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new SporeConfigError(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return { url, serviceRoleKey };
}

function createSupabaseServiceClient(): SupabaseClient {
  const { url, serviceRoleKey } = getSupabaseConfig();

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function resolveApiKey(apiKey?: string): string | null {
  return (
    apiKey ??
    process.env.SPORE_API_KEY ??
    process.env.CODEXLIB_API_KEY ??
    null
  );
}

async function resolveAuthContext(
  supabase: SupabaseClient,
  apiKey?: string,
  options?: { requireBulkDownload?: boolean }
): Promise<AuthContext> {
  const resolvedApiKey = resolveApiKey(apiKey);

  if (!resolvedApiKey) {
    if (options?.requireBulkDownload) {
      throw new SporeAuthError(
        "Bulk download requires an API key. Set SPORE_API_KEY or pass apiKey."
      );
    }

    return {
      hasApiKey: false,
      plan: null,
      canViewFullContent: false,
      canBulkDownload: false,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, api_requests_today, api_requests_reset_at")
    .eq("api_key", resolvedApiKey)
    .single<ProfileRow>();

  if (!profile) {
    throw new SporeAuthError("Invalid API key.");
  }

  const now = new Date();
  const resetAt = new Date(profile.api_requests_reset_at);
  let apiRequestsToday = profile.api_requests_today;

  if (now.toDateString() !== resetAt.toDateString()) {
    const { error: resetError } = await supabase
      .from("profiles")
      .update({
        api_requests_today: 0,
        api_requests_reset_at: now.toISOString(),
      })
      .eq("id", profile.id);

    if (resetError) {
      throw new Error(resetError.message);
    }

    apiRequestsToday = 0;
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", profile.id)
    .single<SubscriptionRow>();

  const plan = subscription?.plan ?? "free";
  const dailyLimit = plan === "pro" || plan === "team" ? 1000 : 10;

  if (apiRequestsToday >= dailyLimit) {
    throw new SporeRateLimitError("Rate limit exceeded.");
  }

  const { error: incrementError } = await supabase
    .from("profiles")
    .update({ api_requests_today: apiRequestsToday + 1 })
    .eq("id", profile.id);

  if (incrementError) {
    throw new Error(incrementError.message);
  }

  const canBulkDownload = plan === "pro" || plan === "team";

  if (options?.requireBulkDownload && !canBulkDownload) {
    throw new SporePermissionError(
      "Bulk download requires a Pro or Team subscription."
    );
  }

  return {
    hasApiKey: true,
    plan,
    canViewFullContent: canBulkDownload,
    canBulkDownload,
  };
}

function buildListSummary(count: number, page: number, pages: number) {
  return `Returned ${count} pack${count === 1 ? "" : "s"} on page ${page} of ${pages}.`;
}

function selectPackSummaryFields() {
  return [
    "id",
    "slug",
    "title",
    "version",
    "compression",
    "token_count",
    "uncompressed_estimate",
    "savings_pct",
    "difficulty",
    "is_free",
    "downloads",
    "rating",
    "domain:domains(name, slug)",
    "subdomain:subdomains(name, slug)",
  ].join(", ");
}

function mapPackSummary(pack: PackRow) {
  const domain = normalizeRow(pack.domain);
  const subdomain = normalizeRow(pack.subdomain);

  return {
    id: pack.slug,
    title: pack.title,
    domain: domain?.name ?? null,
    domain_slug: domain?.slug ?? null,
    subdomain: subdomain?.name ?? null,
    subdomain_slug: subdomain?.slug ?? null,
    version: pack.version,
    compression: pack.compression,
    token_count: pack.token_count,
    uncompressed_estimate: pack.uncompressed_estimate,
    savings_pct: pack.savings_pct,
    difficulty: pack.difficulty,
    is_free: pack.is_free,
    downloads: pack.downloads,
    rating: pack.rating,
  };
}

function mapPackDetail(pack: PackRow, canViewFullContent: boolean) {
  const domain = normalizeRow(pack.domain);
  const subdomain = normalizeRow(pack.subdomain);
  const response = {
    id: pack.slug,
    title: pack.title,
    domain: domain?.name ?? null,
    domain_slug: domain?.slug ?? null,
    subdomain: subdomain?.name ?? null,
    subdomain_slug: subdomain?.slug ?? null,
    version: pack.version,
    compression: pack.compression,
    token_count: pack.token_count,
    uncompressed_estimate: pack.uncompressed_estimate,
    savings_pct: pack.savings_pct,
    difficulty: pack.difficulty,
    downloads: pack.downloads,
    rating: pack.rating,
    rosetta: pack.rosetta,
    content: "",
    preview: false,
  };

  if (pack.is_free || canViewFullContent) {
    return {
      ...response,
      content: pack.content_compressed,
    };
  }

  const lines = pack.content_compressed.split("\n");

  return {
    ...response,
    content: lines.slice(0, Math.ceil(lines.length * 0.2)).join("\n"),
    preview: true,
  };
}

export async function listPacks(input: ListPacksInput = {}) {
  const supabase = createSupabaseServiceClient();
  const auth = await resolveAuthContext(supabase, input.apiKey);
  const page = Math.max(input.page ?? 1, 1);
  const limit = Math.min(Math.max(input.limit ?? 20, 1), 100);
  const offset = (page - 1) * limit;

  let query = supabase
    .from("packs")
    .select(selectPackSummaryFields(), { count: "exact" })
    .eq("status", "approved");

  if (input.domain) {
    const { data: domainRow, error: domainError } = await supabase
      .from("domains")
      .select("id")
      .eq("slug", input.domain)
      .single<{ id: string }>();

    if (domainError) {
      throw new Error(domainError.message);
    }

    if (!domainRow) {
      throw new SporeNotFoundError(`Domain "${input.domain}" not found.`);
    }

    query = query.eq("domain_id", domainRow.id);
  }

  if (input.difficulty) {
    query = query.eq("difficulty", input.difficulty);
  }

  const { data, error, count } = await query
    .order("downloads", { ascending: false })
    .range(offset, offset + limit - 1)
    .returns<PackRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  const packs = (data ?? []).map(mapPackSummary);
  const pages = Math.max(Math.ceil((count ?? 0) / limit), 1);

  return {
    data: packs,
    meta: {
      total: count ?? 0,
      page,
      limit,
      pages,
      authenticated: auth.hasApiKey,
      plan: auth.plan,
    },
    summary: buildListSummary(packs.length, page, pages),
  };
}

export async function searchPacks(input: SearchPacksInput) {
  const supabase = createSupabaseServiceClient();
  const auth = await resolveAuthContext(supabase, input.apiKey);
  const page = Math.max(input.page ?? 1, 1);
  const limit = Math.min(Math.max(input.limit ?? 20, 1), 100);
  const offset = (page - 1) * limit;

  let query = supabase
    .from("packs")
    .select(selectPackSummaryFields(), { count: "exact" })
    .eq("status", "approved")
    .ilike("title", `%${input.query}%`);

  if (input.domain) {
    const { data: domainRow, error: domainError } = await supabase
      .from("domains")
      .select("id")
      .eq("slug", input.domain)
      .single<{ id: string }>();

    if (domainError) {
      throw new Error(domainError.message);
    }

    if (!domainRow) {
      throw new SporeNotFoundError(`Domain "${input.domain}" not found.`);
    }

    query = query.eq("domain_id", domainRow.id);
  }

  if (input.difficulty) {
    query = query.eq("difficulty", input.difficulty);
  }

  const { data, error, count } = await query
    .order("downloads", { ascending: false })
    .range(offset, offset + limit - 1)
    .returns<PackRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  const packs = (data ?? []).map(mapPackSummary);
  const pages = Math.max(Math.ceil((count ?? 0) / limit), 1);

  return {
    data: packs,
    meta: {
      total: count ?? 0,
      page,
      limit,
      pages,
      authenticated: auth.hasApiKey,
      plan: auth.plan,
      query: input.query,
    },
    summary: `Found ${count ?? 0} matching pack${count === 1 ? "" : "s"} for "${input.query}".`,
  };
}

export async function getPack(input: GetPackInput) {
  const supabase = createSupabaseServiceClient();
  const auth = await resolveAuthContext(supabase, input.apiKey);

  let query = supabase
    .from("packs")
    .select(
      [
        "id",
        "slug",
        "title",
        "version",
        "compression",
        "token_count",
        "uncompressed_estimate",
        "savings_pct",
        "difficulty",
        "is_free",
        "downloads",
        "rating",
        "rosetta",
        "content_compressed",
        "domain:domains(name, slug)",
        "subdomain:subdomains(name, slug)",
      ].join(", ")
    )
    .eq("status", "approved");

  if (UUID_PATTERN.test(input.id)) {
    query = query.or(`id.eq.${input.id},slug.eq.${input.id}`);
  } else {
    query = query.eq("slug", input.id);
  }

  const { data, error } = await query.single<PackRow>();

  if (error) {
    if (error.code === "PGRST116") {
      throw new SporeNotFoundError(`Pack "${input.id}" not found.`);
    }

    throw new Error(error.message);
  }

  const pack = mapPackDetail(data, auth.canViewFullContent);

  return {
    data: pack,
    meta: {
      authenticated: auth.hasApiKey,
      plan: auth.plan,
      full_content: !pack.preview,
    },
    summary: `Loaded pack "${pack.title}".`,
  };
}

export async function downloadPacks(input: DownloadPacksInput = {}) {
  const supabase = createSupabaseServiceClient();
  const auth = await resolveAuthContext(supabase, input.apiKey, {
    requireBulkDownload: true,
  });

  let query = supabase
    .from("packs")
    .select(
      [
        "slug",
        "title",
        "version",
        "compression",
        "token_count",
        "uncompressed_estimate",
        "savings_pct",
        "rosetta",
        "content_compressed",
        "difficulty",
        "domain:domains(name, slug)",
        "subdomain:subdomains(name, slug)",
      ].join(", ")
    )
    .eq("status", "approved")
    .limit(100);

  if (input.domain) {
    const { data: domainRow, error: domainError } = await supabase
      .from("domains")
      .select("id")
      .eq("slug", input.domain)
      .single<{ id: string }>();

    if (domainError) {
      throw new Error(domainError.message);
    }

    if (!domainRow) {
      throw new SporeNotFoundError(`Domain "${input.domain}" not found.`);
    }

    query = query.eq("domain_id", domainRow.id);
  }

  const { data, error } = await query.returns<PackRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  const packs = (data ?? []).map((pack) => {
    const domain = normalizeRow(pack.domain);
    const subdomain = normalizeRow(pack.subdomain);

    return {
      id: pack.slug,
      title: pack.title,
      domain: domain?.name ?? null,
      domain_slug: domain?.slug ?? null,
      subdomain: subdomain?.name ?? null,
      subdomain_slug: subdomain?.slug ?? null,
      version: pack.version,
      compression: pack.compression,
      token_count: pack.token_count,
      uncompressed_estimate: pack.uncompressed_estimate,
      savings_pct: pack.savings_pct,
      rosetta: pack.rosetta,
      content: pack.content_compressed,
      difficulty: pack.difficulty,
    };
  });

  return {
    data: packs,
    meta: {
      count: packs.length,
      authenticated: auth.hasApiKey,
      plan: auth.plan,
    },
    summary: `Prepared ${packs.length} pack${packs.length === 1 ? "" : "s"} for bulk download.`,
  };
}
