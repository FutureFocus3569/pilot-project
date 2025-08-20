-- Insert your organization and actual childcare centres
INSERT INTO "organizations" ("id", "name", "slug", "createdAt", "updatedAt") 
VALUES ('org_your_centres', 'Your Childcare Group', 'your-childcare', NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

-- Insert your 5 actual childcare centres (matching your CSV exactly)
INSERT INTO "centres" ("id", "name", "code", "address", "phone", "capacity", "organizationId", "createdAt", "updatedAt") VALUES
('centre_001', 'Livingstone Drive', 'LD1', 'Livingstone Drive Location', '(07) 3000 1001', 65, 'org_your_centres', NOW(), NOW()),
('centre_002', 'Papamoa Beach', 'PB1', 'Papamoa Beach Location', '(07) 3000 1002', 95, 'org_your_centres', NOW(), NOW()),
('centre_003', 'The Boulevard', 'TB1', 'The Boulevard Location', '(07) 3000 1003', 90, 'org_your_centres', NOW(), NOW()),
('centre_004', 'Terrace Views', 'TV1', 'Terrace Views Location', '(07) 3000 1004', 100, 'org_your_centres', NOW(), NOW()),
('centre_005', 'The Bach', 'BC1', 'The Bach Location', '(07) 3000 1005', 95, 'org_your_centres', NOW(), NOW())
ON CONFLICT ("code") DO NOTHING;
