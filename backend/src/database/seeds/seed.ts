import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { Category } from '../entities/category.entity';
import { UnitOfMeasure } from '../entities/unit-of-measure.entity';
import { Product } from '../entities/product.entity';
import { Warehouse } from '../entities/warehouse.entity';
import { StockLevel } from '../inventory/stock-level.entity';
import { StorageLocation, LocationType, ZoneType } from '../entities/storage-location.entity';

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'erp_db',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
});

async function seed() {
    await AppDataSource.initialize();

    console.log('🌱 Starting database seed...');

    // CLEANUP
    console.log('🧹 Cleaning up existing data...');
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    try {
        // Disable foreign key checks temporarily to allow truncation
        // await queryRunner.query('SET session_replication_role = "replica";'); // Only for superusers

        // Truncate tables in order
        await queryRunner.query('TRUNCATE TABLE stock_levels CASCADE');
        await queryRunner.query('TRUNCATE TABLE products CASCADE');
        await queryRunner.query('TRUNCATE TABLE categories CASCADE');
        await queryRunner.query('TRUNCATE TABLE units_of_measure CASCADE');
        await queryRunner.query('TRUNCATE TABLE storage_locations CASCADE');
        await queryRunner.query('TRUNCATE TABLE warehouses CASCADE');
        await queryRunner.query('TRUNCATE TABLE user_roles CASCADE');
        await queryRunner.query('TRUNCATE TABLE users CASCADE');
        await queryRunner.query('TRUNCATE TABLE roles CASCADE');
        await queryRunner.query('TRUNCATE TABLE permissions CASCADE');

        // await queryRunner.query('SET session_replication_role = "origin";');
    } catch (err) {
        console.warn('⚠️ Cleanup warning (might be first run):', err.message);
    } finally {
        await queryRunner.release();
    }

    // 1. Create Permissions
    const permissionRepo = AppDataSource.getRepository(Permission);
    const permissions = await permissionRepo.save([
        { name: 'products:create', resource: 'products', action: 'create', description: 'Create products' },
        { name: 'products:read', resource: 'products', action: 'read', description: 'View products' },
        { name: 'products:update', resource: 'products', action: 'update', description: 'Update products' },
        { name: 'products:delete', resource: 'products', action: 'delete', description: 'Delete products' },
        { name: 'inventory:manage', resource: 'inventory', action: 'manage', description: 'Manage inventory' },
        { name: 'warehouses:manage', resource: 'warehouses', action: 'manage', description: 'Manage warehouses' },
        { name: 'orders:manage', resource: 'orders', action: 'manage', description: 'Manage orders' },
        { name: 'reports:view', resource: 'reports', action: 'view', description: 'View reports' },
    ]);

    console.log('✅ Created permissions');

    // 2. Create Roles
    const roleRepo = AppDataSource.getRepository(Role);
    const adminRole = await roleRepo.save({
        name: 'ADMIN',
        description: 'System Administrator',
        permissions: permissions,
        isActive: true
    });

    console.log('✅ Created roles');

    // 3. Create Users
    const userRepo = AppDataSource.getRepository(User);
    const adminUser = await userRepo.save({
        email: 'admin@erp.com',
        firstName: 'Admin',
        lastName: 'User',
        password: await bcrypt.hash('Admin@123', 10),
        roles: [adminRole],
        isActive: true,
    });

    console.log('✅ Created users');

    // 4. Create Warehouses
    const warehouseRepo = AppDataSource.getRepository(Warehouse);
    const wh1 = await warehouseRepo.save({
        code: 'WH001',
        name: 'Main Distribution Center',
        address: '123 Industrial Blvd',
        city: 'Chicago',
        state: 'IL',
        postalCode: '60601',
        country: 'USA',
        totalCapacity: 10000,
        isActive: true,
    });

    const wh2 = await warehouseRepo.save({
        code: 'WH002',
        name: 'West Coast Facility',
        address: '456 Commerce St',
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90001',
        country: 'USA',
        totalCapacity: 8000,
        isActive: true,
    });

    const wh3 = await warehouseRepo.save({
        code: 'WH003',
        name: 'East Coast Hub',
        address: '789 Logistics Ave',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
        totalCapacity: 6000,
        isActive: true,
    });

    console.log('✅ Created warehouses');

    // 5. Create Categories
    const categoryRepo = AppDataSource.getRepository(Category);
    const electronics = await categoryRepo.save({ name: 'Electronics', code: 'CAT001', description: 'Electronic devices and accessories' });
    const clothing = await categoryRepo.save({ name: 'Clothing', code: 'CAT002', description: 'Apparel and fashion accessories' });
    const homeGoods = await categoryRepo.save({ name: 'Home Goods', code: 'CAT003', description: 'Kitchen and home appliances' });
    const sports = await categoryRepo.save({ name: 'Sports Equipment', code: 'CAT004', description: 'Fitness and sports products' });

    console.log('✅ Created categories');

    // 6. Create Units of Measure
    const uomRepo = AppDataSource.getRepository(UnitOfMeasure);
    const pcs = await uomRepo.save({ name: 'Piece', abbreviation: 'PCS', description: 'Individual item' });
    const box = await uomRepo.save({ name: 'Box', abbreviation: 'BOX', description: 'Box of items' });
    const kg = await uomRepo.save({ name: 'Kilogram', abbreviation: 'KG', description: 'Weight in kilograms' });
    const set = await uomRepo.save({ name: 'Set', abbreviation: 'SET', description: 'Set of items' });

    console.log('✅ Created units of measure');

    // 7. Create Products
    const productRepo = AppDataSource.getRepository(Product);

    const p1 = await productRepo.save({
        name: 'Wireless Headphones',
        sku: 'ELEC-WH-001',
        description: 'Premium wireless headphones with noise cancellation',
        category: electronics,
        unitOfMeasure: pcs,
        unitPrice: 149.99,
        costPrice: 89.99,
        reorderPoint: 50,
        isActive: true,
    });

    const p2 = await productRepo.save({
        name: 'Laptop Backpack',
        sku: 'CLOTH-LB-002',
        description: 'Durable laptop backpack with multiple compartments',
        category: clothing,
        unitOfMeasure: pcs,
        unitPrice: 59.99,
        costPrice: 35.99,
        reorderPoint: 30,
        isActive: true,
    });

    const p3 = await productRepo.save({
        name: 'Coffee Maker',
        sku: 'HOME-CM-003',
        description: 'Programmable 12-cup coffee maker',
        category: homeGoods,
        unitOfMeasure: pcs,
        unitPrice: 89.99,
        costPrice: 54.99,
        reorderPoint: 25,
        isActive: true,
    });

    const p4 = await productRepo.save({
        name: 'Yoga Mat',
        sku: 'SPRT-YM-004',
        description: 'Non-slip exercise yoga mat with carrying strap',
        category: sports,
        unitOfMeasure: pcs,
        unitPrice: 29.99,
        costPrice: 17.99,
        reorderPoint: 40,
        isActive: true,
    });

    const p5 = await productRepo.save({
        name: 'Smartphone Case',
        sku: 'ELEC-SC-005',
        description: 'Protective smartphone case with card holder',
        category: electronics,
        unitOfMeasure: pcs,
        unitPrice: 19.99,
        costPrice: 11.99,
        reorderPoint: 100,
        isActive: true,
    });

    console.log('✅ Created products');

    // 8. Create Stock Levels
    const stockLevelRepo = AppDataSource.getRepository(StockLevel);

    // Wireless Headphones (230 units)
    await stockLevelRepo.save([
        { product: p1, warehouse: wh1, quantity: 150, availableQuantity: 150 },
        { product: p1, warehouse: wh2, quantity: 80, availableQuantity: 80 },
    ]);

    // Laptop Backpack (105 units)
    await stockLevelRepo.save([
        { product: p2, warehouse: wh1, quantity: 45, availableQuantity: 45 },
        { product: p2, warehouse: wh3, quantity: 60, availableQuantity: 60 },
    ]);

    // Coffee Maker (65 units)
    await stockLevelRepo.save([
        { product: p3, warehouse: wh2, quantity: 30, availableQuantity: 30 },
        { product: p3, warehouse: wh3, quantity: 35, availableQuantity: 35 },
    ]);

    // Yoga Mat (125 units)
    await stockLevelRepo.save([
        { product: p4, warehouse: wh1, quantity: 75, availableQuantity: 75 },
        { product: p4, warehouse: wh2, quantity: 50, availableQuantity: 50 },
    ]);

    // Smartphone Case (320 units)
    await stockLevelRepo.save([
        { product: p5, warehouse: wh1, quantity: 200, availableQuantity: 200 },
        { product: p5, warehouse: wh3, quantity: 120, availableQuantity: 120 },
    ]);

    console.log('✅ Created stock levels');

    console.log('🎉 Database seed completed successfully!');
    await AppDataSource.destroy();
}

seed().catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
});
