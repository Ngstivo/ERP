import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { StockLevel } from '@database/inventory/stock-level.entity';
import { StockMovement, MovementType } from '@database/inventory/stock-movement.entity';
import { Product } from '@database/entities/product.entity';
import { Warehouse } from '@database/entities/warehouse.entity';
import { Batch } from '@database/batches/batch.entity';
import { WarehouseTransfer } from '@database/transfers/transfer.entity';
import { GoodsReceipt } from '@database/warehouse-ops/goods-receipt.entity';
import { PurchaseReturn } from '@database/returns/purchase-return.entity';

export interface DashboardMetrics {
    totalProducts: number;
    totalWarehouses: number;
    totalStockValue: number;
    lowStockItems: number;
    expiringBatches: number;
    pendingTransfers: number;
    recentMovements: number;
    warehouseUtilization: number;
}

export interface StockLevelReport {
    productId: string;
    productName: string;
    sku: string;
    warehouseName: string;
    quantity: number;
    availableQuantity: number;
    reservedQuantity: number;
    reorderPoint: number;
    status: 'CRITICAL' | 'LOW' | 'NORMAL' | 'EXCESS';
}

export interface MovementReport {
    date: Date;
    referenceNumber: string;
    type: MovementType;
    productName: string;
    warehouseName: string;
    quantity: number;
    createdBy: string;
}

