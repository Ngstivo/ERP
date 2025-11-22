import { IsNumber, IsEnum, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InspectionResult } from '@database/warehouse-ops/goods-receipt-item.entity';

export class InspectItemDto {
    @ApiProperty()
    @IsNumber()
    @Min(0)
    acceptedQuantity: number;

    @ApiProperty()
    @IsNumber()
    @Min(0)
    rejectedQuantity: number;

    @ApiProperty({ enum: InspectionResult })
    @IsEnum(InspectionResult)
    inspectionResult: InspectionResult;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    inspectionNotes?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    rejectionReason?: string;
}
