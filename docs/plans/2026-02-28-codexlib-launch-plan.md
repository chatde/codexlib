# CodexLib Launch Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Launch codexlib.io — the app is built, we need infrastructure, pricing updates, seed content, and deployment.

**Architecture:** Next.js 16 + Supabase + Stripe + Tailwind v4. App code exists and builds. Currently sharing LankaPros Supabase project. Stripe keys are placeholders. Domain not purchased. No seed content.

**Tech Stack:** Next.js 16, React 19, TypeScript strict, Supabase (Auth + DB + Storage), Stripe, Tailwind v4, Vercel, Namecheap

---

## Current State

- App builds cleanly (`npm run build` passes)
- 55 source files across pages, components, lib, API routes
- Schema SQL ready (12 tables, RLS, triggers, indexes)
- Seed SQL ready (50 domains, 100 subdomains)
- Pricing: currently 2 tiers (Free + $15/mo Pro)
- Approved design: 3 tiers (Free 5/mo + $12/mo Pro + $29/mo Team)
- Supabase: sharing LankaPros project (needs dedicated)
- Stripe: placeholder keys
- Domain: not purchased
- Content: 0 knowledge packs

---

### Task 1: Update Pricing to 3 Tiers

**Files:**
- Modify: `src/app/pricing/page.tsx`
- Modify: `src/app/page.tsx` (hero stat + CTA)
- Modify: `src/lib/types.ts` (Subscription.plan type)
- Modify: `supabase/schema.sql` (plan check constraint)

**Step 1: Update the Subscription type**

In `src/lib/types.ts`, change line 98:

```typescript
// Before
plan: "free" | "pro";

// After
plan: "free" | "pro" | "team";
```

**Step 2: Update schema.sql plan constraint**

In `supabase/schema.sql`, change subscriptions table plan CHECK:

```sql
-- Before
plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro')),

-- After
plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team')),
```

**Step 3: Update pricing page to 3 tiers**

Replace `src/app/pricing/page.tsx` features array and grid:

```typescript
const features = [
  { name: "Browse & search packs", free: true, pro: true, team: true },
  { name: "Download packs", free: "5/mo", pro: "Unlimited", team: "Unlimited" },
  { name: "Full pack content", free: false, pro: true, team: true },
  { name: "REST API access", free: false, pro: "1,000/day", team: "10,000/day" },
  { name: "Bulk download (zip)", free: false, pro: true, team: true },
  { name: "Submit your own packs", free: true, pro: true, team: true },
  { name: "Priority support", free: false, pro: false, team: true },
  { name: "Obsidian vault export", free: false, pro: true, team: true },
];
```

Change grid to `grid-cols-1 md:grid-cols-3`. Add Team tier card at $29/mo with border-gold styling. Pro card at $12/mo (was $15).

**Step 4: Update landing page pricing stat**

In `src/app/page.tsx`, change the stats section:

```tsx
// Before
<p className="text-3xl font-bold text-gold">$15</p>
<p className="mt-1 text-sm text-muted">/mo Unlimited</p>

// After
<p className="text-3xl font-bold text-gold">$12</p>
<p className="mt-1 text-sm text-muted">/mo Pro</p>
```

Update CTA text from "3 free packs" to "5 free packs/month":

```tsx
// Before
Start with 3 free packs. Upgrade to Pro for unlimited access

// After
Start with 5 free packs per month. Upgrade to Pro for unlimited access
```

**Step 5: Update download limit logic**

Find the download limit check in the codebase (likely `src/lib/actions/packs.ts` or an API route). Change free tier from 3 total downloads to 5 per month. Ensure `team` plan is treated like `pro` (unlimited).

**Step 6: Build and verify**

Run: `cd /Volumes/AI-Models/codexlib && npm run build`
Expected: Build passes with zero errors

**Step 7: Commit**

```bash
cd /Volumes/AI-Models/codexlib
git add src/app/pricing/page.tsx src/app/page.tsx src/lib/types.ts supabase/schema.sql
git commit -m "feat: update to 3-tier pricing (Free/Pro $12/Team $29)"
```

---

### Task 2: Create Dedicated Supabase Project

This task requires Dad's manual interaction with Supabase dashboard.

**Step 1: Create project on supabase.com**

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Name: `codexlib`
4. Database password: generate strong password, save to password manager
5. Region: West US (closest to San Jose)
6. Click "Create new project"

**Step 2: Run schema SQL**

1. In Supabase dashboard → SQL Editor
2. Paste contents of `supabase/schema.sql` (297 lines)
3. Run
4. Expected: all 12 tables, triggers, and RLS policies created

**Step 3: Run seed domains SQL**

1. In SQL Editor
2. Paste contents of `supabase/seed-domains.sql`
3. Run
4. Expected: 50 domains + 100 subdomains inserted

**Step 4: Enable Google OAuth**

1. Supabase → Authentication → Providers → Google
2. Enable it
3. Add OAuth client ID + secret from Google Cloud Console
4. Set callback URL: `https://codexlib.io/auth/callback`

**Step 5: Create storage bucket**

