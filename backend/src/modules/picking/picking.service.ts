import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { PickingList, PickingStrategy, PickingListStatus } from '@database/picking/picking-list.entity';
import { PickingListItem, PickingItemStatus } from '@database/picking/picking-list-item.entity';
import { Shipment, ShipmentStatus } from '@database/picking/shipment.entity';
import { ShipmentItem } from '@database/picking/shipment-item.entity';
import { Warehouse } from '@database/entities/warehouse.entity';
import { StockLevel } from '@database/inventory/stock-level.entity';
import { StockMovement, MovementType } from '@database/inventory/stock-movement.entity';
import { Batch } from '@database/batches/batch.entity';
import { CreatePickingListDto } from './dto/create-picking-list.dto';
import { PickItemDto } from './dto/pick-item.dto';
import { CreateShipmentDto } from './dto/create-shipment.dto';

@Injectable()
export class PickingService {
    constructor(
        @InjectRepository(PickingList)
        private pickingListRepository: Repository<PickingList>,
        @InjectRepository(PickingListItem)
        private pickingListItemRepository: Repository<PickingListItem>,
        @InjectRepository(Shipment)
        private shipmentRepository: Repository<Shipment>,
        @InjectRepository(ShipmentItem)
        private shipmentItemRepository: Repository<ShipmentItem>,
        @InjectRepository(Warehouse)
        private warehouseRepository: Repository<Warehouse>,
        @InjectRepository(StockLevel)
        private stockLevelRepository: Repository<StockLevel>,
        @InjectRepository(StockMovement)
        private stockMovementRepository: Repository<StockMovement>,
        @InjectRepository(Batch)
        private batchRepository: Repository<Batch>,
    ) { }

    async createPickingList(createDto: CreatePickingListDto, userId: string): Promise<PickingList> {
        const warehouse = await this.warehouseRepository.findOne({
            where: { id: createDto.warehouseId },
        });

        if (!warehouse) {
            throw new NotFoundException('Warehouse not found');
        }

        const pickingNumber = this.generatePickingNumber();

        const pickingList = this.pickingListRepository.create({
            pickingNumber,
            warehouse,
            strategy: createDto.strategy || PickingStrategy.FIFO,
            pickingDate: createDto.pickingDate || new Date(),
            priority: createDto.priority || 0,
            notes: createDto.notes,
            customerName: createDto.customerName,
            orderReference: createDto.orderReference,
            createdBy: { id: userId } as any,
            status: PickingListStatus.DRAFT,
        });

        const savedList = await this.pickingListRepository.save(pickingList);

        // Create picking items with location suggestions
        const items = await Promise.all(
            createDto.items.map(async (item, index) => {
                const location = await this.suggestPickingLocation(
                    item.productId,
                    createDto.warehouseId,
                    item.quantity,
                    createDto.strategy,
                );

                return this.pickingListItemRepository.create({
                    pickingList: savedList,
                    product: { id: item.productId } as any,
                    batch: item.batchId ? { id: item.batchId } as any : null,
                    location,
                    requestedQuantity: item.quantity,
                    sequence: index + 1,
                    notes: item.notes,
                });
            })
        );

        await this.pickingListItemRepository.save(items);

        return this.findOne(savedList.id);
    }

    async suggestPickingLocation(
        productId: string,
        warehouseId: string,
        quantity: number,
        strategy: PickingStrategy,
    ): Promise<any> {
        const stockLevels = await this.stockLevelRepository.find({
            where: {
                product: { id: productId },
                warehouse: { id: warehouseId },
            },
            relations: ['location', 'batch'],
        });

        if (stockLevels.length === 0) {
            throw new NotFoundException(`No stock found for product ${productId}`);
        }

        // Filter only locations with available stock
        const availableStock = stockLevels.filter(
            (sl) => Number(sl.availableQuantity) > 0
        );

        if (availableStock.length === 0) {
            throw new BadRequestException(`No available stock for product ${productId}`);
        }

        // Apply picking strategy
        let selectedStock: StockLevel;

        switch (strategy) {
            case PickingStrategy.FIFO:
                // Pick oldest stock first (by creation date)
                selectedStock = availableStock.sort((a, b) =>
                    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                )[0];
                break;

            case PickingStrategy.FEFO:
                // Pick stock expiring soonest
                const stockWithExpiry = availableStock.filter(sl => sl.batch?.expirationDate);
                if (stockWithExpiry.length > 0) {
                    selectedStock = stockWithExpiry.sort((a, b) =>
                        new Date(a.batch.expirationDate).getTime() - new Date(b.batch.expirationDate).getTime()
                    )[0];
                } else {
                    selectedStock = availableStock[0];
                }
                break;

            case PickingStrategy.LIFO:
                // Pick newest stock first
                selectedStock = availableStock.sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )[0];
                break;

            default:
                selectedStock = availableStock[0];
        }

