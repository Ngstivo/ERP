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
import { PurchaseReturnService } from './purchase-return.service';
import { CreatePurchaseReturnDto } from './dto/create-purchase-return.dto';
import { UpdatePurchaseReturnDto } from './dto/update-purchase-return.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PurchaseReturnStatus, ReturnReason } from '@database/returns/purchase-return.entity';

@ApiTags('purchase-return')
@Controller('purchase-return')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PurchaseReturnController {
    constructor(private readonly purchaseReturnService: PurchaseReturnService) { }

    @Post()
    @ApiOperation({ summary: 'Create purchase return' })
    create(@Body() createDto: CreatePurchaseReturnDto, @Request() req) {
        return this.purchaseReturnService.create(createDto, req.user.sub);
    }

    @Get()
    @ApiOperation({ summary: 'Get all purchase returns' })
    @ApiQuery({ name: 'warehouseId', required: false })
    @ApiQuery({ name: 'status', enum: PurchaseReturnStatus, required: false })
    @ApiQuery({ name: 'returnReason', enum: ReturnReason, required: false })
    findAll(
        @Query('warehouseId') warehouseId?: string,
        @Query('status') status?: PurchaseReturnStatus,
        @Query('returnReason') returnReason?: ReturnReason,
    ) {
        return this.purchaseReturnService.findAll(warehouseId, status, returnReason);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get purchase return by ID' })
    findOne(@Param('id') id: string) {
        return this.purchaseReturnService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update purchase return' })
    update(@Param('id') id: string, @Body() updateDto: UpdatePurchaseReturnDto) {
        return this.purchaseReturnService.update(id, updateDto);
    }

    @Patch(':id/submit')
    @ApiOperation({ summary: 'Submit return for approval' })
    submit(@Param('id') id: string) {
        return this.purchaseReturnService.submitForApproval(id);
    }

    @Patch(':id/approve')
    @ApiOperation({ summary: 'Approve purchase return' })
    approve(@Param('id') id: string, @Request() req) {
        return this.purchaseReturnService.approve(id, req.user.sub);
    }

    @Patch(':id/reject')
    @ApiOperation({ summary: 'Reject purchase return' })
    reject(@Param('id') id: string, @Body() body: { reason: string }, @Request() req) {
        return this.purchaseReturnService.reject(id, req.user.sub, body.reason);
    }

    @Post(':id/process')
    @ApiOperation({ summary: 'Process return and adjust stock' })
    process(@Param('id') id: string, @Request() req) {
        return this.purchaseReturnService.processReturn(id, req.user.sub);
    }

    @Post(':id/refund')
    @ApiOperation({ summary: 'Process refund for return' })
    processRefund(@Param('id') id: string) {
        return this.purchaseReturnService.processRefund(id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete purchase return (draft only)' })
    remove(@Param('id') id: string) {
        return this.purchaseReturnService.remove(id);
    }
}
