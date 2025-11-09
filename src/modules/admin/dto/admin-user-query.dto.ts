import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsBooleanString,
    IsEmail,
    IsMongoId,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';

export class AdminUserQueryDto {
    @ApiPropertyOptional({ description: 'Filter by tenant ID' })
    @IsOptional()
    @IsMongoId()
        tenant?: string;

    @ApiPropertyOptional({ description: 'Filter by user role name' })
    @IsOptional()
    @IsString()
        role?: string;

    @ApiPropertyOptional({ description: 'Filter by email address' })
    @IsOptional()
    @IsEmail()
        email?: string;

    @ApiPropertyOptional({ description: 'Partial match against name or email' })
    @IsOptional()
    @IsString()
        search?: string;

    @ApiPropertyOptional({ description: 'Filter by global admin flag' })
    @IsOptional()
    @IsBooleanString()
        isGlobalAdmin?: string;

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
    @Max(100)
        limit?: number = 25;
}

