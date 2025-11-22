import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PickItemDto {
    @ApiProperty()
    @IsNumber()
    @Min(0)
    pickedQuantity: number;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    notes?: string;
}