export interface WarehouseUtilizationReport {
    warehouseId: string;
    warehouseName: string;
    totalCapacity: number;
    usedCapacity: number;
    utilizationPercentage: number;
    availableSpace: number;
}

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(StockLevel)
        private stockLevelRepository: Repository<StockLevel>,
        @InjectRepository(StockMovement)
        private stockMovementRepository: Repository<StockMovement>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        @InjectRepository(Warehouse)
        private warehouseRepository: Repository<Warehouse>,
        @InjectRepository(Batch)
        private batchRepository: Repository<Batch>,
        @InjectRepository(WarehouseTransfer)
        private transferRepository: Repository<WarehouseTransfer>,
        @InjectRepository(GoodsReceipt)
        private goodsReceiptRepository: Repository<GoodsReceipt>,
        @InjectRepository(PurchaseReturn)
        private purchaseReturnRepository: Repository<PurchaseReturn>,
    ) { }

    async getDashboardMetrics(): Promise<DashboardMetrics> {
        const [
            totalProducts,
            totalWarehouses,
            lowStockItems,
            expiringBatches,
            pendingTransfers,
            recentMovements,
        ] = await Promise.all([
            this.productRepository.count({ where: { isActive: true } }),
            this.warehouseRepository.count({ where: { isActive: true } }),
            this.getLowStockCount(),
            this.getExpiringBatchesCount(30), // Next 30 days
            this.transferRepository.count({
                where: { status: 'PENDING_APPROVAL' as any },
            }),
            this.stockMovementRepository.count({
                where: {
                    createdAt: Between(
                        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                        new Date()
                    ),
                },
            }),
        ]);

        const totalStockValue = await this.calculateTotalStockValue();
        const warehouseUtilization = await this.calculateAverageUtilization();

        return {
            totalProducts,
            totalWarehouses,
            totalStockValue,
            lowStockItems,
            expiringBatches,
            pendingTransfers,
            recentMovements,
            warehouseUtilization,
        };
    }

    async getStockLevelReport(warehouseId?: string): Promise<StockLevelReport[]> {
        const query = this.stockLevelRepository.createQueryBuilder('sl')
            .leftJoinAndSelect('sl.product', 'product')
            .leftJoinAndSelect('sl.warehouse', 'warehouse')
            .where('product.isActive = :isActive', { isActive: true });

        if (warehouseId) {
            query.andWhere('warehouse.id = :warehouseId', { warehouseId });
        }

        const stockLevels = await query.getMany();

        return stockLevels.map((sl) => {
            const quantity = Number(sl.quantity);
            const reorderPoint = Number(sl.product.reorderPoint || 0);
            let status: 'CRITICAL' | 'LOW' | 'NORMAL' | 'EXCESS' = 'NORMAL';

            if (quantity === 0) {
                status = 'CRITICAL';
            } else if (quantity <= reorderPoint) {
                status = 'LOW';
            } else if (quantity > reorderPoint * 3) {
                status = 'EXCESS';
            }

            return {
                productId: sl.product.id,
                productName: sl.product.name,
                sku: sl.product.sku,
                warehouseName: sl.warehouse.name,
                quantity: sl.quantity,
                availableQuantity: sl.availableQuantity,
                reservedQuantity: sl.reservedQuantity,
                reorderPoint: sl.product.reorderPoint,
                status,
            };
        });
    }

    async getMovementReport(
        startDate: Date,
        endDate: Date,
        warehouseId?: string,
        movementType?: MovementType,
    ): Promise<MovementReport[]> {
        const query = this.stockMovementRepository.createQueryBuilder('sm')
            .leftJoinAndSelect('sm.product', 'product')
            .leftJoinAndSelect('sm.warehouse', 'warehouse')
            .leftJoinAndSelect('sm.createdBy', 'createdBy')
            .where('sm.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
            .orderBy('sm.createdAt', 'DESC');

        if (warehouseId) {
            query.andWhere('warehouse.id = :warehouseId', { warehouseId });
        }

        if (movementType) {
            query.andWhere('sm.type = :movementType', { movementType });
        }

        const movements = await query.getMany();

        return movements.map((sm) => ({
            date: sm.createdAt,
            referenceNumber: sm.referenceNumber,
            type: sm.type,
            productName: sm.product.name,
            warehouseName: sm.warehouse.name,
            quantity: sm.quantity,
            createdBy: sm.createdBy ? `${sm.createdBy.firstName} ${sm.createdBy.lastName}` : 'System',
        }));
    }

    async getWarehouseUtilizationReport(): Promise<WarehouseUtilizationReport[]> {
        const warehouses = await this.warehouseRepository.find({
            where: { isActive: true },
            relations: ['locations', 'locations.stockLevels'],
        });

        return warehouses.map((warehouse) => {
            const totalCapacity = warehouse.locations.reduce(
                (sum, loc) => sum + Number(loc.capacity || 0),
                0
            );

            const usedCapacity = warehouse.locations.reduce((sum, loc) => {
                const locationUsed = loc.stockLevels?.reduce(
                    (locSum, sl) => locSum + Number(sl.quantity),
                    0
                ) || 0;
                return sum + locationUsed;
            }, 0);

            const utilizationPercentage = totalCapacity > 0
                ? (usedCapacity / totalCapacity) * 100
                : 0;

            return {
                warehouseId: warehouse.id,
                warehouseName: warehouse.name,
                totalCapacity,
                usedCapacity,
                utilizationPercentage: Math.round(utilizationPercentage * 100) / 100,
                availableSpace: totalCapacity - usedCapacity,
            };
        });
    }

    async getTopMovingProducts(limit: number = 10, days: number = 30): Promise<any[]> {
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const movements = await this.stockMovementRepository
            .createQueryBuilder('sm')
            .select('sm.product.id', 'productId')
            .addSelect('product.name', 'productName')
            .addSelect('product.sku', 'sku')
            .addSelect('SUM(ABS(sm.quantity))', 'totalMovement')
            .addSelect('COUNT(sm.id)', 'movementCount')
            .leftJoin('sm.product', 'product')
            .where('sm.createdAt >= :startDate', { startDate })
            .groupBy('sm.product.id, product.name, product.sku')
            .orderBy('totalMovement', 'DESC')
            .limit(limit)
            .getRawMany();

        return movements;
    }

    async getSlowMovingProducts(limit: number = 10, days: number = 90): Promise<any[]> {
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const allProducts = await this.productRepository.find({
            where: { isActive: true },
            relations: ['stockLevels'],
        });

        const productsWithMovement = await Promise.all(
            allProducts.map(async (product) => {
                const movementCount = await this.stockMovementRepository.count({
                    where: {
                        product: { id: product.id },
                        createdAt: Between(startDate, new Date()),
                    },
                });

                const totalStock = product.stockLevels?.reduce(
                    (sum, sl) => sum + Number(sl.quantity),
                    0
                ) || 0;

                return {
                    productId: product.id,
                    productName: product.name,
                    sku: product.sku,
                    movementCount,
                    totalStock,
                    daysInStock: days,
                };
            })
        );

        return productsWithMovement
            .filter((p) => p.totalStock > 0)
            .sort((a, b) => a.movementCount - b.movementCount)
            .slice(0, limit);
    }

    async getExpiringBatchesReport(daysAhead: number = 30): Promise<any[]> {
        const today = new Date();
        const futureDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);

        const batches = await this.batchRepository
            .createQueryBuilder('batch')
            .leftJoinAndSelect('batch.product', 'product')
            .leftJoinAndSelect('batch.warehouse', 'warehouse')
            .where('batch.expirationDate BETWEEN :today AND :futureDate', { today, futureDate })
            .andWhere('batch.currentQuantity > 0')
            .orderBy('batch.expirationDate', 'ASC')
            .getMany();

        return batches.map((batch) => ({
            batchNumber: batch.batchNumber,
            productName: batch.product.name,
            warehouseName: batch.warehouse.name,
            expirationDate: batch.expirationDate,
            currentQuantity: batch.currentQuantity,
            daysUntilExpiration: batch.daysUntilExpiration,
            qualityStatus: batch.qualityStatus,
        }));
    }

    private async getLowStockCount(): Promise<number> {
        const stockLevels = await this.stockLevelRepository.find({
            relations: ['product'],
        });

        return stockLevels.filter((sl) => {
            const quantity = Number(sl.quantity);
            const reorderPoint = Number(sl.product.reorderPoint || 0);
            return quantity <= reorderPoint && quantity > 0;
        }).length;
    }

    private async getExpiringBatchesCount(daysAhead: number): Promise<number> {
        const futureDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);

        return await this.batchRepository.count({
            where: {
                expirationDate: Between(new Date(), futureDate),
            },
        });
    }

    private async calculateTotalStockValue(): Promise<number> {
        const stockLevels = await this.stockLevelRepository.find({
            relations: ['product'],
        });

        return stockLevels.reduce((total, sl) => {
            const quantity = Number(sl.quantity);
            const price = Number(sl.product.price || 0);
            return total + (quantity * price);
        }, 0);
    }

    private async calculateAverageUtilization(): Promise<number> {
        const utilizationReport = await this.getWarehouseUtilizationReport();

        if (utilizationReport.length === 0) return 0;

        const totalUtilization = utilizationReport.reduce(
            (sum, report) => sum + report.utilizationPercentage,
            0
        );

        return Math.round((totalUtilization / utilizationReport.length) * 100) / 100;
    }
}
