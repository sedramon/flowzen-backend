import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateRoleDto {
    @ApiProperty({description: 'Role name', required: false})
    @IsString()
    @IsOptional()
        name?: string;

    @ApiProperty({description: 'Tenant ID', required: false})
    @IsString()
    @IsOptional()
        tenant?: string | null;

    @ApiProperty({description: 'Available scopes', required: false})
    @IsArray()
    @IsOptional()
        availableScopes?: string[];
}