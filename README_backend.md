# Backend Quick Reference

## Essential Scripts & Commands

- `npm run dev` — Start the development server (Next.js)
- `npx prisma migrate deploy` — Apply database migrations
- `npx prisma generate` — Regenerate Prisma client after schema changes
- `node scripts/playwright-scrape-overdue.js` — Run the automation to update overdue invoices
- `scripts/setup-database.ts` — (Optional) Seed or set up sample data

## Automation
- Overdue invoice scraping is scheduled via GitHub Actions (see `.github/workflows/scrape-overdue.yml`).
- Secrets for automation are managed in GitHub repo settings.

## Database
- Managed by Supabase (PostgreSQL)
- Prisma is used for database access and migrations

## Where to get help
- Ask Copilot for step-by-step backend help anytime!
