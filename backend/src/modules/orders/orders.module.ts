import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PurchaseOrder } from '@database/orders/purchase-order.entity';
import { PurchaseOrderItem } from '@database/orders/purchase-order-item.entity';

@Module({
    imports: [TypeOrmModule.forFeature([PurchaseOrder, PurchaseOrderItem])],
    controllers: [OrdersController],
    providers: [OrdersService],
    exports: [OrdersService],
})
export class OrdersModule { }
