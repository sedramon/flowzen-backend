import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
    ArrayNotEmpty,
    IsArray,
    IsOptional,
    IsString,
    ValidateIf,
} from 'class-validator';
import { AdminCreateRoleDto } from './admin-create-role.dto';

export class AdminUpdateRoleDto extends PartialType(AdminCreateRoleDto) {
    @ApiPropertyOptional({
        description: 'Updated role name',
    })
    @IsOptional()
    @IsString()
        name?: string;

    @ApiPropertyOptional({
        description: 'Updated scope IDs',
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
        availableScopes?: string[];

    @ApiPropertyOptional({
        description:
            'Tenant ID. Set to null to convert role to global (no tenant).',
        nullable: true,
    })
    @IsOptional()
    @ValidateIf((o) => o.tenant !== null && o.tenant !== undefined && o.tenant !== '')
    @IsString()
        tenant?: string | null;
}

