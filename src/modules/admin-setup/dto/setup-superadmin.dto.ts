import { ApiProperty } from '@nestjs/swagger';
import {
    ArrayNotEmpty,
    IsArray,
    IsEmail,
    IsNotEmpty,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class SuperadminCredentialsDto {
    @ApiProperty({ example: 'global.admin@flowzen.io' })
    @IsEmail()
        email: string;

    @ApiProperty({ example: 'superadmin' })
    @IsString()
    @IsNotEmpty()
        password: string;
}

export class SetupSuperadminDto {
    @ApiProperty({ description: 'Protection token to authorize setup execution' })
    @IsString()
    @IsNotEmpty()
        protectToken: string;

    @ApiProperty({ type: SuperadminCredentialsDto })
    @ValidateNested()
    @Type(() => SuperadminCredentialsDto)
        superadmin: SuperadminCredentialsDto;

    @ApiProperty({
        description: 'List of global scopes to assign to superadmin',
        example: ['global.tenants:read', 'global.tenants:create'],
        type: [String],
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
        scopes: string[];
}

