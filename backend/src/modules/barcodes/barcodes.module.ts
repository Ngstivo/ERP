import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BarcodesService } from './barcodes.service';
import { BarcodesController } from './barcodes.controller';
import { Barcode } from '@database/entities/barcode.entity';
import { Product } from '@database/entities/product.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Barcode, Product])],
    controllers: [BarcodesController],
    providers: [BarcodesService],
    exports: [BarcodesService],
})
export class BarcodesModule { }
