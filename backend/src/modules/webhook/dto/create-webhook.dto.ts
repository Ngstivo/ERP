import { IsString, IsNotEmpty, IsArray, IsBoolean, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WebhookEvent } from '@database/webhooks/webhook.entity';

export class CreateWebhookDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'https://your-app.com/webhooks/erp' })
    @IsUrl()
    @IsNotEmpty()
    url: string;

    @ApiProperty({
        enum: WebhookEvent,
        isArray: true,
        example: [WebhookEvent.STOCK_LOW, WebhookEvent.BATCH_EXPIRING],
    })
    @IsArray()
    @IsNotEmpty()
    events: WebhookEvent[];

    @ApiPropertyOptional({ default: true })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
