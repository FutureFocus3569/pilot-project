-- Insert dummy occupancy data for all centres with realistic monthly data
-- This will give us a good visual representation of the dashboard

-- Delete any existing occupancy data first
DELETE FROM "occupancy_data";

-- Papamoa Beach Kindy (centre_001) - 18 months of data (totalCount = u2Count + o2Count)
INSERT INTO "occupancy_data" ("id", "centreId", "date", "u2Count", "o2Count", "totalCount", "createdAt", "updatedAt") VALUES
('occ_001_202401', 'centre_001', '2024-01-01', 71, 23, 94, NOW(), NOW()),
('occ_001_202402', 'centre_001', '2024-02-01', 79, 32, 111, NOW(), NOW()),
('occ_001_202403', 'centre_001', '2024-03-01', 87, 35, 122, NOW(), NOW()),
('occ_001_202404', 'centre_001', '2024-04-01', 82, 35, 117, NOW(), NOW()),
('occ_001_202405', 'centre_001', '2024-05-01', 100, 34, 134, NOW(), NOW()),
('occ_001_202406', 'centre_001', '2024-06-01', 101, 37, 138, NOW(), NOW()),
('occ_001_202407', 'centre_001', '2024-07-01', 112, 40, 152, NOW(), NOW()),
('occ_001_202408', 'centre_001', '2024-08-01', 79, 49, 128, NOW(), NOW()),
('occ_001_202409', 'centre_001', '2024-09-01', 87, 49, 136, NOW(), NOW()),
('occ_001_202410', 'centre_001', '2024-10-01', 83, 48, 131, NOW(), NOW()),
('occ_001_202411', 'centre_001', '2024-11-01', 91, 52, 143, NOW(), NOW()),
('occ_001_202412', 'centre_001', '2024-12-01', 78, 41, 119, NOW(), NOW()),
('occ_001_202501', 'centre_001', '2025-01-01', 89, 45, 134, NOW(), NOW()),
('occ_001_202502', 'centre_001', '2025-02-01', 95, 48, 143, NOW(), NOW()),
('occ_001_202503', 'centre_001', '2025-03-01', 102, 51, 153, NOW(), NOW()),
('occ_001_202504', 'centre_001', '2025-04-01', 88, 47, 135, NOW(), NOW()),
('occ_001_202505', 'centre_001', '2025-05-01', 94, 49, 143, NOW(), NOW()),
('occ_001_202506', 'centre_001', '2025-06-01', 97, 52, 149, NOW(), NOW());

-- The Boulevard Kindy (centre_002) - 18 months of data (totalCount = u2Count + o2Count)
INSERT INTO "occupancy_data" ("id", "centreId", "date", "u2Count", "o2Count", "totalCount", "createdAt", "updatedAt") VALUES
('occ_002_202401', 'centre_002', '2024-01-01', 45, 38, 83, NOW(), NOW()),
('occ_002_202402', 'centre_002', '2024-02-01', 52, 41, 93, NOW(), NOW()),
('occ_002_202403', 'centre_002', '2024-03-01', 49, 39, 88, NOW(), NOW()),
('occ_002_202404', 'centre_002', '2024-04-01', 54, 42, 96, NOW(), NOW()),
('occ_002_202405', 'centre_002', '2024-05-01', 58, 45, 103, NOW(), NOW()),
('occ_002_202406', 'centre_002', '2024-06-01', 61, 47, 108, NOW(), NOW()),
('occ_002_202407', 'centre_002', '2024-07-01', 55, 43, 98, NOW(), NOW()),
('occ_002_202408', 'centre_002', '2024-08-01', 59, 46, 105, NOW(), NOW()),
('occ_002_202409', 'centre_002', '2024-09-01', 62, 48, 110, NOW(), NOW()),
('occ_002_202410', 'centre_002', '2024-10-01', 57, 44, 101, NOW(), NOW()),
('occ_002_202411', 'centre_002', '2024-11-01', 60, 47, 107, NOW(), NOW()),
('occ_002_202412', 'centre_002', '2024-12-01', 53, 40, 93, NOW(), NOW()),
('occ_002_202501', 'centre_002', '2025-01-01', 58, 45, 103, NOW(), NOW()),
('occ_002_202502', 'centre_002', '2025-02-01', 61, 48, 109, NOW(), NOW()),
('occ_002_202503', 'centre_002', '2025-03-01', 64, 50, 114, NOW(), NOW()),
('occ_002_202504', 'centre_002', '2025-04-01', 59, 46, 105, NOW(), NOW()),
('occ_002_202505', 'centre_002', '2025-05-01', 62, 49, 111, NOW(), NOW()),
('occ_002_202506', 'centre_002', '2025-06-01', 65, 51, 116, NOW(), NOW());

