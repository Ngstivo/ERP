import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { WarehouseTransfer } from './transfer.entity';
import { Product } from '../entities/product.entity';
import { Batch } from '../batches/batch.entity';

export enum TransferItemStatus {
    PENDING = 'PENDING',
    PICKED = 'PICKED',
    IN_TRANSIT = 'IN_TRANSIT',
    RECEIVED = 'RECEIVED',
    DAMAGED = 'DAMAGED',
}

@Entity('transfer_items')
export class TransferItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => WarehouseTransfer, (transfer) => transfer.items)
    @JoinColumn({ name: 'transfer_id' })
    transfer: WarehouseTransfer;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @ManyToOne(() => Batch, { nullable: true })
    @JoinColumn({ name: 'batch_id' })
    batch: Batch;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    requestedQuantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    shippedQuantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    receivedQuantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    damagedQuantity: number;

    @Column({
        type: 'enum',
        enum: TransferItemStatus,
        default: TransferItemStatus.PENDING,
    })
    status: TransferItemStatus;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;
}
