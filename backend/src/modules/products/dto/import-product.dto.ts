import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ImportProductDto {
    @ApiProperty({ example: 'PROD-001', description: 'Unique SKU for the product' })
    @IsString()
    @IsNotEmpty()
    sku: string;

    @ApiProperty({ example: 'Laptop Computer', description: 'Product name' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'High-performance laptop', description: 'Product description', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 'CAT001', description: 'Category code' })
    @IsString()
    @IsNotEmpty()
    categoryCode: string;

    @ApiProperty({ example: 'PCS', description: 'Unit of measure abbreviation' })
    @IsString()
    @IsNotEmpty()
    uomAbbreviation: string;

    @ApiProperty({ example: 999.99, description: 'Unit selling price' })
    @IsNumber()
    @Min(0)
    unitPrice: number;

    @ApiProperty({ example: 599.99, description: 'Cost price' })
    @IsNumber()
    @Min(0)
    costPrice: number;

    @ApiProperty({ example: 10, description: 'Reorder point quantity' })
    @IsNumber()
    @Min(0)
    reorderPoint: number;
}

export class ImportResultDto {
    @ApiProperty({ description: 'Number of products successfully imported' })
    successCount: number;

    @ApiProperty({ description: 'Number of products that failed to import' })
    failureCount: number;

    @ApiProperty({ description: 'Total number of products in file' })
    totalCount: number;

    @ApiProperty({ description: 'List of successfully imported product SKUs' })
    successfulProducts: string[];

    @ApiProperty({ description: 'List of errors for failed imports' })
    errors: Array<{
        row: number;
        sku: string;
        error: string;
    }>;
}
