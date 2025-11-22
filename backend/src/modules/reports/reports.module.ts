import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ExportService } from './export.service';
import { ReportsController } from './reports.controller';
import { StockLevel } from '@database/inventory/stock-level.entity';
import { StockMovement } from '@database/inventory/stock-movement.entity';
import { Product } from '@database/entities/product.entity';
import { Warehouse } from '@database/entities/warehouse.entity';
import { Batch } from '@database/batches/batch.entity';
import { WarehouseTransfer } from '@database/transfers/transfer.entity';
import { GoodsReceipt } from '@database/warehouse-ops/goods-receipt.entity';
import { PurchaseReturn } from '@database/returns/purchase-return.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            StockLevel,
            StockMovement,
            Product,
            Warehouse,
            Batch,
            WarehouseTransfer,
            GoodsReceipt,
            PurchaseReturn,
        ]),
    ],
    controllers: [ReportsController],
    providers: [ReportsService, ExportService],
    exports: [ReportsService, ExportService],
})
export class ReportsModule { }
