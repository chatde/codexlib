# CLAUDE.md — CodexLib

## What This Is

Marketplace for AI knowledge packs — compressed, curated expertise that developers can drop into LLM context windows. Integrates TokenShrink for compression and Stripe for payments.

## Tech Stack

- **Framework**: Next.js 16 App Router, React 19, TypeScript strict
- **Database**: Supabase (PostgreSQL + Auth + Storage, 12 tables)
- **Payments**: Stripe (Free: 5 packs/mo, Pro: $12/mo unlimited, Team: $29/mo + priority)
- **Compression**: TokenShrink SDK (`tokenshrink@2.0.0`)
- **Compliance**: API Guardrails (`api-guardrails@1.0.0`)
- **Validation**: Zod v4
- **Styling**: Tailwind 4, lucide-react icons
- **Hosting**: Vercel (target: codexlib.io)
- **GitHub**: chatde/codexlib (SSH protocol)
- **Node**: /opt/homebrew/bin/node

## Key Paths

```
src/                    # Next.js App Router source
src/app/                # Pages and API routes (23 routes)
src/components/         # Shared UI components
supabase/               # SQL migrations and schema
scripts/                # Utility and seed scripts
seeds/                  # Seed content for packs
GAMEPLAN.md             # Full architecture plan and checklist
```

## Development Workflow

```bash
npm run dev      # Dev server
npm run build    # Production build — catches ALL TS errors
npm run lint     # ESLint
npm test         # Run tests

# Deploy
git push origin main   # Triggers Vercel auto-deploy
```

## Project-Specific Rules

- **TypeScript strict**: Never use `any`. Use `unknown`, proper types, or generics. Zero errors before commit.
- **No console.log in production code.**
- **Zod validation**: Validate all API inputs at boundaries using Zod schemas.
- **Supabase**: Needs `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY` in .env.
- **Stripe**: Needs `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in .env.
- **Status**: Not yet live — needs Supabase project (create first), Stripe setup, domain codexlib.io on Namecheap.
- **Git**: SSH protocol (chatde on GitHub). Deploy by pushing to main — Vercel auto-deploys.
- **GAMEPLAN.md**: Read before starting new features — it is the authoritative architecture document.
