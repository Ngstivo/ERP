import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { Category } from '../entities/category.entity';
import { UnitOfMeasure } from '../entities/unit-of-measure.entity';
import { Product } from '../entities/product.entity';
import { Warehouse } from '../entities/warehouse.entity';
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

    // Create Permissions
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

    // Create Roles
    const roleRepo = AppDataSource.getRepository(Role);
    const adminRole = await roleRepo.save({
        name: 'Admin',
        description: 'Full system access',
        permissions: permissions,
    });

    const managerRole = await roleRepo.save({
        name: 'Manager',
        description: 'Warehouse manager access',
        permissions: permissions.filter(p => !p.name.includes('delete')),
    });

    const staffRole = await roleRepo.save({
        name: 'Staff',
        description: 'Warehouse staff access',
        permissions: permissions.filter(p => p.action === 'read' || p.resource === 'inventory'),
    });

    console.log('✅ Created roles');

    // Create Users
    const userRepo = AppDataSource.getRepository(User);
    await userRepo.save([
        {
            email: 'admin@erp.com',
            firstName: 'Admin',
            lastName: 'User',
            password: await bcrypt.hash('Admin@123', 10),
            roles: [adminRole],
            isActive: true,
        },
        {
            email: 'manager@erp.com',
            firstName: 'Manager',
            lastName: 'User',
            password: await bcrypt.hash('Manager@123', 10),
            roles: [managerRole],
            isActive: true,
        },
        {
            email: 'staff@erp.com',
            firstName: 'Staff',
            lastName: 'User',
            password: await bcrypt.hash('Staff@123', 10),
            roles: [staffRole],
            isActive: true,
        },
    ]);

    console.log('✅ Created users');

    // Create Categories
    const categoryRepo = AppDataSource.getRepository(Category);
    const electronics = await categoryRepo.save({
        name: 'Electronics',
        code: 'ELEC',
        description: 'Electronic devices and accessories',
    });

    const furniture = await categoryRepo.save({
        name: 'Furniture',
        code: 'FURN',
        description: 'Office and home furniture',
    });

    const supplies = await categoryRepo.save({
        name: 'Office Supplies',
        code: 'SUPP',
        description: 'General office supplies',
    });

    console.log('✅ Created categories');

    // Create Units of Measure
    const uomRepo = AppDataSource.getRepository(UnitOfMeasure);
    const piece = await uomRepo.save({
        name: 'Piece',
        abbreviation: 'PC',
        description: 'Individual pieces',
    });

    const box = await uomRepo.save({
        name: 'Box',
        abbreviation: 'BOX',
        description: 'Boxed items',
    });

    console.log('✅ Created units of measure');

    // Create Warehouses
    const warehouseRepo = AppDataSource.getRepository(Warehouse);
    const mainWarehouse = await warehouseRepo.save({
        code: 'WH-001',
        name: 'Main Warehouse',
        description: 'Primary storage facility',
        address: '123 Industrial Blvd',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001',
        phone: '+1-555-0100',
        email: 'main@warehouse.com',
        totalCapacity: 10000,
        isActive: true,
    });

    const secondaryWarehouse = await warehouseRepo.save({
        code: 'WH-002',
        name: 'Secondary Warehouse',
        description: 'Overflow storage',
        address: '456 Storage Ave',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        postalCode: '90001',
        phone: '+1-555-0200',
        email: 'secondary@warehouse.com',
        totalCapacity: 5000,
        isActive: true,
    });

    console.log('✅ Created warehouses');

    // Create Storage Locations
    const locationRepo = AppDataSource.getRepository(StorageLocation);
    await locationRepo.save([
        {
            code: 'ZONE-A',
            name: 'Zone A - Bulk Storage',
            type: LocationType.ZONE,
            zoneType: ZoneType.BULK,
            warehouse: mainWarehouse,
            capacity: 5000,
            isActive: true,
        },
        {
            code: 'ZONE-B',
            name: 'Zone B - Picking Area',
            type: LocationType.ZONE,
            zoneType: ZoneType.PICKING,
            warehouse: mainWarehouse,
            capacity: 3000,
            isActive: true,
        },
    ]);

    console.log('✅ Created storage locations');

    // Create Products
    const productRepo = AppDataSource.getRepository(Product);
    await productRepo.save([
        {
            sku: 'LAPTOP-001',
            name: 'Business Laptop',
            description: 'High-performance laptop for business use',
            category: electronics,
            unitOfMeasure: piece,
            unitPrice: 999.99,
            costPrice: 750.00,
            reorderPoint: 10,
            minStockLevel: 5,
            maxStockLevel: 50,
            isActive: true,
        },
        {
            sku: 'DESK-001',
            name: 'Office Desk',
            description: 'Ergonomic office desk',
            category: furniture,
            unitOfMeasure: piece,
            unitPrice: 299.99,
            costPrice: 200.00,
            reorderPoint: 5,
            minStockLevel: 2,
            maxStockLevel: 20,
            isActive: true,
        },
        {
            sku: 'PEN-001',
            name: 'Ballpoint Pens',
            description: 'Box of 50 ballpoint pens',
            category: supplies,
            unitOfMeasure: box,
            unitPrice: 9.99,
            costPrice: 5.00,
            reorderPoint: 20,
            minStockLevel: 10,
            maxStockLevel: 100,
            isActive: true,
        },
        {
            sku: 'MONITOR-001',
            name: '27" Monitor',
            description: '27-inch LED monitor',
            category: electronics,
            unitOfMeasure: piece,
            unitPrice: 349.99,
            costPrice: 250.00,
            reorderPoint: 8,
            minStockLevel: 4,
            maxStockLevel: 30,
            isActive: true,
        },
        {
            sku: 'CHAIR-001',
            name: 'Office Chair',
            description: 'Ergonomic office chair',
            category: furniture,
            unitOfMeasure: piece,
            unitPrice: 199.99,
            costPrice: 120.00,
            reorderPoint: 10,
            minStockLevel: 5,
            maxStockLevel: 40,
            isActive: true,
        },
    ]);

    console.log('✅ Created products');

    console.log('🎉 Database seed completed successfully!');
    await AppDataSource.destroy();
}

seed().catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
});
