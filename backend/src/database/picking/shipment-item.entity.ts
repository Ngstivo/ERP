import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Shipment } from './shipment.entity';
import { Product } from '../entities/product.entity';

@Entity('shipment_items')
export class ShipmentItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Shipment, (shipment) => shipment.items)
    @JoinColumn({ name: 'shipment_id' })
    shipment: Shipment;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    quantity: number;

    @Column({ nullable: true })
    packageNumber: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;
}
