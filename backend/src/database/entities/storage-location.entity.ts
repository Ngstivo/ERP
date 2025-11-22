import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Tree,
    TreeChildren,
    TreeParent,
} from 'typeorm';
import { Warehouse } from './warehouse.entity';

export enum LocationType {
    ZONE = 'ZONE',
    AISLE = 'AISLE',
    SHELF = 'SHELF',
    BIN = 'BIN',
    PALLET = 'PALLET',
}

export enum ZoneType {
    BULK = 'BULK',
    PICKING = 'PICKING',
    QUARANTINE = 'QUARANTINE',
    STAGING = 'STAGING',
    RECEIVING = 'RECEIVING',
    SHIPPING = 'SHIPPING',
}

@Entity('storage_locations')
@Tree('closure-table')
export class StorageLocation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    code: string;

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: LocationType,
    })
    type: LocationType;

    @Column({
        type: 'enum',
        enum: ZoneType,
        nullable: true,
    })
    zoneType: ZoneType;

    @ManyToOne(() => Warehouse, (warehouse) => warehouse.storageLocations)
    @JoinColumn({ name: 'warehouse_id' })
    warehouse: Warehouse;

    @TreeChildren()
    children: StorageLocation[];

    @TreeParent()
    parent: StorageLocation;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    capacity: number;

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true })
    barcode: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
