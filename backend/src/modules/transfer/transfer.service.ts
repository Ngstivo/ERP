import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WarehouseTransfer, TransferStatus, TransferPriority } from '@database/transfers/transfer.entity';
import { TransferItem, TransferItemStatus } from '@database/transfers/transfer-item.entity';
import { Warehouse } from '@database/entities/warehouse.entity';
import { Product } from '@database/entities/product.entity';
import { StockLevel } from '@database/inventory/stock-level.entity';
import { StockMovement, MovementType } from '@database/inventory/stock-movement.entity';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { ReceiveTransferDto } from './dto/receive-transfer.dto';

@Injectable()
export class TransferService {
    constructor(
        @InjectRepository(WarehouseTransfer)
        private transferRepository: Repository<WarehouseTransfer>,
        @InjectRepository(TransferItem)
        private transferItemRepository: Repository<TransferItem>,
        @InjectRepository(Warehouse)
        private warehouseRepository: Repository<Warehouse>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        @InjectRepository(StockLevel)
        private stockLevelRepository: Repository<StockLevel>,
        @InjectRepository(StockMovement)
        private stockMovementRepository: Repository<StockMovement>,
    ) { }

    async create(createDto: CreateTransferDto, userId: string): Promise<WarehouseTransfer> {
        const fromWarehouse = await this.warehouseRepository.findOne({
            where: { id: createDto.fromWarehouseId },
        });

        if (!fromWarehouse) {
            throw new NotFoundException('Source warehouse not found');
        }

        const toWarehouse = await this.warehouseRepository.findOne({
            where: { id: createDto.toWarehouseId },
        });

        if (!toWarehouse) {
            throw new NotFoundException('Destination warehouse not found');
        }

        if (createDto.fromWarehouseId === createDto.toWarehouseId) {
            throw new BadRequestException('Source and destination warehouses must be different');
        }

        const transferNumber = this.generateTransferNumber();

        const transfer = this.transferRepository.create({
            transferNumber,
            fromWarehouse,
            toWarehouse,
            priority: createDto.priority || TransferPriority.MEDIUM,
            requestedDate: createDto.requestedDate || new Date(),
            expectedDeliveryDate: createDto.expectedDeliveryDate,
            notes: createDto.notes,
            requestedBy: { id: userId } as any,
            status: TransferStatus.DRAFT,
        });

        const savedTransfer = await this.transferRepository.save(transfer);

        // Create transfer items
        const items = createDto.items.map((item) =>
            this.transferItemRepository.create({
                transfer: savedTransfer,
                product: { id: item.productId } as any,
                batch: item.batchId ? { id: item.batchId } as any : null,
                requestedQuantity: item.quantity,
                notes: item.notes,
            })
        );

        await this.transferItemRepository.save(items);

        return this.findOne(savedTransfer.id);
    }

    async findAll(
        fromWarehouseId?: string,
        toWarehouseId?: string,
        status?: TransferStatus,
    ): Promise<WarehouseTransfer[]> {
        const query = this.transferRepository.createQueryBuilder('t')
            .leftJoinAndSelect('t.fromWarehouse', 'fromWarehouse')
            .leftJoinAndSelect('t.toWarehouse', 'toWarehouse')
            .leftJoinAndSelect('t.requestedBy', 'requestedBy')
            .leftJoinAndSelect('t.items', 'items')
            .leftJoinAndSelect('items.product', 'product')
            .orderBy('t.requestedDate', 'DESC');

        if (fromWarehouseId) {
            query.andWhere('t.fromWarehouse.id = :fromWarehouseId', { fromWarehouseId });
        }

        if (toWarehouseId) {
            query.andWhere('t.toWarehouse.id = :toWarehouseId', { toWarehouseId });
        }

        if (status) {
            query.andWhere('t.status = :status', { status });
        }

        return await query.getMany();
    }

    async findOne(id: string): Promise<WarehouseTransfer> {
        const transfer = await this.transferRepository.findOne({
            where: { id },
            relations: [
                'fromWarehouse',
                'toWarehouse',
                'requestedBy',
                'approvedBy',
                'shippedBy',
                'receivedBy',
                'items',
                'items.product',
                'items.batch',
            ],
        });

        if (!transfer) {
            throw new NotFoundException(`Transfer with ID ${id} not found`);
        }

        return transfer;
    }

    async update(id: string, updateDto: UpdateTransferDto): Promise<WarehouseTransfer> {
        const transfer = await this.findOne(id);

        if (transfer.status !== TransferStatus.DRAFT) {
            throw new BadRequestException('Only draft transfers can be updated');
        }

        Object.assign(transfer, updateDto);
        return await this.transferRepository.save(transfer);
    }

