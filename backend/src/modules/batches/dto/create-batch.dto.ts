import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUUID, IsEnum, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QualityStatus } from '@database/batches/batch.entity';

export class CreateBatchDto {
    @ApiPropertyOptional({ example: 'BATCH-001' })
    @IsString()
    @IsOptional()
    batchNumber?: string;

    @ApiPropertyOptional({ example: 'LOT-2024-001' })
    @IsString()
    @IsOptional()
    lotNumber?: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsUUID()
    @IsNotEmpty()
    productId: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsUUID()
    @IsNotEmpty()
    warehouseId: string;

    @ApiPropertyOptional({ example: '2024-01-15' })
    @IsDateString()
    @IsOptional()
    manufacturingDate?: Date;

    @ApiPropertyOptional({ example: '2025-01-15' })
    @IsDateString()
    @IsOptional()
    expirationDate?: Date;

    @ApiPropertyOptional({ example: '2024-02-01' })
    @IsDateString()
    @IsOptional()
    receivedDate?: Date;

    @ApiPropertyOptional({ enum: QualityStatus, example: QualityStatus.PENDING })
    @IsEnum(QualityStatus)
    @IsOptional()
    qualityStatus?: QualityStatus;

    @ApiProperty({ example: 100 })
    @IsNumber()
    @Min(0)
    initialQuantity: number;

    @ApiPropertyOptional({ example: 25.50 })
    @IsNumber()
    @IsOptional()
    @Min(0)
    unitCost?: number;

    @ApiPropertyOptional({ example: 'Batch received from Supplier XYZ' })
    @IsString()
    @IsOptional()
    notes?: string;

    @ApiPropertyOptional({ example: 'Supplier XYZ' })
    @IsString()
    @IsOptional()
    supplierName?: string;

    @ApiPropertyOptional({ example: 'SUP-BATCH-123' })
    @IsString()
    @IsOptional()
    supplierBatchNumber?: string;
}
