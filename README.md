# Crido

> **Algerian Buy-Now-Pay-Later fintech platform — MVP for Adrar.**

This repository contains everything Claude Code needs to autonomously build Crido from scratch.

---

## For Claude Code: read these files in this exact order

1. **`CLAUDE.md`** — master context (start here)
2. **`docs/PROJECT_OVERVIEW.md`** — business model, personas, journey
3. **`docs/BUSINESS_RULES.md`** — all the money math and state machines
4. **`docs/ALGERIA_CONTEXT.md`** — banks, payments, wilayas, KYC
5. **`docs/DESIGN_SYSTEM.md`** — brand, colors, typography, components
6. **`docs/DATABASE_SCHEMA.md`** — full SQL schema
7. **`docs/API_DESIGN.md`** — every REST endpoint
8. **`docs/ROADMAP.md`** — sprint-by-sprint build plan
9. **`backend/CLAUDE.md`** — Laravel-specific instructions
10. **`dashboard/CLAUDE.md`** — shared React conventions
11. **`dashboard/admin/CLAUDE.md`** — admin dashboard specs
12. **`dashboard/vendor/CLAUDE.md`** — vendor dashboard specs
13. **`app/CLAUDE.md`** — Flutter mobile app specs

After reading all of these, you have the complete picture and can start building per the roadmap.

---

## Folder structure

```
Crido/
├── README.md                    ← This file
├── CLAUDE.md                    ← Master context for Claude Code
├── docs/                        ← Reference documentation
│   ├── PROJECT_OVERVIEW.md
│   ├── BUSINESS_RULES.md
│   ├── ALGERIA_CONTEXT.md
│   ├── DESIGN_SYSTEM.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_DESIGN.md
│   └── ROADMAP.md
├── backend/                     ← Laravel 13 API
│   └── CLAUDE.md
├── dashboard/
│   ├── CLAUDE.md                ← Shared dashboard conventions
│   ├── admin/                   ← React admin dashboard
│   │   └── CLAUDE.md
│   └── vendor/                  ← React vendor dashboard
│       └── CLAUDE.md
└── app/                         ← Flutter mobile app
    └── CLAUDE.md
```

---

## Quick start for the founder (Ayoub)

Open this folder in Cursor or Claude Code (`claude` command), then say:

> "Read CLAUDE.md, then docs/, then each subfolder's CLAUDE.md. Confirm you understand the project. Then start Sprint 0 from docs/ROADMAP.md."

Claude Code will then bootstrap the four projects (backend, admin, vendor, app) and proceed sprint by sprint.

---

## Tech stack summary

- **Backend:** Laravel 13 + MySQL 8 + Redis + Sanctum
- **Dashboards:** React 19 + Vite + TypeScript + Tailwind CSS 4 + shadcn/ui
- **Mobile:** Flutter 3.x + Riverpod 2 + go_router + dio
- **PDF:** Spatie Browsershot (Puppeteer)
- **Storage:** Cloudflare R2
- **Hosting:** Laravel Cloud / Forge for backend; Vercel for dashboards; TestFlight + Google Play for mobile

---

## What this product is (one paragraph)

A mobile + web platform that lets Algerian consumers buy products at any shop in Adrar and pay in 4 / 6 / 12 monthly installments. The customer applies via the Crido mobile app; the merchant confirms (or the admin verifies an ad-hoc merchant by phone); two PDF contracts are signed; Crido pays the merchant upfront; Crido collects monthly from the customer. Sharia-compatible Murabaha structure — no interest, fixed margin. Revenue from a 5% merchant commission + a duration-based client margin (5–15%). MVP geographic scope: Wilaya of Adrar only.

---

## License

Proprietary — © 2026 Crido. All rights reserved.
