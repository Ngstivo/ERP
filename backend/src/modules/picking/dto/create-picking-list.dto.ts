import {
    IsUUID,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsDateString,
    IsArray,
    ValidateNested,
    IsNumber,
    IsEnum,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PickingStrategy } from '@database/picking/picking-list.entity';

class PickingItemDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    productId: string;

    @ApiPropertyOptional()
    @IsUUID()
    @IsOptional()
    batchId?: string;

    @ApiProperty()
    @IsNumber()
    @Min(0)
    quantity: number;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    notes?: string;
}

export class CreatePickingListDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    warehouseId: string;

    @ApiPropertyOptional({ enum: PickingStrategy })
    @IsEnum(PickingStrategy)
    @IsOptional()
    strategy?: PickingStrategy;

    @ApiPropertyOptional()
    @IsDateString()
    @IsOptional()
    pickingDate?: Date;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    @Min(0)
    priority?: number;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    notes?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    customerName?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    orderReference?: string;

    @ApiProperty({ type: [PickingItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PickingItemDto)
    items: PickingItemDto[];
}
