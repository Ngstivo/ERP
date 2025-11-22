import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoodsReceiptService } from './goods-receipt.service';
import { GoodsReceiptController } from './goods-receipt.controller';
import { GoodsReceipt } from '@database/warehouse-ops/goods-receipt.entity';
import { GoodsReceiptItem } from '@database/warehouse-ops/goods-receipt-item.entity';
import { PutAwayRule } from '@database/warehouse-ops/put-away-rule.entity';
import { PurchaseOrder } from '@database/orders/purchase-order.entity';
import { Product } from '@database/entities/product.entity';
import { Warehouse } from '@database/entities/warehouse.entity';
import { Batch } from '@database/batches/batch.entity';
import { StockLevel } from '@database/inventory/stock-level.entity';
import { StockMovement } from '@database/inventory/stock-movement.entity';
import { StorageLocation } from '@database/entities/storage-location.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            GoodsReceipt,
            GoodsReceiptItem,
            PutAwayRule,
            PurchaseOrder,
            Product,
            Warehouse,
            Batch,
            StockLevel,
            StockMovement,
            StorageLocation,
        ]),
    ],
    controllers: [GoodsReceiptController],
    providers: [GoodsReceiptService],
    exports: [GoodsReceiptService],
})
export class GoodsReceiptModule { }
