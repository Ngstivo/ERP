import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseReturn, PurchaseReturnStatus, ReturnReason } from '@database/returns/purchase-return.entity';
import { PurchaseReturnItem } from '@database/returns/purchase-return-item.entity';
import { PurchaseOrder } from '@database/orders/purchase-order.entity';
import { GoodsReceipt } from '@database/warehouse-ops/goods-receipt.entity';
import { Warehouse } from '@database/entities/warehouse.entity';
import { StockLevel } from '@database/inventory/stock-level.entity';
import { StockMovement, MovementType } from '@database/inventory/stock-movement.entity';
import { CreatePurchaseReturnDto } from './dto/create-purchase-return.dto';
import { UpdatePurchaseReturnDto } from './dto/update-purchase-return.dto';

@Injectable()
export class PurchaseReturnService {
    constructor(
        @InjectRepository(PurchaseReturn)
        private purchaseReturnRepository: Repository<PurchaseReturn>,
        @InjectRepository(PurchaseReturnItem)
        private purchaseReturnItemRepository: Repository<PurchaseReturnItem>,
        @InjectRepository(PurchaseOrder)
        private purchaseOrderRepository: Repository<PurchaseOrder>,
        @InjectRepository(GoodsReceipt)
        private goodsReceiptRepository: Repository<GoodsReceipt>,
        @InjectRepository(Warehouse)
        private warehouseRepository: Repository<Warehouse>,
        @InjectRepository(StockLevel)
        private stockLevelRepository: Repository<StockLevel>,
        @InjectRepository(StockMovement)
        private stockMovementRepository: Repository<StockMovement>,
    ) { }

    async create(createDto: CreatePurchaseReturnDto, userId: string): Promise<PurchaseReturn> {
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

        let goodsReceipt = null;
        if (createDto.goodsReceiptId) {
            goodsReceipt = await this.goodsReceiptRepository.findOne({
                where: { id: createDto.goodsReceiptId },
            });
        }

        const returnNumber = this.generateReturnNumber();

        const purchaseReturn = this.purchaseReturnRepository.create({
            returnNumber,
            purchaseOrder,
            goodsReceipt,
            warehouse,
            returnDate: createDto.returnDate || new Date(),
            returnReason: createDto.returnReason,
            notes: createDto.notes,
            supplierRmaNumber: createDto.supplierRmaNumber,
            isRefundRequested: createDto.isRefundRequested || false,
            createdBy: { id: userId } as any,
            status: PurchaseReturnStatus.DRAFT,
        });

        const savedReturn = await this.purchaseReturnRepository.save(purchaseReturn);

        // Create return items
        let totalAmount = 0;
        const items = createDto.items.map((item) => {
            const itemTotal = Number(item.quantity) * Number(item.unitPrice);
            totalAmount += itemTotal;

            return this.purchaseReturnItemRepository.create({
                purchaseReturn: savedReturn,
                product: { id: item.productId } as any,
                batch: item.batchId ? { id: item.batchId } as any : null,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: itemTotal,
                itemNotes: item.itemNotes,
            });
        });

        await this.purchaseReturnItemRepository.save(items);

        // Update total amount
        savedReturn.totalAmount = totalAmount;
        await this.purchaseReturnRepository.save(savedReturn);

        return this.findOne(savedReturn.id);
    }

    async findAll(
        warehouseId?: string,
        status?: PurchaseReturnStatus,
        returnReason?: ReturnReason,
    ): Promise<PurchaseReturn[]> {
        const query = this.purchaseReturnRepository.createQueryBuilder('pr')
            .leftJoinAndSelect('pr.purchaseOrder', 'po')
            .leftJoinAndSelect('pr.warehouse', 'warehouse')
            .leftJoinAndSelect('pr.createdBy', 'createdBy')
            .leftJoinAndSelect('pr.items', 'items')
            .leftJoinAndSelect('items.product', 'product')
            .orderBy('pr.returnDate', 'DESC');

        if (warehouseId) {
            query.andWhere('pr.warehouse.id = :warehouseId', { warehouseId });
        }

        if (status) {
            query.andWhere('pr.status = :status', { status });
        }

        if (returnReason) {
            query.andWhere('pr.returnReason = :returnReason', { returnReason });
        }

        return await query.getMany();
    }

    async findOne(id: string): Promise<PurchaseReturn> {
        const purchaseReturn = await this.purchaseReturnRepository.findOne({
            where: { id },
            relations: [
                'purchaseOrder',
                'goodsReceipt',
                'warehouse',
                'createdBy',
                'approvedBy',
                'items',
                'items.product',
                'items.batch',
            ],
        });

        if (!purchaseReturn) {
            throw new NotFoundException(`Purchase return with ID ${id} not found`);
        }

        return purchaseReturn;
    }

    async update(id: string, updateDto: UpdatePurchaseReturnDto): Promise<PurchaseReturn> {
        const purchaseReturn = await this.findOne(id);

        if (purchaseReturn.status !== PurchaseReturnStatus.DRAFT) {
            throw new BadRequestException('Only draft returns can be updated');
        }

        Object.assign(purchaseReturn, updateDto);
        return await this.purchaseReturnRepository.save(purchaseReturn);
    }