    async submitForApproval(id: string): Promise<WarehouseTransfer> {
        const transfer = await this.findOne(id);

        if (transfer.status !== TransferStatus.DRAFT) {
            throw new BadRequestException('Only draft transfers can be submitted');
        }

        if (!transfer.items || transfer.items.length === 0) {
            throw new BadRequestException('Cannot submit transfer without items');
        }

        // Validate stock availability
        for (const item of transfer.items) {
            const stockLevel = await this.stockLevelRepository.findOne({
                where: {
                    product: { id: item.product.id },
                    warehouse: { id: transfer.fromWarehouse.id },
                },
            });

            if (!stockLevel) {
                throw new NotFoundException(
                    `No stock found for ${item.product.name} in ${transfer.fromWarehouse.name}`
                );
            }

            const requestedQty = Number(item.requestedQuantity);
            if (Number(stockLevel.availableQuantity) < requestedQty) {
                throw new BadRequestException(
                    `Insufficient stock for ${item.product.name}. Available: ${stockLevel.availableQuantity}, Requested: ${requestedQty}`
                );
            }
        }

        transfer.status = TransferStatus.PENDING_APPROVAL;
        return await this.transferRepository.save(transfer);
    }

    async approve(id: string, userId: string): Promise<WarehouseTransfer> {
        const transfer = await this.findOne(id);

        if (transfer.status !== TransferStatus.PENDING_APPROVAL) {
            throw new BadRequestException('Only pending transfers can be approved');
        }

        transfer.status = TransferStatus.APPROVED;
        transfer.approvedBy = { id: userId } as any;

        return await this.transferRepository.save(transfer);
    }

    async reject(id: string, userId: string, reason: string): Promise<WarehouseTransfer> {
        const transfer = await this.findOne(id);

        if (transfer.status !== TransferStatus.PENDING_APPROVAL) {
            throw new BadRequestException('Only pending transfers can be rejected');
        }

        transfer.status = TransferStatus.REJECTED;
        transfer.approvedBy = { id: userId } as any;
        transfer.rejectionReason = reason;

        return await this.transferRepository.save(transfer);
    }

    async ship(id: string, userId: string, trackingNumber?: string, carrier?: string): Promise<WarehouseTransfer> {
        const transfer = await this.findOne(id);

        if (transfer.status !== TransferStatus.APPROVED) {
            throw new BadRequestException('Only approved transfers can be shipped');
        }

        // Deduct stock from source warehouse
        for (const item of transfer.items) {
            const stockLevel = await this.stockLevelRepository.findOne({
                where: {
                    product: { id: item.product.id },
                    warehouse: { id: transfer.fromWarehouse.id },
                },
            });

            if (!stockLevel) {
                throw new NotFoundException(`Stock level not found for item ${item.id}`);
            }

            const shippedQty = Number(item.requestedQuantity);
            stockLevel.quantity = Number(stockLevel.quantity) - shippedQty;
            stockLevel.availableQuantity = Number(stockLevel.availableQuantity) - shippedQty;

            await this.stockLevelRepository.save(stockLevel);

            // Create stock movement for shipment
            await this.stockMovementRepository.save({
                referenceNumber: `TRANSFER-OUT-${transfer.transferNumber}`,
                type: MovementType.TRANSFER_OUT,
                product: item.product,
                warehouse: transfer.fromWarehouse,
                quantity: -shippedQty,
                notes: `Transfer to ${transfer.toWarehouse.name}`,
                createdBy: { id: userId } as any,
            });

            // Update item status
            item.shippedQuantity = item.requestedQuantity;
            item.status = TransferItemStatus.IN_TRANSIT;
            await this.transferItemRepository.save(item);
        }

        transfer.status = TransferStatus.IN_TRANSIT;
        transfer.shippedBy = { id: userId } as any;
        transfer.shippedAt = new Date();
        transfer.trackingNumber = trackingNumber;
        transfer.carrier = carrier;

        return await this.transferRepository.save(transfer);
    }

