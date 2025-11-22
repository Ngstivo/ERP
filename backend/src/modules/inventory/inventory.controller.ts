import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { StockAdjustmentDto } from './dto/stock-adjustment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MovementType } from '@database/inventory/stock-movement.entity';

@ApiTags('inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Get('stock-levels')
    @ApiOperation({ summary: 'Get stock levels' })
    @ApiQuery({ name: 'productId', required: false })
    @ApiQuery({ name: 'warehouseId', required: false })
    getStockLevels(
        @Query('productId') productId?: string,
        @Query('warehouseId') warehouseId?: string,
    ) {
        return this.inventoryService.getStockLevels(productId, warehouseId);
    }

    @Get('movements')
    @ApiOperation({ summary: 'Get stock movements' })
    @ApiQuery({ name: 'productId', required: false })
    @ApiQuery({ name: 'warehouseId', required: false })
    @ApiQuery({ name: 'type', enum: MovementType, required: false })
    getMovements(
        @Query('productId') productId?: string,
        @Query('warehouseId') warehouseId?: string,
        @Query('type') type?: MovementType,
    ) {
        return this.inventoryService.getStockMovements(productId, warehouseId, type);
    }

    @Post('adjust')
    @ApiOperation({ summary: 'Adjust stock levels' })
    adjustStock(@Body() adjustmentDto: StockAdjustmentDto, @Request() req) {
        return this.inventoryService.adjustStock(adjustmentDto, req.user.sub);
    }

    @Get('value')
    @ApiOperation({ summary: 'Get inventory value' })
    @ApiQuery({ name: 'warehouseId', required: false })
    getInventoryValue(@Query('warehouseId') warehouseId?: string) {
        return this.inventoryService.getInventoryValue(warehouseId);
    }
}
