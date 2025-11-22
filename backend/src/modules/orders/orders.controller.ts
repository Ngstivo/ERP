import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Get('purchase')
    @ApiOperation({ summary: 'Get all purchase orders' })
    findAll() {
        return this.ordersService.findAll();
    }

    @Get('purchase/:id')
    @ApiOperation({ summary: 'Get purchase order by ID' })
    findOne(@Param('id') id: string) {
        return this.ordersService.findOne(id);
    }

    @Post('purchase')
    @ApiOperation({ summary: 'Create purchase order' })
    create(@Body() orderData: any, @Request() req) {
        return this.ordersService.create(orderData, req.user.sub);
    }

    @Patch('purchase/:id')
    @ApiOperation({ summary: 'Update purchase order' })
    update(@Param('id') id: string, @Body() updateData: any) {
        return this.ordersService.update(id, updateData);
    }

    @Delete('purchase/:id')
    @ApiOperation({ summary: 'Delete purchase order' })
    remove(@Param('id') id: string) {
        return this.ordersService.remove(id);
    }
}
