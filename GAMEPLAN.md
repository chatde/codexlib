# CodexLib — The Library of Alexandria for AI

## What Is It
A curated repository of 10,000+ deep knowledge bases in compressed, AI-optimized format. Each "book" is a **Knowledge Pack** — self-contained JSON with a Rosetta decoder header so any AI can decompress on-the-fly. Uses TokenShrink compression to save ~15% tokens.

## Business Model
- **Free tier:** Browse, search, preview (20% of content), 3 downloads total
- **Pro tier:** $15/mo — unlimited downloads, full content, bulk API, priority support
- **Community submissions:** Users submit knowledge packs, auto-compressed + validated

## Tech Stack
- **Frontend:** Next.js 16 (App Router, TypeScript, Tailwind CSS v4)
- **Backend/DB/Auth:** Supabase (PostgreSQL + Auth + RLS)
- **Payments:** Stripe (Checkout + webhooks + customer portal)
- **Compression:** TokenShrink SDK v2.0.0
- **Hosting:** Vercel (free tier)
- **Domain:** codexlib.io (Namecheap)

## Project Structure
```
/Volumes/AI-Models/codexlib/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page (hero, stats, featured)
│   │   ├── layout.tsx                  # Root layout (dark theme, navbar, footer)
│   │   ├── globals.css                 # Global styles (gold #D4A843 accent)
│   │   ├── login/page.tsx              # Email/password + Google OAuth
│   │   ├── signup/page.tsx             # Registration
│   │   ├── browse/page.tsx             # Domain grid (50 domains)
│   │   ├── browse/[domain]/page.tsx    # Domain detail + subdomains
│   │   ├── browse/[domain]/[sub]/page.tsx # Subdomain pack list
│   │   ├── pack/[slug]/page.tsx        # Pack detail + download
│   │   ├── search/page.tsx             # Search with filters
│   │   ├── library/page.tsx            # User's saved packs
│   │   ├── pricing/page.tsx            # Free vs Pro comparison
│   │   ├── settings/page.tsx           # Profile, subscription, API key
│   │   ├── submit/page.tsx             # Community pack submission
│   │   ├── my-packs/page.tsx           # User's submissions + status
│   │   ├── api-docs/page.tsx           # REST API documentation
│   │   ├── admin/generate/page.tsx     # Admin: generate packs
│   │   ├── admin/review/page.tsx       # Admin: review queue
│   │   ├── auth/callback/route.ts      # OAuth callback
│   │   └── api/
│   │       ├── stripe/checkout/route.ts
│   │       ├── stripe/portal/route.ts
│   │       ├── stripe/webhook/route.ts
│   │       ├── submit/route.ts
│   │       └── v1/packs/
│   │           ├── route.ts            # GET: list/search packs
│   │           ├── [id]/route.ts       # GET: single pack
│   │           └── download/route.ts   # GET: bulk download (pro)
│   ├── components/
│   │   ├── navbar.tsx
│   │   ├── footer.tsx
│   │   ├── pack-card.tsx
│   │   └── domain-card.tsx
│   ├── lib/
│   │   ├── utils.ts                    # cn(), truncateContent(), slugify()
│   │   ├── types.ts                    # All TypeScript interfaces
│   │   ├── stripe.ts                   # Stripe client + helpers
│   │   ├── supabase/client.ts          # Browser client
│   │   ├── supabase/server.ts          # Server + service role clients
│   │   ├── supabase/middleware.ts      # Session refresh + route protection
│   │   └── actions/
│   │       ├── packs.ts                # Server actions: CRUD operations
│   │       └── auth.ts                 # Server actions: login/signup/signout
│   ├── middleware.ts                   # Route matcher
│   └── types/modules.d.ts             # Type declarations for tokenshrink, api-guardrails
├── supabase/
│   ├── schema.sql                      # 12 tables + RLS + triggers + indexes
│   └── seed-domains.sql                # 50 domains + 100 subdomains
├── .env.local                          # Environment variables (gitignored)
└── package.json
```

## Database Schema (12 tables)
1. **profiles** — extends auth.users
2. **domains** — 50 top-level categories
3. **subdomains** — linked to domains
4. **packs** — knowledge packs (the core entity)
5. **tags** — searchable tags
6. **pack_tags** — many-to-many
7. **pack_prerequisites** — prerequisite chains
8. **user_library** — saved packs
9. **user_downloads** — download history + free tier tracking
10. **subscriptions** — Stripe subscription status
11. **reviews** — ratings + comments
12. **submissions** — community pack submissions

## REST API
- `GET /api/v1/packs` — paginated, filterable (domain, search, difficulty)
- `GET /api/v1/packs/:id` — single pack (20% preview free, full for pro)
- `GET /api/v1/packs/download` — bulk download (pro only, up to 100)
- Auth via `x-api-key` header
- Rate limits: 10/day free, 1,000/day pro

## Knowledge Pack Format (.codexlib)
```json
{
  "id": "med-cardiology-001",
  "title": "Cardiology Fundamentals",
  "domain": "Medicine",
  "version": "1.0.0",
  "compression": "tokenshrink-v2",
  "token_count": 2847,
  "savings_pct": 16.3,
  "rosetta": "[DECODE] heart=cardiac organ|bp=blood pressure|...",
  "content": "## Cardiac Anatomy\nheart: 4-chamber muscular organ...",
  "difficulty": "intermediate"
}
```

## Content Pipeline
```
Claude generates knowledge → TokenShrink compresses → Admin reviews → Publish
Community submits → Auto-compress → Auto-validate → Admin reviews → Publish
```

## Setup Steps
1. Create Supabase project → run schema.sql → run seed-domains.sql
2. Copy Supabase URL + keys to .env.local
3. Create Stripe products (Free + Pro $15/mo) → copy keys to .env.local
4. Enable Google OAuth in Supabase dashboard
5. `npm run dev` → verify locally
6. Push to GitHub (chatde/codexlib)
7. Deploy to Vercel → connect GitHub repo
8. Purchase codexlib.io on Namecheap → point to Vercel
9. Configure Stripe webhook URL: https://codexlib.io/api/stripe/webhook

## Status
- [x] Phase 1: Foundation (Next.js, deps, schema, auth)
- [x] Phase 2: Knowledge Pack System (CRUD, detail page, browse)
- [x] Phase 3: Search & Discovery (full-text, filters, preview)
- [x] Phase 4: User Library & Downloads (shelf, .codexlib, free limit)
- [x] Phase 5: Stripe Integration (checkout, webhooks, portal)
- [x] Phase 6: REST API (list, get, bulk download, rate limiting)
- [x] Phase 7: Community Submissions (submit, compress, review)
- [x] Phase 8: Admin & Content Pipeline (generate, review queue)
- [x] Phase 9: Polish & Deploy (landing, dark theme, build passing)

## Next Steps
- [ ] Create Supabase project + run SQL
- [ ] Set up Stripe products
- [ ] Purchase codexlib.io domain
- [ ] Seed initial 100 knowledge packs
- [ ] Deploy to Vercel
- [ ] Add to chatde.dev + ghb.ventures portfolios
