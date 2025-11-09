import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsEmail,
    IsMongoId,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class AdminCreateUserDto {
    @ApiPropertyOptional({ description: 'Display name of the user' })
    @IsOptional()
    @IsString()
    @MaxLength(120)
        name?: string;

    @ApiProperty({ description: 'Email address of the user' })
    @IsEmail()
    @MaxLength(255)
        email: string;

    @ApiProperty({ description: 'Plain-text password (will be hashed server-side)' })
    @IsString()
    @MinLength(8)
    @MaxLength(128)
        password: string;

    @ApiProperty({ description: 'Role identifier or name' })
    @IsString()
    @MaxLength(120)
        role: string;

    @ApiPropertyOptional({
        description: 'Tenant identifier (omit for global administrators)',
    })
    @IsOptional()
    @IsMongoId()
        tenantId?: string;

    @ApiPropertyOptional({
        description: 'Flag indicating whether the user is a global administrator',
    })
    @IsOptional()
    @IsBoolean()
        isGlobalAdmin?: boolean = false;

    @ApiPropertyOptional({
        description:
            'Explicit list of scopes to assign (overrides role available scopes)',
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(100)
    @IsString({ each: true })
        scopes?: string[];
}

