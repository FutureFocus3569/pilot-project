-- Production Database Setup for Childcare Dashboard
-- This creates all the tables needed for the user management system

-- First, let's create some sample centres
INSERT INTO "public"."centres" (id, name, code, address, phone, email, capacity, "createdAt", "updatedAt") VALUES
('centre_papamoa', 'Papamoa Beach Early Learning', 'CC1', '123 Papamoa Beach Road, Papamoa', '+64 7 572 1234', 'papamoa@childcare.com', 50, NOW(), NOW()),
('centre_mount', 'Mount Maunganui Childcare', 'CC2', '456 Maunganui Road, Mount Maunganui', '+64 7 575 5678', 'mount@childcare.com', 40, NOW(), NOW()),
('centre_tauranga', 'Tauranga Central Learning', 'CC3', '789 Cameron Road, Tauranga', '+64 7 578 9012', 'tauranga@childcare.com', 60, NOW(), NOW()),
('centre_bethlehem', 'Bethlehem Kids Corner', 'CC4', '321 Bethlehem Road, Tauranga', '+64 7 576 3456', 'bethlehem@childcare.com', 35, NOW(), NOW()),
('centre_greerton', 'Greerton Family Centre', 'CC5', '654 Greerton Road, Tauranga', '+64 7 578 7890', 'greerton@childcare.com', 45, NOW(), NOW()),
('centre_hairini', 'Hairini Heights Learning', 'CC6', '987 Hairini Street, Tauranga', '+64 7 579 1234', 'hairini@childcare.com', 30, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create the organization 
INSERT INTO "public"."organizations" (id, name, "createdAt", "updatedAt") VALUES
('org_futurefocus', 'Future Focus Childcare Group', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create master user (you)
INSERT INTO "public"."users" (id, email, name, password, role, "isActive", "organizationId", "createdAt", "updatedAt") VALUES
('user_master', 'courtney@futurefocus.co.nz', 'Courtney Everest', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewZyOUZOB.DY.O/y', 'MASTER', true, 'org_futurefocus', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET 
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = NOW();

-- Give master user access to all centres with full permissions
INSERT INTO "public"."user_centre_permissions" (id, "userId", "centreId", "canViewOccupancy", "canEditOccupancy", "canViewFinancials", "canEditFinancials", "canViewEnrollments", "canEditEnrollments", "canViewReports", "canManageStaff", "createdAt", "updatedAt")
SELECT 
  'perm_master_' || c.id,
  'user_master',
  c.id,
  true, true, true, true, true, true, true, true,
  NOW(), NOW()
FROM "public"."centres" c
ON CONFLICT (id) DO UPDATE SET
  "canViewOccupancy" = true,
  "canEditOccupancy" = true,
  "canViewFinancials" = true,
  "canEditFinancials" = true,
  "canViewEnrollments" = true,
  "canEditEnrollments" = true,
  "canViewReports" = true,
  "canManageStaff" = true,
  "updatedAt" = NOW();

-- Give master user access to all pages
INSERT INTO "public"."user_page_permissions" (id, "userId", page, "canAccess", "createdAt", "updatedAt") VALUES
('page_master_dashboard', 'user_master', 'DASHBOARD', true, NOW(), NOW()),
('page_master_xero', 'user_master', 'XERO', true, NOW(), NOW()),
('page_master_marketing', 'user_master', 'MARKETING', true, NOW(), NOW()),
('page_master_data', 'user_master', 'DATA_MANAGEMENT', true, NOW(), NOW()),
('page_master_admin', 'user_master', 'ADMIN', true, NOW(), NOW()),
('page_master_assistant', 'user_master', 'ASSISTANT', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  "canAccess" = true,
  "updatedAt" = NOW();

-- Create some example users to show the system working
INSERT INTO "public"."users" (id, email, name, password, role, "isActive", "organizationId", "createdAt", "updatedAt") VALUES
('user_admin_sarah', 'sarah@futurefocus.co.nz', 'Sarah Johnson', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewZyOUZOB.DY.O/y', 'ADMIN', true, 'org_futurefocus', NOW(), NOW()),
('user_manager_mike', 'mike@futurefocus.co.nz', 'Mike Chen', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewZyOUZOB.DY.O/y', 'USER', true, 'org_futurefocus', NOW(), NOW()),
('user_staff_emma', 'emma@futurefocus.co.nz', 'Emma Wilson', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewZyOUZOB.DY.O/y', 'USER', true, 'org_futurefocus', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET 
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = NOW();

-- Sarah (Admin) - Access to 3 centres for Dashboard and 2 centres for Xero
INSERT INTO "public"."user_centre_permissions" (id, "userId", "centreId", "canViewOccupancy", "canEditOccupancy", "canViewFinancials", "canEditFinancials", "canViewEnrollments", "canEditEnrollments", "canViewReports", "canManageStaff", "createdAt", "updatedAt") VALUES
('perm_sarah_papamoa', 'user_admin_sarah', 'centre_papamoa', true, true, true, false, true, true, true, false, NOW(), NOW()),
('perm_sarah_mount', 'user_admin_sarah', 'centre_mount', true, true, true, false, true, true, true, false, NOW(), NOW()),
('perm_sarah_tauranga', 'user_admin_sarah', 'centre_tauranga', true, true, true, false, true, true, true, false, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  "canViewOccupancy" = EXCLUDED."canViewOccupancy",
  "canEditOccupancy" = EXCLUDED."canEditOccupancy",
  "canViewFinancials" = EXCLUDED."canViewFinancials",
  "canEditFinancials" = EXCLUDED."canEditFinancials",
  "canViewEnrollments" = EXCLUDED."canViewEnrollments",
  "canEditEnrollments" = EXCLUDED."canEditEnrollments",
  "canViewReports" = EXCLUDED."canViewReports",
  "canManageStaff" = EXCLUDED."canManageStaff",
  "updatedAt" = NOW();

-- Sarah's page permissions
INSERT INTO "public"."user_page_permissions" (id, "userId", page, "canAccess", "createdAt", "updatedAt") VALUES
('page_sarah_dashboard', 'user_admin_sarah', 'DASHBOARD', true, NOW(), NOW()),
('page_sarah_xero', 'user_admin_sarah', 'XERO', true, NOW(), NOW()),
('page_sarah_reports', 'user_admin_sarah', 'DATA_MANAGEMENT', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  "canAccess" = true,
  "updatedAt" = NOW();

-- Mike (Manager) - Access to 2 centres for Dashboard only
INSERT INTO "public"."user_centre_permissions" (id, "userId", "centreId", "canViewOccupancy", "canEditOccupancy", "canViewFinancials", "canEditFinancials", "canViewEnrollments", "canEditEnrollments", "canViewReports", "canManageStaff", "createdAt", "updatedAt") VALUES
('perm_mike_papamoa', 'user_manager_mike', 'centre_papamoa', true, false, false, false, true, false, true, false, NOW(), NOW()),
('perm_mike_mount', 'user_manager_mike', 'centre_mount', true, false, false, false, true, false, true, false, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  "canViewOccupancy" = EXCLUDED."canViewOccupancy",
  "canEditOccupancy" = EXCLUDED."canEditOccupancy",
  "canViewFinancials" = EXCLUDED."canViewFinancials",
  "canEditFinancials" = EXCLUDED."canEditFinancials",
  "canViewEnrollments" = EXCLUDED."canViewEnrollments",
  "canEditEnrollments" = EXCLUDED."canEditEnrollments",
  "canViewReports" = EXCLUDED."canViewReports",
  "canManageStaff" = EXCLUDED."canManageStaff",
  "updatedAt" = NOW();

-- Mike's page permissions (Dashboard only)
INSERT INTO "public"."user_page_permissions" (id, "userId", page, "canAccess", "createdAt", "updatedAt") VALUES
('page_mike_dashboard', 'user_manager_mike', 'DASHBOARD', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  "canAccess" = true,
  "updatedAt" = NOW();

-- Display current setup
SELECT 'User Management Setup Complete!' as status;
SELECT 
  u.email,
  u.name,
  u.role,
  COUNT(ucp.id) as centre_count,
  COUNT(upp.id) as page_count
FROM users u
LEFT JOIN user_centre_permissions ucp ON u.id = ucp."userId"
LEFT JOIN user_page_permissions upp ON u.id = upp."userId"
WHERE u."organizationId" = 'org_futurefocus'
GROUP BY u.id, u.email, u.name, u.role
ORDER BY u.role DESC, u.name;
