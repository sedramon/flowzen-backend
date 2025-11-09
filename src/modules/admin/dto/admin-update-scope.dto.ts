import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class AdminUpdateScopeDto {
    @ApiPropertyOptional({ description: 'Updated description' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
        description?: string;

    @ApiPropertyOptional({
        description: 'Updated category',
        enum: ['tenant', 'global'],
    })
    @IsOptional()
    @IsString()
    @IsIn(['tenant', 'global'])
        category?: 'tenant' | 'global';
}

