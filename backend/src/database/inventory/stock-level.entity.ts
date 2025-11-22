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
import { Product } from '../entities/product.entity';
import { Warehouse } from '../entities/warehouse.entity';
import { StorageLocation } from '../entities/storage-location.entity';

@Entity('stock_levels')
@Index(['product', 'warehouse'], { unique: true })
export class StockLevel {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Product, (product) => product.stockLevels)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @ManyToOne(() => Warehouse, (warehouse) => warehouse.stockLevels)
    @JoinColumn({ name: 'warehouse_id' })
    warehouse: Warehouse;

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
