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
                ttl: 60000, // 1 minute
                limit: 100, // 100 requests per minute
            },
        ]),

        // Database
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => {
                const databaseUrl = configService.get('DATABASE_URL');

                // Railway and other platforms provide DATABASE_URL
                if (databaseUrl) {
                    return {
                        type: 'postgres',
                        url: databaseUrl,
                        entities: [__dirname + '/**/*.entity{.ts,.js}'],
                        synchronize: true, // Enabled for MVP deployment to ensure tables exist
                        ssl: {
                            rejectUnauthorized: false,
                        },
                        extra: {
                            family: 4, // Force IPv4
                        },
                        logging: configService.get('NODE_ENV') === 'development',
                    };
                }

                // Fallback to individual environment variables
                return {
                    type: 'postgres',
                    host: configService.get('DB_HOST'),
                    port: configService.get('DB_PORT'),
                    username: configService.get('DB_USERNAME'),
                    password: configService.get('DB_PASSWORD'),
                    database: configService.get('DB_DATABASE'),
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    synchronize: configService.get('NODE_ENV') === 'development',
                    logging: configService.get('NODE_ENV') === 'development',
                };
            },
            inject: [ConfigService],
        }),

        // Feature modules
        AuthModule,
        UsersModule,
        ProductsModule,
        WarehousesModule,
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