-- The Bach Kindy (centre_003) - 18 months of data (totalCount = u2Count + o2Count)
INSERT INTO "occupancy_data" ("id", "centreId", "date", "u2Count", "o2Count", "totalCount", "createdAt", "updatedAt") VALUES
('occ_003_202401', 'centre_003', '2024-01-01', 34, 28, 62, NOW(), NOW()),
('occ_003_202402', 'centre_003', '2024-02-01', 38, 31, 69, NOW(), NOW()),
('occ_003_202403', 'centre_003', '2024-03-01', 41, 33, 74, NOW(), NOW()),
('occ_003_202404', 'centre_003', '2024-04-01', 36, 29, 65, NOW(), NOW()),
('occ_003_202405', 'centre_003', '2024-05-01', 42, 34, 76, NOW(), NOW()),
('occ_003_202406', 'centre_003', '2024-06-01', 45, 36, 81, NOW(), NOW()),
('occ_003_202407', 'centre_003', '2024-07-01', 39, 32, 71, NOW(), NOW()),
('occ_003_202408', 'centre_003', '2024-08-01', 43, 35, 78, NOW(), NOW()),
('occ_003_202409', 'centre_003', '2024-09-01', 46, 37, 83, NOW(), NOW()),
('occ_003_202410', 'centre_003', '2024-10-01', 41, 33, 74, NOW(), NOW()),
('occ_003_202411', 'centre_003', '2024-11-01', 44, 36, 80, NOW(), NOW()),
('occ_003_202412', 'centre_003', '2024-12-01', 37, 30, 67, NOW(), NOW()),
('occ_003_202501', 'centre_003', '2025-01-01', 42, 34, 76, NOW(), NOW()),
('occ_003_202502', 'centre_003', '2025-02-01', 45, 37, 82, NOW(), NOW()),
('occ_003_202503', 'centre_003', '2025-03-01', 48, 39, 87, NOW(), NOW()),
('occ_003_202504', 'centre_003', '2025-04-01', 43, 35, 78, NOW(), NOW()),
('occ_003_202505', 'centre_003', '2025-05-01', 46, 38, 84, NOW(), NOW()),
('occ_003_202506', 'centre_003', '2025-06-01', 49, 40, 89, NOW(), NOW());

-- Terrace Views Kindy (centre_004) - 18 months of data (totalCount = u2Count + o2Count)
INSERT INTO "occupancy_data" ("id", "centreId", "date", "u2Count", "o2Count", "totalCount", "createdAt", "updatedAt") VALUES
('occ_004_202401', 'centre_004', '2024-01-01', 52, 43, 95, NOW(), NOW()),
('occ_004_202402', 'centre_004', '2024-02-01', 58, 47, 105, NOW(), NOW()),
('occ_004_202403', 'centre_004', '2024-03-01', 55, 45, 100, NOW(), NOW()),
('occ_004_202404', 'centre_004', '2024-04-01', 61, 49, 110, NOW(), NOW()),
('occ_004_202405', 'centre_004', '2024-05-01', 64, 52, 116, NOW(), NOW()),
('occ_004_202406', 'centre_004', '2024-06-01', 67, 54, 121, NOW(), NOW()),
('occ_004_202407', 'centre_004', '2024-07-01', 59, 48, 107, NOW(), NOW()),
('occ_004_202408', 'centre_004', '2024-08-01', 63, 51, 114, NOW(), NOW()),
('occ_004_202409', 'centre_004', '2024-09-01', 66, 53, 119, NOW(), NOW()),
('occ_004_202410', 'centre_004', '2024-10-01', 60, 49, 109, NOW(), NOW()),
('occ_004_202411', 'centre_004', '2024-11-01', 64, 52, 116, NOW(), NOW()),
('occ_004_202412', 'centre_004', '2024-12-01', 56, 46, 102, NOW(), NOW()),
('occ_004_202501', 'centre_004', '2025-01-01', 62, 50, 112, NOW(), NOW()),
('occ_004_202502', 'centre_004', '2025-02-01', 65, 53, 118, NOW(), NOW()),
('occ_004_202503', 'centre_004', '2025-03-01', 68, 55, 123, NOW(), NOW()),
('occ_004_202504', 'centre_004', '2025-04-01', 63, 51, 114, NOW(), NOW()),
('occ_004_202505', 'centre_004', '2025-05-01', 66, 54, 120, NOW(), NOW()),
('occ_004_202506', 'centre_004', '2025-06-01', 69, 56, 125, NOW(), NOW());

-- Livingstone Drive Kindy (centre_005) - 18 months of data (totalCount = u2Count + o2Count)
INSERT INTO "occupancy_data" ("id", "centreId", "date", "u2Count", "o2Count", "totalCount", "createdAt", "updatedAt") VALUES
('occ_005_202401', 'centre_005', '2024-01-01', 28, 22, 50, NOW(), NOW()),
('occ_005_202402', 'centre_005', '2024-02-01', 32, 25, 57, NOW(), NOW()),
('occ_005_202403', 'centre_005', '2024-03-01', 35, 28, 63, NOW(), NOW()),
('occ_005_202404', 'centre_005', '2024-04-01', 30, 24, 54, NOW(), NOW()),
('occ_005_202405', 'centre_005', '2024-05-01', 36, 29, 65, NOW(), NOW()),
('occ_005_202406', 'centre_005', '2024-06-01', 39, 31, 70, NOW(), NOW()),
('occ_005_202407', 'centre_005', '2024-07-01', 33, 26, 59, NOW(), NOW()),
('occ_005_202408', 'centre_005', '2024-08-01', 37, 30, 67, NOW(), NOW()),
('occ_005_202409', 'centre_005', '2024-09-01', 40, 32, 72, NOW(), NOW()),
('occ_005_202410', 'centre_005', '2024-10-01', 35, 28, 63, NOW(), NOW()),
('occ_005_202411', 'centre_005', '2024-11-01', 38, 31, 69, NOW(), NOW()),
('occ_005_202412', 'centre_005', '2024-12-01', 31, 25, 56, NOW(), NOW()),
('occ_005_202501', 'centre_005', '2025-01-01', 36, 29, 65, NOW(), NOW()),
('occ_005_202502', 'centre_005', '2025-02-01', 39, 32, 71, NOW(), NOW()),
('occ_005_202503', 'centre_005', '2025-03-01', 42, 34, 76, NOW(), NOW()),
('occ_005_202504', 'centre_005', '2025-04-01', 37, 30, 67, NOW(), NOW()),
('occ_005_202505', 'centre_005', '2025-05-01', 40, 33, 73, NOW(), NOW()),
('occ_005_202506', 'centre_005', '2025-06-01', 43, 35, 78, NOW(), NOW());
