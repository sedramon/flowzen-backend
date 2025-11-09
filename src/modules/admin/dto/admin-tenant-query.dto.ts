import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsIn,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';

export class AdminTenantQueryDto {
    @ApiPropertyOptional({
        description: 'Free text filter applied to name, contact email, MIB and PIB',
    })
    @IsOptional()
    @IsString()
        search?: string;

    @ApiPropertyOptional({
        description: 'Tenant status filter',
        enum: ['active', 'suspended', 'pending'],
    })
    @IsOptional()
    @IsIn(['active', 'suspended', 'pending'])
        status?: 'active' | 'suspended' | 'pending';

    @ApiPropertyOptional({ description: 'Page number for pagination', default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
        page?: number = 1;

    @ApiPropertyOptional({ description: 'Page size for pagination', default: 25 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(100)
        limit?: number = 25;
}

