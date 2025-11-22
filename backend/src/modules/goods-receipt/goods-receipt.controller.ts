import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GoodsReceiptService } from './goods-receipt.service';
import { CreateGoodsReceiptDto } from './dto/create-goods-receipt.dto';
import { InspectItemDto } from './dto/inspect-item.dto';
import { PutAwayItemDto } from './dto/put-away-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GoodsReceiptStatus } from '@database/warehouse-ops/goods-receipt.entity';

@ApiTags('goods-receipt')
@Controller('goods-receipt')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GoodsReceiptController {
    constructor(private readonly goodsReceiptService: GoodsReceiptService) { }

    @Post()
    @ApiOperation({ summary: 'Create goods receipt from purchase order' })
    create(@Body() createDto: CreateGoodsReceiptDto, @Request() req) {
        return this.goodsReceiptService.create(createDto, req.user.sub);
    }

    @Get()
    @ApiOperation({ summary: 'Get all goods receipts' })
    @ApiQuery({ name: 'warehouseId', required: false })
    @ApiQuery({ name: 'status', enum: GoodsReceiptStatus, required: false })
    findAll(
        @Query('warehouseId') warehouseId?: string,
        @Query('status') status?: GoodsReceiptStatus,
    ) {
        return this.goodsReceiptService.findAll(warehouseId, status);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get goods receipt by ID' })
    findOne(@Param('id') id: string) {
        return this.goodsReceiptService.findOne(id);
    }

    @Patch(':id/start-inspection')
    @ApiOperation({ summary: 'Start quality inspection' })
    startInspection(@Param('id') id: string, @Request() req) {
        return this.goodsReceiptService.startInspection(id, req.user.sub);
    }

    @Patch('items/:itemId/inspect')
    @ApiOperation({ summary: 'Inspect receipt item' })
    inspectItem(@Param('itemId') itemId: string, @Body() inspectDto: InspectItemDto) {
        return this.goodsReceiptService.inspectItem(itemId, inspectDto);
    }

    @Patch(':id/complete-inspection')
    @ApiOperation({ summary: 'Complete inspection process' })
    completeInspection(@Param('id') id: string) {
        return this.goodsReceiptService.completeInspection(id);
    }

    @Get('suggest-location/:productId/:warehouseId')
    @ApiOperation({ summary: 'Suggest put-away location' })
    suggestLocation(
        @Param('productId') productId: string,
        @Param('warehouseId') warehouseId: string,
        @Query('quantity') quantity: number,
    ) {
        return this.goodsReceiptService.suggestPutAwayLocation(productId, warehouseId, quantity);
    }

    @Post('items/:itemId/put-away')
    @ApiOperation({ summary: 'Put away inspected item' })
    putAwayItem(
        @Param('itemId') itemId: string,
        @Body() putAwayDto: PutAwayItemDto,
        @Request() req,
    ) {
        return this.goodsReceiptService.putAwayItem(itemId, putAwayDto, req.user.sub);
    }
}