1. Supabase → Storage → New bucket
2. Name: `knowledge-packs`
3. Public: No (downloads via API only)

**Step 6: Update .env.local**

Update `/Volumes/AI-Models/codexlib/.env.local` with new Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[NEW_PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[NEW_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[NEW_SERVICE_ROLE_KEY]
```

**Step 7: Build and verify**

Run: `cd /Volumes/AI-Models/codexlib && npm run build`
Expected: Build passes (no runtime errors since DB calls are lazy)

**Step 8: Commit**

```bash
cd /Volumes/AI-Models/codexlib
git add .env.local  # NOTE: .env.local is gitignored — this is just updating local
```

No commit needed (env files are gitignored). Just verify build still passes.

---

### Task 3: Set Up Stripe Products

Requires Dad's manual Stripe dashboard work.

**Step 1: Create Stripe products**

1. Go to https://dashboard.stripe.com
2. Products → Add product
3. Product 1: "CodexLib Pro"
   - Price: $12/month, recurring
   - Copy price ID (e.g., `price_xxx`)
4. Product 2: "CodexLib Team"
   - Price: $29/month, recurring
   - Copy price ID

**Step 2: Update .env.local**

```env
STRIPE_SECRET_KEY=sk_live_xxx  # or sk_test_xxx for testing
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx  # Set after Vercel deploy
STRIPE_PRO_PRICE_ID=price_[pro_id]
STRIPE_TEAM_PRICE_ID=price_[team_id]
```

**Step 3: Update checkout route for Team tier**

In `src/app/api/stripe/checkout/route.ts`, ensure it handles `plan: 'team'` by mapping to `STRIPE_TEAM_PRICE_ID`. Add the env var lookup:

```typescript
const priceId = plan === 'team'
  ? process.env.STRIPE_TEAM_PRICE_ID
  : process.env.STRIPE_PRO_PRICE_ID;
```

**Step 4: Update webhook route for Team tier**

In `src/app/api/stripe/webhook/route.ts`, ensure `customer.subscription.updated` handler maps the Team price ID to `plan: 'team'` in the subscriptions table.

**Step 5: Build and verify**

Run: `cd /Volumes/AI-Models/codexlib && npm run build`
Expected: Build passes

**Step 6: Commit**

```bash
cd /Volumes/AI-Models/codexlib
git add src/app/api/stripe/checkout/route.ts src/app/api/stripe/webhook/route.ts
git commit -m "feat: add Team tier Stripe integration"
```

---

### Task 4: Purchase Domain + Configure DNS

Requires Dad's manual Namecheap interaction.

**Step 1: Purchase domain**

1. Go to https://www.namecheap.com
2. Search for `codexlib.io`
3. Purchase (should be ~$25-35/year for .io)
4. Keep default Namecheap DNS for now

**Step 2: Add to Vercel (after Task 6)**

Will configure DNS after Vercel deployment. Vercel will provide the DNS records.

---

### Task 5: Generate Seed Knowledge Packs

**Files:**
- Create: `scripts/generate-seed-packs.ts`
- Create: `seeds/packs/` directory with 10 JSON files

**Step 1: Create the seed pack generator script**

Create `scripts/generate-seed-packs.ts` — a Node script that generates pack JSON files using the `.codexlib` format from the GAMEPLAN. Each pack should contain:

```typescript
interface SeedPack {
  slug: string;
  title: string;
  domain_slug: string;      // matches seed-domains.sql
  subdomain_slug: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
  content_raw: string;       // ~2000-3000 word knowledge base
  rosetta: string;           // TokenShrink decoder header
  content_compressed: string; // compressed version
}
```

**Step 2: Create 10 seed packs**

Create files in `seeds/packs/`:

1. `seeds/packs/dentistry-fundamentals.json`
2. `seeds/packs/legal-assistant-basics.json`
3. `seeds/packs/hr-management.json`
4. `seeds/packs/software-engineering-patterns.json`
5. `seeds/packs/accounting-bookkeeping.json`
6. `seeds/packs/real-estate-agent.json`
7. `seeds/packs/customer-support-pro.json`
8. `seeds/packs/marketing-copywriting.json`
9. `seeds/packs/solidity-smart-contracts.json`
10. `seeds/packs/data-science-fundamentals.json`

Each pack should be a genuine, useful knowledge base — not placeholder text. 2000-3000 words of real domain expertise that would help an LLM become competent in that field.

**Step 3: Create upload script**

Create `scripts/upload-seeds.ts` — reads each JSON from `seeds/packs/`, inserts into Supabase `packs` table with `status: 'approved'` and `is_free: true` (first 3) or `is_free: false` (rest).

```typescript
// scripts/upload-seeds.ts
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function uploadSeeds() {
  const packsDir = path.join(__dirname, '../seeds/packs');
  const files = fs.readdirSync(packsDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const pack = JSON.parse(fs.readFileSync(path.join(packsDir, file), 'utf-8'));

    // Look up domain_id and subdomain_id from slugs
    const { data: domain } = await supabase
      .from('domains')
      .select('id')
      .eq('slug', pack.domain_slug)
      .single();

    let subdomain_id = null;
    if (pack.subdomain_slug) {
      const { data: sub } = await supabase
        .from('subdomains')
        .select('id')
        .eq('slug', pack.subdomain_slug)
        .eq('domain_id', domain!.id)
        .single();
      subdomain_id = sub?.id;
    }

    const { error } = await supabase.from('packs').insert({
      slug: pack.slug,
      title: pack.title,
      domain_id: domain!.id,
      subdomain_id,
      difficulty: pack.difficulty,
      content_compressed: pack.content_compressed,
      rosetta: pack.rosetta,
      token_count: pack.token_count,
      uncompressed_estimate: pack.uncompressed_estimate,
      savings_pct: pack.savings_pct,
      status: 'approved',
      is_free: pack.is_free ?? false,
    });

    if (error) console.error(`Failed: ${file}`, error.message);
    else console.log(`Uploaded: ${pack.title}`);
  }
}

uploadSeeds();
```

**Step 4: Run seed upload**

Run: `cd /Volumes/AI-Models/codexlib && npx tsx scripts/upload-seeds.ts`
Expected: 10 packs uploaded, 0 errors

**Step 5: Verify in Supabase**

Check Supabase dashboard → Table Editor → packs: should see 10 rows with `status: approved`

**Step 6: Commit**

```bash
cd /Volumes/AI-Models/codexlib
git add scripts/generate-seed-packs.ts scripts/upload-seeds.ts seeds/packs/
git commit -m "feat: add 10 seed knowledge packs for launch"
```

---

### Task 6: Deploy to Vercel

**Step 1: Push to GitHub**

```bash
cd /Volumes/AI-Models/codexlib
gh repo create chatde/codexlib --private --source=. --push
```

**Step 2: Deploy to Vercel**

```bash
cd /Volumes/AI-Models/codexlib && vercel deploy --prod --yes
```

Or link via Vercel dashboard:
1. Go to https://vercel.com/dashboard
2. Import → GitHub → chatde/codexlib
3. Framework: Next.js
4. Add environment variables from `.env.local`
5. Deploy

**Step 3: Verify deployment**

Run: `curl -s https://codexlib.vercel.app | head -20`
Expected: HTML with "Library of Alexandria for AI"

**Step 4: Add custom domain**

```bash
vercel domains add codexlib.io
```

Vercel will provide DNS records. Update Namecheap DNS:
- Type A: `@` → Vercel IP (76.76.21.21)
- Type CNAME: `www` → `cname.vercel-dns.com`

**Step 5: Configure Stripe webhook**

1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://codexlib.io/api/stripe/webhook`
3. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy webhook secret → update `STRIPE_WEBHOOK_SECRET` in Vercel env vars

**Step 6: Verify live site**

Open: `https://codexlib.io`
Expected: Landing page loads, browse shows 50 domains, 10 packs visible

---

### Task 7: Update Portfolio Sites

**Files:**
- Modify: `/Volumes/AI-Models/ghb-ventures/lib/ventures.js` (status: "Launching" → "Live")
- Modify: `/Volumes/AI-Models/chatde-dev/app/page.js` (status: "Launching" → "Live")

**Step 1: Update ghb.ventures**

In `lib/ventures.js`, find the CodexLib entry and change `status: "Launching"` → `status: "Live"`.

**Step 2: Update chatde.dev**

In `app/page.js`, find the CodexLib entry and change `status: "Launching"` → `status: "Live"`.

**Step 3: Deploy both**

```bash
cd /Volumes/AI-Models/ghb-ventures && vercel deploy --prod --yes
cd /Volumes/AI-Models/chatde-dev && vercel deploy --prod --yes
```

**Step 4: Commit both**

```bash
cd /Volumes/AI-Models/ghb-ventures
git add lib/ventures.js && git commit -m "chore: update CodexLib status to Live"

cd /Volumes/AI-Models/chatde-dev
git add app/page.js && git commit -m "chore: update CodexLib status to Live"
```

---

## Task Dependency Graph

```
Task 1 (Pricing)         ─┐
Task 2 (Supabase) ────────┤
Task 3 (Stripe)   ────────┼──→ Task 5 (Seeds) ──→ Task 6 (Deploy) ──→ Task 7 (Portfolio)
Task 4 (Domain)   ────────┘
```

Tasks 1-4 are independent and can run in parallel.
Task 5 requires Task 2 (Supabase must exist to upload seeds).
Task 6 requires Tasks 1-5.
Task 7 requires Task 6.

---

## Manual Steps Summary (Dad must do)

| Step | Where | What |
|------|-------|------|
| Task 2.1 | supabase.com | Create `codexlib` project |
| Task 2.4 | Supabase + Google Cloud | Enable Google OAuth |
| Task 3.1 | stripe.com | Create Pro ($12) + Team ($29) products |
| Task 4.1 | namecheap.com | Purchase `codexlib.io` |
| Task 6.4 | Namecheap DNS | Point domain to Vercel |
| Task 6.5 | stripe.com | Create webhook endpoint |
