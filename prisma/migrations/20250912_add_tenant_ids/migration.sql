-- Add tenantId to centres table
ALTER TABLE centres ADD COLUMN tenantId text;

-- Add xeroTenantId to centre_budget_categories table
ALTER TABLE centre_budget_categories ADD COLUMN xeroTenantId text;
