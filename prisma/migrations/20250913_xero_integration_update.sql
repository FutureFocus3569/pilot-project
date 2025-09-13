-- Migration for Xero integration schema updates

-- 1. Add tenantId to centres
ALTER TABLE "centres"
ADD COLUMN "tenantId" TEXT;

-- 2. Make xeroAccountCode required in centre_budget_categories
ALTER TABLE "centre_budget_categories"
ALTER COLUMN "xeroAccountCode" SET NOT NULL;

-- 3. Create xero_connections table
CREATE TABLE "xero_connections" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "centreId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP NOT NULL,
    CONSTRAINT "fk_centre" FOREIGN KEY ("centreId") REFERENCES "centres"("id") ON DELETE CASCADE
);
