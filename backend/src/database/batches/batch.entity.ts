import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { Product } from '../entities/product.entity';
import { Warehouse } from '../entities/warehouse.entity';
import { BatchStockLevel } from './batch-stock-level.entity';
import { BatchMovement } from './batch-movement.entity';

export enum QualityStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    QUARANTINE = 'QUARANTINE',
    RELEASED = 'RELEASED',
}

@Entity('batches')
export class Batch {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    batchNumber: string;

    @Column({ nullable: true })
    lotNumber: string;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @ManyToOne(() => Warehouse)
    @JoinColumn({ name: 'warehouse_id' })
    warehouse: Warehouse;

    @Column({ type: 'date', nullable: true })
    manufacturingDate: Date;

    @Column({ type: 'date', nullable: true })
    expirationDate: Date;

    @Column({ type: 'date', nullable: true })
    receivedDate: Date;

    @Column({
        type: 'enum',
        enum: QualityStatus,
        default: QualityStatus.PENDING,
    })
    qualityStatus: QualityStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    initialQuantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    currentQuantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    unitCost: number;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ nullable: true })
    supplierName: string;

    @Column({ nullable: true })
    supplierBatchNumber: string;

    @Column({ default: true })
    isActive: boolean;

    @OneToMany(() => BatchStockLevel, (stockLevel) => stockLevel.batch)
    stockLevels: BatchStockLevel[];

    @OneToMany(() => BatchMovement, (movement) => movement.batch)
    movements: BatchMovement[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Helper method to check if batch is expired
    get isExpired(): boolean {
        if (!this.expirationDate) return false;
        return new Date() > new Date(this.expirationDate);
    }

    // Helper method to get days until expiration
    get daysUntilExpiration(): number | null {
        if (!this.expirationDate) return null;
        const today = new Date();
        const expiry = new Date(this.expirationDate);
        const diffTime = expiry.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
}
