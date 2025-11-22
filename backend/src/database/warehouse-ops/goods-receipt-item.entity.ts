import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { GoodsReceipt } from './goods-receipt.entity';
import { Product } from '../entities/product.entity';
import { Batch } from '../batches/batch.entity';
import { StorageLocation } from '../entities/storage-location.entity';

export enum InspectionResult {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    PARTIAL = 'PARTIAL',
}

@Entity('goods_receipt_items')
export class GoodsReceiptItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => GoodsReceipt, (receipt) => receipt.items)
    @JoinColumn({ name: 'goods_receipt_id' })
    goodsReceipt: GoodsReceipt;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @ManyToOne(() => Batch, { nullable: true })
    @JoinColumn({ name: 'batch_id' })
    batch: Batch;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    orderedQuantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    receivedQuantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    acceptedQuantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    rejectedQuantity: number;

    @Column({
        type: 'enum',
        enum: InspectionResult,
        default: InspectionResult.PENDING,
    })
    inspectionResult: InspectionResult;

    @Column({ type: 'text', nullable: true })
    inspectionNotes: string;

    @Column({ type: 'text', nullable: true })
    rejectionReason: string;

    @ManyToOne(() => StorageLocation, { nullable: true })
    @JoinColumn({ name: 'put_away_location_id' })
    putAwayLocation: StorageLocation;

    @Column({ default: false })
    isPutAway: boolean;

    @Column({ type: 'timestamp', nullable: true })
    putAwayTime: Date;

    @CreateDateColumn()
    createdAt: Date;
}
