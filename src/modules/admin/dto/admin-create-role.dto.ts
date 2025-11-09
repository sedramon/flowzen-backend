import { ApiProperty } from '@nestjs/swagger';
import {
    ArrayNotEmpty,
    IsArray,
    IsNotEmpty,
    IsOptional,
    IsString,
    ValidateIf,
} from 'class-validator';

export class AdminCreateRoleDto {
    @ApiProperty({ description: 'Role name' })
    @IsString()
    @IsNotEmpty()
        name: string;

    @ApiProperty({
        description: 'Array of scope IDs attached to the role',
        type: [String],
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
        availableScopes: string[];

    @ApiProperty({
        description:
            'Tenant ID. Leave empty or set to null to create a global role.',
        required: false,
        nullable: true,
    })
    @IsOptional()
    @ValidateIf((o) => o.tenant !== null && o.tenant !== undefined && o.tenant !== '')
    @IsString()
        tenant?: string | null;
}

