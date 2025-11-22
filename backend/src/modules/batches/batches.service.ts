import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, Between } from 'typeorm';
import { Batch, QualityStatus } from '@database/batches/batch.entity';
import { BatchStockLevel } from '@database/batches/batch-stock-level.entity';
import { BatchMovement, BatchMovementType } from '@database/batches/batch-movement.entity';
import { Product } from '@database/entities/product.entity';
import { Warehouse } from '@database/entities/warehouse.entity';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';

@Injectable()
export class BatchesService {
    constructor(
        @InjectRepository(Batch)
        private batchRepository: Repository<Batch>,
        @InjectRepository(BatchStockLevel)
        private batchStockLevelRepository: Repository<BatchStockLevel>,
        @InjectRepository(BatchMovement)
        private batchMovementRepository: Repository<BatchMovement>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        @InjectRepository(Warehouse)
        private warehouseRepository: Repository<Warehouse>,
    ) { }

    async create(createBatchDto: CreateBatchDto, userId: string): Promise<Batch> {
        const product = await this.productRepository.findOne({
            where: { id: createBatchDto.productId },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        const warehouse = await this.warehouseRepository.findOne({
            where: { id: createBatchDto.warehouseId },
        });

        if (!warehouse) {
            throw new NotFoundException('Warehouse not found');
        }

        // Generate batch number if not provided
        const batchNumber = createBatchDto.batchNumber || this.generateBatchNumber();

        const batch = this.batchRepository.create({
            ...createBatchDto,
            batchNumber,
            product,
            warehouse,
            currentQuantity: createBatchDto.initialQuantity,
        });

        const savedBatch = await this.batchRepository.save(batch);

        // Create initial batch movement
        await this.batchMovementRepository.save({
            referenceNumber: `BM-${Date.now()}`,
            type: BatchMovementType.RECEIVE,
            batch: savedBatch,
            quantity: createBatchDto.initialQuantity,
            unitCost: createBatchDto.unitCost,
            notes: 'Initial batch receipt',
            createdBy: { id: userId } as any,
        });

        return savedBatch;
    }

    async findAll(
        productId?: string,
        warehouseId?: string,
        qualityStatus?: QualityStatus,
    ): Promise<Batch[]> {
        const query = this.batchRepository.createQueryBuilder('batch')
            .leftJoinAndSelect('batch.product', 'product')
            .leftJoinAndSelect('batch.warehouse', 'warehouse')
            .leftJoinAndSelect('batch.stockLevels', 'stockLevels')
            .orderBy('batch.expirationDate', 'ASC');

        if (productId) {
            query.andWhere('batch.product.id = :productId', { productId });
        }

        if (warehouseId) {
            query.andWhere('batch.warehouse.id = :warehouseId', { warehouseId });
        }

        if (qualityStatus) {
            query.andWhere('batch.qualityStatus = :qualityStatus', { qualityStatus });
        }

        return await query.getMany();
    }

    async findOne(id: string): Promise<Batch> {
        const batch = await this.batchRepository.findOne({
            where: { id },
            relations: ['product', 'warehouse', 'stockLevels', 'stockLevels.location', 'movements'],
        });

        if (!batch) {
            throw new NotFoundException(`Batch with ID ${id} not found`);
        }

        return batch;
    }

    async update(id: string, updateBatchDto: UpdateBatchDto): Promise<Batch> {
        const batch = await this.findOne(id);
        Object.assign(batch, updateBatchDto);
        return await this.batchRepository.save(batch);
    }

    async updateQualityStatus(
        id: string,
        qualityStatus: QualityStatus,
        userId: string,
    ): Promise<Batch> {
        const batch = await this.findOne(id);
        batch.qualityStatus = qualityStatus;

        await this.batchMovementRepository.save({
            referenceNumber: `QC-${Date.now()}`,
            type: BatchMovementType.ADJUSTMENT,
            batch,
            quantity: 0,
            notes: `Quality status changed to ${qualityStatus}`,
            createdBy: { id: userId } as any,
        });

        return await this.batchRepository.save(batch);
    }

    async getExpiringBatches(daysThreshold: number = 30): Promise<Batch[]> {
        const today = new Date();
        const thresholdDate = new Date();
        thresholdDate.setDate(today.getDate() + daysThreshold);

        return await this.batchRepository.find({
            where: {
                expirationDate: Between(today, thresholdDate),
                isActive: true,
            },
            relations: ['product', 'warehouse'],
            order: { expirationDate: 'ASC' },
        });
    }

    async getExpiredBatches(): Promise<Batch[]> {
        const today = new Date();

        return await this.batchRepository.find({
            where: {
                expirationDate: LessThan(today),
                isActive: true,
            },
            relations: ['product', 'warehouse'],
            order: { expirationDate: 'ASC' },
        });
    }

    async getBatchesByFEFO(productId: string, warehouseId: string): Promise<Batch[]> {
        return await this.batchRepository.find({
            where: {
                product: { id: productId },
                warehouse: { id: warehouseId },
                qualityStatus: QualityStatus.RELEASED,
                isActive: true,
            },
            order: {
                expirationDate: 'ASC',
            },
            relations: ['product', 'warehouse', 'stockLevels'],
        });
    }

    async getTraceability(batchNumber: string): Promise<any> {
        const batch = await this.batchRepository.findOne({
            where: { batchNumber },
            relations: ['product', 'warehouse', 'movements', 'movements.createdBy'],
        });

        if (!batch) {
            throw new NotFoundException(`Batch ${batchNumber} not found`);
        }

        return {
            batch: {
                batchNumber: batch.batchNumber,
                lotNumber: batch.lotNumber,
                product: batch.product.name,
                sku: batch.product.sku,
                warehouse: batch.warehouse.name,
                manufacturingDate: batch.manufacturingDate,
                expirationDate: batch.expirationDate,
                receivedDate: batch.receivedDate,
                qualityStatus: batch.qualityStatus,
                initialQuantity: batch.initialQuantity,
                currentQuantity: batch.currentQuantity,
                supplierName: batch.supplierName,
                supplierBatchNumber: batch.supplierBatchNumber,
            },
            movements: batch.movements.map((m) => ({
                referenceNumber: m.referenceNumber,
                type: m.type,
                quantity: m.quantity,
                createdBy: `${m.createdBy.firstName} ${m.createdBy.lastName}`,
                createdAt: m.createdAt,
                notes: m.notes,
            })),
            timeline: this.buildTimeline(batch),
        };
    }

    private buildTimeline(batch: Batch): any[] {
        const timeline = [];

        if (batch.manufacturingDate) {
            timeline.push({
                date: batch.manufacturingDate,
                event: 'Manufactured',
                description: `Batch manufactured${batch.supplierName ? ` by ${batch.supplierName}` : ''}`,
            });
        }

        if (batch.receivedDate) {
            timeline.push({
                date: batch.receivedDate,
                event: 'Received',
                description: `Received at ${batch.warehouse.name}`,
            });
        }

        timeline.push({
            date: batch.createdAt,
            event: 'Created in System',
            description: 'Batch record created',
        });

        if (batch.expirationDate) {
            timeline.push({
                date: batch.expirationDate,
                event: 'Expiration',
                description: 'Batch expiration date',
            });
        }

        return timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    private generateBatchNumber(): string {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `BATCH-${timestamp}-${random}`;
    }

    async remove(id: string): Promise<void> {
        const batch = await this.findOne(id);
        batch.isActive = false;
        await this.batchRepository.save(batch);
    }
}
