-- Insert your organization and actual childcare centres
INSERT INTO "organizations" ("id", "name", "slug", "createdAt", "updatedAt") 
VALUES ('org_your_centres', 'Your Childcare Group', 'your-childcare', NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

-- Insert your 6 actual childcare centres
INSERT INTO "centres" ("id", "name", "code", "address", "phone", "capacity", "organizationId", "createdAt", "updatedAt") VALUES
('centre_001', 'Papamoa Beach', 'PB1', 'Papamoa Beach Location', '(07) 3000 1001', 50, 'org_your_centres', NOW(), NOW()),
('centre_002', 'The Boulevard', 'TB1', 'The Boulevard Location', '(07) 3000 1002', 45, 'org_your_centres', NOW(), NOW()),
('centre_003', 'The Bach', 'BC1', 'The Bach Location', '(07) 3000 1003', 60, 'org_your_centres', NOW(), NOW()),
('centre_004', 'Terrace Views', 'TV1', 'Terrace Views Location', '(07) 3000 1004', 40, 'org_your_centres', NOW(), NOW()),
('centre_005', 'Livingstone Drive', 'LD1', 'Livingstone Drive Location', '(07) 3000 1005', 55, 'org_your_centres', NOW(), NOW()),
('centre_006', 'West Dune', 'WD1', 'West Dune Location', '(07) 3000 1006', 65, 'org_your_centres', NOW(), NOW())
ON CONFLICT ("code") DO NOTHING;

-- Insert some sample occupancy data to test
INSERT INTO "occupancy_data" ("id", "centreId", "date", "u2Count", "o2Count", "totalOccupancy", "createdAt", "updatedAt") VALUES
-- Papamoa Beach data
('occ_001_001', 'centre_001', '2025-08-01', 8, 32, 40, NOW(), NOW()),
('occ_001_002', 'centre_001', '2025-08-02', 9, 34, 43, NOW(), NOW()),

-- The Boulevard data
('occ_002_001', 'centre_002', '2025-08-01', 6, 28, 34, NOW(), NOW()),
('occ_002_002', 'centre_002', '2025-08-02', 8, 30, 38, NOW(), NOW()),

-- The Bach data
('occ_003_001', 'centre_003', '2025-08-01', 10, 38, 48, NOW(), NOW()),
('occ_003_002', 'centre_003', '2025-08-02', 11, 40, 51, NOW(), NOW())

ON CONFLICT ("centreId", "date") DO NOTHING;
