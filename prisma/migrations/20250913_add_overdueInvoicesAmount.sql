-- Migration: Add overdueInvoicesAmount to centres table
ALTER TABLE "centres"
ADD COLUMN "overdueInvoicesAmount" NUMERIC(10,2);
