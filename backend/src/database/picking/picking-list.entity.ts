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
import { PickingListItem } from './picking-list-item.entity';

export enum PickingStrategy {
    FIFO = 'FIFO',
    FEFO = 'FEFO',
    LIFO = 'LIFO',
    MANUAL = 'MANUAL',
    ZONE_BASED = 'ZONE_BASED',
}

export enum PickingListStatus {
    DRAFT = 'DRAFT',
    RELEASED = 'RELEASED',
    IN_PROGRESS = 'IN_PROGRESS',
    PICKED = 'PICKED',
    PACKED = 'PACKED',
    SHIPPED = 'SHIPPED',
    CANCELLED = 'CANCELLED',
}

@Entity('picking_lists')
export class PickingList {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    pickingNumber: string;

    @ManyToOne(() => Warehouse)
    @JoinColumn({ name: 'warehouse_id' })
    warehouse: Warehouse;

    @Column({
        type: 'enum',
        enum: PickingStrategy,
        default: PickingStrategy.FIFO,
    })
    strategy: PickingStrategy;

    @Column({
        type: 'enum',
        enum: PickingListStatus,
        default: PickingListStatus.DRAFT,
    })
    status: PickingListStatus;

    @Column({ type: 'date' })
    pickingDate: Date;

    @Column({ type: 'int', default: 0 })
    priority: number;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ nullable: true })
    customerName: string;

    @Column({ nullable: true })
    orderReference: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'assigned_to_id' })
    assignedTo: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by_id' })
    createdBy: User;

    @Column({ type: 'timestamp', nullable: true })
    pickingStartTime: Date;

    @Column({ type: 'timestamp', nullable: true })
    pickingEndTime: Date;

    @OneToMany(() => PickingListItem, (item) => item.pickingList)
    items: PickingListItem[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
