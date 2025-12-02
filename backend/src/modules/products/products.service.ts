import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from '@database/entities/product.entity';
import { Category } from '@database/entities/category.entity';
import { UnitOfMeasure } from '@database/entities/unit-of-measure.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ImportProductDto, ImportResultDto } from './dto/import-product.dto';
import { Readable } from 'stream';
import * as ExcelJS from 'exceljs';
const csvParser = require('csv-parser');

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
        @InjectRepository(UnitOfMeasure)
        private uomRepository: Repository<UnitOfMeasure>,
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
    async findAllCategories(): Promise<Category[]> {
        return await this.categoryRepository.find();
    }

    async findAllUOMs(): Promise<UnitOfMeasure[]> {
        return await this.uomRepository.find();
    }

    // Product Import Methods
    async importFromCSV(fileBuffer: Buffer): Promise<ImportResultDto> {
        return new Promise((resolve, reject) => {
            const products: any[] = [];
            const stream = Readable.from(fileBuffer.toString());

            stream
                .pipe(csvParser())
                .on('data', (row) => {
                    products.push(row);
                })
                .on('end', async () => {
                    try {
                        const result = await this.validateAndCreateProducts(products);
                        resolve(result);
                    } catch (error) {
                        reject(error);
                    }
                })
                .on('error', (error) => {
                    reject(new BadRequestException(`CSV parsing error: ${error.message}`));
                });
        });
    }

    async importFromExcel(fileBuffer: Buffer): Promise<ImportResultDto> {
        try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(fileBuffer);

            const worksheet = workbook.getWorksheet(1);
            if (!worksheet) {
                throw new BadRequestException('Excel file is empty or invalid');
            }

            const products: any[] = [];
            const headers: string[] = [];

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) {
                    // First row is headers
                    row.eachCell((cell) => {
                        headers.push(cell.value?.toString() || '');
                    });
                } else {
                    const product: any = {};
                    row.eachCell((cell, colNumber) => {
                        const header = headers[colNumber - 1];
                        product[header] = cell.value;
                    });
                    products.push(product);
                }
            });

            return await this.validateAndCreateProducts(products);
        } catch (error) {
            throw new BadRequestException(`Excel parsing error: ${error.message}`);
        }
    }

    private async validateAndCreateProducts(rawData: any[]): Promise<ImportResultDto> {
        const result: ImportResultDto = {
            successCount: 0,
            failureCount: 0,
            totalCount: rawData.length,
            successfulProducts: [],
            errors: [],
        };

        // Pre-load categories and UOMs for efficient lookup
        const categories = await this.categoryRepository.find();
        const uoms = await this.uomRepository.find();

        const categoryMap = new Map(categories.map(c => [c.code, c]));
        const uomMap = new Map(uoms.map(u => [u.abbreviation, u]));

        for (let i = 0; i < rawData.length; i++) {
            const row = rawData[i];
            const rowNumber = i + 2; // Excel/CSV row number (1-indexed + header)

            try {
                // Validate required fields
                if (!row.sku || !row.name) {
                    throw new Error('Missing required fields: sku and name are mandatory');
                }

                // Check for duplicate SKU
                const existingProduct = await this.productRepository.findOne({
                    where: { sku: row.sku },
                });

                if (existingProduct) {
                    throw new Error(`Product with SKU ${row.sku} already exists`);
                }

                // Validate category
                const category = categoryMap.get(row.categoryCode);
                if (!category) {
                    throw new Error(`Invalid category code: ${row.categoryCode}`);
                }

                // Validate UOM
                const uom = uomMap.get(row.uomAbbreviation);
                if (!uom) {
                    throw new Error(`Invalid UOM abbreviation: ${row.uomAbbreviation}`);
                }

                // Validate numeric fields
                const unitPrice = parseFloat(row.unitPrice);
                const costPrice = parseFloat(row.costPrice);
                const reorderPoint = parseInt(row.reorderPoint);

                if (isNaN(unitPrice) || unitPrice < 0) {
                    throw new Error('Invalid unitPrice: must be a positive number');
                }

                if (isNaN(costPrice) || costPrice < 0) {
                    throw new Error('Invalid costPrice: must be a positive number');
                }

                if (isNaN(reorderPoint) || reorderPoint < 0) {
                    throw new Error('Invalid reorderPoint: must be a positive integer');
                }

                // Create product
                const product = this.productRepository.create({
                    sku: row.sku,
                    name: row.name,
                    description: row.description || '',
                    category: category,
                    unitOfMeasure: uom,
                    unitPrice,
                    costPrice,
                    reorderPoint,
                    isActive: true,
                });

                await this.productRepository.save(product);

                result.successCount++;
                result.successfulProducts.push(row.sku);
            } catch (error) {
                result.failureCount++;
                result.errors.push({
                    row: rowNumber,
                    sku: row.sku || 'N/A',
                    error: error.message,
                });
            }
        }

        return result;
    }
}
