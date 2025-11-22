import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QualityStatus } from '@database/batches/batch.entity';

export class UpdateQualityStatusDto {
    @ApiProperty({ enum: QualityStatus, example: QualityStatus.APPROVED })
    @IsEnum(QualityStatus)
    @IsNotEmpty()
    qualityStatus: QualityStatus;
}
