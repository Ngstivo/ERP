import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransferService } from './transfer.service';
import { TransferController } from './transfer.controller';
import { WarehouseTransfer } from '@database/transfers/transfer.entity';
import { TransferItem } from '@database/transfers/transfer-item.entity';
import { Product } from '@database/entities/product.entity';
import { Warehouse } from '@database/entities/warehouse.entity';
import { Batch } from '@database/batches/batch.entity';
import { StockLevel } from '@database/inventory/stock-level.entity';
import { StockMovement } from '@database/inventory/stock-movement.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            WarehouseTransfer,
            TransferItem,
            Product,
            Warehouse,
            Batch,
            StockLevel,
            StockMovement,
        ]),
    ],
    controllers: [TransferController],
    providers: [TransferService],
    exports: [TransferService],
})
export class TransferModule { }
