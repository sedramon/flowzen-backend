import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    ArrayMaxSize,
    IsArray,
    IsBoolean,
    IsMongoId,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

export class AdminUpdateUserDto {
    @ApiPropertyOptional({ description: 'Updated display name' })
    @IsOptional()
    @IsString()
    @MaxLength(120)
        name?: string;

    @ApiPropertyOptional({ description: 'Updated role identifier or name' })
    @IsOptional()
    @IsString()
    @MaxLength(120)
        role?: string;

    @ApiPropertyOptional({
        description: 'Updated tenant identifier (omit for global administrators)',
    })
    @IsOptional()
    @IsMongoId()
        tenantId?: string | null;

    @ApiPropertyOptional({
        description: 'Updated global admin flag (requires tenantId to be null)',
    })
    @IsOptional()
    @IsBoolean()
        isGlobalAdmin?: boolean;

    @ApiPropertyOptional({
        description: 'Explicit scopes override',
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(100)
    @IsString({ each: true })
        scopes?: string[];
}

