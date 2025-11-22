import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../entities/user.entity';

export enum WebhookEvent {
    STOCK_LOW = 'STOCK_LOW',
    STOCK_OUT = 'STOCK_OUT',
    BATCH_EXPIRING = 'BATCH_EXPIRING',
    BATCH_EXPIRED = 'BATCH_EXPIRED',
    TRANSFER_CREATED = 'TRANSFER_CREATED',
    TRANSFER_COMPLETED = 'TRANSFER_COMPLETED',
    GOODS_RECEIPT_CREATED = 'GOODS_RECEIPT_CREATED',
    GOODS_RECEIPT_COMPLETED = 'GOODS_RECEIPT_COMPLETED',
    PICKING_LIST_CREATED = 'PICKING_LIST_CREATED',
    SHIPMENT_SHIPPED = 'SHIPMENT_SHIPPED',
    PURCHASE_RETURN_CREATED = 'PURCHASE_RETURN_CREATED',
}

@Entity('webhooks')
export class Webhook {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    url: string;

    @Column({ type: 'simple-array' })
    events: WebhookEvent[];

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true })
    secret: string;

    @Column({ type: 'int', default: 0 })
    failureCount: number;

    @Column({ type: 'timestamp', nullable: true })
    lastTriggeredAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    lastFailedAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by_id' })
    createdBy: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
