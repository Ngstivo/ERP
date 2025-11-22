import { IsUUID, IsNotEmpty, IsOptional, IsString, IsDateString, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ReceiptItemDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    purchaseOrderItemId: string;

    @ApiProperty()
    @IsNumber()
    @Min(0)
    receivedQuantity: number;
}

export class CreateGoodsReceiptDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    purchaseOrderId: string;

    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    warehouseId: string;

    @ApiPropertyOptional()
    @IsDateString()
    @IsOptional()
    receiptDate?: Date;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    notes?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    supplierDeliveryNote?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    transportCompany?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    vehicleNumber?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    driverName?: string;

    @ApiProperty({ type: [ReceiptItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReceiptItemDto)
    items: ReceiptItemDto[];
}
