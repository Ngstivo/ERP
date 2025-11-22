import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockLevel } from '@database/inventory/stock-level.entity';
import { StockMovement, MovementType } from '@database/inventory/stock-movement.entity';
import { Product } from '@database/entities/product.entity';
import { Warehouse } from '@database/entities/warehouse.entity';
import { StockAdjustmentDto } from './dto/stock-adjustment.dto';

@Injectable()
export class InventoryService {
    constructor(
        @InjectRepository(StockLevel)
        private stockLevelRepository: Repository<StockLevel>,
        @InjectRepository(StockMovement)
        private stockMovementRepository: Repository<StockMovement>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        @InjectRepository(Warehouse)
        private warehouseRepository: Repository<Warehouse>,
    ) { }

    async getStockLevels(productId?: string, warehouseId?: string): Promise<StockLevel[]> {
        const query = this.stockLevelRepository.createQueryBuilder('stock')
            .leftJoinAndSelect('stock.product', 'product')
            .leftJoinAndSelect('stock.warehouse', 'warehouse')
            .leftJoinAndSelect('stock.location', 'location');

        if (productId) {
            query.andWhere('stock.product.id = :productId', { productId });
        }

        if (warehouseId) {
            query.andWhere('stock.warehouse.id = :warehouseId', { warehouseId });
        }

        return await query.getMany();
    }

    async getStockMovements(
        productId?: string,
        warehouseId?: string,
        type?: MovementType,
    ): Promise<StockMovement[]> {
        const query = this.stockMovementRepository.createQueryBuilder('movement')
            .leftJoinAndSelect('movement.product', 'product')
            .leftJoinAndSelect('movement.warehouse', 'warehouse')
            .leftJoinAndSelect('movement.location', 'location')
            .leftJoinAndSelect('movement.createdBy', 'user')
            .orderBy('movement.createdAt', 'DESC');

        if (productId) {
            query.andWhere('movement.product.id = :productId', { productId });
        }

        if (warehouseId) {
            query.andWhere('movement.warehouse.id = :warehouseId', { warehouseId });
        }

        if (type) {
            query.andWhere('movement.type = :type', { type });
        }

        return await query.getMany();
    }

    async adjustStock(
        adjustmentDto: StockAdjustmentDto,
        userId: string,
    ): Promise<StockMovement> {
        const product = await this.productRepository.findOne({
            where: { id: adjustmentDto.productId },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        const warehouse = await this.warehouseRepository.findOne({
            where: { id: adjustmentDto.warehouseId },
        });

        if (!warehouse) {
            throw new NotFoundException('Warehouse not found');
        }

        // Find or create stock level
        let stockLevel = await this.stockLevelRepository.findOne({
            where: {
                product: { id: adjustmentDto.productId },
                warehouse: { id: adjustmentDto.warehouseId },
            },
        });

        if (!stockLevel) {
            stockLevel = this.stockLevelRepository.create({
                product,
                warehouse,
                quantity: 0,
                reservedQuantity: 0,
                availableQuantity: 0,
            });
        }

        // Update stock level
        const newQuantity = Number(stockLevel.quantity) + adjustmentDto.quantity;

        if (newQuantity < 0) {
            throw new BadRequestException('Insufficient stock');
        }

        stockLevel.quantity = newQuantity;
        stockLevel.availableQuantity = newQuantity - Number(stockLevel.reservedQuantity);

        await this.stockLevelRepository.save(stockLevel);

        // Create stock movement record
        const movement = this.stockMovementRepository.create({
            referenceNumber: `ADJ-${Date.now()}`,
            type: MovementType.ADJUSTMENT,
            product,
            warehouse,
            quantity: adjustmentDto.quantity,
            unitCost: adjustmentDto.unitCost,
            totalCost: adjustmentDto.quantity * (adjustmentDto.unitCost || 0),
            notes: adjustmentDto.notes,
            createdBy: { id: userId } as any,
        });

        return await this.stockMovementRepository.save(movement);
    }

    async getInventoryValue(warehouseId?: string): Promise<any> {
        const query = this.stockLevelRepository.createQueryBuilder('stock')
            .leftJoinAndSelect('stock.product', 'product')
            .leftJoinAndSelect('stock.warehouse', 'warehouse');

        if (warehouseId) {
            query.where('stock.warehouse.id = :warehouseId', { warehouseId });
        }

        const stockLevels = await query.getMany();

        const totalValue = stockLevels.reduce(
            (sum, stock) => sum + Number(stock.quantity) * Number(stock.product.costPrice),
            0,
        );

        const totalQuantity = stockLevels.reduce(
            (sum, stock) => sum + Number(stock.quantity),
            0,
        );

        return {
            totalValue,
            totalQuantity,
            totalProducts: stockLevels.length,
            stockLevels: stockLevels.map((stock) => ({
                productId: stock.product.id,
                productName: stock.product.name,
                sku: stock.product.sku,
                warehouseId: stock.warehouse.id,
                warehouseName: stock.warehouse.name,
                quantity: stock.quantity,
                value: Number(stock.quantity) * Number(stock.product.costPrice),
            })),
        };
    }
}
