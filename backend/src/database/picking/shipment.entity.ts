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
import { PickingList } from './picking-list.entity';
import { User } from '../entities/user.entity';
import { ShipmentItem } from './shipment-item.entity';

export enum ShipmentStatus {
    DRAFT = 'DRAFT',
    READY_TO_SHIP = 'READY_TO_SHIP',
    IN_TRANSIT = 'IN_TRANSIT',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
}

@Entity('shipments')
export class Shipment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    shipmentNumber: string;

    @ManyToOne(() => PickingList)
    @JoinColumn({ name: 'picking_list_id' })
    pickingList: PickingList;

    @Column({
        type: 'enum',
        enum: ShipmentStatus,
        default: ShipmentStatus.DRAFT,
    })
    status: ShipmentStatus;

    @Column({ type: 'date' })
    shipmentDate: Date;

    @Column({ nullable: true })
    trackingNumber: string;

    @Column({ nullable: true })
    carrier: string;

    @Column({ nullable: true })
    shippingMethod: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    shippingCost: number;

    @Column({ type: 'text', nullable: true })
    shippingAddress: string;

    @Column({ nullable: true })
    recipientName: string;

    @Column({ nullable: true })
    recipientPhone: string;

    @Column({ nullable: true })
    recipientEmail: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ type: 'int', default: 0 })
    numberOfPackages: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    totalWeight: number;

    @Column({ type: 'timestamp', nullable: true })
    estimatedDeliveryDate: Date;

    @Column({ type: 'timestamp', nullable: true })
    actualDeliveryDate: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'packed_by_id' })
    packedBy: User;

    @OneToMany(() => ShipmentItem, (item) => item.shipment)
    items: ShipmentItem[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
