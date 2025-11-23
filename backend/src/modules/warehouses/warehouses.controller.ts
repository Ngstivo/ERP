import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('warehouses')
@Controller('warehouses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WarehousesController {
    constructor(private readonly warehousesService: WarehousesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new warehouse' })
    create(@Body() createWarehouseDto: CreateWarehouseDto) {
        return this.warehousesService.create(createWarehouseDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all warehouses' })
    findAll() {
        return this.warehousesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get warehouse by ID' })
    findOne(@Param('id') id: string) {
        return this.warehousesService.findOne(id);
    }

    @Get(':id/utilization')
    @ApiOperation({ summary: 'Get warehouse utilization metrics' })
    getUtilization(@Param('id') id: string) {
        return this.warehousesService.getWarehouseUtilization(id);
    }

    @Get(':id/locations')
    @ApiOperation({ summary: 'Get warehouse storage location tree' })
    getLocations(@Param('id') id: string) {
        return this.warehousesService.getLocationTree(id);
    }

    @Post(':id/locations')
    @ApiOperation({ summary: 'Create storage location in warehouse' })
    createLocation(
        @Param('id') id: string,
        @Body() createLocationDto: CreateLocationDto,
    ) {
        return this.warehousesService.createLocation(id, createLocationDto);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update warehouse' })
    update(@Param('id') id: string, @Body() updateWarehouseDto: UpdateWarehouseDto) {
        return this.warehousesService.update(id, updateWarehouseDto);
    }

    @Post('admin/activate-all')
    @ApiOperation({ summary: 'Admin: Activate all warehouses (one-time fix)' })
    activateAll() {
        return this.warehousesService.activateAllWarehouses();
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete warehouse' })
    remove(@Param('id') id: string) {
        return this.warehousesService.remove(id);
    }
}
