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
import { PickingService } from './picking.service';
import { CreatePickingListDto } from './dto/create-picking-list.dto';
import { PickItemDto } from './dto/pick-item.dto';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PickingListStatus } from '@database/picking/picking-list.entity';

@ApiTags('picking')
@Controller('picking')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PickingController {
    constructor(private readonly pickingService: PickingService) { }

    @Post('lists')
    @ApiOperation({ summary: 'Create picking list' })
    createList(@Body() createDto: CreatePickingListDto, @Request() req) {
        return this.pickingService.createPickingList(createDto, req.user.sub);
    }

    @Get('lists')
    @ApiOperation({ summary: 'Get all picking lists' })
    @ApiQuery({ name: 'warehouseId', required: false })
    @ApiQuery({ name: 'status', enum: PickingListStatus, required: false })
    findAllLists(
        @Query('warehouseId') warehouseId?: string,
        @Query('status') status?: PickingListStatus,
    ) {
        return this.pickingService.findAll(warehouseId, status);
    }

    @Get('lists/:id')
    @ApiOperation({ summary: 'Get picking list by ID' })
    findOneList(@Param('id') id: string) {
        return this.pickingService.findOne(id);
    }

    @Patch('lists/:id/release')
    @ApiOperation({ summary: 'Release picking list and reserve stock' })
    releaseList(@Param('id') id: string) {
        return this.pickingService.releasePickingList(id);
    }

    @Patch('lists/:id/start')
    @ApiOperation({ summary: 'Start picking process' })
    startPicking(@Param('id') id: string, @Request() req) {
        return this.pickingService.startPicking(id, req.user.sub);
    }

    @Patch('items/:itemId/pick')
    @ApiOperation({ summary: 'Pick item' })
    pickItem(
        @Param('itemId') itemId: string,
        @Body() pickDto: PickItemDto,
        @Request() req,
    ) {
        return this.pickingService.pickItem(itemId, pickDto, req.user.sub);
    }

    @Patch('lists/:id/complete')
    @ApiOperation({ summary: 'Complete picking' })
    completePicking(@Param('id') id: string) {
        return this.pickingService.completePicking(id);
    }

    @Post('shipments')
    @ApiOperation({ summary: 'Create shipment from picked list' })
    createShipment(@Body() createDto: CreateShipmentDto, @Request() req) {
        return this.pickingService.createShipment(createDto, req.user.sub);
    }

    @Get('shipments/:id')
    @ApiOperation({ summary: 'Get shipment by ID' })
    findShipment(@Param('id') id: string) {
        return this.pickingService.findShipment(id);
    }

    @Patch('shipments/:id/ship')
    @ApiOperation({ summary: 'Mark shipment as shipped' })
    shipShipment(@Param('id') id: string) {
        return this.pickingService.shipShipment(id);
    }

    @Get('shipments/:id/delivery-note')
    @ApiOperation({ summary: 'Generate delivery note' })
    generateDeliveryNote(@Param('id') id: string) {
        return this.pickingService.generateDeliveryNote(id);
    }
}
