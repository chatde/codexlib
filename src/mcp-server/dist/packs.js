"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SporeRateLimitError = exports.SporeNotFoundError = exports.SporePermissionError = exports.SporeAuthError = exports.SporeConfigError = void 0;
exports.listPacks = listPacks;
exports.searchPacks = searchPacks;
exports.getPack = getPack;
exports.downloadPacks = downloadPacks;
const supabase_js_1 = require("@supabase/supabase-js");
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
class SporeConfigError extends Error {
}
exports.SporeConfigError = SporeConfigError;
class SporeAuthError extends Error {
}
exports.SporeAuthError = SporeAuthError;
class SporePermissionError extends Error {
}
exports.SporePermissionError = SporePermissionError;
class SporeNotFoundError extends Error {
}
exports.SporeNotFoundError = SporeNotFoundError;
class SporeRateLimitError extends Error {
}
exports.SporeRateLimitError = SporeRateLimitError;
function normalizeRow(value) {
    var _a;
    if (Array.isArray(value)) {
        return (_a = value[0]) !== null && _a !== void 0 ? _a : null;
    }
    return value !== null && value !== void 0 ? value : null;
}
function getSupabaseConfig() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey) {
        throw new SporeConfigError("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
    }
    return { url, serviceRoleKey };
}
function createSupabaseServiceClient() {
    const { url, serviceRoleKey } = getSupabaseConfig();
    return (0, supabase_js_1.createClient)(url, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
function resolveApiKey(apiKey) {
    var _a, _b;
    return ((_b = (_a = apiKey !== null && apiKey !== void 0 ? apiKey : process.env.SPORE_API_KEY) !== null && _a !== void 0 ? _a : process.env.CODEXLIB_API_KEY) !== null && _b !== void 0 ? _b : null);
}
async function resolveAuthContext(supabase, apiKey, options) {
    var _a;
    const resolvedApiKey = resolveApiKey(apiKey);
    if (!resolvedApiKey) {
        if (options === null || options === void 0 ? void 0 : options.requireBulkDownload) {
            throw new SporeAuthError("Bulk download requires an API key. Set SPORE_API_KEY or pass apiKey.");
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
        .single();
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
        .single();
    const plan = (_a = subscription === null || subscription === void 0 ? void 0 : subscription.plan) !== null && _a !== void 0 ? _a : "free";
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
    if ((options === null || options === void 0 ? void 0 : options.requireBulkDownload) && !canBulkDownload) {
        throw new SporePermissionError("Bulk download requires a Pro or Team subscription.");
    }
    return {
        hasApiKey: true,
        plan,
        canViewFullContent: canBulkDownload,
        canBulkDownload,
    };
}
function buildListSummary(count, page, pages) {
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
function mapPackSummary(pack) {
    var _a, _b, _c, _d;
    const domain = normalizeRow(pack.domain);
    const subdomain = normalizeRow(pack.subdomain);
    return {
        id: pack.slug,
        title: pack.title,
        domain: (_a = domain === null || domain === void 0 ? void 0 : domain.name) !== null && _a !== void 0 ? _a : null,
        domain_slug: (_b = domain === null || domain === void 0 ? void 0 : domain.slug) !== null && _b !== void 0 ? _b : null,
        subdomain: (_c = subdomain === null || subdomain === void 0 ? void 0 : subdomain.name) !== null && _c !== void 0 ? _c : null,
        subdomain_slug: (_d = subdomain === null || subdomain === void 0 ? void 0 : subdomain.slug) !== null && _d !== void 0 ? _d : null,
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
function mapPackDetail(pack, canViewFullContent) {
    var _a, _b, _c, _d;
    const domain = normalizeRow(pack.domain);
    const subdomain = normalizeRow(pack.subdomain);
    const response = {
        id: pack.slug,
        title: pack.title,
        domain: (_a = domain === null || domain === void 0 ? void 0 : domain.name) !== null && _a !== void 0 ? _a : null,
        domain_slug: (_b = domain === null || domain === void 0 ? void 0 : domain.slug) !== null && _b !== void 0 ? _b : null,
        subdomain: (_c = subdomain === null || subdomain === void 0 ? void 0 : subdomain.name) !== null && _c !== void 0 ? _c : null,
        subdomain_slug: (_d = subdomain === null || subdomain === void 0 ? void 0 : subdomain.slug) !== null && _d !== void 0 ? _d : null,
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
        return Object.assign(Object.assign({}, response), { content: pack.content_compressed });
    }
    const lines = pack.content_compressed.split("\n");
    return Object.assign(Object.assign({}, response), { content: lines.slice(0, Math.ceil(lines.length * 0.2)).join("\n"), preview: true });
}
async function listPacks(input = {}) {
    var _a, _b;
    const supabase = createSupabaseServiceClient();
    const auth = await resolveAuthContext(supabase, input.apiKey);
    const page = Math.max((_a = input.page) !== null && _a !== void 0 ? _a : 1, 1);
    const limit = Math.min(Math.max((_b = input.limit) !== null && _b !== void 0 ? _b : 20, 1), 100);
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
            .single();
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
        .returns();
    if (error) {
        throw new Error(error.message);
    }
    const packs = (data !== null && data !== void 0 ? data : []).map(mapPackSummary);
    const pages = Math.max(Math.ceil((count !== null && count !== void 0 ? count : 0) / limit), 1);
    return {
        data: packs,
        meta: {
            total: count !== null && count !== void 0 ? count : 0,
            page,
            limit,
            pages,
            authenticated: auth.hasApiKey,
            plan: auth.plan,
        },
        summary: buildListSummary(packs.length, page, pages),
    };
}
async function searchPacks(input) {
    var _a, _b;
    const supabase = createSupabaseServiceClient();
    const auth = await resolveAuthContext(supabase, input.apiKey);
    const page = Math.max((_a = input.page) !== null && _a !== void 0 ? _a : 1, 1);
    const limit = Math.min(Math.max((_b = input.limit) !== null && _b !== void 0 ? _b : 20, 1), 100);
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
            .single();
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
        .returns();
    if (error) {
        throw new Error(error.message);
    }
    const packs = (data !== null && data !== void 0 ? data : []).map(mapPackSummary);
    const pages = Math.max(Math.ceil((count !== null && count !== void 0 ? count : 0) / limit), 1);
    return {
        data: packs,
        meta: {
            total: count !== null && count !== void 0 ? count : 0,
            page,
            limit,
            pages,
            authenticated: auth.hasApiKey,
            plan: auth.plan,
            query: input.query,
        },
        summary: `Found ${count !== null && count !== void 0 ? count : 0} matching pack${count === 1 ? "" : "s"} for "${input.query}".`,
    };
}
async function getPack(input) {
    const supabase = createSupabaseServiceClient();
    const auth = await resolveAuthContext(supabase, input.apiKey);
    let query = supabase
        .from("packs")
        .select([
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
    ].join(", "))
        .eq("status", "approved");
    if (UUID_PATTERN.test(input.id)) {
        query = query.or(`id.eq.${input.id},slug.eq.${input.id}`);
    }
    else {
        query = query.eq("slug", input.id);
    }
    const { data, error } = await query.single();
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
async function downloadPacks(input = {}) {
    const supabase = createSupabaseServiceClient();
    const auth = await resolveAuthContext(supabase, input.apiKey, {
        requireBulkDownload: true,
    });
    let query = supabase
        .from("packs")
        .select([
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
    ].join(", "))
        .eq("status", "approved")
        .limit(100);
    if (input.domain) {
        const { data: domainRow, error: domainError } = await supabase
            .from("domains")
            .select("id")
            .eq("slug", input.domain)
            .single();
        if (domainError) {
            throw new Error(domainError.message);
        }
        if (!domainRow) {
            throw new SporeNotFoundError(`Domain "${input.domain}" not found.`);
        }
        query = query.eq("domain_id", domainRow.id);
    }
    const { data, error } = await query.returns();
    if (error) {
        throw new Error(error.message);
    }
    const packs = (data !== null && data !== void 0 ? data : []).map((pack) => {
        var _a, _b, _c, _d;
        const domain = normalizeRow(pack.domain);
        const subdomain = normalizeRow(pack.subdomain);
        return {
            id: pack.slug,
            title: pack.title,
            domain: (_a = domain === null || domain === void 0 ? void 0 : domain.name) !== null && _a !== void 0 ? _a : null,
            domain_slug: (_b = domain === null || domain === void 0 ? void 0 : domain.slug) !== null && _b !== void 0 ? _b : null,
            subdomain: (_c = subdomain === null || subdomain === void 0 ? void 0 : subdomain.name) !== null && _c !== void 0 ? _c : null,
            subdomain_slug: (_d = subdomain === null || subdomain === void 0 ? void 0 : subdomain.slug) !== null && _d !== void 0 ? _d : null,
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
