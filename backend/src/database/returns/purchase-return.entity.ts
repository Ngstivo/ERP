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
import { GoodsReceipt } from '../warehouse-ops/goods-receipt.entity';
import { User } from '../entities/user.entity';
import { Warehouse } from '../entities/warehouse.entity';
import { PurchaseReturnItem } from './purchase-return-item.entity';

export enum PurchaseReturnStatus {
    DRAFT = 'DRAFT',
    PENDING_APPROVAL = 'PENDING_APPROVAL',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export enum ReturnReason {
    DAMAGED = 'DAMAGED',
    DEFECTIVE = 'DEFECTIVE',
    WRONG_ITEM = 'WRONG_ITEM',
    EXCESS_QUANTITY = 'EXCESS_QUANTITY',
    QUALITY_ISSUE = 'QUALITY_ISSUE',
    EXPIRED = 'EXPIRED',
    OTHER = 'OTHER',
}

@Entity('purchase_returns')
export class PurchaseReturn {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    returnNumber: string;

    @ManyToOne(() => PurchaseOrder)
    @JoinColumn({ name: 'purchase_order_id' })
    purchaseOrder: PurchaseOrder;

    @ManyToOne(() => GoodsReceipt, { nullable: true })
    @JoinColumn({ name: 'goods_receipt_id' })
    goodsReceipt: GoodsReceipt;

    @ManyToOne(() => Warehouse)
    @JoinColumn({ name: 'warehouse_id' })
    warehouse: Warehouse;

    @Column({ type: 'date' })
    returnDate: Date;

    @Column({
        type: 'enum',
        enum: PurchaseReturnStatus,
        default: PurchaseReturnStatus.DRAFT,
    })
    status: PurchaseReturnStatus;

    @Column({
        type: 'enum',
        enum: ReturnReason,
    })
    returnReason: ReturnReason;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ nullable: true })
    supplierRmaNumber: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    totalAmount: number;

    @Column({ default: false })
    isRefundRequested: boolean;

    @Column({ default: false })
    isRefundProcessed: boolean;

    @Column({ type: 'date', nullable: true })
    refundDate: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by_id' })
    createdBy: User;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'approved_by_id' })
    approvedBy: User;

    @OneToMany(() => PurchaseReturnItem, (item) => item.purchaseReturn)
    items: PurchaseReturnItem[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
