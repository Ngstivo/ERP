import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Product } from '../entities/product.entity';
import { Warehouse } from '../entities/warehouse.entity';
import { StorageLocation } from '../entities/storage-location.entity';
import { User } from '../entities/user.entity';

export enum MovementType {
    PURCHASE = 'PURCHASE',
    SALE = 'SALE',
    ADJUSTMENT = 'ADJUSTMENT',
    TRANSFER_IN = 'TRANSFER_IN',
    TRANSFER_OUT = 'TRANSFER_OUT',
    RETURN = 'RETURN',
    DAMAGE = 'DAMAGE',
    LOSS = 'LOSS',
}

@Entity('stock_movements')
export class StockMovement {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    referenceNumber: string;

    @Column({
        type: 'enum',
        enum: MovementType,
    })
    type: MovementType;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @ManyToOne(() => Warehouse)
    @JoinColumn({ name: 'warehouse_id' })
    warehouse: Warehouse;

    @ManyToOne(() => StorageLocation, { nullable: true })
    @JoinColumn({ name: 'location_id' })
    location: StorageLocation;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    unitCost: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    totalCost: number;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ nullable: true })
    relatedDocumentType: string; // e.g., 'PurchaseOrder', 'SalesOrder'

    @Column({ nullable: true })
    relatedDocumentId: string;

    @ManyToOne(() => User, (user) => user.stockMovements)
    @JoinColumn({ name: 'created_by_id' })
    createdBy: User;

    @CreateDateColumn()
    createdAt: Date;
}
