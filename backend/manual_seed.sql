-- ============================================================================
-- ERP SYSTEM ESSENTIAL DATA SEED
-- Contains only reference data required for system operation
-- NO SAMPLE USERS, WAREHOUSES, OR PRODUCTS
-- ============================================================================

-- Clean up existing data (in correct order to respect foreign keys)
TRUNCATE TABLE goods_receipt_items, goods_receipts, purchase_order_items, purchase_orders, 
               batches, stock_levels, products, units_of_measure, categories, 
               warehouses, user_roles, users, roles CASCADE;

-- ============================================================================
-- 1. ROLES & PERMISSIONS (Essential for system operation)
-- ============================================================================
-- Create Admin Role
INSERT INTO roles (id, name, description, "isActive", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'ADMIN', 'System Administrator', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Create User Role (for regular users)
INSERT INTO roles (id, name, description, "isActive", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'USER', 'Regular User', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 2. PRODUCT CATEGORIES (Essential reference data)
-- ============================================================================
INSERT INTO categories (id, name, code, description, "isActive", "createdAt", "updatedAt")
VALUES 
    (gen_random_uuid(), 'Electronics', 'CAT001', 'Electronic devices and accessories', true, NOW(), NOW()),
    (gen_random_uuid(), 'Clothing', 'CAT002', 'Apparel and fashion accessories', true, NOW(), NOW()),
    (gen_random_uuid(), 'Home Goods', 'CAT003', 'Kitchen and home appliances', true, NOW(), NOW()),
    (gen_random_uuid(), 'Sports Equipment', 'CAT004', 'Fitness and sports products', true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 3. UNITS OF MEASURE (Essential reference data)
-- ============================================================================
INSERT INTO units_of_measure (id, name, abbreviation, description, "isActive", "createdAt", "updatedAt")
VALUES 
    (gen_random_uuid(), 'Piece', 'PCS', 'Individual item', true, NOW(), NOW()),
    (gen_random_uuid(), 'Box', 'BOX', 'Box of items', true, NOW(), NOW()),
    (gen_random_uuid(), 'Kilogram', 'KG', 'Weight in kilograms', true, NOW(), NOW()),
    (gen_random_uuid(), 'Set', 'SET', 'Set of items', true, NOW(), NOW())
ON CONFLICT (abbreviation) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
SELECT 'ESSENTIAL DATA SEED COMPLETED!' as status;
SELECT '================================' as separator;
SELECT 'Roles count:' as info, COUNT(*) as total FROM roles;
SELECT 'Categories count:' as info, COUNT(*) as total FROM categories;
SELECT 'Units of Measure count:' as info, COUNT(*) as total FROM units_of_measure;
SELECT 'Users count (should be 0):' as info, COUNT(*) as total FROM users;
SELECT 'Warehouses count (should be 0):' as info, COUNT(*) as total FROM warehouses;
SELECT 'Products count (should be 0):' as info, COUNT(*) as total FROM products;