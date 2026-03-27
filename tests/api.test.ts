/**
 * CodexLib API Integration Tests
 *
 * Tests the live API at https://codexlib.io
 * Run: npx tsx tests/api.test.ts
 */

const BASE = "https://codexlib.io";
const SUPABASE_URL = "https://fkqgnhezbufszkqoqjct.supabase.co";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrcWduaGV6YnVmc3prcW9xamN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NjU5MjIsImV4cCI6MjA5MDE0MTkyMn0.KMGKblL2cYbZUhPR8jrNVmZMM6Y0c9ZpDmRb7nCnjgs";

let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ ${name}`);
    passed++;
  } else {
    console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

async function testPagesReturn200() {
  console.log("\n=== Page Tests ===");
  const pages = [
    "/", "/browse", "/search", "/pricing", "/login", "/signup",
    "/api-docs", "/privacy", "/terms", "/books", "/marketplace",
    "/agents", "/vaults",
  ];
  for (const path of pages) {
    const res = await fetch(`${BASE}${path}`, { redirect: "follow" });
    assert(res.ok, `GET ${path} → ${res.status}`, `expected 200, got ${res.status}`);
  }
}

async function testAuthProtectedRedirects() {
  console.log("\n=== Auth Redirect Tests ===");
  const protectedPages = ["/library", "/my-packs", "/settings", "/submit"];
  for (const path of protectedPages) {
    const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
    assert(
      res.status === 307 || res.status === 308,
      `GET ${path} redirects (${res.status})`,
      `expected 307/308, got ${res.status}`
    );
  }
}

async function testPacksAPI() {
  console.log("\n=== Packs API Tests ===");

  // List packs
  const listRes = await fetch(`${BASE}/api/v1/packs?limit=3`);
  assert(listRes.ok, "GET /api/v1/packs returns 200");
  const listData = await listRes.json();
  assert(listData.meta?.total > 0, `Has packs (${listData.meta?.total} total)`);
  assert(listData.data?.length === 3, `Returns requested limit (${listData.data?.length})`);
  assert(listData.meta?.pages > 0, "Has pagination");

  // Search
  const searchRes = await fetch(`${BASE}/api/v1/packs?search=neural`);
  const searchData = await searchRes.json();
  assert(searchRes.ok, "Search works");
  assert(searchData.data?.length > 0, `Search returns results (${searchData.data?.length})`);

  // Filter by domain
  const domainRes = await fetch(`${BASE}/api/v1/packs?domain=ai-ml`);
  const domainData = await domainRes.json();
  assert(domainRes.ok, "Domain filter works");
  assert(domainData.data?.length > 0, `AI/ML domain has packs (${domainData.data?.length})`);

  // Filter by difficulty
  const diffRes = await fetch(`${BASE}/api/v1/packs?difficulty=intermediate`);
  const diffData = await diffRes.json();
  assert(diffRes.ok, "Difficulty filter works");

  // Single pack by slug
  const slug = listData.data?.[0]?.slug;
  if (slug) {
    const packRes = await fetch(`${BASE}/api/v1/packs/${slug}`);
    assert(packRes.ok, `GET /api/v1/packs/${slug} returns 200`);
    const packData = await packRes.json();
    assert(packData.title !== undefined, "Pack has title");
    assert(packData.token_count > 0, `Pack has token_count (${packData.token_count})`);
  }

  // Rate limit - no API key, should still work for basic queries
  const noKeyRes = await fetch(`${BASE}/api/v1/packs?limit=1`);
  assert(noKeyRes.ok, "Works without API key");

  // Invalid API key
  const badKeyRes = await fetch(`${BASE}/api/v1/packs?limit=1`, {
    headers: { "x-api-key": "invalid_key_12345" },
  });
  assert(badKeyRes.status === 401, "Invalid API key returns 401");

  // Download endpoint requires auth
  const downloadRes = await fetch(`${BASE}/api/v1/packs/download`);
  assert(
    downloadRes.status === 401 || downloadRes.status === 400,
    `Download endpoint requires auth (${downloadRes.status})`
  );
}

async function testSignupLogin() {
  console.log("\n=== Auth Tests ===");

  const ts = Date.now();

  // Signup
  const signupRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: {
      apikey: ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: `test-${ts}@codexlib-test.com`,
      password: "testpassword123",
      data: { full_name: "Test Runner" },
    }),
  });
  const signupData = await signupRes.json();
  assert(!!signupData.access_token, "Signup returns access token");
  assert(signupData.user?.email_confirmed_at !== null, "Email auto-confirmed");

  // Login
  const loginRes = await fetch(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        apikey: ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: `test-${ts}@codexlib-test.com`,
        password: "testpassword123",
      }),
    }
  );
  const loginData = await loginRes.json();
  assert(!!loginData.access_token, "Login returns access token");
}

async function testOtherAPIs() {
  console.log("\n=== Other API Tests ===");

  const booksRes = await fetch(`${BASE}/api/v1/books`);
  assert(booksRes.ok, `GET /api/v1/books → ${booksRes.status}`);

  const vaultsRes = await fetch(`${BASE}/api/v1/vaults`);
  assert(vaultsRes.ok, `GET /api/v1/vaults → ${vaultsRes.status}`);

  const marketRes = await fetch(`${BASE}/api/v1/marketplace`);
  assert(marketRes.ok, `GET /api/v1/marketplace → ${marketRes.status}`);
}

async function main() {
  console.log("CodexLib API Test Suite");
  console.log("======================");

  await testPagesReturn200();
  await testAuthProtectedRedirects();
  await testPacksAPI();
  await testSignupLogin();
  await testOtherAPIs();

  console.log(`\n======================`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
