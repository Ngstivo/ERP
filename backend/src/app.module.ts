import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { WarehousesModule } from './modules/warehouses/warehouses.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ReportsModule } from './modules/reports/reports.module';
import { BatchesModule } from './modules/batches/batches.module';
import { BarcodesModule } from './modules/barcodes/barcodes.module';
import { GoodsReceiptModule } from './modules/goods-receipt/goods-receipt.module';
import { PurchaseReturnModule } from './modules/purchase-return/purchase-return.module';
import { PickingModule } from './modules/picking/picking.module';
import { TransferModule } from './modules/transfer/transfer.module';
import { WebhookModule } from './modules/webhook/webhook.module';

@Module({
    imports: [
        // Configuration
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),

        // Rate Limiting
        ThrottlerModule.forRoot([
            {
                name: 'short',
                ttl: 1000, // 1 second
                limit: 10, // 10 requests per second
            },
            {
                name: 'medium',
                ttl: 10000, // 10 seconds
                limit: 50, // 50 requests per 10 seconds
            },
            {
                name: 'long',
                InventoryModule,
                OrdersModule,
                ReportsModule,
                BatchesModule,
                BarcodesModule,
                GoodsReceiptModule,
                PurchaseReturnModule,
                PickingModule,
                TransferModule,
                WebhookModule,
    ],
})
export class AppModule { }
