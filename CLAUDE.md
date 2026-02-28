# CodexLib — AI Knowledge Pack Marketplace

Marketplace for AI knowledge packs (compressed expertise for LLMs). Next.js 16 + Supabase + Stripe + TokenShrink. GitHub: chatde/codexlib. Owner: Dad — maximum autonomy.

## Commands

```bash
npm run build    # Build — catches ALL TS errors
npm run dev      # Dev server
npm test         # Run tests
```

## Stack & Conventions

- **Framework**: Next.js 16 App Router, React 19, TypeScript strict
- **Database**: Supabase (12 tables)
- **Payments**: Stripe (Free: 5/mo, Pro: $12/mo unlimited, Team: $29/mo + priority)
- **Compression**: TokenShrink SDK for knowledge pack compression
- **API**: REST with rate limiting, 23 routes
- **Formatting**: Follow existing project conventions

## Status

- GAMEPLAN complete at /Volumes/AI-Models/codexlib/GAMEPLAN.md
- Needs: Supabase project + Stripe setup + domain (codexlib.io on Namecheap) + seed content

## Known Pitfalls

- Domain codexlib.io not yet purchased
- No Supabase project created yet
- No Stripe account configured yet
