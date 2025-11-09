import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsDate,
    IsIn,
    IsMongoId,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
} from 'class-validator';

export class AdminAuditQueryDto {
    @ApiPropertyOptional({ description: 'Filter by action name' })
    @IsOptional()
    @IsString()
    @MaxLength(120)
        action?: string;

    @ApiPropertyOptional({ description: 'Filter by target type' })
    @IsOptional()
    @IsString()
    @MaxLength(120)
        targetType?: string;

    @ApiPropertyOptional({ description: 'Filter by performer user ID' })
    @IsOptional()
    @IsMongoId()
        performedBy?: string;

    @ApiPropertyOptional({ description: 'Filter by tenant ID' })
    @IsOptional()
    @IsMongoId()
        tenant?: string;

    @ApiPropertyOptional({ description: 'Page number', default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
        page?: number = 1;

    @ApiPropertyOptional({ description: 'Page size', default: 25 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(200)
        limit?: number = 25;

    @ApiPropertyOptional({
        description: 'Preset time range filter',
        enum: ['24h', '7d', '30d', 'custom'],
    })
    @IsOptional()
    @IsIn(['24h', '7d', '30d', 'custom'])
        timeRange?: '24h' | '7d' | '30d' | 'custom';

    @ApiPropertyOptional({
        description: 'Custom range start date (ISO string)',
        type: String,
        format: 'date-time',
    })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
        startDate?: Date | null;

    @ApiPropertyOptional({
        description: 'Custom range end date (ISO string)',
        type: String,
        format: 'date-time',
    })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
        endDate?: Date | null;
}

