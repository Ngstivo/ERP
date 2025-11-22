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
import { Category } from './category.entity';
import { UnitOfMeasure } from './unit-of-measure.entity';
import { StockLevel } from '../inventory/stock-level.entity';
import { Barcode } from './barcode.entity';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    sku: string;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @ManyToOne(() => Category, { eager: true })
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @ManyToOne(() => UnitOfMeasure, { eager: true })
    @JoinColumn({ name: 'uom_id' })
    unitOfMeasure: UnitOfMeasure;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    unitPrice: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    costPrice: number;

    @Column({ default: 0 })
    reorderPoint: number;

    @Column({ default: 0 })
    minStockLevel: number;

    @Column({ default: 0 })
    maxStockLevel: number;

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true })
    imageUrl: string;

    @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
    weight: number;

    @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
    length: number;

    @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
    width: number;

    @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
    height: number;

    @OneToMany(() => StockLevel, (stockLevel) => stockLevel.product)
    stockLevels: StockLevel[];

    @OneToMany(() => Barcode, (barcode) => barcode.product)
    barcodes: Barcode[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
