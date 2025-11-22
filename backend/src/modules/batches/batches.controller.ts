import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BatchesService } from './batches.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { UpdateQualityStatusDto } from './dto/update-quality-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QualityStatus } from '@database/batches/batch.entity';

@ApiTags('batches')
@Controller('batches')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BatchesController {
    constructor(private readonly batchesService: BatchesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new batch' })
    create(@Body() createBatchDto: CreateBatchDto, @Request() req) {
        return this.batchesService.create(createBatchDto, req.user.sub);
    }

    @Get()
    @ApiOperation({ summary: 'Get all batches' })
    @ApiQuery({ name: 'productId', required: false })
    @ApiQuery({ name: 'warehouseId', required: false })
    @ApiQuery({ name: 'qualityStatus', enum: QualityStatus, required: false })
    findAll(
        @Query('productId') productId?: string,
        @Query('warehouseId') warehouseId?: string,
        @Query('qualityStatus') qualityStatus?: QualityStatus,
    ) {
        return this.batchesService.findAll(productId, warehouseId, qualityStatus);
    }

    @Get('expiring')
    @ApiOperation({ summary: 'Get batches expiring soon' })
    @ApiQuery({ name: 'days', required: false, description: 'Days threshold (default: 30)' })
    getExpiring(@Query('days') days?: number) {
        return this.batchesService.getExpiringBatches(days ? parseInt(days.toString()) : 30);
    }

    @Get('expired')
    @ApiOperation({ summary: 'Get expired batches' })
    getExpired() {
        return this.batchesService.getExpiredBatches();
    }

    @Get('fefo/:productId/:warehouseId')
    @ApiOperation({ summary: 'Get batches by FEFO order' })
    getFEFO(
        @Param('productId') productId: string,
        @Param('warehouseId') warehouseId: string,
    ) {
        return this.batchesService.getBatchesByFEFO(productId, warehouseId);
    }

    @Get('traceability/:batchNumber')
    @ApiOperation({ summary: 'Get batch traceability information' })
    getTraceability(@Param('batchNumber') batchNumber: string) {
        return this.batchesService.getTraceability(batchNumber);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get batch by ID' })
    findOne(@Param('id') id: string) {
        return this.batchesService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update batch' })
    update(@Param('id') id: string, @Body() updateBatchDto: UpdateBatchDto) {
        return this.batchesService.update(id, updateBatchDto);
    }

    @Patch(':id/quality-status')
    @ApiOperation({ summary: 'Update batch quality status' })
    updateQualityStatus(
        @Param('id') id: string,
        @Body() updateQualityStatusDto: UpdateQualityStatusDto,
        @Request() req,
    ) {
        return this.batchesService.updateQualityStatus(
            id,
            updateQualityStatusDto.qualityStatus,
            req.user.sub,
        );
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete batch (soft delete)' })
    remove(@Param('id') id: string) {
        return this.batchesService.remove(id);
    }
}
