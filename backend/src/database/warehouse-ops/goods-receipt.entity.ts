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
import { PurchaseOrder } from '../orders/purchase-order.entity';
import { User } from '../entities/user.entity';
import { Warehouse } from '../entities/warehouse.entity';
import { GoodsReceiptItem } from './goods-receipt-item.entity';

export enum GoodsReceiptStatus {
    DRAFT = 'DRAFT',
    PENDING_INSPECTION = 'PENDING_INSPECTION',
    INSPECTING = 'INSPECTING',
    APPROVED = 'APPROVED',
    PARTIALLY_APPROVED = 'PARTIALLY_APPROVED',
    REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED',
}

@Entity('goods_receipts')
export class GoodsReceipt {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    receiptNumber: string;

    @ManyToOne(() => PurchaseOrder)
    @JoinColumn({ name: 'purchase_order_id' })
    purchaseOrder: PurchaseOrder;

    @ManyToOne(() => Warehouse)
    @JoinColumn({ name: 'warehouse_id' })
    warehouse: Warehouse;

    @Column({ type: 'date' })
    receiptDate: Date;

    @Column({
        type: 'enum',
        enum: GoodsReceiptStatus,
        default: GoodsReceiptStatus.DRAFT,
    })
    status: GoodsReceiptStatus;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ nullable: true })
    supplierDeliveryNote: string;

    @Column({ nullable: true })
    transportCompany: string;

    @Column({ nullable: true })
    vehicleNumber: string;

    @Column({ nullable: true })
    driverName: string;

    @Column({ type: 'timestamp', nullable: true })
    inspectionStartTime: Date;

    @Column({ type: 'timestamp', nullable: true })
    inspectionEndTime: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'received_by_id' })
    receivedBy: User;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'inspected_by_id' })
    inspectedBy: User;

    @OneToMany(() => GoodsReceiptItem, (item) => item.goodsReceipt)
    items: GoodsReceiptItem[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
