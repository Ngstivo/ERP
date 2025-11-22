import { IsUUID, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StockAdjustmentDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsUUID()
    productId: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsUUID()
    warehouseId: string;

    @ApiProperty({ example: 50, description: 'Positive for increase, negative for decrease' })
    @IsNumber()
    quantity: number;

    @ApiPropertyOptional({ example: 25.50 })
    @IsNumber()
    @IsOptional()
    unitCost?: number;

    @ApiPropertyOptional({ example: 'Manual stock adjustment' })
    @IsString()
    @IsOptional()
    notes?: string;
}
