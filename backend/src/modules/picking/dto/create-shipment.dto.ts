import {
    IsUUID,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsDateString,
    IsNumber,
    Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShipmentDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    pickingListId: string;

    @ApiPropertyOptional()
    @IsDateString()
    @IsOptional()
    shipmentDate?: Date;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    trackingNumber?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    carrier?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    shippingMethod?: string;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    @Min(0)
    shippingCost?: number;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    shippingAddress?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    recipientName?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    recipientPhone?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    recipientEmail?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    notes?: string;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    @Min(1)
    numberOfPackages?: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    @Min(0)
    totalWeight?: number;

    @ApiPropertyOptional()
    @IsDateString()
    @IsOptional()
    estimatedDeliveryDate?: Date;
}
