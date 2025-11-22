import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Barcode, BarcodeType } from '@database/entities/barcode.entity';
import { Product } from '@database/entities/product.entity';
import * as JsBarcode from 'jsbarcode';
import * as QRCode from 'qrcode';
import { createCanvas } from 'canvas';

@Injectable()
export class BarcodesService {
    constructor(
        @InjectRepository(Barcode)
        private barcodeRepository: Repository<Barcode>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
    ) { }

    async create(productId: string, type: BarcodeType, code?: string): Promise<Barcode> {
        const product = await this.productRepository.findOne({
            where: { id: productId },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        // Generate code if not provided
        const barcodeCode = code || this.generateCode(type, product.sku);

        // Check if code already exists
        const existing = await this.barcodeRepository.findOne({
            where: { code: barcodeCode },
        });

        if (existing) {
            throw new BadRequestException('Barcode code already exists');
        }

        const barcode = this.barcodeRepository.create({
            code: barcodeCode,
            type,
            product,
        });

        return await this.barcodeRepository.save(barcode);
    }

    async findAll(productId?: string): Promise<Barcode[]> {
        const query = this.barcodeRepository.createQueryBuilder('barcode')
            .leftJoinAndSelect('barcode.product', 'product');

        if (productId) {
            query.where('barcode.product.id = :productId', { productId });
        }

        return await query.getMany();
    }

    async findByCode(code: string): Promise<Barcode> {
        const barcode = await this.barcodeRepository.findOne({
            where: { code },
            relations: ['product', 'product.category', 'product.stockLevels'],
        });

        if (!barcode) {
            throw new NotFoundException(`Barcode ${code} not found`);
        }

        return barcode;
    }

    async generateBarcodeImage(code: string, type: BarcodeType): Promise<string> {
        if (type === BarcodeType.QR) {
            // Generate QR code
            try {
                const qrDataUrl = await QRCode.toDataURL(code, {
                    width: 300,
                    margin: 2,
                });
                return qrDataUrl;
            } catch (error) {
                throw new BadRequestException('Failed to generate QR code');
            }
        } else {
            // Generate barcode using JsBarcode
            try {
                const canvas = createCanvas(300, 100);
                JsBarcode(canvas, code, {
                    format: type,
                    width: 2,
                    height: 80,
                    displayValue: true,
                });
                return canvas.toDataURL();
            } catch (error) {
                throw new BadRequestException(`Failed to generate ${type} barcode`);
            }
        }
    }

    async generateLabel(productId: string): Promise<any> {
        const product = await this.productRepository.findOne({
            where: { id: productId },
            relations: ['barcodes', 'category'],
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        // Get or create primary barcode
        let barcode = product.barcodes?.[0];
        if (!barcode) {
            barcode = await this.create(productId, BarcodeType.CODE128);
        }

        const barcodeImage = await this.generateBarcodeImage(barcode.code, barcode.type);

        return {
            product: {
                name: product.name,
                sku: product.sku,
                category: product.category?.name,
                price: product.unitPrice,
            },
            barcode: {
                code: barcode.code,
                type: barcode.type,
                image: barcodeImage,
            },
        };
    }

    async bulkPrint(productIds: string[]): Promise<any[]> {
        const labels = [];

        for (const productId of productIds) {
            try {
                const label = await this.generateLabel(productId);
                labels.push(label);
            } catch (error) {
                console.error(`Failed to generate label for product ${productId}:`, error);
            }
        }

        return labels;
    }

    private generateCode(type: BarcodeType, sku: string): string {
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

        switch (type) {
            case BarcodeType.UPC:
                // UPC-A is 12 digits
                return timestamp.slice(-11) + this.calculateCheckDigit(timestamp.slice(-11));
            case BarcodeType.EAN:
                // EAN-13 is 13 digits
                return timestamp.slice(-12) + this.calculateCheckDigit(timestamp.slice(-12));
            case BarcodeType.CODE128:
                return `${sku}-${timestamp.slice(-8)}`;
            case BarcodeType.QR:
                return `QR-${sku}-${timestamp}-${random}`;
            default:
                return `${sku}-${timestamp}-${random}`;
        }
    }

    private calculateCheckDigit(code: string): string {
        let sum = 0;
        for (let i = 0; i < code.length; i++) {
            const digit = parseInt(code[i]);
            sum += i % 2 === 0 ? digit * 3 : digit;
        }
        const checkDigit = (10 - (sum % 10)) % 10;
        return checkDigit.toString();
    }

    async remove(id: string): Promise<void> {
        const barcode = await this.barcodeRepository.findOne({ where: { id } });
        if (!barcode) {
            throw new NotFoundException('Barcode not found');
        }
        await this.barcodeRepository.remove(barcode);
    }
}