    async submitForApproval(id: string): Promise<PurchaseReturn> {
        const purchaseReturn = await this.findOne(id);

        if (purchaseReturn.status !== PurchaseReturnStatus.DRAFT) {
            throw new BadRequestException('Only draft returns can be submitted');
        }

        if (!purchaseReturn.items || purchaseReturn.items.length === 0) {
            throw new BadRequestException('Cannot submit return without items');
        }

        purchaseReturn.status = PurchaseReturnStatus.PENDING_APPROVAL;
        return await this.purchaseReturnRepository.save(purchaseReturn);
    }

    async approve(id: string, userId: string): Promise<PurchaseReturn> {
        const purchaseReturn = await this.findOne(id);

        if (purchaseReturn.status !== PurchaseReturnStatus.PENDING_APPROVAL) {
            throw new BadRequestException('Only pending returns can be approved');
        }

        purchaseReturn.status = PurchaseReturnStatus.APPROVED;
        purchaseReturn.approvedBy = { id: userId } as any;

        return await this.purchaseReturnRepository.save(purchaseReturn);
    }

    async reject(id: string, userId: string, reason: string): Promise<PurchaseReturn> {
        const purchaseReturn = await this.findOne(id);

        if (purchaseReturn.status !== PurchaseReturnStatus.PENDING_APPROVAL) {
            throw new BadRequestException('Only pending returns can be rejected');
        }

        purchaseReturn.status = PurchaseReturnStatus.REJECTED;
        purchaseReturn.approvedBy = { id: userId } as any;
        purchaseReturn.notes = `${purchaseReturn.notes || ''}\nRejection reason: ${reason}`;

        return await this.purchaseReturnRepository.save(purchaseReturn);
    }

    async processReturn(id: string, userId: string): Promise<PurchaseReturn> {
        const purchaseReturn = await this.findOne(id);

        if (purchaseReturn.status !== PurchaseReturnStatus.APPROVED) {
            throw new BadRequestException('Only approved returns can be processed');
        }

        purchaseReturn.status = PurchaseReturnStatus.PROCESSING;

        // Adjust stock levels for each item
        for (const item of purchaseReturn.items) {
            await this.adjustStockForReturn(item, purchaseReturn, userId);
        }

        purchaseReturn.status = PurchaseReturnStatus.COMPLETED;
        return await this.purchaseReturnRepository.save(purchaseReturn);
    }

    private async adjustStockForReturn(
        item: PurchaseReturnItem,
        purchaseReturn: PurchaseReturn,
        userId: string,
    ): Promise<void> {
        if (item.isStockAdjusted) {
            return; // Already adjusted
        }

        // Find stock level
        const stockLevel = await this.stockLevelRepository.findOne({
            where: {
                product: { id: item.product.id },
                warehouse: { id: purchaseReturn.warehouse.id },
            },
        });

        if (!stockLevel) {
            throw new NotFoundException(
                `Stock level not found for product ${item.product.id} in warehouse ${purchaseReturn.warehouse.id}`
            );
        }

        // Reduce stock
        const returnQty = Number(item.quantity);
        stockLevel.quantity = Number(stockLevel.quantity) - returnQty;
        stockLevel.availableQuantity = Number(stockLevel.availableQuantity) - returnQty;

        if (stockLevel.quantity < 0) {
            throw new BadRequestException(
                `Insufficient stock for product ${item.product.id}. Available: ${stockLevel.quantity + returnQty}, Requested: ${returnQty}`
            );
        }

        await this.stockLevelRepository.save(stockLevel);

        // Create stock movement
        await this.stockMovementRepository.save({
            referenceNumber: `PR-${purchaseReturn.returnNumber}`,
            type: MovementType.RETURN,
            product: item.product,
            warehouse: purchaseReturn.warehouse,
            quantity: -returnQty, // Negative for return
            notes: `Purchase return - ${purchaseReturn.returnReason}`,
            createdBy: { id: userId } as any,
        });

        // Mark as adjusted
        item.isStockAdjusted = true;
        await this.purchaseReturnItemRepository.save(item);
    }

    async processRefund(id: string): Promise<PurchaseReturn> {
        const purchaseReturn = await this.findOne(id);

        if (purchaseReturn.status !== PurchaseReturnStatus.COMPLETED) {
            throw new BadRequestException('Only completed returns can have refunds processed');
        }

        if (!purchaseReturn.isRefundRequested) {
            throw new BadRequestException('Refund was not requested for this return');
        }

        if (purchaseReturn.isRefundProcessed) {
            throw new BadRequestException('Refund already processed');
        }

        purchaseReturn.isRefundProcessed = true;
        purchaseReturn.refundDate = new Date();

        return await this.purchaseReturnRepository.save(purchaseReturn);
    }

    private generateReturnNumber(): string {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `PR-${timestamp}-${random}`;
    }

    async remove(id: string): Promise<void> {
        const purchaseReturn = await this.findOne(id);

        if (purchaseReturn.status !== PurchaseReturnStatus.DRAFT) {
            throw new BadRequestException('Only draft returns can be deleted');
        }

        await this.purchaseReturnRepository.remove(purchaseReturn);
    }
}