    async receive(id: string, receiveDto: ReceiveTransferDto, userId: string): Promise<WarehouseTransfer> {
        const transfer = await this.findOne(id);

        if (transfer.status !== TransferStatus.IN_TRANSIT) {
            throw new BadRequestException('Only in-transit transfers can be received');
        }

        // Process received items
        for (const receivedItem of receiveDto.items) {
            const item = transfer.items.find((i) => i.id === receivedItem.itemId);
            if (!item) {
                throw new NotFoundException(`Transfer item ${receivedItem.itemId} not found`);
            }

            item.receivedQuantity = receivedItem.receivedQuantity;
            item.damagedQuantity = receivedItem.damagedQuantity || 0;
            item.status = TransferItemStatus.RECEIVED;
            item.notes = receivedItem.notes || item.notes;

            await this.transferItemRepository.save(item);

            // Add stock to destination warehouse
            let stockLevel = await this.stockLevelRepository.findOne({
                where: {
                    product: { id: item.product.id },
                    warehouse: { id: transfer.toWarehouse.id },
                },
            });

            if (!stockLevel) {
                stockLevel = this.stockLevelRepository.create({
                    product: item.product,
                    warehouse: transfer.toWarehouse,
                    quantity: 0,
                    availableQuantity: 0,
                    reservedQuantity: 0,
                });
            }

            const receivedQty = Number(receivedItem.receivedQuantity);
            stockLevel.quantity = Number(stockLevel.quantity) + receivedQty;
            stockLevel.availableQuantity = Number(stockLevel.availableQuantity) + receivedQty;

            await this.stockLevelRepository.save(stockLevel);

            // Create stock movement for receipt
            await this.stockMovementRepository.save({
                referenceNumber: `TRANSFER-IN-${transfer.transferNumber}`,
                type: MovementType.TRANSFER_IN,
                product: item.product,
                warehouse: transfer.toWarehouse,
                quantity: receivedQty,
                notes: `Transfer from ${transfer.fromWarehouse.name}`,
                createdBy: { id: userId } as any,
            });
        }

        transfer.status = TransferStatus.RECEIVED;
        transfer.receivedBy = { id: userId } as any;
        transfer.receivedAt = new Date();
        transfer.actualDeliveryDate = new Date();

        // Check if all items received match shipped quantities
        const allMatched = transfer.items.every(
            (item) => Number(item.receivedQuantity) === Number(item.shippedQuantity)
        );

        if (allMatched) {
            transfer.status = TransferStatus.COMPLETED;
        }

        return await this.transferRepository.save(transfer);
    }

    async getConsolidatedInventory(productId?: string): Promise<any[]> {
        const query = this.stockLevelRepository.createQueryBuilder('sl')
            .leftJoinAndSelect('sl.product', 'product')
            .leftJoinAndSelect('sl.warehouse', 'warehouse')
            .select([
                'product.id as productId',
                'product.name as productName',
                'product.sku as sku',
                'warehouse.id as warehouseId',
                'warehouse.name as warehouseName',
                'SUM(sl.quantity) as totalQuantity',
                'SUM(sl.availableQuantity) as availableQuantity',
                'SUM(sl.reservedQuantity) as reservedQuantity',
            ])
            .groupBy('product.id, product.name, product.sku, warehouse.id, warehouse.name');

        if (productId) {
            query.where('product.id = :productId', { productId });
        }

        return await query.getRawMany();
    }

    async suggestStockBalancing(productId: string): Promise<any> {
        const stockLevels = await this.stockLevelRepository.find({
            where: { product: { id: productId } },
            relations: ['warehouse', 'product'],
        });

        if (stockLevels.length === 0) {
            throw new NotFoundException('No stock found for this product');
        }

        const totalStock = stockLevels.reduce((sum, sl) => sum + Number(sl.availableQuantity), 0);
        const averageStock = totalStock / stockLevels.length;

        const suggestions = [];

        for (const sl of stockLevels) {
            const variance = Number(sl.availableQuantity) - averageStock;

            if (Math.abs(variance) > averageStock * 0.3) { // 30% threshold
                suggestions.push({
                    warehouse: sl.warehouse.name,
                    warehouseId: sl.warehouse.id,
                    currentStock: sl.availableQuantity,
                    targetStock: averageStock,
                    variance: variance,
                    action: variance > 0 ? 'TRANSFER_OUT' : 'TRANSFER_IN',
                    suggestedQuantity: Math.abs(variance),
                });
            }
        }

        return {
            product: stockLevels[0].product,
            totalStock,
            averageStock,
            suggestions,
        };
    }

    private generateTransferNumber(): string {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `TRF-${timestamp}-${random}`;
    }

    async remove(id: string): Promise<void> {
        const transfer = await this.findOne(id);

        if (transfer.status !== TransferStatus.DRAFT && transfer.status !== TransferStatus.REJECTED) {
            throw new BadRequestException('Only draft or rejected transfers can be deleted');
        }

        await this.transferRepository.remove(transfer);
    }
}
