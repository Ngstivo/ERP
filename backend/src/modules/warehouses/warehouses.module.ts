import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarehousesService } from './warehouses.service';
import { WarehousesController } from './warehouses.controller';
import { Warehouse } from '@database/entities/warehouse.entity';
import { StorageLocation } from '@database/entities/storage-location.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Warehouse, StorageLocation])],
    controllers: [WarehousesController],
    providers: [WarehousesService],
    exports: [WarehousesService],
})
export class WarehousesModule { }
