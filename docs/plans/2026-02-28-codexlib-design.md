# CodexLib — Design Document

**Date:** 2026-02-28
**Status:** Approved
**Owner:** GHB Ventures

---

## Vision

"The Library of Alexandria for AI" — a marketplace of domain knowledge packs that help people build better local AI models and agents. A dentist downloads the "Dentistry" pack and gets everything needed to train or prompt a local LLM to be a dental expert.

## Business Model

- **Free:** 5 pack downloads/month, browse/search
- **Pro ($12/mo):** Unlimited downloads + API access
- **Team ($29/mo):** Bulk downloads + priority support + API
- **Creator revenue share:** 70% platform / 30% creator
- **Content strategy:** Seed 5-10 hand-crafted packs, then invite-only verified contributors who earn from downloads

## Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 16 (App Router) |
| Auth | Supabase Auth (GitHub + Google) |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage (knowledge pack .zip files) |
| Payments | Stripe (subscriptions + checkout) |
| CSS | Tailwind v4 (`@tailwindcss/postcss`, `@theme` in globals.css) |
| Fonts | Geist Sans + Geist Mono (via `next/font/google`) |
| Hosting | Vercel |
| CLI | npm package (`codexlib`) |
| Domain | codexlib.io |

## Architecture

```
codexlib.io (Vercel)
├── Website (Next.js)
│   ├── Landing — hero, featured packs, pricing
│   ├── /explore — browse/search/filter packs
│   ├── /pack/[slug] — detail, preview, download
│   ├── /dashboard — user downloads, usage, subscription
│   ├── /creator — upload, earnings (verified only)
│   ├── /docs — API docs, CLI, pack format spec
│   └── /pricing — Free / Pro / Team
│
├── API (Next.js API routes)
│   ├── /api/packs — CRUD, search, download
│   ├── /api/auth — Supabase OAuth callback
│   ├── /api/billing — Stripe checkout, webhooks
│   └── /api/creator — upload, earnings, verification
│
├── Database (Supabase PostgreSQL)
│   ├── profiles, packs, downloads, creators, subscriptions
│   └── Row-level security policies
│
└── Storage (Supabase Storage)
    └── knowledge-packs/ bucket
```

## Ecosystem Connections

```
┌──────────────────────────────────────────────────────┐
│                    codexlib.io                        │
│         "The Library of Alexandria for AI"            │
├──────────────────────────────────────────────────────┤
│   Browse → Download → Import into your AI workflow   │
└───────┬──────────────┬───────────────┬───────────────┘
        │              │               │
        ▼              ▼               ▼
   ┌─────────┐   ┌──────────┐   ┌──────────────┐
   │ Obsidian │   │ CLI/API  │   │ Raw .zip     │
   │ vault    │   │ pull     │   │ download     │
   │ import   │   │          │   │              │
   └─────────┘   └──────────┘   └──────────────┘
        │              │               │
        ▼              ▼               ▼
   ┌───────────────────────────────────────────────┐
   │  Consumers                                     │
   │                                                │
   │  1. Humans: import to Obsidian, feed to LLMs  │
   │  2. Team agents: pull packs for expertise      │
   │  3. NeuralCube (PRIVATE): knowledge supply     │
   └───────────────────────────────────────────────┘
```

1. **CodexLib packs → Obsidian import** — Packs are markdown-native, drop into any Obsidian vault
2. **Obsidian vaults → CodexLib upload** — Creators export vaults as packs
3. **Team agents → CodexLib consumer** — 21-agent team pulls packs for domain knowledge
4. **NeuralCube → CodexLib dependency** — Private: NeuralCube's on-premise agents consume CodexLib packs as their knowledge supply chain. Not exposed publicly.

## Knowledge Pack Format

A pack is a `.zip` containing Obsidian-compatible markdown:

```
dentistry-pack/
├── pack.json            — metadata (name, version, category, tags, format)
├── README.md            — human-readable overview (vault-ready)
├── knowledge/
│   ├── context.md       — main LLM context / system prompt
│   ├── glossary.md      — domain terminology ([[wikilinks]] supported)
│   ├── procedures.md    — common workflows
│   └── faq.md           — domain Q&A pairs
├── compressed/
│   └── context.shrink   — TokenShrink-compressed version
└── .obsidian/           — (optional) vault settings for standalone use
```

**pack.json schema:**
```json
{
  "name": "Dentistry",
  "slug": "dentistry",
  "version": "1.0.0",
  "category": "Medical",
  "tags": ["dental", "healthcare", "clinical"],
  "format": "obsidian",
  "author": "GHB Ventures",
  "license": "proprietary",
  "files": ["context.md", "glossary.md", "procedures.md", "faq.md"],
  "compressed": true
}
```

