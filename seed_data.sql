-- Insert sample organization and childcare centres
INSERT INTO "organizations" ("id", "name", "slug", "createdAt", "updatedAt") 
VALUES ('org_sample_123', 'Sample Childcare Group', 'sample-childcare', NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

-- Insert the 6 childcare centres
INSERT INTO "centres" ("id", "name", "code", "address", "phone", "capacity", "organizationId", "createdAt", "updatedAt") VALUES
('centre_001', 'Sunshine Early Learning', 'CC1', '123 Main Street, Brisbane QLD 4000', '(07) 3000 1001', 50, 'org_sample_123', NOW(), NOW()),
('centre_002', 'Rainbow Kids Centre', 'CC2', '456 Oak Avenue, Brisbane QLD 4001', '(07) 3000 1002', 45, 'org_sample_123', NOW(), NOW()),
('centre_003', 'Little Explorers', 'CC3', '789 Pine Road, Brisbane QLD 4002', '(07) 3000 1003', 60, 'org_sample_123', NOW(), NOW()),
('centre_004', 'Happy Hearts Childcare', 'CC4', '321 Elm Street, Brisbane QLD 4003', '(07) 3000 1004', 40, 'org_sample_123', NOW(), NOW()),
('centre_005', 'Bright Beginnings', 'CC5', '654 Maple Lane, Brisbane QLD 4004', '(07) 3000 1005', 55, 'org_sample_123', NOW(), NOW()),
('centre_006', 'Adventure Kids Academy', 'CC6', '987 Cedar Court, Brisbane QLD 4005', '(07) 3000 1006', 65, 'org_sample_123', NOW(), NOW())
ON CONFLICT ("code") DO NOTHING;

-- Insert some sample occupancy data for the current month
INSERT INTO "occupancy_data" ("id", "centreId", "date", "u2Count", "o2Count", "totalOccupancy", "createdAt", "updatedAt") VALUES
-- Centre 1 data
('occ_001_001', 'centre_001', '2025-08-01', 8, 32, 40, NOW(), NOW()),
('occ_001_002', 'centre_001', '2025-08-02', 9, 34, 43, NOW(), NOW()),
('occ_001_003', 'centre_001', '2025-08-05', 7, 31, 38, NOW(), NOW()),

-- Centre 2 data
('occ_002_001', 'centre_002', '2025-08-01', 6, 28, 34, NOW(), NOW()),
('occ_002_002', 'centre_002', '2025-08-02', 8, 30, 38, NOW(), NOW()),
('occ_002_003', 'centre_002', '2025-08-05', 7, 29, 36, NOW(), NOW()),

-- Centre 3 data
('occ_003_001', 'centre_003', '2025-08-01', 10, 38, 48, NOW(), NOW()),
('occ_003_002', 'centre_003', '2025-08-02', 11, 40, 51, NOW(), NOW()),
('occ_003_003', 'centre_003', '2025-08-05', 9, 37, 46, NOW(), NOW())

ON CONFLICT ("centreId", "date") DO NOTHING;
