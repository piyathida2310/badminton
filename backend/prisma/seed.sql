-- Seed data for roles, permissions, and test user

-- Insert sample roles
INSERT INTO "ms_Role" (id, name, description, "createdAt", "updatedAt", "isDeleted") VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Admin', 'System Administrator with full access', NOW(), NOW(), false),
('550e8400-e29b-41d4-a716-446655440002', 'User', 'Regular user with limited access', NOW(), NOW(), false),
('550e8400-e29b-41d4-a716-446655440003', 'Moderator', 'Content moderator with moderate access', NOW(), NOW(), false),
('550e8400-e29b-41d4-a716-446655440004', 'Guest', 'Guest user with read-only access', NOW(), NOW(), false)
ON CONFLICT (name) DO NOTHING;

-- Insert sample permissions
INSERT INTO "ms_Permission" (id, name, description, "createdAt", "updatedAt", "isDeleted") VALUES
('660e8400-e29b-41d4-a716-446655440001', 'user.create', 'Create new users', NOW(), NOW(), false),
('660e8400-e29b-41d4-a716-446655440002', 'user.read', 'View user information', NOW(), NOW(), false),
('660e8400-e29b-41d4-a716-446655440003', 'user.update', 'Update user information', NOW(), NOW(), false),
('660e8400-e29b-41d4-a716-446655440004', 'user.delete', 'Delete users', NOW(), NOW(), false),
('660e8400-e29b-41d4-a716-446655440005', 'role.create', 'Create new roles', NOW(), NOW(), false),
('660e8400-e29b-41d4-a716-446655440006', 'role.read', 'View role information', NOW(), NOW(), false),
('660e8400-e29b-41d4-a716-446655440007', 'role.update', 'Update role information', NOW(), NOW(), false),
('660e8400-e29b-41d4-a716-446655440008', 'role.delete', 'Delete roles', NOW(), NOW(), false),
('660e8400-e29b-41d4-a716-446655440009', 'permission.read', 'View permissions', NOW(), NOW(), false),
('660e8400-e29b-41d4-a716-446655440010', 'content.create', 'Create content', NOW(), NOW(), false),
('660e8400-e29b-41d4-a716-446655440011', 'content.read', 'View content', NOW(), NOW(), false),
('660e8400-e29b-41d4-a716-446655440012', 'content.update', 'Update content', NOW(), NOW(), false),
('660e8400-e29b-41d4-a716-446655440013', 'content.delete', 'Delete content', NOW(), NOW(), false)
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
-- Admin role gets all permissions
INSERT INTO "sa_RolePermission" ("roleId", "permissionId", "createdAt", "createdBy") VALUES
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', NOW(), 'system'),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', NOW(), 'system'),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003', NOW(), 'system'),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440004', NOW(), 'system'),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440005', NOW(), 'system'),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440006', NOW(), 'system'),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440007', NOW(), 'system'),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440008', NOW(), 'system'),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440009', NOW(), 'system'),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440010', NOW(), 'system'),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440011', NOW(), 'system'),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440012', NOW(), 'system'),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440013', NOW(), 'system'),

-- User role gets basic permissions
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', NOW(), 'system'),
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440009', NOW(), 'system'),
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440010', NOW(), 'system'),
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440011', NOW(), 'system'),

-- Moderator role gets content management permissions
('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', NOW(), 'system'),
('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440009', NOW(), 'system'),
('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440010', NOW(), 'system'),
('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440011', NOW(), 'system'),
('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440012', NOW(), 'system'),
('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440013', NOW(), 'system'),

-- Guest role gets only read permissions
('550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002', NOW(), 'system'),
('550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440009', NOW(), 'system'),
('550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440011', NOW(), 'system')
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- Create test user with hashed password (password123)
-- Password hash generated using bcrypt with 12 rounds: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G
INSERT INTO "ss_User" (id, email, "passwordHash", "createdAt", "updatedAt", "isDeleted") VALUES
('770e8400-e29b-41d4-a716-446655440001', 'user@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', NOW(), NOW(), false)
ON CONFLICT (email) DO NOTHING;

-- Assign User role to the test user
INSERT INTO "sa_UserRole" ("userId", "roleId", "createdAt", "createdBy") VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', NOW(), 'system')
ON CONFLICT ("userId", "roleId") DO NOTHING;

-- Display summary
SELECT 'Seed data inserted successfully!' as message;
SELECT COUNT(*) as total_roles FROM "ms_Role" WHERE "isDeleted" = false;
SELECT COUNT(*) as total_permissions FROM "ms_Permission" WHERE "isDeleted" = false;
SELECT COUNT(*) as total_users FROM "ss_User" WHERE "isDeleted" = false;
SELECT COUNT(*) as total_role_permissions FROM "sa_RolePermission";
SELECT COUNT(*) as total_user_roles FROM "sa_UserRole";