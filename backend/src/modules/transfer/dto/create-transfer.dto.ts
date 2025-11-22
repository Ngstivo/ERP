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
import { TransferPriority } from '@database/transfers/transfer.entity';

class TransferItemDto {
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

export class CreateTransferDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    fromWarehouseId: string;

    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    toWarehouseId: string;

    @ApiPropertyOptional({ enum: TransferPriority })
    @IsEnum(TransferPriority)
    @IsOptional()
    priority?: TransferPriority;

    @ApiPropertyOptional()
    @IsDateString()
    @IsOptional()
    requestedDate?: Date;

    @ApiPropertyOptional()
    @IsDateString()
    @IsOptional()
    expectedDeliveryDate?: Date;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    notes?: string;

    @ApiProperty({ type: [TransferItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TransferItemDto)
    items: TransferItemDto[];
}
