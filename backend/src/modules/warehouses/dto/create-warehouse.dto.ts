import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEmail, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWarehouseDto {
    @ApiProperty({ example: 'WH-001' })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiProperty({ example: 'Main Warehouse' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ example: 'Primary storage facility' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: '123 Industrial Blvd' })
    @IsString()
    @IsNotEmpty()
    address: string;

    @ApiPropertyOptional({ example: 'New York' })
    @IsString()
    @IsOptional()
    city?: string;

    @ApiPropertyOptional({ example: 'NY' })
    @IsString()
    @IsOptional()
    state?: string;

    @ApiPropertyOptional({ example: 'USA' })
    @IsString()
    @IsOptional()
    country?: string;

    @ApiPropertyOptional({ example: '10001' })
    @IsString()
    @IsOptional()
    postalCode?: string;

    @ApiPropertyOptional({ example: '+1-555-0100' })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiPropertyOptional({ example: 'warehouse@company.com' })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiPropertyOptional({ example: 10000 })
    @IsNumber()
    @IsOptional()
    @Min(0)
    totalCapacity?: number;
}
