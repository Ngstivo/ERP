import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TransferService } from './transfer.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { ReceiveTransferDto } from './dto/receive-transfer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TransferStatus } from '@database/transfers/transfer.entity';

@ApiTags('transfers')
@Controller('transfers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransferController {
    constructor(private readonly transferService: TransferService) { }

    @Post()
    @ApiOperation({ summary: 'Create warehouse transfer' })
    create(@Body() createDto: CreateTransferDto, @Request() req) {
        return this.transferService.create(createDto, req.user.sub);
    }

    @Get()
    @ApiOperation({ summary: 'Get all transfers' })
    @ApiQuery({ name: 'fromWarehouseId', required: false })
    @ApiQuery({ name: 'toWarehouseId', required: false })
    @ApiQuery({ name: 'status', enum: TransferStatus, required: false })
    findAll(
        @Query('fromWarehouseId') fromWarehouseId?: string,
        @Query('toWarehouseId') toWarehouseId?: string,
        @Query('status') status?: TransferStatus,
    ) {
        return this.transferService.findAll(fromWarehouseId, toWarehouseId, status);
    }

    @Get('consolidated-inventory')
    @ApiOperation({ summary: 'Get consolidated inventory across all warehouses' })
    @ApiQuery({ name: 'productId', required: false })
    getConsolidatedInventory(@Query('productId') productId?: string) {
        return this.transferService.getConsolidatedInventory(productId);
    }

    @Get('stock-balancing/:productId')
    @ApiOperation({ summary: 'Get stock balancing suggestions for a product' })
    suggestStockBalancing(@Param('productId') productId: string) {
        return this.transferService.suggestStockBalancing(productId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get transfer by ID' })
    findOne(@Param('id') id: string) {
        return this.transferService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update transfer' })
    update(@Param('id') id: string, @Body() updateDto: UpdateTransferDto) {
        return this.transferService.update(id, updateDto);
    }

    @Patch(':id/submit')
    @ApiOperation({ summary: 'Submit transfer for approval' })
    submit(@Param('id') id: string) {
        return this.transferService.submitForApproval(id);
    }

    @Patch(':id/approve')
    @ApiOperation({ summary: 'Approve transfer' })
    approve(@Param('id') id: string, @Request() req) {
        return this.transferService.approve(id, req.user.sub);
    }

    @Patch(':id/reject')
    @ApiOperation({ summary: 'Reject transfer' })
    reject(@Param('id') id: string, @Body() body: { reason: string }, @Request() req) {
        return this.transferService.reject(id, req.user.sub, body.reason);
    }

    @Post(':id/ship')
    @ApiOperation({ summary: 'Ship transfer' })
    ship(
        @Param('id') id: string,
        @Body() body: { trackingNumber?: string; carrier?: string },
        @Request() req,
    ) {
        return this.transferService.ship(id, req.user.sub, body.trackingNumber, body.carrier);
    }

    @Post(':id/receive')
    @ApiOperation({ summary: 'Receive transfer' })
    receive(@Param('id') id: string, @Body() receiveDto: ReceiveTransferDto, @Request() req) {
        return this.transferService.receive(id, receiveDto, req.user.sub);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete transfer (draft/rejected only)' })
    remove(@Param('id') id: string) {
        return this.transferService.remove(id);
    }
}
