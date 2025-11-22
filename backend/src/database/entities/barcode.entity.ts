import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

export enum BarcodeType {
    UPC = 'UPC',
    EAN = 'EAN',
    CODE128 = 'CODE128',
    QR = 'QR',
}

@Entity('barcodes')
export class Barcode {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    code: string;

    @Column({
        type: 'enum',
        enum: BarcodeType,
        default: BarcodeType.CODE128,
    })
    type: BarcodeType;

    @ManyToOne(() => Product, (product) => product.barcodes)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
