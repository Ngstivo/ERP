import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
    @ApiProperty({ example: 'PROD-001' })
    @IsString()
    @IsNotEmpty()
    sku: string;

    @ApiProperty({ example: 'Laptop Computer' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ example: 'High-performance laptop for business use' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsUUID()
    @IsNotEmpty()
    category: any;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsUUID()
    @IsNotEmpty()
    unitOfMeasure: any;

    @ApiProperty({ example: 999.99 })
    @IsNumber()
    @Min(0)
    unitPrice: number;

    @ApiProperty({ example: 750.00 })
    @IsNumber()
    @Min(0)
    costPrice: number;

    @ApiPropertyOptional({ example: 10 })
    @IsNumber()
    @IsOptional()
    @Min(0)
    reorderPoint?: number;

    @ApiPropertyOptional({ example: 5 })
    @IsNumber()
    @IsOptional()
    @Min(0)
    minStockLevel?: number;

    @ApiPropertyOptional({ example: 100 })
    @IsNumber()
    @IsOptional()
    @Min(0)
    maxStockLevel?: number;

    @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
    @IsString()
    @IsOptional()
    imageUrl?: string;

    @ApiPropertyOptional({ example: 2.5 })
    @IsNumber()
    @IsOptional()
    @Min(0)
    weight?: number;

    @ApiPropertyOptional({ example: 35.5 })
    @IsNumber()
    @IsOptional()
    @Min(0)
    length?: number;

    @ApiPropertyOptional({ example: 25.0 })
    @IsNumber()
    @IsOptional()
    @Min(0)
    width?: number;

    @ApiPropertyOptional({ example: 2.0 })
    @IsNumber()
    @IsOptional()
    @Min(0)
    height?: number;
}
