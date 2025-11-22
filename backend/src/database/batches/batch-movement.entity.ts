import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Batch } from './batch.entity';
import { User } from '../entities/user.entity';
import { StorageLocation } from '../entities/storage-location.entity';

export enum BatchMovementType {
    RECEIVE = 'RECEIVE',
    ISSUE = 'ISSUE',
    TRANSFER = 'TRANSFER',
    ADJUSTMENT = 'ADJUSTMENT',
    RETURN = 'RETURN',
    SCRAP = 'SCRAP',
}

@Entity('batch_movements')
export class BatchMovement {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    referenceNumber: string;

    @Column({
        type: 'enum',
        enum: BatchMovementType,
    })
    type: BatchMovementType;

    @ManyToOne(() => Batch, (batch) => batch.movements)
    @JoinColumn({ name: 'batch_id' })
    batch: Batch;

    @ManyToOne(() => StorageLocation, { nullable: true })
    @JoinColumn({ name: 'from_location_id' })
    fromLocation: StorageLocation;

    @ManyToOne(() => StorageLocation, { nullable: true })
    @JoinColumn({ name: 'to_location_id' })
    toLocation: StorageLocation;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    unitCost: number;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ nullable: true })
    relatedDocumentType: string;

    @Column({ nullable: true })
    relatedDocumentId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by_id' })
    createdBy: User;

    @CreateDateColumn()
    createdAt: Date;
}
