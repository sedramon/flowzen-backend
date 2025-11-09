import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RollbackSuperadminDto {
    @ApiProperty({ description: 'Protection token to authorize rollback' })
    @IsString()
    @IsNotEmpty()
        protectToken: string;

    @ApiProperty({
        description: 'Superadmin email to delete',
        example: 'global.admin@flowzen.io',
    })
    @IsEmail()
    @IsOptional()
        superadminEmail?: string;

    @ApiProperty({
        description: 'Scope prefix to delete',
        example: 'global.',
        default: 'global.',
    })
    @IsString()
    @IsOptional()
        scopesPrefix?: string;
}

