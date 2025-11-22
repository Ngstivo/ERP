import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoodsReceipt, GoodsReceiptStatus } from '@database/warehouse-ops/goods-receipt.entity';
import { GoodsReceiptItem, InspectionResult } from '@database/warehouse-ops/goods-receipt-item.entity';
import { PutAwayRule, PutAwayStrategy } from '@database/warehouse-ops/put-away-rule.entity';
import { PurchaseOrder } from '@database/orders/purchase-order.entity';
import { Warehouse } from '@database/entities/warehouse.entity';
import { StockLevel } from '@database/inventory/stock-level.entity';
import { StockMovement, MovementType } from '@database/inventory/stock-movement.entity';
import { StorageLocation, LocationType } from '@database/entities/storage-location.entity';
import { CreateGoodsReceiptDto } from './dto/create-goods-receipt.dto';
import { InspectItemDto } from './dto/inspect-item.dto';
import { PutAwayItemDto } from './dto/put-away-item.dto';

@Injectable()
export class GoodsReceiptService {
    constructor(
        @InjectRepository(GoodsReceipt)
        private goodsReceiptRepository: Repository<GoodsReceipt>,
        @InjectRepository(GoodsReceiptItem)
        private goodsReceiptItemRepository: Repository<GoodsReceiptItem>,
        @InjectRepository(PutAwayRule)
        private putAwayRuleRepository: Repository<PutAwayRule>,
        @InjectRepository(PurchaseOrder)
        private purchaseOrderRepository: Repository<PurchaseOrder>,
        @InjectRepository(Warehouse)
        private warehouseRepository: Repository<Warehouse>,
        @InjectRepository(StockLevel)
        private stockLevelRepository: Repository<StockLevel>,
        @InjectRepository(StockMovement)
        private stockMovementRepository: Repository<StockMovement>,
        @InjectRepository(StorageLocation)
        private storageLocationRepository: Repository<StorageLocation>,
    ) { }

    async create(createDto: CreateGoodsReceiptDto, userId: string): Promise<GoodsReceipt> {
        const purchaseOrder = await this.purchaseOrderRepository.findOne({
            where: { id: createDto.purchaseOrderId },
            relations: ['items', 'items.product'],
        });

        if (!purchaseOrder) {
            throw new NotFoundException('Purchase order not found');
        }

        const warehouse = await this.warehouseRepository.findOne({
            where: { id: createDto.warehouseId },
        });

        if (!warehouse) {
            throw new NotFoundException('Warehouse not found');
        }

        const receiptNumber = this.generateReceiptNumber();

        const goodsReceipt = this.goodsReceiptRepository.create({
            receiptNumber,
            purchaseOrder,
            warehouse,
            receiptDate: createDto.receiptDate || new Date(),
            notes: createDto.notes,
            supplierDeliveryNote: createDto.supplierDeliveryNote,
            transportCompany: createDto.transportCompany,
            vehicleNumber: createDto.vehicleNumber,
            driverName: createDto.driverName,
            receivedBy: { id: userId } as any,
            status: GoodsReceiptStatus.DRAFT,
        });

        const savedReceipt = await this.goodsReceiptRepository.save(goodsReceipt);

        // Create receipt items from PO items
        const items = createDto.items.map((item) => {
            const poItem = purchaseOrder.items.find((poi) => poi.id === item.purchaseOrderItemId);
            return this.goodsReceiptItemRepository.create({
                goodsReceipt: savedReceipt,
                product: poItem.product,
                orderedQuantity: poItem.quantity,
                receivedQuantity: item.receivedQuantity,
                inspectionResult: InspectionResult.PENDING,
            });
        });

        await this.goodsReceiptItemRepository.save(items);

        return this.findOne(savedReceipt.id);
    }

