-- ============================================================================
-- COMPREHENSIVE ERP SEED SCRIPT
-- Complete Inventory Management System with Predefined Data
-- ============================================================================

-- Clean up existing data (in correct order to respect foreign keys)
TRUNCATE TABLE goods_receipt_items, goods_receipts, purchase_order_items, purchase_orders, 
               batches, stock_levels, products, units_of_measure, categories, 
               warehouses, users CASCADE;

-- ============================================================================
-- 1. USERS
-- ============================================================================
-- Admin user (password: Admin@123)
INSERT INTO users (id, email, "firstName", "lastName", password, role, "isActive", "createdAt", "updatedAt")
VALUES (
    gen_random_uuid(),
    'admin@erp.com',
    'Admin',
    'User',
    '$2b$10$rQJ5YxF5YxF5YxF5YxF5YeMZj.wZj.wZj.wZj.wZj.wZj.wZj.wZj.w',
    'ADMIN',
    true,
    NOW(),
    NOW()
);

-- ============================================================================
-- 2. WAREHOUSES (3 Major Distribution Centers)
-- ============================================================================
INSERT INTO warehouses (id, name, code, address, city, state, "zipCode", country, capacity, "currentUsage", "isActive", "createdAt", "updatedAt")
VALUES 
    (
        gen_random_uuid(),
        'Main Distribution Center',
        'WH001',
        '123 Industrial Blvd',
        'Chicago',
        'IL',
        '60601',
        'USA',
        10000,
        7500,
        true,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid(),
        'West Coast Facility',
        'WH002',
        '456 Commerce St',
        'Los Angeles',
        'CA',
        '90001',
        'USA',
        8000,
        6200,
        true,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid(),
        'East Coast Hub',
        'WH003',
        '789 Logistics Ave',
        'New York',
        'NY',
        '10001',
        'USA',
        6000,
        4500,
        true,
        NOW(),
        NOW()
    );

-- ============================================================================
-- 3. PRODUCT CATEGORIES
-- ============================================================================
INSERT INTO categories (id, name, code, description, "isActive", "createdAt", "updatedAt")
VALUES 
    (gen_random_uuid(), 'Electronics', 'CAT001', 'Electronic devices and accessories', true, NOW(), NOW()),
    (gen_random_uuid(), 'Clothing', 'CAT002', 'Apparel and fashion accessories', true, NOW(), NOW()),
    (gen_random_uuid(), 'Home Goods', 'CAT003', 'Kitchen and home appliances', true, NOW(), NOW()),
    (gen_random_uuid(), 'Sports Equipment', 'CAT004', 'Fitness and sports products', true, NOW(), NOW());

-- ============================================================================
-- 4. UNITS OF MEASURE
-- ============================================================================
INSERT INTO units_of_measure (id, name, abbreviation, description, "isActive", "createdAt", "updatedAt")
VALUES 
    (gen_random_uuid(), 'Piece', 'PCS', 'Individual item', true, NOW(), NOW()),
    (gen_random_uuid(), 'Box', 'BOX', 'Box of items', true, NOW(), NOW()),
    (gen_random_uuid(), 'Kilogram', 'KG', 'Weight in kilograms', true, NOW(), NOW()),
    (gen_random_uuid(), 'Set', 'SET', 'Set of items', true, NOW(), NOW());

