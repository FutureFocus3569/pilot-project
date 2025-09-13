-- Migration: Add overdueInvoicesAmount to centres
ALTER TABLE "centres"
ADD COLUMN "overdueInvoicesAmount" NUMERIC;
