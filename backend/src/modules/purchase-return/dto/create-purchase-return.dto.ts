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
    IsBoolean,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReturnReason } from '@database/returns/purchase-return.entity';

class ReturnItemDto {
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

    @ApiProperty()
    @IsNumber()
    @Min(0)
    unitPrice: number;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    itemNotes?: string;
}

export class CreatePurchaseReturnDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    purchaseOrderId: string;

    @ApiPropertyOptional()
    @IsUUID()
    @IsOptional()
    goodsReceiptId?: string;

    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    warehouseId: string;

    @ApiPropertyOptional()
    @IsDateString()
    @IsOptional()
    returnDate?: Date;

    @ApiProperty({ enum: ReturnReason })
    @IsEnum(ReturnReason)
    @IsNotEmpty()
    returnReason: ReturnReason;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    notes?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    supplierRmaNumber?: string;

    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    isRefundRequested?: boolean;

    @ApiProperty({ type: [ReturnItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReturnItemDto)
    items: ReturnItemDto[];
}
