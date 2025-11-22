import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { Webhook } from '@database/webhooks/webhook.entity';
import { WebhookDelivery } from '@database/webhooks/webhook-delivery.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Webhook, WebhookDelivery]),
        HttpModule,
    ],
    controllers: [WebhookController],
    providers: [WebhookService],
    exports: [WebhookService],
})
export class WebhookModule { }
