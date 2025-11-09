import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AdminCreateScopeDto {
    @ApiProperty({ description: 'Unique scope name' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
        name: string;

    @ApiProperty({ description: 'Human readable description' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
        description: string;

    @ApiProperty({
        description: 'Scope category',
        enum: ['tenant', 'global'],
        default: 'tenant',
    })
    @IsString()
    @IsIn(['tenant', 'global'])
        category: 'tenant' | 'global' = 'tenant';
}

