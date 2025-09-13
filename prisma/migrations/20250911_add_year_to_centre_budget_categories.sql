-- Migration: Add year column to centre_budget_categories for year-specific budgets
ALTER TABLE "public"."centre_budget_categories"
ADD COLUMN "year" INTEGER DEFAULT 2025; -- Set default to current year or NULL if you prefer
