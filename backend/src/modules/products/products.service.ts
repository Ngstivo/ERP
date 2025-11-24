import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from '@database/entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
    ) { }

    async create(createProductDto: CreateProductDto): Promise<Product> {
        const product = this.productRepository.create({
            ...createProductDto,
            isActive: true, // Explicitly set to ensure dashboard counts work
        });
        return await this.productRepository.save(product);
    }

    async findAll(search?: string, categoryId?: string): Promise<Product[]> {
        const query = this.productRepository.createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .leftJoinAndSelect('product.unitOfMeasure', 'uom')
            .leftJoinAndSelect('product.stockLevels', 'stockLevels')
            .leftJoinAndSelect('stockLevels.warehouse', 'warehouse');

        if (search) {
            query.where('product.name ILIKE :search OR product.sku ILIKE :search', {
                search: `%${search}%`,
            });
        }

        if (categoryId) {
            query.andWhere('product.category.id = :categoryId', { categoryId });
        }

        return await query.getMany();
    }

    async findOne(id: string): Promise<Product> {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: ['category', 'unitOfMeasure', 'stockLevels', 'stockLevels.warehouse', 'barcodes'],
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        return product;
    }

    async findBySku(sku: string): Promise<Product> {
        const product = await this.productRepository.findOne({
            where: { sku },
            relations: ['category', 'unitOfMeasure', 'stockLevels'],
        });

        if (!product) {
            throw new NotFoundException(`Product with SKU ${sku} not found`);
        }

        return product;
    }

    async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
        const product = await this.findOne(id);
        Object.assign(product, updateProductDto);
        return await this.productRepository.save(product);
    }

    async remove(id: string): Promise<void> {
        const product = await this.findOne(id);
        await this.productRepository.remove(product);
    }

    async getLowStockProducts(threshold?: number): Promise<Product[]> {
        const query = this.productRepository.createQueryBuilder('product')
            .leftJoinAndSelect('product.stockLevels', 'stockLevels')
            .leftJoinAndSelect('stockLevels.warehouse', 'warehouse')
            .where('stockLevels.availableQuantity <= product.reorderPoint');

        if (threshold) {
            query.andWhere('stockLevels.availableQuantity <= :threshold', { threshold });
        }

        return await query.getMany();
    }
}