-- ============================================================================
-- 5. PRODUCTS (5 Core Products)
-- ============================================================================
INSERT INTO products (id, name, sku, description, "categoryId", "unitOfMeasureId", "unitPrice", "costPrice", "reorderLevel", "isActive", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(),
    'Wireless Headphones',
    'ELEC-WH-001',
    'Premium wireless headphones with noise cancellation',
    c.id,
    u.id,
    149.99,
    89.99,
    50,
    true,
    NOW(),
    NOW()
FROM categories c, units_of_measure u
WHERE c.code = 'CAT001' AND u.abbreviation = 'PCS';

INSERT INTO products (id, name, sku, description, "categoryId", "unitOfMeasureId", "unitPrice", "costPrice", "reorderLevel", "isActive", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(),
    'Laptop Backpack',
    'CLOTH-LB-002',
    'Durable laptop backpack with multiple compartments',
    c.id,
    u.id,
    59.99,
    35.99,
    30,
    true,
    NOW(),
    NOW()
FROM categories c, units_of_measure u
WHERE c.code = 'CAT002' AND u.abbreviation = 'PCS';

INSERT INTO products (id, name, sku, description, "categoryId", "unitOfMeasureId", "unitPrice", "costPrice", "reorderLevel", "isActive", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(),
    'Coffee Maker',
    'HOME-CM-003',
    'Programmable 12-cup coffee maker',
    c.id,
    u.id,
    89.99,
    54.99,
    25,
    true,
    NOW(),
    NOW()
FROM categories c, units_of_measure u
WHERE c.code = 'CAT003' AND u.abbreviation = 'PCS';

INSERT INTO products (id, name, sku, description, "categoryId", "unitOfMeasureId", "unitPrice", "costPrice", "reorderLevel", "isActive", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(),
    'Yoga Mat',
    'SPRT-YM-004',
    'Non-slip exercise yoga mat with carrying strap',
    c.id,
    u.id,
    29.99,
    17.99,
    40,
    true,
    NOW(),
    NOW()
FROM categories c, units_of_measure u
WHERE c.code = 'CAT004' AND u.abbreviation = 'PCS';

INSERT INTO products (id, name, sku, description, "categoryId", "unitOfMeasureId", "unitPrice", "costPrice", "reorderLevel", "isActive", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(),
    'Smartphone Case',
    'ELEC-SC-005',
    'Protective smartphone case with card holder',
    c.id,
    u.id,
    19.99,
    11.99,
    100,
    true,
    NOW(),
    NOW()
FROM categories c, units_of_measure u
WHERE c.code = 'CAT001' AND u.abbreviation = 'PCS';

-- ============================================================================
-- 6. STOCK LEVELS (Current Inventory Distribution)
-- ============================================================================
-- Wireless Headphones (PROD001) - Total: 230 units
INSERT INTO stock_levels (id, "productId", "warehouseId", quantity, location, "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(),
    p.id,
    w.id,
    150,
    'A-01-02',
    NOW(),
    NOW()
FROM products p, warehouses w
WHERE p.sku = 'ELEC-WH-001' AND w.code = 'WH001';

INSERT INTO stock_levels (id, "productId", "warehouseId", quantity, location, "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(),
    p.id,
    w.id,
    80,
    'B-02-01',
    NOW(),
    NOW()
FROM products p, warehouses w
WHERE p.sku = 'ELEC-WH-001' AND w.code = 'WH002';

-- Laptop Backpack (PROD002) - Total: 105 units
INSERT INTO stock_levels (id, "productId", "warehouseId", quantity, location, "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(),
    p.id,
    w.id,
    45,
    'C-01-03',
    NOW(),
    NOW()
FROM products p, warehouses w
WHERE p.sku = 'CLOTH-LB-002' AND w.code = 'WH001';

INSERT INTO stock_levels (id, "productId", "warehouseId", quantity, location, "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(),
    p.id,
    w.id,
    60,
    'A-02-01',
    NOW(),
    NOW()
FROM products p, warehouses w
WHERE p.sku = 'CLOTH-LB-002' AND w.code = 'WH003';

-- Coffee Maker (PROD003) - Total: 65 units
INSERT INTO stock_levels (id, "productId", "warehouseId", quantity, location, "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(),
    p.id,
    w.id,
    30,
    'D-01-04',
    NOW(),
    NOW()
FROM products p, warehouses w
WHERE p.sku = 'HOME-CM-003' AND w.code = 'WH002';

INSERT INTO stock_levels (id, "productId", "warehouseId", quantity, location, "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(),
    p.id,
    w.id,
    35,
    'B-01-02',
    NOW(),
    NOW()
FROM products p, warehouses w
WHERE p.sku = 'HOME-CM-003' AND w.code = 'WH003';

-- Yoga Mat (PROD004) - Total: 125 units
INSERT INTO stock_levels (id, "productId", "warehouseId", quantity, location, "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(),
    p.id,
    w.id,
    75,
    'E-02-03',
    NOW(),
    NOW()
FROM products p, warehouses w
WHERE p.sku = 'SPRT-YM-004' AND w.code = 'WH001';

INSERT INTO stock_levels (id, "productId", "warehouseId", quantity, location, "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(),
    p.id,
    w.id,
    50,
    'C-02-01',
    NOW(),
    NOW()
FROM products p, warehouses w
WHERE p.sku = 'SPRT-YM-004' AND w.code = 'WH002';

-- Smartphone Case (PROD005) - Total: 320 units
INSERT INTO stock_levels (id, "productId", "warehouseId", quantity, location, "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(),
    p.id,
    w.id,
    200,
    'F-01-05',
    NOW(),
    NOW()
FROM products p, warehouses w
WHERE p.sku = 'ELEC-SC-005' AND w.code = 'WH001';

INSERT INTO stock_levels (id, "productId", "warehouseId", quantity, location, "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(),
    p.id,
    w.id,
    120,
    'D-02-02',
    NOW(),
    NOW()
FROM products p, warehouses w
WHERE p.sku = 'ELEC-SC-005' AND w.code = 'WH003';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
SELECT 'SEED COMPLETED SUCCESSFULLY!' as status;
SELECT '================================' as separator;
SELECT 'Users count:' as info, COUNT(*) as total FROM users;
SELECT 'Warehouses count:' as info, COUNT(*) as total FROM warehouses;
SELECT 'Categories count:' as info, COUNT(*) as total FROM categories;
SELECT 'Units of Measure count:' as info, COUNT(*) as total FROM units_of_measure;
SELECT 'Products count:' as info, COUNT(*) as total FROM products;
SELECT 'Stock Levels count:' as info, COUNT(*) as total FROM stock_levels;

-- Warehouse Capacity Summary
SELECT 
    w.name as warehouse,
    w.capacity,
    w."currentUsage" as current_usage,
    ROUND((w."currentUsage"::decimal / w.capacity) * 100, 2) as "usage_%"
FROM warehouses w
ORDER BY w.code;

-- Inventory Summary by Product
SELECT 
    p.name as product,
    p.sku,
    SUM(sl.quantity) as total_stock,
    p."reorderLevel" as reorder_level,
    CASE 
        WHEN SUM(sl.quantity) < p."reorderLevel" THEN 'REORDER NEEDED'
        ELSE 'OK'
    END as status
FROM products p
LEFT JOIN stock_levels sl ON p.id = sl."productId"
GROUP BY p.id, p.name, p.sku, p."reorderLevel"
ORDER BY p.sku;

-- Inventory Distribution by Warehouse
SELECT 
    w.name as warehouse,
    p.name as product,
    sl.quantity,
    sl.location
FROM stock_levels sl
JOIN warehouses w ON sl."warehouseId" = w.id
JOIN products p ON sl."productId" = p.id
ORDER BY w.code, p.sku;
