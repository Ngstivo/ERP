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
import { User } from '../entities/user.entity';
import { Warehouse } from '../entities/warehouse.entity';
import { PurchaseOrderItem } from './purchase-order-item.entity';

export enum OrderStatus {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    RECEIVED = 'RECEIVED',
    PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
    CANCELLED = 'CANCELLED',
}

@Entity('purchase_orders')
export class PurchaseOrder {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    orderNumber: string;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.DRAFT,
    })
    status: OrderStatus;

    @ManyToOne(() => Warehouse)
    @JoinColumn({ name: 'warehouse_id' })
    warehouse: Warehouse;

    @Column()
    supplierName: string;

    @Column({ nullable: true })
    supplierEmail: string;

    @Column({ nullable: true })
    supplierPhone: string;

    @Column({ type: 'date' })
    orderDate: Date;

    @Column({ type: 'date', nullable: true })
    expectedDeliveryDate: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    totalAmount: number;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @OneToMany(() => PurchaseOrderItem, (item) => item.purchaseOrder, {
        cascade: true,
    })
    items: PurchaseOrderItem[];

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by_id' })
    createdBy: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