**Key insight:** Markdown is the universal format. It works in Obsidian, as LLM context, as Claude Code agent memory, and as NeuralCube training data. One format, four consumers.

## Database Schema

```sql
-- Extends Supabase Auth users
profiles (
  id                     uuid PRIMARY KEY,  -- = auth.users.id
  name                   text,
  avatar_url             text,
  plan                   text DEFAULT 'free',  -- free | pro | team
  stripe_id              text,
  downloads_this_month   int DEFAULT 0,
  created_at             timestamptz DEFAULT now()
)

-- Knowledge packs
packs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              text UNIQUE NOT NULL,
  name              text NOT NULL,
  description       text,
  category          text NOT NULL,
  tags              text[],
  format            text DEFAULT 'obsidian',  -- obsidian | context | claude-md
  version           text DEFAULT '1.0.0',
  file_path         text,                     -- Supabase Storage path
  file_size         int,
  download_count    int DEFAULT 0,
  creator_id        uuid REFERENCES profiles(id),
  is_featured       boolean DEFAULT false,
  status            text DEFAULT 'draft',     -- draft | review | published
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
)

-- Download tracking
downloads (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES profiles(id),
  pack_id     uuid REFERENCES packs(id),
  method      text,    -- web | cli | api
  created_at  timestamptz DEFAULT now()
)

-- Verified creators
creators (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES profiles(id) UNIQUE,
  verified        boolean DEFAULT false,
  bio             text,
  payout_email    text,
  total_earnings  numeric DEFAULT 0,
  created_at      timestamptz DEFAULT now()
)

-- Stripe subscriptions (synced via webhooks)
subscriptions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid REFERENCES profiles(id),
  stripe_sub_id       text,
  plan                text,       -- pro | team
  status              text,       -- active | canceled | past_due
  current_period_end  timestamptz,
  created_at          timestamptz DEFAULT now()
)
```

## Pages

| Route | Purpose | Auth |
|-------|---------|------|
| `/` | Landing — hero, featured packs, categories, pricing | Public |
| `/explore` | Browse/search/filter packs by category, tags, format | Public |
| `/pack/[slug]` | Pack detail — description, preview, download button, creator | Public |
| `/pricing` | Three tiers with Stripe checkout | Public |
| `/dashboard` | User downloads, usage meter, subscription status | Required |
| `/creator` | Upload packs, view earnings, manage listings | Verified |
| `/docs` | API docs, CLI usage, pack format spec, creator guide | Public |
| `/login` | Supabase Auth (GitHub + Google) | Public |
| `/privacy` | Privacy policy | Public |
| `/terms` | Terms of service | Public |

## API Routes

| Route | Method | Purpose | Auth |
|-------|--------|---------|------|
| `/api/packs` | GET | List/search packs | Public |
| `/api/packs/[slug]` | GET | Pack detail | Public |
| `/api/packs/download/[slug]` | POST | Download pack (checks quota) | Required |
| `/api/packs/upload` | POST | Creator uploads pack | Verified |
| `/api/auth/callback` | GET | Supabase OAuth callback | - |
| `/api/billing/checkout` | POST | Create Stripe checkout session | Required |
| `/api/billing/portal` | POST | Stripe customer portal | Required |
| `/api/billing/webhook` | POST | Stripe webhook handler | Stripe sig |
| `/api/creator/apply` | POST | Apply for verified status | Required |
| `/api/creator/earnings` | GET | Creator earnings data | Verified |
| `/api/user/profile` | GET/PUT | Profile + usage stats | Required |

## CLI (npm package: `codexlib`)

```bash
npx codexlib login                        # Auth via browser OAuth
npx codexlib search dental                # Search packs
npx codexlib pull dentistry               # Download to ./codexlib-packs/
npx codexlib pull dentistry --obsidian ~/vault/  # Direct to Obsidian vault
npx codexlib list                         # List downloaded packs
npx codexlib publish ./my-pack/           # Creator upload (verified only)
```

## What We're NOT Building (MVP)

- No reviews/ratings system (v2)
- No pack versioning/updates (v2)
- No Stripe Connect for creator payouts (manual payouts initially)
- No NeuralCube integration UI (private, built separately)
- No pack preview/editor in browser (just metadata + description)
- No mobile app

## Seed Packs (First 5-10)

Hand-crafted by GHB Ventures for launch:
1. Dentistry (medical)
2. Legal Assistant (legal)
3. HR Manager (business)
4. Software Engineering (tech)
5. Accounting/Bookkeeping (finance)
6. Real Estate Agent (sales)
7. Customer Support (service)
8. Marketing Copywriter (creative)
9. Solidity/Smart Contracts (blockchain)
10. Data Science (tech)
