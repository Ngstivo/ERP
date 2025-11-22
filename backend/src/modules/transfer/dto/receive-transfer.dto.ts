import {
    IsUUID,
    IsNotEmpty,
    IsArray,
    ValidateNested,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ReceivedItemDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    itemId: string;

    @ApiProperty()
    @IsNumber()
    @Min(0)
    receivedQuantity: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    @Min(0)
    damagedQuantity?: number;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    notes?: string;
}

export class ReceiveTransferDto {
    @ApiProperty({ type: [ReceivedItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReceivedItemDto)
    items: ReceivedItemDto[];
}
