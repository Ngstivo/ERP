import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { StockLevel } from '@database/inventory/stock-level.entity';
import { StockMovement } from '@database/inventory/stock-movement.entity';
import { Product } from '@database/entities/product.entity';
import { Warehouse } from '@database/entities/warehouse.entity';

@Module({
    imports: [TypeOrmModule.forFeature([StockLevel, StockMovement, Product, Warehouse])],
    controllers: [InventoryController],
    providers: [InventoryService],
    exports: [InventoryService],
})
export class InventoryModule { }