    async findAll(warehouseId?: string, status?: GoodsReceiptStatus): Promise<GoodsReceipt[]> {
        const query = this.goodsReceiptRepository.createQueryBuilder('gr')
            .leftJoinAndSelect('gr.purchaseOrder', 'po')
            .leftJoinAndSelect('gr.warehouse', 'warehouse')
            .leftJoinAndSelect('gr.receivedBy', 'receivedBy')
            .leftJoinAndSelect('gr.items', 'items')
            .leftJoinAndSelect('items.product', 'product')
            .orderBy('gr.receiptDate', 'DESC');

        if (warehouseId) {
            query.andWhere('gr.warehouse.id = :warehouseId', { warehouseId });
        }

        if (status) {
            query.andWhere('gr.status = :status', { status });
        }

        return await query.getMany();
    }

    async findOne(id: string): Promise<GoodsReceipt> {
        const receipt = await this.goodsReceiptRepository.findOne({
            where: { id },
            relations: [
                'purchaseOrder',
                'warehouse',
                'receivedBy',
                'inspectedBy',
                'items',
                'items.product',
                'items.batch',
                'items.putAwayLocation',
            ],
        });

        if (!receipt) {
            throw new NotFoundException(`Goods receipt with ID ${id} not found`);
        }

        return receipt;
    }

    async startInspection(id: string, userId: string): Promise<GoodsReceipt> {
        const receipt = await this.findOne(id);

        if (receipt.status !== GoodsReceiptStatus.DRAFT) {
            throw new BadRequestException('Only draft receipts can start inspection');
        }

        receipt.status = GoodsReceiptStatus.INSPECTING;
        receipt.inspectionStartTime = new Date();
        receipt.inspectedBy = { id: userId } as any;

        return await this.goodsReceiptRepository.save(receipt);
    }

    async inspectItem(itemId: string, inspectDto: InspectItemDto): Promise<GoodsReceiptItem> {
        const item = await this.goodsReceiptItemRepository.findOne({
            where: { id: itemId },
            relations: ['goodsReceipt', 'product'],
        });

        if (!item) {
            throw new NotFoundException('Receipt item not found');
        }

        item.acceptedQuantity = inspectDto.acceptedQuantity;
        item.rejectedQuantity = inspectDto.rejectedQuantity;
        item.inspectionResult = inspectDto.inspectionResult;
        item.inspectionNotes = inspectDto.inspectionNotes;
        item.rejectionReason = inspectDto.rejectionReason;

        return await this.goodsReceiptItemRepository.save(item);
    }

    async completeInspection(id: string): Promise<GoodsReceipt> {
        const receipt = await this.findOne(id);

        if (receipt.status !== GoodsReceiptStatus.INSPECTING) {
            throw new BadRequestException('Receipt is not in inspecting status');
        }

        // Check all items are inspected
        const pendingItems = receipt.items.filter(
            (item) => item.inspectionResult === InspectionResult.PENDING
        );

        if (pendingItems.length > 0) {
            throw new BadRequestException('All items must be inspected before completing');
        }

        receipt.inspectionEndTime = new Date();

        // Determine overall status
        const allApproved = receipt.items.every(
            (item) => item.inspectionResult === InspectionResult.APPROVED
        );
        const allRejected = receipt.items.every(
            (item) => item.inspectionResult === InspectionResult.REJECTED
        );

        if (allApproved) {
            receipt.status = GoodsReceiptStatus.APPROVED;
        } else if (allRejected) {
            receipt.status = GoodsReceiptStatus.REJECTED;
        } else {
            receipt.status = GoodsReceiptStatus.PARTIALLY_APPROVED;
        }

        return await this.goodsReceiptRepository.save(receipt);
    }

