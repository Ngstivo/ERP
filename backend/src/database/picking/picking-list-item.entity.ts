import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { PickingList } from './picking-list.entity';
import { Product } from '../entities/product.entity';
import { Batch } from '../batches/batch.entity';
import { StorageLocation } from '../entities/storage-location.entity';

export enum PickingItemStatus {
    PENDING = 'PENDING',
    PICKED = 'PICKED',
    SHORT_PICKED = 'SHORT_PICKED',
    CANCELLED = 'CANCELLED',
}

@Entity('picking_list_items')
export class PickingListItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => PickingList, (pickingList) => pickingList.items)
    @JoinColumn({ name: 'picking_list_id' })
    pickingList: PickingList;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @ManyToOne(() => Batch, { nullable: true })
    @JoinColumn({ name: 'batch_id' })
    batch: Batch;

    @ManyToOne(() => StorageLocation)
    @JoinColumn({ name: 'location_id' })
    location: StorageLocation;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    requestedQuantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    pickedQuantity: number;

    @Column({
        type: 'enum',
        enum: PickingItemStatus,
        default: PickingItemStatus.PENDING,
    })
    status: PickingItemStatus;

    @Column({ type: 'int', default: 0 })
    sequence: number;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ type: 'timestamp', nullable: true })
    pickedAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}
