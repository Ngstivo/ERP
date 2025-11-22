import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Webhook } from './webhook.entity';

export enum WebhookDeliveryStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    RETRYING = 'RETRYING',
}

@Entity('webhook_deliveries')
export class WebhookDelivery {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Webhook)
    @JoinColumn({ name: 'webhook_id' })
    webhook: Webhook;

    @Column()
    event: string;

    @Column({ type: 'json' })
    payload: any;

    @Column({
        type: 'enum',
        enum: WebhookDeliveryStatus,
        default: WebhookDeliveryStatus.PENDING,
    })
    status: WebhookDeliveryStatus;

    @Column({ type: 'int', default: 0 })
    attempts: number;

    @Column({ type: 'int', nullable: true })
    responseStatus: number;

    @Column({ type: 'text', nullable: true })
    responseBody: string;

    @Column({ type: 'text', nullable: true })
    errorMessage: string;

    @Column({ type: 'timestamp', nullable: true })
    deliveredAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}
