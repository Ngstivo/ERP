import { Controller, Get, Query, UseGuards, Res, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MovementType } from '@database/inventory/stock-movement.entity';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
    constructor(
        private readonly reportsService: ReportsService,
        private readonly exportService: ExportService,
    ) { }

    @Get('dashboard')
    @ApiOperation({ summary: 'Get dashboard metrics' })
    getDashboardMetrics() {
        return this.reportsService.getDashboardMetrics();
    }

    @Get('stock-levels')
    @ApiOperation({ summary: 'Get stock level report' })
    @ApiQuery({ name: 'warehouseId', required: false })
    getStockLevelReport(@Query('warehouseId') warehouseId?: string) {
        return this.reportsService.getStockLevelReport(warehouseId);
    }

    @Get('stock-levels/export/pdf')
    @ApiOperation({ summary: 'Export stock level report to PDF' })
    @ApiQuery({ name: 'warehouseId', required: false })
    async exportStockLevelsPDF(
        @Query('warehouseId') warehouseId: string,
        @Res() res: Response,
        @Request() req,
    ) {
        const data = await this.reportsService.getStockLevelReport(warehouseId);

        await this.exportService.exportToPDF({
            title: 'Stock Level Report',
            filename: `stock-levels-${new Date().toISOString().split('T')[0]}`,
            headers: ['Product', 'SKU', 'Warehouse', 'Quantity', 'Available', 'Reserved', 'Status'],
            data: data.map(item => [
                item.productName,
                item.sku,
                item.warehouseName,
                item.quantity,
                item.availableQuantity,
                item.reservedQuantity,
                item.status,
            ]),
            metadata: {
                generatedBy: `${req.user.firstName} ${req.user.lastName}`,
                generatedAt: new Date(),
                description: warehouseId ? `Stock levels for selected warehouse` : 'Stock levels for all warehouses',
            },
        }, res);
    }

    @Get('stock-levels/export/excel')
    @ApiOperation({ summary: 'Export stock level report to Excel' })
    @ApiQuery({ name: 'warehouseId', required: false })
    async exportStockLevelsExcel(
        @Query('warehouseId') warehouseId: string,
        @Res() res: Response,
        @Request() req,
    ) {
        const data = await this.reportsService.getStockLevelReport(warehouseId);

        await this.exportService.exportToExcel({
            title: 'Stock Level Report',
            filename: `stock-levels-${new Date().toISOString().split('T')[0]}`,
            headers: ['Product', 'SKU', 'Warehouse', 'Quantity', 'Available', 'Reserved', 'Reorder Point', 'Status'],
            data: data.map(item => [
                item.productName,
                item.sku,
                item.warehouseName,
                item.quantity,
                item.availableQuantity,
                item.reservedQuantity,
                item.reorderPoint,
                item.status,
            ]),
            metadata: {
                generatedBy: `${req.user.firstName} ${req.user.lastName}`,
                generatedAt: new Date(),
                description: warehouseId ? `Stock levels for selected warehouse` : 'Stock levels for all warehouses',
            },
        }, res);
    }

    @Get('movements')
    @ApiOperation({ summary: 'Get stock movement report' })
    @ApiQuery({ name: 'startDate', required: true })
    @ApiQuery({ name: 'endDate', required: true })
    @ApiQuery({ name: 'warehouseId', required: false })
    @ApiQuery({ name: 'movementType', enum: MovementType, required: false })
    getMovementReport(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Query('warehouseId') warehouseId?: string,
        @Query('movementType') movementType?: MovementType,
    ) {
        return this.reportsService.getMovementReport(
            new Date(startDate),
            new Date(endDate),
            warehouseId,
            movementType,
        );
    }

    @Get('movements/export/pdf')
    @ApiOperation({ summary: 'Export movement report to PDF' })
    @ApiQuery({ name: 'startDate', required: true })
    @ApiQuery({ name: 'endDate', required: true })
    @ApiQuery({ name: 'warehouseId', required: false })
    @ApiQuery({ name: 'movementType', enum: MovementType, required: false })
    async exportMovementsPDF(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Query('warehouseId') warehouseId: string,
        @Query('movementType') movementType: MovementType,
        @Res() res: Response,
        @Request() req,
    ) {
        const data = await this.reportsService.getMovementReport(
            new Date(startDate),
            new Date(endDate),
            warehouseId,
            movementType,
        );

        await this.exportService.exportToPDF({
            title: 'Stock Movement Report',
            filename: `movements-${startDate}-to-${endDate}`,
            headers: ['Date', 'Reference', 'Type', 'Product', 'Warehouse', 'Quantity', 'User'],
            data: data.map(item => [
                new Date(item.date).toLocaleDateString(),
                item.referenceNumber,
                item.type,
                item.productName,
                item.warehouseName,
                item.quantity,
                item.createdBy,
            ]),
            metadata: {
                generatedBy: `${req.user.firstName} ${req.user.lastName}`,
                generatedAt: new Date(),
                description: `Stock movements from ${startDate} to ${endDate}`,
            },
        }, res);
    }

    @Get('movements/export/excel')
    @ApiOperation({ summary: 'Export movement report to Excel' })
    @ApiQuery({ name: 'startDate', required: true })
    @ApiQuery({ name: 'endDate', required: true })
    @ApiQuery({ name: 'warehouseId', required: false })
    @ApiQuery({ name: 'movementType', enum: MovementType, required: false })
    async exportMovementsExcel(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Query('warehouseId') warehouseId: string,
        @Query('movementType') movementType: MovementType,
        @Res() res: Response,
        @Request() req,
    ) {
        const data = await this.reportsService.getMovementReport(
            new Date(startDate),
            new Date(endDate),
            warehouseId,
            movementType,
        );

        await this.exportService.exportToExcel({
            title: 'Stock Movement Report',
            filename: `movements-${startDate}-to-${endDate}`,
            headers: ['Date', 'Reference', 'Type', 'Product', 'Warehouse', 'Quantity', 'User'],
            data: data.map(item => [
                new Date(item.date).toLocaleDateString(),
                item.referenceNumber,
                item.type,
                item.productName,
                item.warehouseName,
                item.quantity,
                item.createdBy,
            ]),
            metadata: {
                generatedBy: `${req.user.firstName} ${req.user.lastName}`,
                generatedAt: new Date(),
                description: `Stock movements from ${startDate} to ${endDate}`,
            },
        }, res);
    }

    @Get('warehouse-utilization')
    @ApiOperation({ summary: 'Get warehouse utilization report' })
    getWarehouseUtilization() {
        return this.reportsService.getWarehouseUtilizationReport();
    }

    @Get('warehouse-utilization/export/pdf')
    @ApiOperation({ summary: 'Export warehouse utilization to PDF' })
    async exportUtilizationPDF(@Res() res: Response, @Request() req) {
        const data = await this.reportsService.getWarehouseUtilizationReport();

        await this.exportService.exportToPDF({
            title: 'Warehouse Utilization Report',
            filename: `warehouse-utilization-${new Date().toISOString().split('T')[0]}`,
            headers: ['Warehouse', 'Total Capacity', 'Used', 'Utilization %', 'Available'],
            data: data.map(item => [
                item.warehouseName,
                item.totalCapacity,
                item.usedCapacity,
                `${item.utilizationPercentage}%`,
                item.availableSpace,
            ]),
            metadata: {
                generatedBy: `${req.user.firstName} ${req.user.lastName}`,
                generatedAt: new Date(),
                description: 'Warehouse capacity utilization across all warehouses',
            },
        }, res);
    }

    @Get('warehouse-utilization/export/excel')
    @ApiOperation({ summary: 'Export warehouse utilization to Excel' })
    async exportUtilizationExcel(@Res() res: Response, @Request() req) {
        const data = await this.reportsService.getWarehouseUtilizationReport();

        await this.exportService.exportToExcel({
            title: 'Warehouse Utilization Report',
            filename: `warehouse-utilization-${new Date().toISOString().split('T')[0]}`,
            headers: ['Warehouse', 'Total Capacity', 'Used Capacity', 'Utilization %', 'Available Space'],
            data: data.map(item => [
                item.warehouseName,
                item.totalCapacity,
                item.usedCapacity,
                item.utilizationPercentage,
                item.availableSpace,
            ]),
            metadata: {
                generatedBy: `${req.user.firstName} ${req.user.lastName}`,
                generatedAt: new Date(),
                description: 'Warehouse capacity utilization across all warehouses',
            },
        }, res);
    }

    @Get('top-moving-products')
    @ApiOperation({ summary: 'Get top moving products' })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'days', required: false })
    getTopMovingProducts(
        @Query('limit') limit?: number,
        @Query('days') days?: number,
    ) {
        return this.reportsService.getTopMovingProducts(
            limit ? Number(limit) : 10,
            days ? Number(days) : 30,
        );
    }

    @Get('slow-moving-products')
    @ApiOperation({ summary: 'Get slow moving products' })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'days', required: false })
    getSlowMovingProducts(
        @Query('limit') limit?: number,
        @Query('days') days?: number,
    ) {
        return this.reportsService.getSlowMovingProducts(
            limit ? Number(limit) : 10,
            days ? Number(days) : 90,
        );
    }

    @Get('expiring-batches')
    @ApiOperation({ summary: 'Get expiring batches report' })
    @ApiQuery({ name: 'daysAhead', required: false })
    getExpiringBatches(@Query('daysAhead') daysAhead?: number) {
        return this.reportsService.getExpiringBatchesReport(
            daysAhead ? Number(daysAhead) : 30,
        );
    }

    @Get('expiring-batches/export/pdf')
    @ApiOperation({ summary: 'Export expiring batches to PDF' })
    @ApiQuery({ name: 'daysAhead', required: false })
    async exportExpiringBatchesPDF(
        @Query('daysAhead') daysAhead: number,
        @Res() res: Response,
        @Request() req,
    ) {
        const days = daysAhead ? Number(daysAhead) : 30;
        const data = await this.reportsService.getExpiringBatchesReport(days);

        await this.exportService.exportToPDF({
            title: 'Expiring Batches Report',
            filename: `expiring-batches-${new Date().toISOString().split('T')[0]}`,
            headers: ['Batch #', 'Product', 'Warehouse', 'Expiry Date', 'Quantity', 'Days Left', 'Status'],
            data: data.map(item => [
                item.batchNumber,
                item.productName,
                item.warehouseName,
                new Date(item.expirationDate).toLocaleDateString(),
                item.currentQuantity,
                item.daysUntilExpiration,
                item.qualityStatus,
            ]),
            metadata: {
                generatedBy: `${req.user.firstName} ${req.user.lastName}`,
                generatedAt: new Date(),
                description: `Batches expiring within ${days} days`,
            },
        }, res);
    }

    @Get('expiring-batches/export/excel')
    @ApiOperation({ summary: 'Export expiring batches to Excel' })
    @ApiQuery({ name: 'daysAhead', required: false })
    async exportExpiringBatchesExcel(
        @Query('daysAhead') daysAhead: number,
        @Res() res: Response,
        @Request() req,
    ) {
        const days = daysAhead ? Number(daysAhead) : 30;
        const data = await this.reportsService.getExpiringBatchesReport(days);

        await this.exportService.exportToExcel({
            title: 'Expiring Batches Report',
            filename: `expiring-batches-${new Date().toISOString().split('T')[0]}`,
            headers: ['Batch Number', 'Product', 'Warehouse', 'Expiry Date', 'Quantity', 'Days Until Expiration', 'Quality Status'],
            data: data.map(item => [
                item.batchNumber,
                item.productName,
                item.warehouseName,
                new Date(item.expirationDate).toLocaleDateString(),
                item.currentQuantity,
                item.daysUntilExpiration,
                item.qualityStatus,
            ]),
            metadata: {
                generatedBy: `${req.user.firstName} ${req.user.lastName}`,
                generatedAt: new Date(),
                description: `Batches expiring within ${days} days`,
            },
        }, res);
    }
}
