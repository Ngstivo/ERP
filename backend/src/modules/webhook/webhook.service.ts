import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { Webhook, WebhookEvent } from '@database/webhooks/webhook.entity';
import { WebhookDelivery, WebhookDeliveryStatus } from '@database/webhooks/webhook-delivery.entity';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';

@Injectable()
export class WebhookService {
    constructor(
        @InjectRepository(Webhook)
        private webhookRepository: Repository<Webhook>,
        @InjectRepository(WebhookDelivery)
        private deliveryRepository: Repository<WebhookDelivery>,
        private httpService: HttpService,
    ) { }

    async create(createDto: CreateWebhookDto, userId: string): Promise<Webhook> {
        const secret = this.generateSecret();

        const webhook = this.webhookRepository.create({
            ...createDto,
            secret,
            createdBy: { id: userId } as any,
        });

        return await this.webhookRepository.save(webhook);
    }

    async findAll(userId?: string): Promise<Webhook[]> {
        const query = this.webhookRepository.createQueryBuilder('webhook')
            .leftJoinAndSelect('webhook.createdBy', 'createdBy');

        if (userId) {
            query.where('webhook.createdBy.id = :userId', { userId });
        }

        return await query.getMany();
    }

    async findOne(id: string): Promise<Webhook> {
        const webhook = await this.webhookRepository.findOne({
            where: { id },
            relations: ['createdBy'],
        });

        if (!webhook) {
            throw new NotFoundException(`Webhook with ID ${id} not found`);
        }

        return webhook;
    }

    async update(id: string, updateDto: UpdateWebhookDto): Promise<Webhook> {
        const webhook = await this.findOne(id);
        Object.assign(webhook, updateDto);
        return await this.webhookRepository.save(webhook);
    }

    async remove(id: string): Promise<void> {
        const webhook = await this.findOne(id);
        await this.webhookRepository.remove(webhook);
    }

    async trigger(event: WebhookEvent, payload: any): Promise<void> {
        const webhooks = await this.webhookRepository.find({
            where: { isActive: true },
        });

        const relevantWebhooks = webhooks.filter((webhook) =>
            webhook.events.includes(event)
        );

        for (const webhook of relevantWebhooks) {
            await this.deliverWebhook(webhook, event, payload);
        }
    }

    private async deliverWebhook(
        webhook: Webhook,
        event: WebhookEvent,
        payload: any,
    ): Promise<void> {
        const delivery = this.deliveryRepository.create({
            webhook,
            event,
            payload,
            status: WebhookDeliveryStatus.PENDING,
        });

        await this.deliveryRepository.save(delivery);

        try {
            const signature = this.generateSignature(payload, webhook.secret);

            const response = await firstValueFrom(
                this.httpService.post(webhook.url, payload, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Webhook-Event': event,
                        'X-Webhook-Signature': signature,
                        'X-Webhook-Delivery-ID': delivery.id,
                    },
                    timeout: 10000, // 10 seconds
                })
            );

            delivery.status = WebhookDeliveryStatus.SUCCESS;
            delivery.responseStatus = response.status;
            delivery.responseBody = JSON.stringify(response.data).substring(0, 1000);
            delivery.deliveredAt = new Date();
            delivery.attempts = 1;

            webhook.lastTriggeredAt = new Date();
            webhook.failureCount = 0;

            await this.webhookRepository.save(webhook);
        } catch (error) {
            delivery.status = WebhookDeliveryStatus.FAILED;
            delivery.errorMessage = error.message;
            delivery.attempts = 1;
            delivery.responseStatus = error.response?.status;

            webhook.failureCount += 1;
            webhook.lastFailedAt = new Date();

            // Disable webhook after 10 consecutive failures
            if (webhook.failureCount >= 10) {
                webhook.isActive = false;
            }

            await this.webhookRepository.save(webhook);
        } finally {
            await this.deliveryRepository.save(delivery);
        }
    }

    async getDeliveries(webhookId: string, limit: number = 50): Promise<WebhookDelivery[]> {
        return await this.deliveryRepository.find({
            where: { webhook: { id: webhookId } },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }

    async retryDelivery(deliveryId: string): Promise<void> {
        const delivery = await this.deliveryRepository.findOne({
            where: { id: deliveryId },
            relations: ['webhook'],
        });

        if (!delivery) {
            throw new NotFoundException('Delivery not found');
        }

        delivery.status = WebhookDeliveryStatus.RETRYING;
        await this.deliveryRepository.save(delivery);

        await this.deliverWebhook(
            delivery.webhook,
            delivery.event as WebhookEvent,
            delivery.payload,
        );
    }

    private generateSecret(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    private generateSignature(payload: any, secret: string): string {
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(JSON.stringify(payload));
        return hmac.digest('hex');
    }
}
