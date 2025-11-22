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
    Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WebhookService } from './webhook.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('webhooks')
@Controller('webhooks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WebhookController {
    constructor(private readonly webhookService: WebhookService) { }

    @Post()
    @ApiOperation({ summary: 'Create webhook subscription' })
    create(@Body() createDto: CreateWebhookDto, @Request() req) {
        return this.webhookService.create(createDto, req.user.sub);
    }

    @Get()
    @ApiOperation({ summary: 'Get all webhooks' })
    @ApiQuery({ name: 'userId', required: false })
    findAll(@Query('userId') userId?: string) {
        return this.webhookService.findAll(userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get webhook by ID' })
    findOne(@Param('id') id: string) {
        return this.webhookService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update webhook' })
    update(@Param('id') id: string, @Body() updateDto: UpdateWebhookDto) {
        return this.webhookService.update(id, updateDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete webhook' })
    remove(@Param('id') id: string) {
        return this.webhookService.remove(id);
    }

    @Get(':id/deliveries')
    @ApiOperation({ summary: 'Get webhook delivery history' })
    @ApiQuery({ name: 'limit', required: false })
    getDeliveries(@Param('id') id: string, @Query('limit') limit?: number) {
        return this.webhookService.getDeliveries(id, limit ? Number(limit) : 50);
    }

    @Post('deliveries/:deliveryId/retry')
    @ApiOperation({ summary: 'Retry failed webhook delivery' })
    retryDelivery(@Param('deliveryId') deliveryId: string) {
        return this.webhookService.retryDelivery(deliveryId);
    }
}