        return selectedStock.location;
    }

    async findAll(warehouseId?: string, status?: PickingListStatus): Promise<PickingList[]> {
        const query = this.pickingListRepository.createQueryBuilder('pl')
            .leftJoinAndSelect('pl.warehouse', 'warehouse')
            .leftJoinAndSelect('pl.createdBy', 'createdBy')
            .leftJoinAndSelect('pl.assignedTo', 'assignedTo')
            .leftJoinAndSelect('pl.items', 'items')
            .leftJoinAndSelect('items.product', 'product')
            .orderBy('pl.pickingDate', 'DESC');

        if (warehouseId) {
            query.andWhere('pl.warehouse.id = :warehouseId', { warehouseId });
        }

        if (status) {
            query.andWhere('pl.status = :status', { status });
        }

        return await query.getMany();
    }

    async findOne(id: string): Promise<PickingList> {
        const pickingList = await this.pickingListRepository.findOne({
            where: { id },
            relations: [
                'warehouse',
                'createdBy',
                'assignedTo',
                'items',
                'items.product',
                'items.batch',
                'items.location',
            ],
        });

        if (!pickingList) {
            throw new NotFoundException(`Picking list with ID ${id} not found`);
        }

        return pickingList;
    }

    async releasePickingList(id: string): Promise<PickingList> {
        const pickingList = await this.findOne(id);

        if (pickingList.status !== PickingListStatus.DRAFT) {
            throw new BadRequestException('Only draft picking lists can be released');
        }

        // Reserve stock for picking
        for (const item of pickingList.items) {
            const stockLevel = await this.stockLevelRepository.findOne({
                where: {
                    product: { id: item.product.id },
                    warehouse: { id: pickingList.warehouse.id },
                    location: { id: item.location.id },
                },
            });

            if (!stockLevel) {
                throw new NotFoundException(`Stock level not found for item ${item.id}`);
            }

            const requestedQty = Number(item.requestedQuantity);
            if (Number(stockLevel.availableQuantity) < requestedQty) {
                throw new BadRequestException(
                    `Insufficient stock for ${item.product.name}. Available: ${stockLevel.availableQuantity}, Requested: ${requestedQty}`
                );
            }

            // Reserve stock
            stockLevel.reservedQuantity = Number(stockLevel.reservedQuantity) + requestedQty;
            stockLevel.availableQuantity = Number(stockLevel.availableQuantity) - requestedQty;
            await this.stockLevelRepository.save(stockLevel);
        }

        pickingList.status = PickingListStatus.RELEASED;
        return await this.pickingListRepository.save(pickingList);
    }

    async startPicking(id: string, userId: string): Promise<PickingList> {
        const pickingList = await this.findOne(id);

        if (pickingList.status !== PickingListStatus.RELEASED) {
            throw new BadRequestException('Only released picking lists can be started');
        }

        pickingList.status = PickingListStatus.IN_PROGRESS;
        pickingList.pickingStartTime = new Date();
        pickingList.assignedTo = { id: userId } as any;

        return await this.pickingListRepository.save(pickingList);
    }

    async pickItem(itemId: string, pickDto: PickItemDto, userId: string): Promise<PickingListItem> {
        const item = await this.pickingListItemRepository.findOne({
            where: { id: itemId },
            relations: ['pickingList', 'pickingList.warehouse', 'product', 'location'],
        });

        if (!item) {
            throw new NotFoundException('Picking list item not found');
        }

        item.pickedQuantity = pickDto.pickedQuantity;
        item.pickedAt = new Date();

        if (Number(pickDto.pickedQuantity) >= Number(item.requestedQuantity)) {
            item.status = PickingItemStatus.PICKED;
        } else if (Number(pickDto.pickedQuantity) > 0) {
            item.status = PickingItemStatus.SHORT_PICKED;
        }

        if (pickDto.notes) {
            item.notes = pickDto.notes;
        }

        // Update stock levels
        const stockLevel = await this.stockLevelRepository.findOne({
            where: {
                product: { id: item.product.id },
                warehouse: { id: item.pickingList.warehouse.id },
                location: { id: item.location.id },
            },
        });

        if (stockLevel) {
            const pickedQty = Number(pickDto.pickedQuantity);
            stockLevel.quantity = Number(stockLevel.quantity) - pickedQty;
            stockLevel.reservedQuantity = Number(stockLevel.reservedQuantity) - pickedQty;
            await this.stockLevelRepository.save(stockLevel);

            // Create stock movement
            await this.stockMovementRepository.save({
                referenceNumber: `PICK-${item.pickingList.pickingNumber}`,
                type: MovementType.PICK,
                product: item.product,
                warehouse: item.pickingList.warehouse,
                fromLocation: item.location,
                quantity: -pickedQty,
                notes: `Picked for ${item.pickingList.orderReference || 'order'}`,
                createdBy: { id: userId } as any,
            });
        }

        return await this.pickingListItemRepository.save(item);
    }

    async completePicking(id: string): Promise<PickingList> {
        const pickingList = await this.findOne(id);

        if (pickingList.status !== PickingListStatus.IN_PROGRESS) {
            throw new BadRequestException('Only in-progress picking lists can be completed');
        }

        const pendingItems = pickingList.items.filter(
            (item) => item.status === PickingItemStatus.PENDING
        );

        if (pendingItems.length > 0) {
            throw new BadRequestException('All items must be picked before completing');
        }

        pickingList.status = PickingListStatus.PICKED;
        pickingList.pickingEndTime = new Date();

        return await this.pickingListRepository.save(pickingList);
    }

    async createShipment(createDto: CreateShipmentDto, userId: string): Promise<Shipment> {
        const pickingList = await this.findOne(createDto.pickingListId);

        if (pickingList.status !== PickingListStatus.PICKED) {
            throw new BadRequestException('Only picked lists can be shipped');
        }

        const shipmentNumber = this.generateShipmentNumber();

        const shipment = this.shipmentRepository.create({
            shipmentNumber,
            pickingList,
            shipmentDate: createDto.shipmentDate || new Date(),
            trackingNumber: createDto.trackingNumber,
            carrier: createDto.carrier,
            shippingMethod: createDto.shippingMethod,
            shippingCost: createDto.shippingCost,
            shippingAddress: createDto.shippingAddress,
            recipientName: createDto.recipientName,
            recipientPhone: createDto.recipientPhone,
            recipientEmail: createDto.recipientEmail,
            notes: createDto.notes,
            numberOfPackages: createDto.numberOfPackages || 1,
            totalWeight: createDto.totalWeight,
            estimatedDeliveryDate: createDto.estimatedDeliveryDate,
            packedBy: { id: userId } as any,
            status: ShipmentStatus.READY_TO_SHIP,
        });

        const savedShipment = await this.shipmentRepository.save(shipment);

        // Create shipment items from picked items
        const items = pickingList.items.map((item) =>
            this.shipmentItemRepository.create({
                shipment: savedShipment,
                product: item.product,
                quantity: item.pickedQuantity,
            })
        );

        await this.shipmentItemRepository.save(items);

        // Update picking list status
        pickingList.status = PickingListStatus.PACKED;
        await this.pickingListRepository.save(pickingList);

        return this.findShipment(savedShipment.id);
    }

    async findShipment(id: string): Promise<Shipment> {
        const shipment = await this.shipmentRepository.findOne({
            where: { id },
            relations: ['pickingList', 'packedBy', 'items', 'items.product'],
        });

        if (!shipment) {
            throw new NotFoundException(`Shipment with ID ${id} not found`);
        }

        return shipment;
    }

    async shipShipment(id: string): Promise<Shipment> {
        const shipment = await this.findShipment(id);

        if (shipment.status !== ShipmentStatus.READY_TO_SHIP) {
            throw new BadRequestException('Only ready shipments can be shipped');
        }

        shipment.status = ShipmentStatus.IN_TRANSIT;

        // Update picking list
        const pickingList = await this.findOne(shipment.pickingList.id);
        pickingList.status = PickingListStatus.SHIPPED;
        await this.pickingListRepository.save(pickingList);

        return await this.shipmentRepository.save(shipment);
    }

    async generateDeliveryNote(shipmentId: string): Promise<any> {
        const shipment = await this.findShipment(shipmentId);

        return {
            shipmentNumber: shipment.shipmentNumber,
            shipmentDate: shipment.shipmentDate,
            trackingNumber: shipment.trackingNumber,
            carrier: shipment.carrier,
            recipient: {
                name: shipment.recipientName,
                address: shipment.shippingAddress,
                phone: shipment.recipientPhone,
                email: shipment.recipientEmail,
            },
            items: shipment.items.map((item) => ({
                productName: item.product.name,
                sku: item.product.sku,
                quantity: item.quantity,
            })),
            numberOfPackages: shipment.numberOfPackages,
            totalWeight: shipment.totalWeight,
            estimatedDelivery: shipment.estimatedDeliveryDate,
        };
    }

    private generatePickingNumber(): string {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `PICK-${timestamp}-${random}`;
    }

    private generateShipmentNumber(): string {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `SHIP-${timestamp}-${random}`;
    }
}
