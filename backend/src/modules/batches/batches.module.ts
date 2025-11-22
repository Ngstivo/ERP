import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchesService } from './batches.service';
import { BatchesController } from './batches.controller';
import { Batch } from '@database/batches/batch.entity';
import { BatchStockLevel } from '@database/batches/batch-stock-level.entity';
import { BatchMovement } from '@database/batches/batch-movement.entity';
import { Product } from '@database/entities/product.entity';
import { Warehouse } from '@database/entities/warehouse.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Batch,
            BatchStockLevel,
            BatchMovement,
            Product,
            Warehouse,
        ]),
    ],
    controllers: [BatchesController],
    providers: [BatchesService],
    exports: [BatchesService],
})
export class BatchesModule { }
