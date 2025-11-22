import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { Warehouse } from '../entities/warehouse.entity';
import { User } from '../entities/user.entity';
import { TransferItem } from './transfer-item.entity';

export enum TransferStatus {
    DRAFT = 'DRAFT',
    PENDING_APPROVAL = 'PENDING_APPROVAL',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    IN_TRANSIT = 'IN_TRANSIT',
    RECEIVED = 'RECEIVED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export enum TransferPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT',
}

@Entity('warehouse_transfers')
export class WarehouseTransfer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    transferNumber: string;

    @ManyToOne(() => Warehouse)
    @JoinColumn({ name: 'from_warehouse_id' })
    fromWarehouse: Warehouse;

    @ManyToOne(() => Warehouse)
    @JoinColumn({ name: 'to_warehouse_id' })
    toWarehouse: Warehouse;

    @Column({
        type: 'enum',
        enum: TransferStatus,
        default: TransferStatus.DRAFT,
    })
    status: TransferStatus;

    @Column({
        type: 'enum',
        enum: TransferPriority,
        default: TransferPriority.MEDIUM,
    })
    priority: TransferPriority;

    @Column({ type: 'date' })
    requestedDate: Date;

    @Column({ type: 'date', nullable: true })
    expectedDeliveryDate: Date;

    @Column({ type: 'date', nullable: true })
    actualDeliveryDate: Date;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ type: 'text', nullable: true })
    rejectionReason: string;

    @Column({ nullable: true })
    trackingNumber: string;

    @Column({ nullable: true })
    carrier: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    shippingCost: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'requested_by_id' })
    requestedBy: User;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'approved_by_id' })
    approvedBy: User;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'shipped_by_id' })
    shippedBy: User;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'received_by_id' })
    receivedBy: User;

    @Column({ type: 'timestamp', nullable: true })
    shippedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    receivedAt: Date;

    @OneToMany(() => TransferItem, (item) => item.transfer)
    items: TransferItem[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
