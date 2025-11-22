import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseReturnService } from './purchase-return.service';
import { PurchaseReturnController } from './purchase-return.controller';
import { PurchaseReturn } from '@database/returns/purchase-return.entity';
import { PurchaseReturnItem } from '@database/returns/purchase-return-item.entity';
import { PurchaseOrder } from '@database/orders/purchase-order.entity';
import { GoodsReceipt } from '@database/warehouse-ops/goods-receipt.entity';
import { Product } from '@database/entities/product.entity';
import { Warehouse } from '@database/entities/warehouse.entity';
import { Batch } from '@database/batches/batch.entity';
import { StockLevel } from '@database/inventory/stock-level.entity';
import { StockMovement } from '@database/inventory/stock-movement.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            PurchaseReturn,
            PurchaseReturnItem,
            PurchaseOrder,
            GoodsReceipt,
            Product,
            Warehouse,
            Batch,
            StockLevel,
            StockMovement,
        ]),
    ],
    controllers: [PurchaseReturnController],
    providers: [PurchaseReturnService],
    exports: [PurchaseReturnService],
})
export class PurchaseReturnModule { }