    async suggestPutAwayLocation(
        productId: string,
        warehouseId: string,
        quantity: number
    ): Promise<StorageLocation> {
        // Get active put-away rules
        const rules = await this.putAwayRuleRepository.find({
            where: { isActive: true },
            order: { priority: 'DESC' },
            relations: ['defaultLocation'],
        });

        // Find available locations in the warehouse
        const locations = await this.storageLocationRepository.find({
            where: {
                warehouse: { id: warehouseId },
                isActive: true,
            },
            relations: ['stockLevels'],
        });

        // Apply put-away strategies
        for (const rule of rules) {
            switch (rule.strategy) {
                case PutAwayStrategy.FIXED_LOCATION:
                    if (rule.defaultLocation) {
                        return rule.defaultLocation;
                    }
                    break;

                case PutAwayStrategy.NEAREST_AVAILABLE:
                    // Find first available location with capacity
                    const available = locations.find((loc) => {
                        const currentOccupancy = loc.stockLevels?.reduce(
                            (sum, sl) => sum + Number(sl.quantity),
                            0
                        ) || 0;
                        return loc.capacity && currentOccupancy + quantity <= loc.capacity;
                    });
                    if (available) return available;
                    break;

                case PutAwayStrategy.BULK_STORAGE:
                    // Find bulk storage zones
                    const bulkLocation = locations.find(
                        (loc) => loc.type === LocationType.ZONE && loc.zoneType === 'BULK'
                    );
                    if (bulkLocation) return bulkLocation;
                    break;
            }
        }

        // Default: return first available location
        return locations[0] || null;
    }

    async putAwayItem(itemId: string, putAwayDto: PutAwayItemDto, userId: string): Promise<void> {
        const item = await this.goodsReceiptItemRepository.findOne({
            where: { id: itemId },
            relations: ['goodsReceipt', 'goodsReceipt.warehouse', 'product', 'batch'],
        });

        if (!item) {
            throw new NotFoundException('Receipt item not found');
        }

        if (item.inspectionResult !== InspectionResult.APPROVED) {
            throw new BadRequestException('Only approved items can be put away');
        }

        const location = await this.storageLocationRepository.findOne({
            where: { id: putAwayDto.locationId },
        });

        if (!location) {
            throw new NotFoundException('Storage location not found');
        }

        // Update or create stock level
        let stockLevel = await this.stockLevelRepository.findOne({
            where: {
                product: { id: item.product.id },
                warehouse: { id: item.goodsReceipt.warehouse.id },
                location: { id: location.id },
            },
        });

        if (!stockLevel) {
            stockLevel = this.stockLevelRepository.create({
                product: item.product,
                warehouse: item.goodsReceipt.warehouse,
                location,
                quantity: 0,
                availableQuantity: 0,
                reservedQuantity: 0,
            });
        }

        stockLevel.quantity = Number(stockLevel.quantity) + Number(item.acceptedQuantity);
        stockLevel.availableQuantity = Number(stockLevel.availableQuantity) + Number(item.acceptedQuantity);

        await this.stockLevelRepository.save(stockLevel);

        // Create stock movement
        await this.stockMovementRepository.save({
            referenceNumber: `GR-${item.goodsReceipt.receiptNumber}`,
            type: MovementType.RECEIVE,
            product: item.product,
            warehouse: item.goodsReceipt.warehouse,
            toLocation: location,
            quantity: item.acceptedQuantity,
            notes: `Goods receipt put-away`,
            createdBy: { id: userId } as any,
        });

        // Update item
        item.putAwayLocation = location;
        item.isPutAway = true;
        item.putAwayTime = new Date();

        await this.goodsReceiptItemRepository.save(item);

        // Check if all items are put away
        const receipt = await this.findOne(item.goodsReceipt.id);
        const allPutAway = receipt.items.every((i) => i.isPutAway || i.inspectionResult !== InspectionResult.APPROVED);

        if (allPutAway) {
            receipt.status = GoodsReceiptStatus.COMPLETED;
            await this.goodsReceiptRepository.save(receipt);
        }
    }

    private generateReceiptNumber(): string {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `GR-${timestamp}-${random}`;
    }
}
