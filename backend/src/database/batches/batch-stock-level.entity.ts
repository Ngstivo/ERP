import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { Batch } from './batch.entity';
import { StorageLocation } from '../entities/storage-location.entity';

@Entity('batch_stock_levels')
@Index(['batch', 'location'], { unique: true })
export class BatchStockLevel {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Batch, (batch) => batch.stockLevels)
    @JoinColumn({ name: 'batch_id' })
    batch: Batch;

    @ManyToOne(() => StorageLocation, { nullable: true })
    @JoinColumn({ name: 'location_id' })
    location: StorageLocation;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    reservedQuantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    availableQuantity: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
