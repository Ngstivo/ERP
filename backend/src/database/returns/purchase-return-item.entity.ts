import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { PurchaseReturn } from './purchase-return.entity';
import { Product } from '../entities/product.entity';
import { Batch } from '../batches/batch.entity';

export enum ReturnItemStatus {
    PENDING = 'PENDING',
    PICKED = 'PICKED',
    PACKED = 'PACKED',
    SHIPPED = 'SHIPPED',
    RECEIVED_BY_SUPPLIER = 'RECEIVED_BY_SUPPLIER',
}

@Entity('purchase_return_items')
export class PurchaseReturnItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => PurchaseReturn, (purchaseReturn) => purchaseReturn.items)
    @JoinColumn({ name: 'purchase_return_id' })
    purchaseReturn: PurchaseReturn;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @ManyToOne(() => Batch, { nullable: true })
    @JoinColumn({ name: 'batch_id' })
    batch: Batch;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    unitPrice: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalPrice: number;

    @Column({
        type: 'enum',
        enum: ReturnItemStatus,
        default: ReturnItemStatus.PENDING,
    })
    status: ReturnItemStatus;

    @Column({ type: 'text', nullable: true })
    itemNotes: string;

    @Column({ default: false })
    isStockAdjusted: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
