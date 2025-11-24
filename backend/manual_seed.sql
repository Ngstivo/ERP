-- Manual Seed Script for Categories and Units of Measure
-- Run this directly in Supabase SQL Editor

-- Insert Categories (will skip if already exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM categories WHERE code = 'ELEC') THEN
        INSERT INTO categories (id, name, code, description, "isActive", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), 'Electronics', 'ELEC', 'Electronic devices and accessories', true, NOW(), NOW());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM categories WHERE code = 'OFF') THEN
        INSERT INTO categories (id, name, code, description, "isActive", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), 'Office Supplies', 'OFF', 'Stationery and office equipment', true, NOW(), NOW());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM categories WHERE code = 'FURN') THEN
        INSERT INTO categories (id, name, code, description, "isActive", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), 'Furniture', 'FURN', 'Office and warehouse furniture', true, NOW(), NOW());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM categories WHERE code = 'RAW') THEN
        INSERT INTO categories (id, name, code, description, "isActive", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), 'Raw Materials', 'RAW', 'Materials for production', true, NOW(), NOW());
    END IF;
END $$;

-- Insert Units of Measure (will skip if already exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM units_of_measure WHERE abbreviation = 'PCS') THEN
        INSERT INTO units_of_measure (id, name, abbreviation, description, "isActive", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), 'Piece', 'PCS', 'Individual item', true, NOW(), NOW());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM units_of_measure WHERE abbreviation = 'BOX') THEN
        INSERT INTO units_of_measure (id, name, abbreviation, description, "isActive", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), 'Box', 'BOX', 'Box of items', true, NOW(), NOW());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM units_of_measure WHERE abbreviation = 'KG') THEN
        INSERT INTO units_of_measure (id, name, abbreviation, description, "isActive", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), 'Kilogram', 'KG', 'Weight in kilograms', true, NOW(), NOW());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM units_of_measure WHERE abbreviation = 'L') THEN
        INSERT INTO units_of_measure (id, name, abbreviation, description, "isActive", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), 'Liter', 'L', 'Volume in liters', true, NOW(), NOW());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM units_of_measure WHERE abbreviation = 'M') THEN
        INSERT INTO units_of_measure (id, name, abbreviation, description, "isActive", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), 'Meter', 'M', 'Length in meters', true, NOW(), NOW());
    END IF;
END $$;

-- Verify the data was inserted
SELECT 'Categories count:' as info, COUNT(*) as total FROM categories;
SELECT 'Units of Measure count:' as info, COUNT(*) as total FROM units_of_measure;
