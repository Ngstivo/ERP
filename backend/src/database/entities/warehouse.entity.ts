import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { StorageLocation } from './storage-location.entity';
import { StockLevel } from '../inventory/stock-level.entity';

@Entity('warehouses')
export class Warehouse {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    code: string;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column()
    address: string;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    state: string;

    @Column({ nullable: true })
    country: string;

    @Column({ nullable: true })
    postalCode: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    email: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    totalCapacity: number;

    @Column({ default: true })
    isActive: boolean;

    @OneToMany(() => StorageLocation, (location) => location.warehouse)
    storageLocations: StorageLocation[];

    @OneToMany(() => StockLevel, (stockLevel) => stockLevel.warehouse)
    stockLevels: StockLevel[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
