import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LocationType, ZoneType } from '@database/entities/storage-location.entity';

export class CreateLocationDto {
    @ApiProperty({ example: 'ZONE-A' })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiProperty({ example: 'Zone A - Bulk Storage' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ enum: LocationType, example: LocationType.ZONE })
    @IsEnum(LocationType)
    @IsNotEmpty()
    type: LocationType;

    @ApiPropertyOptional({ enum: ZoneType, example: ZoneType.BULK })
    @IsEnum(ZoneType)
    @IsOptional()
    zoneType?: ZoneType;

    @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsUUID()
    @IsOptional()
    parentId?: string;

    @ApiPropertyOptional({ example: 1000 })
    @IsNumber()
    @IsOptional()
    @Min(0)
    capacity?: number;

    @ApiPropertyOptional({ example: 'ZONE-A-001' })
    @IsString()
    @IsOptional()
    barcode?: string;
}
