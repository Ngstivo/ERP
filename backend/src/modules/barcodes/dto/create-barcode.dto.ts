import { IsUUID, IsNotEmpty, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BarcodeType } from '@database/entities/barcode.entity';

export class CreateBarcodeDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsUUID()
    @IsNotEmpty()
    productId: string;

    @ApiProperty({ enum: BarcodeType, example: BarcodeType.CODE128 })
    @IsEnum(BarcodeType)
    @IsNotEmpty()
    type: BarcodeType;

    @ApiPropertyOptional({ example: 'PROD-001-12345678' })
    @IsString()
    @IsOptional()
    code?: string;
}
