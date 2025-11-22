import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PickingService } from './picking.service';
import { PickingController } from './picking.controller';
import { PickingList } from '@database/picking/picking-list.entity';
import { PickingListItem } from '@database/picking/picking-list-item.entity';
import { Shipment } from '@database/picking/shipment.entity';
import { ShipmentItem } from '@database/picking/shipment-item.entity';
import { Product } from '@database/entities/product.entity';
import { Warehouse } from '@database/entities/warehouse.entity';
import { Batch } from '@database/batches/batch.entity';
import { StockLevel } from '@database/inventory/stock-level.entity';
import { StockMovement } from '@database/inventory/stock-movement.entity';
import { StorageLocation } from '@database/entities/storage-location.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            PickingList,
            PickingListItem,
            Shipment,
            ShipmentItem,
            Product,
            Warehouse,
            Batch,
            StockLevel,
            StockMovement,
            StorageLocation,
        ]),
    ],
    controllers: [PickingController],
    providers: [PickingService],
    exports: [PickingService],
})
export class PickingModule { }
