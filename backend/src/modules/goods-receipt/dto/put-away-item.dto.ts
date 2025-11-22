import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PutAwayItemDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    locationId: string;
}
