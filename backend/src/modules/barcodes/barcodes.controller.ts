import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    Query,
    Body,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BarcodesService } from './barcodes.service';
import { CreateBarcodeDto } from './dto/create-barcode.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('barcodes')
@Controller('barcodes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BarcodesController {
    constructor(private readonly barcodesService: BarcodesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a barcode for a product' })
    create(@Body() createBarcodeDto: CreateBarcodeDto) {
        return this.barcodesService.create(
            createBarcodeDto.productId,
            createBarcodeDto.type,
            createBarcodeDto.code,
        );
    }

    @Get()
    @ApiOperation({ summary: 'Get all barcodes' })
    @ApiQuery({ name: 'productId', required: false })
    findAll(@Query('productId') productId?: string) {
        return this.barcodesService.findAll(productId);
    }

    @Get('lookup/:code')
    @ApiOperation({ summary: 'Lookup product by barcode' })
    lookup(@Param('code') code: string) {
        return this.barcodesService.findByCode(code);
    }

    @Get('generate-image/:code/:type')
    @ApiOperation({ summary: 'Generate barcode image' })
    async generateImage(@Param('code') code: string, @Param('type') type: string) {
        const image = await this.barcodesService.generateBarcodeImage(code, type as any);
        return { image };
    }

    @Get('label/:productId')
    @ApiOperation({ summary: 'Generate product label' })
    generateLabel(@Param('productId') productId: string) {
        return this.barcodesService.generateLabel(productId);
    }

    @Post('bulk-print')
    @ApiOperation({ summary: 'Bulk print labels for multiple products' })
    bulkPrint(@Body() body: { productIds: string[] }) {
        return this.barcodesService.bulkPrint(body.productIds);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete barcode' })
    remove(@Param('id') id: string) {
        return this.barcodesService.remove(id);
    }
}
