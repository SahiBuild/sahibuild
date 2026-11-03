# SahiBuild

An AI-first construction marketplace for Bengaluru landowners: instant planning-grade estimates, stage-wise BOQs, PDF quote audits, conceptual Vastu floor plans, verified-builder matching, and a local project workspace.

Built with Next.js 16 (App Router), React 19, Tailwind CSS 4, TypeScript, Zod, the Vercel AI SDK, Prisma, and unpdf.

## What works

- `/` — landing page with a live plot estimator.
- `/scope` — 4-step scoping wizard. Generates a deterministic estimate, optional AI-enriched BOQ, material schedule, approvals, risk flags, CSV export, and a conceptual Vastu floor plan.
- `/audit` — upload a PDF quotation (or load the sample). Extracts text with `unpdf`, checks missing scope, vague charges, rate outliers, and compares against a SahiBuild benchmark.
- `/builders` — filterable directory of verified Bengaluru builders by zone, finish tier, rate, rating, and delivery.
- `/dashboard` — saved estimates stored in browser `localStorage` (`sahibuild_projects`), with quick BOQ, CSV export, and delete.
- `/api/scoping` — estimate + optional LLM BOQ.
- `/api/audit` — PDF upload + rule-based audit.

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The estimator works with no API keys. The LLM path is optional: set `OPENAI_API_KEY` or `LLM_API_KEY` (or `NVIDIA_API_KEY`) and optionally `LLM_BASE_URL`, `LLM_MODEL`, and `LLM_TIMEOUT_MS`. Without a key, `/api/scoping` returns a deterministic BOQ and sets the AI mode accordingly.

## Database

The Prisma schema in `prisma/schema.prisma` targets PostgreSQL and covers users, projects, estimates, line items, floor plans, builder profiles, matches, quote audits, and knowledge chunks.

```bash
npx prisma validate
npx prisma generate
npx prisma migrate dev --name init
```

Persistence is not wired into the UI yet; the MVP workspace uses local storage. Add auth and DB calls before production.

## Commands

```bash
npm run dev
npm run lint
npx tsc --noEmit
npm run build
npm run start
```

## Cost model assumptions

- Ground coverage: 70% up to 4,000 sq.ft, 65% above.
- FAR: 1.75 / 2.25 / 2.75 by road width.
- 2026 base rates: ₹1,950 / 2,400 / 2,900 / 3,500 per sq.ft for Basic / Standard / Premium / Luxury.
- GST 18%, contingency 3%, plus indicative BBMP, BESCOM, BWSSB, labour-cess, and design/liaison costs.
- Basement area is costed separately and excluded from FAR.

All output is planning-grade. It is not a BBMP sanction, structural certificate, or contractor quotation. Verify FAR, setbacks, khata, and approvals with a licensed architect and the relevant authorities.

## Notes

- If npm hits a cache permission error on this machine, use:
  `npm install --cache /var/folders/tt/q_6lzk1s2kq8kw2clm23j0lr0000gn/T/opencode/npm-cache`
- Next.js `cacheComponents` is enabled, so route segment `runtime` exports are not used.
