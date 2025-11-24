import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder } from '@database/orders/purchase-order.entity';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(PurchaseOrder)
        private purchaseOrderRepository: Repository<PurchaseOrder>,
    ) { }

    async findAll(): Promise<PurchaseOrder[]> {
        return await this.purchaseOrderRepository.find({
            relations: ['warehouse', 'items', 'items.product', 'createdBy'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<PurchaseOrder> {
        const order = await this.purchaseOrderRepository.findOne({
            where: { id },
            relations: ['warehouse', 'items', 'items.product', 'createdBy'],
        });

        if (!order) {
            throw new NotFoundException(`Purchase order with ID ${id} not found`);
        }

        return order;
    }

    async create(orderData: Partial<PurchaseOrder>, userId: string): Promise<PurchaseOrder> {
        // Calculate totalPrice for each item
        if (orderData.items) {
            orderData.items = orderData.items.map(item => ({
                ...item,
                totalPrice: Number(item.quantity) * Number(item.unitPrice),
            }));
        }

        const order = this.purchaseOrderRepository.create({
            ...orderData,
            orderNumber: `PO-${Date.now()}`,
            createdBy: { id: userId } as any,
        });

        return await this.purchaseOrderRepository.save(order);
    }

    async update(id: string, updateData: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
        const order = await this.findOne(id);
        Object.assign(order, updateData);
        return await this.purchaseOrderRepository.save(order);
    }

    async remove(id: string): Promise<void> {
        const order = await this.findOne(id);
        await this.purchaseOrderRepository.remove(order);
    }
}
