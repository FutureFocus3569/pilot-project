-- Migration: Add xeroTenantId to centre_budget_categories
ALTER TABLE "public"."centre_budget_categories"
ADD COLUMN "xeroTenantId" TEXT;

-- Optional: If you want to enforce that every budget row must have a tenant, uncomment below
-- ALTER TABLE "public"."centre_budget_categories" ALTER COLUMN "xeroTenantId" SET NOT NULL;

-- You may want to backfill this column for existing rows using a join from centreId -> centres -> organizations -> xero_config.xeroTenantId
-- Example (Postgres):
-- UPDATE "public"."centre_budget_categories" cbc
-- SET "xeroTenantId" = xc."xeroTenantId"
-- FROM "public"."centres" ce
-- JOIN "public"."organizations" org ON ce."organizationId" = org."id"
-- JOIN "public"."xero_config" xc ON xc."organizationId" = org."id"
-- WHERE cbc."centreId" = ce."id";
