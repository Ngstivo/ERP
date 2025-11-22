import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { StorageLocation } from '../entities/storage-location.entity';

export enum PutAwayStrategy {
    FIXED_LOCATION = 'FIXED_LOCATION',
    NEAREST_AVAILABLE = 'NEAREST_AVAILABLE',
    FEFO = 'FEFO',
    ABC_CLASSIFICATION = 'ABC_CLASSIFICATION',
    BULK_STORAGE = 'BULK_STORAGE',
    CROSS_DOCK = 'CROSS_DOCK',
}

@Entity('put_away_rules')
export class PutAwayRule {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({
        type: 'enum',
        enum: PutAwayStrategy,
    })
    strategy: PutAwayStrategy;

    @Column({ type: 'int', default: 0 })
    priority: number;

    @Column({ type: 'json', nullable: true })
    conditions: any;

    @ManyToOne(() => StorageLocation, { nullable: true })
    @JoinColumn({ name: 'default_location_id' })
    defaultLocation: StorageLocation;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
